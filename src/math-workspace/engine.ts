import { ComputeEngine, isExpression } from '@cortex-js/compute-engine';
import type { Calculation, CalculationResult, GraphSpec, GraphData, Point2D, AngleUnit } from './types';

const operators = new Set(['Add', 'Subtract', 'InvisibleOperator', 'Multiply', 'Divide', 'Rational', 'Negate', 'Power', 'Root', 'Sqrt', 'Square', 'Exp', 'Ln', 'Log', 'Log10', 'Sin', 'Cos', 'Tan', 'Arcsin', 'Arccos', 'Arctan', 'Sinh', 'Cosh', 'Tanh', 'Abs', 'Floor', 'Ceil', 'Min', 'Max', 'Equal', 'Less', 'LessEqual', 'Greater', 'GreaterEqual', 'Tuple', 'List', 'Matrix', 'Complex', 'Delimiter']);

function parse(latex: string, angleUnit: AngleUnit = 'rad') {
  if (!latex.trim() || latex.length > 2048) throw new Error('Enter a formula of at most 2048 characters.');
  let depth = 0;
  for (const character of latex) {
    if ('({['.includes(character) && ++depth > 24) throw new Error('This expression is too deeply nested.');
    if (')}]'.includes(character)) depth--;
  }
  const ce = new ComputeEngine();
  ce.angularUnit = angleUnit;
  const raw = ce.parse(latex, { form: 'raw' });
  const expression = ce.parse(latex);
  if (!expression.isValid) throw new Error('The formula is incomplete or has a syntax error.');
  let nodes = 0;
  function validate(node: unknown, nesting = 0): void {
    if (++nodes > 512 || nesting > 24) throw new Error('This expression is too complex.');
    if (Array.isArray(node)) {
      if (!operators.has(node[0])) throw new Error(`The operation ${String(node[0])} is not supported here.`);
      node.slice(1).forEach(value => validate(value, nesting + 1));
    } else if (typeof node === 'string' && !/^(?:[a-zA-Z]|Pi|ExponentialE|ImaginaryUnit)$/.test(node)) {
      throw new Error(`Unsupported symbol: ${node}. Use single-letter variables.`);
    } else if (node && typeof node === 'object') {
      if (!('num' in node) || !Number.isFinite(Number(node.num))) throw new Error('Unsupported mathematical input.');
    }
  }
  validate(expression.json);
  validate(raw.json);
  return { ce, expression, raw };
}

export function calculate(request: Calculation): CalculationResult {
  const { ce, expression } = parse(request.latex, request.angleUnit);
  const variable = request.variable || 'x';
  if (!/^[a-zA-Z]$/.test(variable)) throw new Error('Choose a single-letter variable.');
  const explanations = {
    evaluate: 'Evaluate known quantities exactly where possible. Undefined quantities remain symbolic.',
    approximate: 'Numerical approximation; check the domain and units before interpreting the value.',
    simplify: 'Combine supported algebraic terms. Keep the original expression’s domain restrictions.',
    solve: `Solve for ${variable}. These are candidate roots: substitute into the original expression to check domain restrictions. An expression without = is set equal to zero.`,
    differentiate: `Differentiate with respect to ${variable}, holding other variables fixed. Power, product and chain rules describe local rate of change. Trigonometric derivatives use radians.`,
    integrate: `Find a supported antiderivative with respect to ${variable}; add an arbitrary constant C. An unevaluated integral means no supported result was found.`,
  };
  if (request.operation === 'solve') {
    // Inspect the unsimplified syntax: a removable singularity is still excluded.
    const original = ce.parse(request.latex, { form: 'raw' }).json;
    const degree = (node: unknown): number => {
      if (typeof node === 'number') return 0;
      if (node === variable) return 1;
      if (node === 'Pi' || node === 'ExponentialE') return 0;
      if (!Array.isArray(node)) return Infinity;
      const degrees = node.slice(1).map(degree);
      switch (node[0]) {
        case 'Add': case 'Subtract': case 'Equal': return Math.max(...degrees);
        case 'Negate': case 'Delimiter': return degrees[0];
        case 'InvisibleOperator': case 'Multiply': return degrees.reduce((sum, value) => sum + value, 0);
        case 'Rational': case 'Divide': return degrees[1] === 0 ? degrees[0] : Infinity;
        case 'Power': return typeof node[2] === 'number' && Number.isInteger(node[2]) && node[2] >= 0 ? degrees[0] * node[2] : Infinity;
        default: return Infinity;
      }
    };
    if (!(degree(original) >= 1 && degree(original) <= 2)) throw new Error('Solve supports linear and quadratic polynomials with numeric coefficients. Other equations require a guided derivation.');
    const solutions = expression.solve(variable);
    if (!Array.isArray(solutions)) throw new Error('No supported explicit solution was found. Try a linear or quadratic equation.');
    const roots = solutions.map(solution => isExpression(solution) ? solution : solution[variable]);
    const verified = roots.filter(solution => {
      const value = solution.N();
      return value.isFinite !== false;
    });
    return { latex: verified.length ? `${variable}\\in\\left\\{${verified.map(value => value.latex).join(',')}\\right\\}` : '\\varnothing', explanation: explanations.solve };
  }
  if ((request.operation === 'differentiate' || request.operation === 'integrate') && request.angleUnit === 'deg') throw new Error('Switch to radians before using calculus.');
  const result = request.operation === 'simplify' ? expression.simplify()
    : request.operation === 'approximate' ? expression.N()
      : request.operation === 'differentiate' ? ce.box(['D', expression, variable]).evaluate()
        : request.operation === 'integrate' ? ce.box(['Integrate', expression, variable]).evaluate()
          : expression.evaluate();
  if (result.isFinite === false || /NaN|Undefined|ComplexInfinity/.test(JSON.stringify(result.json))) throw new Error('This expression is undefined or nonfinite in the selected domain.');
  return { latex: result.latex + (request.operation === 'integrate' ? '+C' : ''), explanation: explanations[request.operation] };
}

/** Restricted numeric interpreter: never compile learner input into JavaScript. */
export function compileExpression(latex: string, angleUnit: AngleUnit = 'rad'): (variables: Record<string, number>) => number {
  const { raw } = parse(latex, angleUnit);
  const factor = angleUnit === 'deg' ? Math.PI / 180 : 1;
  function compile(node: unknown): (variables: Record<string, number>) => number {
    if (typeof node === 'number') return () => node;
    if (typeof node === 'string') {
      if (node === 'Pi') return () => Math.PI;
      if (node === 'ExponentialE') return () => Math.E;
      if (node === 'ImaginaryUnit') throw new Error('Graphs require real-valued expressions.');
      return variables => variables[node] ?? NaN;
    }
    if (!Array.isArray(node)) return () => Number((node as { num?: string })?.num ?? NaN);
    const args = node.slice(1).map(compile);
    return variables => {
      const a = args.map(fn => fn(variables)), x = a[0], y = a[1];
      switch (node[0]) {
        case 'Add': return a.reduce((sum, value) => sum + value, 0);
        case 'InvisibleOperator': case 'Multiply': return a.reduce((product, value) => product * value, 1);
        case 'Subtract': return x - y;
        case 'Negate': return -x;
        case 'Divide': case 'Rational': return x / y;
        case 'Power': return x ** y;
        case 'Square': return x * x;
        case 'Sqrt': return Math.sqrt(x);
        case 'Root': return x ** (1 / y);
        case 'Exp': return Math.exp(x);
        case 'Ln': return Math.log(x);
        case 'Log': return Math.log(x) / Math.log(y ?? 10);
        case 'Log10': return Math.log10(x);
        case 'Sin': return Math.sin(x * factor);
        case 'Cos': return Math.cos(x * factor);
        case 'Tan': return Math.tan(x * factor);
        case 'Arcsin': return Math.asin(x) / factor;
        case 'Arccos': return Math.acos(x) / factor;
        case 'Arctan': return Math.atan(x) / factor;
        case 'Sinh': return Math.sinh(x);
        case 'Cosh': return Math.cosh(x);
        case 'Tanh': return Math.tanh(x);
        case 'Abs': return Math.abs(x);
        case 'Floor': return Math.floor(x);
        case 'Ceil': return Math.ceil(x);
        case 'Min': return Math.min(...a);
        case 'Max': return Math.max(...a);
        case 'Equal': return x - y;
        case 'Delimiter': return x;
        default: throw new Error(`The operation ${node[0]} cannot be plotted as a real scalar.`);
      }
    };
  }
  return compile(raw.json);
}

export function sampleGraph(spec: GraphSpec): GraphData {
  if (![spec.min, spec.max, spec.yMin, spec.yMax].every(Number.isFinite) || spec.min >= spec.max || spec.yMin >= spec.yMax) throw new Error('Graph bounds must be finite and increasing.');
  const f = compileExpression(spec.latex, spec.angleUnit);
  const segments: Point2D[][] = [], points: Point2D[] = [];
  if (spec.kind === 'implicit' || spec.kind === 'inequality') {
    const n = 64, dx = (spec.max - spec.min) / n, dy = (spec.yMax - spec.yMin) / n;
    const value = (x: number, y: number) => f({ ...spec.parameters, x, y });
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = spec.min + i * dx, y = spec.yMin + j * dy;
      if (spec.kind === 'inequality' && value(x + dx / 2, y + dy / 2) <= 0) points.push([x + dx / 2, y + dy / 2]);
      const corners: Point2D[] = [[x, y], [x + dx, y], [x + dx, y + dy], [x, y + dy]];
      const crossings: Point2D[] = [];
      for (let k = 0; k < 4; k++) {
        const a = corners[k], b = corners[(k + 1) % 4], va = value(...a), vb = value(...b);
        if (Number.isFinite(va) && Number.isFinite(vb) && (va < 0) !== (vb < 0)) {
          // A sign change can also be a pole. Refine and require a small residual.
          let low = 0, high = 1, leftValue = va;
          for (let iteration = 0; iteration < 16; iteration++) {
            const mid = (low + high) / 2;
            const test = value(a[0] + (b[0]-a[0])*mid, a[1] + (b[1]-a[1])*mid);
            if (!Number.isFinite(test)) break;
            if ((test < 0) === (leftValue < 0)) { low = mid; leftValue = test; } else high = mid;
          }
          const ratio = (low + high) / 2;
          const crossing: Point2D = [a[0] + (b[0]-a[0])*ratio, a[1] + (b[1]-a[1])*ratio];
          if (Math.abs(value(...crossing)) <= 1e-3 * Math.max(1, Math.abs(va), Math.abs(vb))) crossings.push(crossing);
        }
      }
      for (let k = 0; k + 1 < crossings.length; k += 2) segments.push([crossings[k], crossings[k + 1]]);
    }
    return { segments, points, note: 'Numerical contour on a bounded grid; features smaller than the grid can be missed. Shading means f(x,y) ≤ 0.' };
  }
  const g = spec.kind === 'parametric' ? compileExpression(spec.secondary, spec.angleUnit) : null;
  let segment: Point2D[] = [];
  for (let i = 0; i <= 600; i++) {
    const t = spec.min + (spec.max - spec.min) * i / 600;
    const variables = { ...spec.parameters, x: t, t }, value = f(variables);
    const angle = spec.angleUnit === 'deg' ? t * Math.PI / 180 : t;
    const point: Point2D = spec.kind === 'parametric' ? [value, g!(variables)] : spec.kind === 'polar' ? [value * Math.cos(angle), value * Math.sin(angle)] : [t, value];
    const previous = segment.at(-1);
    if (!point.every(Number.isFinite) || Math.abs(point[1]) > 1e8 || (previous && Math.abs(point[1] - previous[1]) > (spec.yMax - spec.yMin) * .6)) {
      if (segment.length > 1) segments.push(segment);
      segment = [];
      continue;
    }
    segment.push(point);
  }
  if (segment.length > 1) segments.push(segment);
  return { segments, points, note: 'Numerically sampled curve; zoom and inspect the formula near discontinuities. For parametric/polar curves the interval controls t.' };
}

export function fitData(points: Point2D[], kind: 'linear' | 'quadratic' | 'exponential') {
  const order = kind === 'quadratic' ? 2 : 1;
  if (points.length < order + 1 || points.length > 2000 || points.some(p => !p.every(Number.isFinite) || (kind === 'exponential' && p[1] <= 0))) throw new Error('Provide enough finite points; exponential fits require positive y values.');
  const n = order + 1;
  const matrix = Array.from({ length: n }, (_, row) => [...Array.from({ length: n }, (_, col) => points.reduce((sum, [x]) => sum + x ** (row + col), 0)), points.reduce((sum, [x, y]) => sum + x ** row * (kind === 'exponential' ? Math.log(y) : y), 0)]);
  for (let col = 0; col < n; col++) {
    const pivot = matrix.reduce((best, row, index) => index >= col && Math.abs(row[col]) > Math.abs(matrix[best][col]) ? index : best, col);
    [matrix[col], matrix[pivot]] = [matrix[pivot], matrix[col]];
    if (Math.abs(matrix[col][col]) < 1e-12) throw new Error('The data do not determine a unique fit. Use distinct x values.');
    const divisor = matrix[col][col];
    matrix[col] = matrix[col].map(value => value / divisor);
    for (let row = 0; row < n; row++) if (row !== col) {
      const factor = matrix[row][col];
      matrix[row] = matrix[row].map((value, i) => value - factor * matrix[col][i]);
    }
  }
  const coefficients = matrix.map(row => row[n]);
  const predict = (x: number) => kind === 'exponential' ? Math.exp(coefficients[0] + coefficients[1] * x) : coefficients.reduce((sum, a, i) => sum + a * x ** i, 0);
  return { coefficients, residuals: points.map(([x, y]) => y - predict(x)), predicted: points.map(([x]) => [x, predict(x)] as Point2D) };
}
