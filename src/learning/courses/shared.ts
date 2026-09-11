import { mathTutorials } from '../../content/math';
import { modelDefaults } from '../../physics';
import type { Assessment, Parameters } from '../../types';
import type { CourseDefinition, CourseGroup, ModelId, NormalMissionDefinition, ScienceStatus, SourceReference } from '../types';
export const reviewedAt = '2026-09-09';
export const source = (label: string, url: string): SourceReference => ({
    label, url
});
export const up = (volume: number, section: string): SourceReference => source(`OpenStax University Physics ${volume}: ${section.replace(/^\d+-\d+-/, '').replaceAll('-', ' ')}`, `https://openstax.org/books/university-physics-volume-${volume}/pages/${section}`);
type Choice = [
    prompt: string,
    options: string[],
    answer: number,
    explanation: string
];
type Calculation = [
    prompt: string,
    answer: number,
    unit: string,
    explanation: string
];
export interface StarterMission {
    id: string;
    title: string;
    summary: string;
    body: string[];
    equation: string;
    symbols: Array<[
        string,
        string
    ]>;
    math: string;
    mathNotes: string[];
    example: {
        question: string;
        steps: string[];
        answer: string;
    };
    calculation: Calculation;
    predict: Choice;
    check: Choice;
    lab: string;
    model?: ModelId;
    preset?: Parameters;
    takeaway: string;
    limitation: string;
    status?: ScienceStatus;
}
interface StarterCourse {
    id: string;
    title: string;
    description: string;
    group: CourseGroup;
    color: string;
    model: ModelId;
    sources: SourceReference[];
    limitations: string[];
    missions: StarterMission[];
}
function choice(id: string, data: Choice): Assessment {
    return {
        id, kind: 'concept', prompt: data[0], options: data[1], answer: data[2], hints: [data[3]], explanation: data[3]
    };
}
/** Assembly only: all scientific prose, questions, values, examples and lab tasks are authored per mission. */
export function starterCourse(course: StarterCourse): CourseDefinition {
    const missions: NormalMissionDefinition[] = course.missions.map(draft => {
        const id = `${course.id}-${draft.id}`, stepId = `${id}-math`;
        const tutorial = mathTutorials.find(item => item.id === `math-${draft.math}`);
        if (!tutorial)
            throw new Error(`Unavailable starter math: ${draft.math}`);
        const modelId = draft.model ?? course.model;
        const requiredMath = [tutorial.id];
        const calculation: Assessment = {
            id: `${id}-calculate`, kind: 'calculation', prompt: draft.calculation[0], answer: draft.calculation[1], unit: draft.calculation[2], tolerance: Math.abs(draft.calculation[1]) * 0.015 + 1e-40, hints: [draft.example.steps[0]], explanation: draft.calculation[3]
        };
        return {
            id, kind: 'mission', title: draft.title, summary: draft.summary, objectives: [draft.takeaway, `Use the worked example to explain ${draft.title.toLowerCase()}.`],
            minutes: 7, xp: 60, requiredMath, modelId, scienceStatus: draft.status ?? 'established',
            equation: draft.equation, symbols: draft.symbols.map(([symbol, meaning]) => `${symbol}: ${meaning}`).join('; '), workedExample: draft.example, reviewedAt,
            steps: [
                {
                    id: `${id}-observe`, kind: 'observe', title: draft.title, body: [draft.summary]
                },
                {
                    id: `${id}-predict`, kind: 'predict', assessment: choice(`${id}-prediction`, draft.predict)
                },
                {
                    id: `${id}-simulate`, kind: 'simulate', modelId, prompt: draft.lab, preset: {
                        ...modelDefaults(modelId), ...draft.preset
                    }
                },
                {
                    id: `${id}-explain`, kind: 'explain', title: 'Connect the evidence', body: draft.body
                },
                {
                    id: stepId, kind: 'math', title: `Calculate: ${draft.title.toLowerCase()}`, layer: {
                        quick: {
                            equation: draft.equation, summary: draft.summary, symbols: [...draft.symbols.map(([symbol, meaning]) => ({
                                    symbol, meaning
                                })), {
                                    symbol: '=', meaning: 'has the same value as'
                                }, {
                                    symbol: '\\times', meaning: 'multiply quantities; adjacent letters also mean multiplication'
                                }, {
                                    symbol: '/', meaning: 'divide the numerator by the denominator'
                                }]
                        },
                        foundation: {
                            title: `Build the math for ${draft.title.toLowerCase()}`, concepts: tutorial.concepts, explanation: [...draft.mathNotes, ...tutorial.explanation],
                            prerequisites: requiredMath.map(mathId => ({
                                id: mathId, returnTo: stepId
                            })), returnTo: stepId,
                            visual: {
                                ...tutorial.interactive, tutorialId: tutorial.id
                            }, workedExample: draft.example, check: calculation,
                        },
                    }
                },
                {
                    id: `${id}-check`, kind: 'check', assessment: choice(`${id}-reasoning`, draft.check)
                },
                {
                    id: `${id}-recap`, kind: 'recap', takeaways: [draft.takeaway, draft.limitation]
                },
            ],
            sources: course.sources, limitations: [draft.limitation, ...course.limitations],
        };
    });
    const checkpointId = `${course.id}-checkpoint`;
    return {
        id: course.id, title: course.title, description: course.description, group: course.group, scope: 'Released five-mission starter; deeper course planned', color: course.color, access: 'open', recommendations: [], estimatedMinutes: 40, sources: course.sources, limitations: course.limitations, reviewedAt,
        missions: [...missions, {
                id: checkpointId, kind: 'checkpoint', title: `${course.title} checkpoint`, summary: `Connect the five starter ideas in ${course.title.toLowerCase()}.`, objectives: [course.missions[0].takeaway, course.missions[4].takeaway], minutes: 5, xp: 100, requiredMath: [], scienceStatus: course.missions[4].status ?? 'established', sources: course.sources, limitations: course.limitations,
                checkpoint: {
                    badgeId: `${course.id}-starter`, requiredMissionIds: missions.map(mission => mission.id)
                },
                steps: [
                    ...[0, 2, 4].map((index) => ({
                        id: `${checkpointId}-check-${index}`, kind: 'check' as const, assessment: choice(`${checkpointId}-assessment-${index}`, course.missions[index].check)
                    })),
                    {
                        id: `${checkpointId}-recap`, kind: 'recap', takeaways: course.missions.map(mission => mission.takeaway)
                    },
                ],
            }],
    };
}
