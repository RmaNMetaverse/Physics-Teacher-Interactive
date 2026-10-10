/** Release contracts for the expanded curriculum. Legacy starter coverage is not inferred. */
export type ClaimKind = 'definition' | 'deduction' | 'experimental-law' | 'interpretation' | 'unconfirmed-proposal';
export interface FormulaRecord {
  id: string; latex: string; kind: ClaimKind;
  notation: Array<{ symbol: string; meaning: string; unit: string }>;
  assumptions: string[];
  derivation: string[];
  detailedProof: { startingPoint: string; steps: string[]; limits: string[] };
}
export interface ObjectiveContent {
  introduction: string; explanation: string[]; formulas: FormulaRecord[];
  examples: Array<{ question: string; steps: string[]; answer: string }>;
  assessments: Array<{ id: string; kind: 'concept' | 'calculation' | 'evidence'; prompt: string; answer: string; explanation: string; variants: string[] }>;
  misconceptions: Array<{ query: string; explanation: string }>;
  sourceUrls: string[];
}
export interface CurriculumObjective {
  id: string; title: string; prerequisites: string[]; requiredMath: string[];
  status: 'planned' | 'draft' | 'released'; lessonId?: string; content?: ObjectiveContent;
  experimentIds: string[]; lectureIds: string[];
}
export interface ExperimentDefinition {
  id: string; objectiveIds: string[]; modelId: string; rendererId: string;
  controls: Array<{ parameter: string; unit: string; min: number; max: number; initial: number }>;
  annotations: string[]; graphs: Array<{ x: string; y: string; xUnit: string; yUnit: string }>;
  investigation: { manipulate: string; compare: string; interpret: string };
  limitations: string[];
}
export interface LectureMapping { id: string; reviewed: boolean; objectiveIds: string[]; unresolvedTopics: string[] }

export function validateExpandedCurriculum(objectives: CurriculumObjective[], experiments: ExperimentDefinition[], lectures: LectureMapping[], mathIds: ReadonlySet<string>, lessonIds: ReadonlySet<string>, modelIds: ReadonlySet<string>): string[] {
  const errors: string[] = [], map = new Map(objectives.map(item => [item.id,item]));
  if (map.size !== objectives.length) errors.push('Duplicate objective identifiers.');
  const experimentMap = new Map(experiments.map(item => [item.id,item]));
  if (experimentMap.size !== experiments.length) errors.push('Duplicate experiment identifiers.');
  const lectureMap = new Map(lectures.map(item => [item.id,item]));
  if (lectureMap.size !== lectures.length) errors.push('Duplicate lecture identifiers.');
  const visiting = new Set<string>(), visited = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) { errors.push(`Prerequisite cycle at ${id}.`); return; }
    if (visited.has(id)) return;
    const objective = map.get(id);
    if (!objective) { errors.push(`Missing prerequisite ${id}.`); return; }
    visiting.add(id); objective.prerequisites.forEach(visit); visiting.delete(id); visited.add(id);
  };
  for (const objective of objectives) {
    visit(objective.id);
    objective.requiredMath.forEach(id => { if (!mathIds.has(id)) errors.push(`${objective.id}: unavailable math ${id}.`); });
    objective.experimentIds.forEach(id => { if (!experimentMap.get(id)?.objectiveIds.includes(objective.id)) errors.push(`${objective.id}: mismatched experiment ${id}.`); });
    objective.lectureIds.forEach(id => { if (!lectureMap.get(id)?.objectiveIds.includes(objective.id)) errors.push(`${objective.id}: missing reciprocal lecture mapping ${id}.`); });
    if (objective.status !== 'released') continue;
    if (!objective.lessonId || !lessonIds.has(objective.lessonId)) errors.push(`${objective.id}: missing released lesson.`);
    if (objective.prerequisites.some(id => map.get(id)?.status !== 'released')) errors.push(`${objective.id}: unreleased prerequisite.`);
    const content = objective.content;
    if (!content) { errors.push(`${objective.id}: missing content.`); continue; }
    if (!content.introduction.trim() || content.explanation.length < 2 || !content.explanation.every(p => p.trim())) errors.push(`${objective.id}: missing authored explanation.`);
    if (content.examples.length < 2 || content.examples.some(example => !example.question || example.steps.length < 2 || !example.answer)) errors.push(`${objective.id}: needs two worked examples.`);
    for (const kind of ['concept','calculation','evidence']) if (!content.assessments.some(a => a.kind === kind && a.prompt && a.answer && a.explanation && a.variants.length)) errors.push(`${objective.id}: missing ${kind} assessment and practice variants.`);
    if (!content.sourceUrls.length || content.sourceUrls.some(url => !url.startsWith('https://'))) errors.push(`${objective.id}: missing sources.`);
    if (!content.misconceptions.length) errors.push(`${objective.id}: missing misconception feedback.`);
    if (!content.formulas.length) errors.push(`${objective.id}: missing formula record.`);
    for (const formula of content.formulas) {
      if (!formula.id || !formula.latex || !formula.notation.length || formula.notation.some(n => !n.symbol || !n.meaning || !n.unit)) errors.push(`${objective.id}: unexplained formula notation or units.`);
      if (!formula.assumptions.length || !formula.derivation.length || !formula.detailedProof.startingPoint || !formula.detailedProof.steps.length || !formula.detailedProof.limits.length) errors.push(`${objective.id}: missing derivation or assumptions.`);
    }
  }
  for (const experiment of experiments) {
    if (!modelIds.has(experiment.modelId) || !experiment.rendererId || !experiment.limitations.length) errors.push(`${experiment.id}: missing model, renderer or limitations.`);
    if (!experiment.objectiveIds.length || experiment.objectiveIds.some(id => !map.get(id)?.experimentIds.includes(experiment.id))) errors.push(`${experiment.id}: mismatched objective.`);
    if (experiment.controls.some(c => !c.unit || ![c.min,c.max,c.initial].every(Number.isFinite) || c.min >= c.max || c.initial < c.min || c.initial > c.max)) errors.push(`${experiment.id}: invalid controls.`);
    if (!experiment.investigation.manipulate || !experiment.investigation.compare || !experiment.investigation.interpret) errors.push(`${experiment.id}: incomplete investigation.`);
  }
  for (const lecture of lectures) {
    if (lecture.reviewed && (!lecture.objectiveIds.length || lecture.unresolvedTopics.length)) errors.push(`${lecture.id}: cannot count unresolved lecture material as covered.`);
    lecture.objectiveIds.forEach(id => { if (!map.get(id)?.lectureIds.includes(lecture.id)) errors.push(`${lecture.id}: missing reciprocal objective mapping ${id}.`); });
  }
  return errors;
}
