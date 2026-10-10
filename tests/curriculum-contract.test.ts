import { expect, it } from 'vitest';
import manifest from '../src/learning/sources/stanford-manifest.json';
import { validateExpandedCurriculum, type CurriculumObjective } from '../src/learning/curriculum-contract';

const planned: CurriculumObjective = { id: 'measurement.interval', title: 'Interpret a stated uncertainty interval', prerequisites: [], requiredMath: ['ratios'], status: 'planned', experimentIds: [], lectureIds: [] };
const validate = (objectives: CurriculumObjective[]) => validateExpandedCurriculum(objectives,[],[],new Set(['ratios']),new Set(['measurement']),new Set());
it('checks closure and cycles even for planned prerequisites', () => {
  expect(validate([planned])).toEqual([]);
  expect(validate([{ ...planned, prerequisites: ['missing'] }]).join()).toMatch(/Missing prerequisite/);
  expect(validate([{ ...planned, prerequisites: [planned.id] }]).join()).toMatch(/cycle/);
});
it('does not release an objective without the required instructional material', () => {
  expect(validate([{ ...planned, status: 'released', lessonId: 'measurement' }]).join()).toMatch(/missing content/);
});
it('does not count unresolved video topics as reviewed coverage', () => {
  expect(validateExpandedCurriculum([],[],[{ id:'lecture-1', reviewed:true, objectiveIds:[], unresolvedTopics:['unreviewed content'] }],new Set(),new Set(),new Set()).join()).toMatch(/unresolved/);
});
it('keeps lecture metadata internally consistent without claiming it has been reviewed', () => {
  expect(manifest.courses).toHaveLength(21);
  const ids = new Set<string>();
  for (const course of manifest.courses) {
    expect(course.title.trim()).not.toBe('');
    expect(course.lectures.length).toBeGreaterThan(0);
    for (const [index, lecture] of course.lectures.entries()) {
      expect(ids.has(lecture.id)).toBe(false); ids.add(lecture.id);
      expect(lecture.order).toBeGreaterThan(index ? course.lectures[index-1].order : 0);
      expect(lecture.reviewStatus).toBe('indexed');
      expect(lecture.objectiveIds).toEqual([]);
      lecture.videoIds.forEach(id => expect(id).toMatch(/^[\w-]{11}$/));
    }
    const present = new Set(course.lectures.map(lecture => lecture.order));
    for (let number=1; number <= course.lectures.at(-1)!.order; number++) {
      if (!present.has(number)) expect(course.unresolvedLectureNumbers).toContain(number);
    }
  }
});
