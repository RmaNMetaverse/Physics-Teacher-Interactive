import { modelCatalog } from '../physics';
import type { Assessment } from '../types';
import { validateExpandedCurriculum, type CurriculumObjective, type ExperimentDefinition, type FormulaRecord } from './curriculum-contract';
import { foundationEnrichment } from './foundation-enrichment';
import { formulaReasoning } from './formula-reasoning';
import { foundationCourse } from './foundations';

const lessonIds = [
  'measurement-basics', 'unit-conversion', 'measurement-uncertainty',
  'coordinates-displacement', 'vector-components', 'vector-addition',
  'constant-velocity', 'constant-acceleration', 'projectile-motion',
] as const;

type StageOneLessonId = typeof lessonIds[number];

const objectiveByLesson: Record<StageOneLessonId, string> = Object.fromEntries(
  lessonIds.map(id => [id, foundationEnrichment[id].objectiveId]),
) as Record<StageOneLessonId, string>;

const prerequisiteLessons: Record<StageOneLessonId, StageOneLessonId[]> = {
  'measurement-basics': [],
  'unit-conversion': ['measurement-basics'],
  'measurement-uncertainty': ['unit-conversion'],
  'coordinates-displacement': ['measurement-uncertainty'],
  'vector-components': ['coordinates-displacement'],
  'vector-addition': ['vector-components'],
  'constant-velocity': ['vector-addition'],
  'constant-acceleration': ['constant-velocity'],
  'projectile-motion': ['constant-acceleration', 'vector-components'],
};

const supplementalSources: Record<StageOneLessonId, string[]> = {
  'measurement-basics': ['https://www.khanacademy.org/science/physics/units-and-measurements'],
  'unit-conversion': ['https://www.khanacademy.org/science/physics/units-and-measurements'],
  'measurement-uncertainty': ['https://www.khanacademy.org/science/physics/units-and-measurements'],
  'coordinates-displacement': ['https://www.physicsclassroom.com/class/1dkin/lesson-1/introduction'],
  'vector-components': ['https://www.physicsclassroom.com/Physics-Video-Tutorial/Vectors-and-Projectiles'],
  'vector-addition': ['https://www.physicsclassroom.com/Physics-Video-Tutorial/Vectors-and-Projectiles'],
  'constant-velocity': ['https://www.physicsclassroom.com/Physics-Tutorial/1-D-Kinematics', 'https://www.khanacademy.org/science/physics/one-dimensional-motion/displacement-velocity-acceleration-tutorial/a/motion-diagrams'],
  'constant-acceleration': ['https://www.physicsclassroom.com/Physics-Tutorial/1-D-Kinematics', 'https://www.khanacademy.org/science/physics/one-dimensional-motion/displacement-velocity-acceleration-tutorial/a/motion-diagrams'],
  'projectile-motion': ['https://www.physicsclassroom.com/Physics-Video-Tutorial/Vectors-and-Projectiles', 'https://www.khanacademy.org/science/physics/projectile-motion'],
};

const practiceVariants: Record<StageOneLessonId, [string, string, string]> = {
  'measurement-basics': ['Classify 7.2 kg as a value, unit, and physical quantity.', 'Find the total duration of five equal 0.40 s intervals.', 'Compare a model input with a reading from a physical timer.'],
  'unit-conversion': ['Choose the factor that converts meters to millimeters without changing length.', 'Convert 0.045 km to meters and show unit cancellation.', 'Hold the modeled rod fixed while changing only its display unit.'],
  'measurement-uncertainty': ['Decide whether tightly grouped biased readings are precise, accurate, both, or neither.', 'Find the bounds and relative uncertainty of 12.0 ± 0.3 cm.', 'Compare two intervals and state whether their stated bounds overlap.'],
  'coordinates-displacement': ['Explain how a closed walk can have positive distance and zero displacement.', 'Find signed displacement from x = 5 m to x = −4 m.', 'Record endpoints for two different paths that have the same displacement.'],
  'vector-components': ['Predict component signs for an arrow in quadrant III.', 'Resolve a 12 N vector at 60° from +x.', 'Rotate a fixed vector and compare its reconstructed magnitude at three angles.'],
  'vector-addition': ['Explain why opposite x components need not make the entire resultant zero.', 'Add (−2, 5) m and (7, −3) m and find the magnitude.', 'Reverse the order of two displayed vectors and compare their endpoints.'],
  'constant-velocity': ['Distinguish a horizontal position graph from a graph lying on x = 0.', 'Find velocity from two points on a position-time line.', 'Double the velocity and compare equal-time displacements and graph slopes.'],
  'constant-acceleration': ['Decide when negative acceleration increases rather than decreases speed.', 'Use a velocity-time area to find displacement over a stated interval.', 'Compare velocity changes over two equal intervals under constant acceleration.'],
  'projectile-motion': ['Explain why horizontal launch speed does not change fall time in the no-drag model.', 'Solve the full vertical quadratic for a projectile landing below its launch point.', 'Compare horizontal and vertical velocity components at equal time intervals.'],
};

const graphAxes: Record<StageOneLessonId, ExperimentDefinition['graphs']> = {
  'measurement-basics': [{ x: 'trial', y: 'reported length', xUnit: '1', yUnit: 'm' }],
  'unit-conversion': [{ x: 'SI length', y: 'display value', xUnit: 'm', yUnit: 'selected unit' }],
  'measurement-uncertainty': [{ x: 'central length', y: 'relative uncertainty', xUnit: 'm', yUnit: '%' }],
  'coordinates-displacement': [{ x: 'path step', y: 'position', xUnit: '1', yUnit: 'm' }],
  'vector-components': [{ x: 'angle', y: 'component', xUnit: 'deg', yUnit: 'm' }],
  'vector-addition': [{ x: 'horizontal component', y: 'vertical component', xUnit: 'm', yUnit: 'm' }],
  'constant-velocity': [{ x: 'time', y: 'position', xUnit: 's', yUnit: 'm' }],
  'constant-acceleration': [{ x: 'time', y: 'velocity', xUnit: 's', yUnit: 'm/s' }],
  'projectile-motion': [{ x: 'horizontal position', y: 'height', xUnit: 'm', yUnit: 'm' }],
};

function notation(symbols: string): FormulaRecord['notation'] {
  return symbols.split(';').map(entry => {
    const [symbol, ...meaningParts] = entry.split(':');
    const meaning = meaningParts.join(':').trim();
    const unit = meaning.match(/\(([^()]*)\)\.?$/)?.[1] ?? (meaning.includes('percent') ? '%' : '1');
    return { symbol: symbol.trim(), meaning: meaning || 'Defined in the lesson context.', unit };
  }).filter(item => item.symbol);
}

function answerText(assessment: Assessment): string {
  if (assessment.options) return assessment.options[assessment.answer] ?? String(assessment.answer);
  return `${assessment.answer}${assessment.unit ? ` ${assessment.unit}` : ''}`;
}

const stageOneMissions = lessonIds.map(id => {
  const mission = foundationCourse.missions.find(candidate => candidate.id === id);
  if (!mission || mission.kind !== 'mission') throw new Error(`Stage 1 lesson ${id} is unavailable.`);
  return [id, mission] as const;
});

export const stageOneObjectives: CurriculumObjective[] = stageOneMissions.map(([lessonId, mission]) => {
  const enrichment = foundationEnrichment[lessonId];
  const reasoning = formulaReasoning[lessonId];
  if (!reasoning?.detailed) throw new Error(`Stage 1 lesson ${lessonId} needs a detailed formula proof.`);
  const assessments = mission.steps.flatMap(step => step.kind === 'predict' || step.kind === 'check' ? [step.assessment] : []);
  const mathAssessment = mission.steps.find(step => step.kind === 'math');
  if (mathAssessment?.kind === 'math') assessments.splice(1, 0, mathAssessment.layer.foundation.check);
  const kinds = ['concept', 'calculation', 'evidence'] as const;
  return {
    id: enrichment.objectiveId,
    title: mission.title,
    prerequisites: prerequisiteLessons[lessonId].map(id => objectiveByLesson[id]),
    requiredMath: mission.requiredMath,
    status: 'released',
    lessonId,
    experimentIds: [`${lessonId}-investigation`],
    lectureIds: [],
    content: {
      introduction: mission.summary,
      explanation: mission.detailedExplanation ?? [mission.summary, ...mission.objectives],
      formulas: [{
        id: `${enrichment.objectiveId}.formula`, latex: mission.equation,
        kind: lessonId.startsWith('measurement') || lessonId === 'coordinates-displacement' ? 'definition' : 'deduction',
        notation: notation(mission.symbols), assumptions: mission.limitations,
        derivation: [...reasoning.steps],
        detailedProof: { startingPoint: reasoning.detailed.start, steps: [...reasoning.detailed.steps], limits: [reasoning.detailed.limits] },
      }],
      examples: [mission.workedExample, enrichment.example],
      assessments: kinds.map((kind, index) => {
        const assessment = assessments[index];
        if (!assessment) throw new Error(`Stage 1 lesson ${lessonId} needs ${kind} assessment content.`);
        return { id: assessment.id, kind, prompt: assessment.prompt, answer: answerText(assessment), explanation: assessment.explanation, variants: [practiceVariants[lessonId][index]] };
      }),
      misconceptions: [{ query: enrichment.misconception.question, explanation: enrichment.misconception.explanation }],
      sourceUrls: [...new Set([...mission.sources.map(source => source.url), ...supplementalSources[lessonId]])],
    },
  };
});

export const stageOneExperiments: ExperimentDefinition[] = stageOneMissions.map(([lessonId, mission]) => {
  const modelId = mission.modelId;
  if (!modelId) throw new Error(`Stage 1 lesson ${lessonId} needs a model.`);
  const simulate = mission.steps.find(step => step.kind === 'simulate');
  if (simulate?.kind !== 'simulate') throw new Error(`Stage 1 lesson ${lessonId} needs an investigation.`);
  const parameters = modelCatalog[modelId].parameters;
  return {
    id: `${lessonId}-investigation`, objectiveIds: [objectiveByLesson[lessonId]], modelId,
    rendererId: `model-scene:${modelId}`,
    controls: parameters.map(parameter => ({ parameter: parameter.key, unit: parameter.unit || '1', min: parameter.min, max: parameter.max, initial: simulate.preset[parameter.key] ?? parameter.default })),
    annotations: [...mission.objectives], graphs: graphAxes[lessonId],
    investigation: {
      manipulate: simulate.prompt,
      compare: practiceVariants[lessonId][2],
      interpret: mission.steps.find(step => step.kind === 'recap')?.takeaways.join(' ') ?? mission.summary,
    },
    limitations: mission.limitations,
  };
});

export function validateStageOneCurriculum(): string[] {
  const mathIds = new Set(foundationCourse.missions.flatMap(mission => mission.requiredMath));
  return validateExpandedCurriculum(
    stageOneObjectives,
    stageOneExperiments,
    [],
    mathIds,
    new Set(foundationCourse.missions.map(mission => mission.id)),
    new Set(Object.keys(modelCatalog)),
  );
}
