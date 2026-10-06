import { foundationProofs } from './detailed-foundations-proofs';
import { starterProofs } from './detailed-starter-proofs';

export interface DetailedFormulaProof {
  start: string;
  steps: readonly string[];
  limits: string;
  sources?: readonly { label: string; url: string }[];
}

export const detailedFormulaProofs: Record<string, DetailedFormulaProof> = { ...foundationProofs, ...starterProofs };

const references: Record<string, { label: string; url: string }> = {
  'thermodynamics-ideal-gas': { label: 'OpenStax: kinetic theory and pressure', url: 'https://openstax.org/books/university-physics-volume-2/pages/2-2-pressure-temperature-and-rms-speed' },
  'thermodynamics-microscopic-temperature': { label: 'OpenStax: equipartition', url: 'https://openstax.org/books/university-physics-volume-2/pages/2-3-heat-capacity-and-equipartition-of-energy' },
  'electromagnetism-maxwells-synthesis': { label: 'OpenStax: Maxwell’s equations', url: 'https://openstax.org/books/university-physics-volume-2/pages/16-1-maxwells-equations-and-electromagnetic-waves' },
  'quantum-uncertainty': { label: 'OpenStax: state spreads and uncertainty', url: 'https://openstax.org/books/university-physics-volume-3/pages/7-2-the-heisenberg-uncertainty-principle' },
  'condensed-matter-superconductivity': { label: 'Rutgers: BCS gap calculation', url: 'https://www.physics.rutgers.edu/grad/621/lectures/L20_BCS_Path_Integral.pdf' },
  'astrophysics-stellar-light': { label: 'OpenStax: blackbody spectrum', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-1-blackbody-radiation' },
  'astrophysics-compact-objects': { label: 'Sean Carroll: Schwarzschild vacuum solution', url: 'https://ned.ipac.caltech.edu/level5/March01/Carroll3/Carroll7.html' },
};
for (const [id, reference] of Object.entries(references)) detailedFormulaProofs[id].sources = [reference];
