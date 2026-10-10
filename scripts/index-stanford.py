"""Refresh public lecture metadata, never mark an unread lecture as reviewed."""
import concurrent.futures
import datetime
import html
import json
import pathlib
import re
import urllib.request
import urllib.parse

BASE = 'https://theoreticalminimum.com'
ROOT = pathlib.Path(__file__).resolve().parents[1]


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'PhysicsTeacherSourceInventory/1.0'})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode('utf-8')


def links(page):
    return [(html.unescape(url), html.unescape(re.sub('<[^>]+>', '', label)).strip())
            for url, label in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', page, re.S)]


def lecture(item):
    url, title, order = item
    result = {'id': url.split('/courses/')[1].replace('/', '-'), 'url': url,
              'title': title, 'order': order, 'videoIds': [], 'reviewStatus': 'indexed',
              'objectiveIds': [], 'derivations': [], 'verifiedTimestamps': []}
    try:
        page = fetch(url)
        result['videoIds'] = sorted(set(re.findall(r'(?:youtube(?:-nocookie)?\.com/(?:embed/|watch\?v=)|youtu\.be/)([\w-]{11})', page)))
        if not result['videoIds']:
            result['issue'] = 'No video identifier found on the official lecture page.'
    except Exception as error:
        result['reviewStatus'] = 'unresolved'
        result['issue'] = str(error)
    return result


def main():
    course_links = {}
    issues = []
    for section in ['', '/supplemental', '/archive']:
        url = BASE + '/courses' + section
        try:
            for href, title in links(fetch(url)):
                match = re.search(r'/courses/[^/]+/\d{4}/[a-z]+$', href)
                if match and title and title not in ('more', '[more]'):
                    course_links.setdefault(BASE + match.group(), (title, section.strip('/') or 'core'))
        except Exception as error:
            issues.append({'url': url, 'issue': str(error)})
    courses = []
    for url, (title, section) in course_links.items():
        course = {'id': url.split('/courses/')[1].replace('/', '-'), 'title': title,
                  'edition': '/'.join(url.split('/')[-2:]), 'section': section, 'url': url,
                  'playlistIds': [], 'lectures': [], 'reviewStatus': 'indexed'}
        try:
            page = fetch(url)
            course['playlistIds'] = sorted(set(re.findall(r'[?&]list=([\w-]+)', html.unescape(page))))
            found = {}
            for href, label in links(page):
                if '/lecture-' in href and label not in ('more', '[more]'):
                    target = BASE + urllib.parse.urlparse(href).path
                    if re.search(r'/courses/[^/]+/' + course['edition'] + r'/lecture-\d+$', target):
                        found[target] = label
            items = [(href, label, int(href.rsplit('-', 1)[-1])) for href, label in found.items()]
            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
                course['lectures'] = sorted(pool.map(lecture, items), key=lambda entry: entry['order'])
            orders = {entry['order'] for entry in course['lectures']}
            course['unresolvedLectureNumbers'] = [n for n in range(1, max(orders, default=0) + 1) if n not in orders]
            if not items:
                course['reviewStatus'] = 'unresolved'
                course['issue'] = 'No numbered lecture pages found; inspect this course manually.'
        except Exception as error:
            course['reviewStatus'] = 'unresolved'
            course['issue'] = str(error)
        courses.append(course)
        print(f"Indexed {title} ({course['edition']}): {len(course['lectures'])} lectures", flush=True)
    output = {'version': 1, 'indexedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'channelUrl': 'https://www.youtube.com/@stanford/playlists',
              'channelReconciliation': 'pending-video-owner-verification',
              'note': 'Metadata inventory only. Topic coverage, derivations and video ownership still require review.',
              'issues': issues, 'courses': courses}
    destination = ROOT / 'src/learning/sources/stanford-manifest.json'
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(output, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
