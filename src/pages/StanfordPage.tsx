import { useState } from 'react';
import manifest from '../learning/sources/stanford-manifest.json';
import '../math-workspace/workspace.css';

export default function StanfordPage() {
  const [query, setQuery] = useState('');
  const count = manifest.courses.reduce((sum, course) => sum + course.lectures.length, 0);
  const filtered = manifest.courses.filter(course => `${course.title} ${course.edition} ${course.lectures.map(lecture => lecture.title).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="math-workspace"><header><p className="eyebrow">Advanced physics • source inventory</p><h1>Follow the Stanford lectures</h1><p>Leonard Susskind’s core, supplemental, and earlier courses, in lecture order.</p><a href="#/explore">Back to Explore</a></header>
    <aside className="workspace-help"><h2>Curriculum expansion in progress</h2><p>{manifest.courses.length} course editions and {count} lecture records have been indexed from The Theoretical Minimum. Indexing identifies source pages and videos; it does not mean a lecture has been reviewed or fully taught in the app.</p><p>Detailed topic review, Stanford channel ownership reconciliation, and objective mapping remain unresolved. No lecture completion is required here, and these records do not award XP or duplicate existing lessons.</p><a href="https://theoreticalminimum.com/courses" target="_blank" rel="noreferrer">Official course index</a></aside>
    <label>Search courses and lecture titles<input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label>
    {filtered.map(course => <details className="workspace-help" key={course.id}><summary>{course.title} · {course.edition} · {course.lectures.length} lectures</summary><p>Review status: {course.reviewStatus}. <a href={course.url} target="_blank" rel="noreferrer">Official course page</a></p>{course.unresolvedLectureNumbers.length > 0 && <p>Unresolved source numbering: {course.unresolvedLectureNumbers.join(', ')}. The official index skips these video/URL numbers; their material has not been counted as covered.</p>}<ol>{course.lectures.map(lecture => <li key={lecture.id} value={lecture.order} style={{ marginBlock: '1rem' }}><a href={lecture.url} target="_blank" rel="noreferrer">{lecture.title}</a><p>Content review and in-app mapping pending.{lecture.videoIds.length === 0 ? ' Video identifier unresolved.' : ''}</p>{lecture.videoIds.map(id => <a key={id} href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">Optional lecture video</a>)}</li>)}</ol></details>)}
  </section>;
}
