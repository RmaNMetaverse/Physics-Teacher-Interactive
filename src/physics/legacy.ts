import type { Body, Family, Observation, ParameterDefinition, Parameters, SimulationDefinition, SimulationState } from '../types';

export const G = 6.67430e-11;
const TAU = 2 * Math.PI;
const rad = (degrees: number) => degrees * Math.PI / 180;
const cyan = '#5eead4', blue = '#60a5fa', orange = '#fbbf24';
const parameter = (key: string, label: string, unit: string, min: number, max: number, step: number, initial: number): ParameterDefinition =>
  ({ key, label, unit, min, max, step, default: initial });
const mass = () => parameter('mass', 'Mass', 'kg', .1, 20, .1, 2);
const gravity = () => parameter('g', 'Gravitational acceleration', 'm/s²', .1, 25, .01, 9.81);
const obs = (key: string, label: string, value: number, unit: string, color = cyan): Observation => ({ key, label, value, unit, color });
const body = (id: string, x: number, y: number, radius = .3, color = cyan, vx = 0, vy = 0): Body =>
  ({ id, position: [x, y, 0], radius, color, velocity: [vx, vy, 0] });
type Model = (p: Parameters, t: number) => SimulationState;

function definition(id: Family, title: string, description: string, parameters: ParameterDefinition[], duration: number, model: Model): SimulationDefinition {
  return { id, title, description, parameters, duration, evaluate: (p, time) => {
    const t = Number.isFinite(time) ? Math.max(0, Math.min(duration, time)) : 0;
    const state = model(sanitizeParameters(id, p), t);
    return { ...state, ended: state.ended || t >= duration };
  } };
}

export const simulations: Record<Family, SimulationDefinition> = {
  measurement: definition('measurement', 'Measure with confidence', 'Convert a length and its absolute uncertainty together.', [
    parameter('length', 'Measured length', 'm', .1, 10, .1, 2),
    parameter('uncertainty', 'Absolute uncertainty', 'm', .001, .5, .001, .05),
    parameter('scale', 'Display units per meter (100 = cm)', 'units/m', 1, 1000, 1, 1),
  ], 10, (p, t) => ({ time: t, ended: false, bodies: [body('origin', 0, 0, .1, blue), body('measurement', p.length, 0)],
    observations: [obs('length', 'Length', p.length, 'm'), obs('uncertainty', 'Absolute uncertainty', p.uncertainty, 'm', orange),
      obs('lowerBound', 'Lower uncertainty bound', p.length - p.uncertainty, 'm', blue),
      obs('upperBound', 'Upper uncertainty bound', p.length + p.uncertainty, 'm', orange),
      obs('relative', 'Relative uncertainty', 100 * p.uncertainty / p.length, '%'),
      obs('converted', 'Converted length', p.length * p.scale, 'display units', blue),
      obs('convertedUncertainty', 'Converted uncertainty', p.uncertainty * p.scale, 'display units', orange)],
    description: 'A stated uncertainty is an interval estimate, not a random animation. Display units = meters × scale. No probability distribution is assumed.' })),

  vectors: definition('vectors', 'Build a resultant', 'Resolve vector A, then add vector B by components.', [
    parameter('magnitude', 'Magnitude of A', 'm', 0, 10, .1, 5), parameter('angle', 'Angle of A from +x', '°', -180, 180, 1, 35),
    parameter('bx', 'B horizontal component', 'm', -10, 10, .1, 3), parameter('by', 'B vertical component', 'm', -10, 10, .1, 2),
  ], 10, (p, t) => {
    const ax = p.magnitude * Math.cos(rad(p.angle)), ay = p.magnitude * Math.sin(rad(p.angle));
    const rx = ax + p.bx, ry = ay + p.by;
    return { time: t, ended: false, bodies: [body('origin', 0, 0, .1, blue), body('vector-a', ax, ay, .2), body('resultant', rx, ry, .25, orange)],
      observations: [obs('ax', 'A horizontal', ax, 'm'), obs('ay', 'A vertical', ay, 'm', blue), obs('rx', 'Resultant horizontal', rx, 'm'),
        obs('ry', 'Resultant vertical', ry, 'm', blue), obs('resultant', 'Resultant magnitude', Math.hypot(rx, ry), 'm', orange)],
      description: 'Vectors are displacements in a flat Cartesian plane. Angles are counterclockwise from +x. The second endpoint shows A + B.' };
  }),

  motion: definition('motion', 'Motion laboratory', 'Compare constant velocity, acceleration, free fall and projectiles.', [
    parameter('mode', 'Mode: 0 velocity · 1 acceleration · 2 fall · 3 projectile', '', 0, 3, 1, 3),
    parameter('speed', 'Initial speed (horizontal in modes 0–1)', 'm/s', 0, 40, .5, 12),
    parameter('angle', 'Launch angle (projectile)', '°', 0, 90, 1, 45),
    parameter('acceleration', 'Horizontal acceleration (mode 1)', 'm/s²', -10, 10, .1, 2),
    parameter('height', 'Initial height', 'm', 0, 40, .5, 0), gravity(), { ...mass(), default: 1 },
  ], 12, (p, t) => {
    const falling = p.mode >= 2;
    const vx0 = p.mode === 2 ? 0 : p.speed * (p.mode === 3 ? Math.cos(rad(p.angle)) : 1);
    const vy0 = p.mode === 3 ? p.speed * Math.sin(rad(p.angle)) : 0;
    const ax = p.mode === 1 ? p.acceleration : 0;
    const impact = falling ? (vy0 + Math.sqrt(vy0 * vy0 + 2 * p.g * p.height)) / p.g : Infinity;
    const time = Math.min(t, impact);
    const x = vx0 * time + .5 * ax * time * time;
    const y = Math.max(0, p.height + vy0 * time - (falling ? .5 * p.g * time * time : 0));
    const vx = vx0 + ax * time, vy = falling ? vy0 - p.g * time : 0;
    return { time, ended: falling && t >= impact, bodies: [body('particle', x, y, .3, cyan, vx, vy)],
      observations: [obs('x', 'Horizontal position', x, 'm'), obs('y', 'Height', y, 'm', blue), obs('vx', 'Horizontal velocity', vx, 'm/s'),
        obs('vy', 'Vertical velocity', vy, 'm/s', blue), obs('speed', 'Speed', Math.hypot(vx, vy), 'm/s', orange),
        obs('kinetic', 'Kinetic energy', .5 * p.mass * (vx * vx + vy * vy), 'J', orange)],
      description: falling ? 'Uniform gravity; no air resistance or spin. Motion ends at first ground contact; velocity is the value immediately before impact.' :
        'Straight-line motion with constant prescribed acceleration. Positive horizontal velocity points right; mass does not alter the prescribed trajectory.' };
  }),

  forces: definition('forces', 'Forces on an incline', 'Explore net force, normal reaction and friction from rest.', [
    mass(), parameter('force', 'Applied force down slope (negative = up)', 'N', -40, 40, .5, 8),
    parameter('angle', 'Slope angle below horizontal', '°', 0, 60, 1, 0),
    parameter('friction', 'Friction coefficient (static = kinetic)', '', 0, 1, .01, .2), gravity(),
  ], 8, (p, t) => {
    const angle = rad(p.angle), normal = p.mass * p.g * Math.cos(angle);
    const drive = p.force + p.mass * p.g * Math.sin(angle);
    const frictionForce = -Math.sign(drive) * Math.min(Math.abs(drive), p.friction * normal);
    const netForce = drive + frictionForce, acceleration = netForce / p.mass;
    const s = .5 * acceleration * t * t, v = acceleration * t;
    return { time: t, ended: false, bodies: [body('block', s * Math.cos(angle), -s * Math.sin(angle), .4, cyan, v * Math.cos(angle), -v * Math.sin(angle))],
      observations: [obs('netForce', 'Net force down slope', netForce, 'N'), obs('normal', 'Normal reaction', normal, 'N', blue),
        obs('frictionForce', 'Signed friction force', frictionForce, 'N', orange), obs('acceleration', 'Acceleration down slope', acceleration, 'm/s²'),
        obs('displacement', 'Displacement down slope', s, 'm'), obs('velocity', 'Velocity down slope', v, 'm/s', blue)],
      description: 'Block starts at rest on an unlimited slope. Applied force is parallel to the surface. Static and kinetic coefficients are set equal; static friction balances the drive until its limit.' };
  }),

  energy: definition('energy', 'Follow the energy', 'Watch gravitational energy become kinetic energy and heat.', [
    mass(), parameter('height', 'Initial height', 'm', .1, 20, .1, 5), parameter('angle', 'Ramp angle (90° = free fall)', '°', 5, 90, 1, 30),
    parameter('friction', 'Friction coefficient (static = kinetic)', '', 0, 1, .01, 0), gravity(),
  ], 20, (p, t) => {
    const angle = rad(p.angle), path = p.height / Math.sin(angle);
    const acceleration = Math.max(0, p.g * (Math.sin(angle) - p.friction * Math.cos(angle)));
    const impact = acceleration > 0 ? Math.sqrt(2 * path / acceleration) : Infinity;
    const time = Math.min(t, impact), s = Math.min(path, .5 * acceleration * time * time), v = acceleration * time;
    const h = Math.max(0, p.height - s * Math.sin(angle));
    const kinetic = .5 * p.mass * v * v, potential = p.mass * p.g * h;
    const thermal = p.friction * p.mass * p.g * Math.cos(angle) * s;
    return { time, ended: t >= impact, bodies: [body('block', s * Math.cos(angle), h, .35, cyan, v * Math.cos(angle), -v * Math.sin(angle))],
      observations: [obs('kinetic', 'Kinetic energy', kinetic, 'J'), obs('potential', 'Potential energy', potential, 'J', blue),
        obs('thermal', 'Thermal energy gained', thermal, 'J', orange), obs('totalEnergy', 'Kinetic + potential + thermal', kinetic + potential + thermal, 'J'),
        obs('speed', 'Speed', v, 'm/s', blue), obs('height', 'Height', h, 'm'), obs('work', 'Net work', kinetic, 'J')],
      description: 'Released from rest. Sliding without rotation; uniform gravity and equal static/kinetic friction coefficients. Thermal energy counts frictional dissipation. State freezes immediately before ground impact.' };
  }),

  collisions: definition('collisions', 'Collision bench', 'Compare momentum and kinetic energy before and after one impact.', [
    parameter('mass1', 'Mass of body A', 'kg', .1, 10, .1, 2), parameter('mass2', 'Mass of body B', 'kg', .1, 10, .1, 1),
    parameter('velocity1', 'Initial velocity A', 'm/s', -8, 8, .1, 3), parameter('velocity2', 'Initial velocity B', 'm/s', -8, 8, .1, 0),
    parameter('restitution', 'Coefficient of restitution', '', 0, 1, .01, 1),
  ], 8, (p, t) => {
    const relative = p.velocity1 - p.velocity2, collisionTime = relative > 0 ? 5.4 / relative : Infinity;
    const collided = t >= collisionTime, totalMass = p.mass1 + p.mass2;
    const v1 = collided ? (p.mass1 * p.velocity1 + p.mass2 * p.velocity2 - p.mass2 * p.restitution * relative) / totalMass : p.velocity1;
    const v2 = collided ? (p.mass1 * p.velocity1 + p.mass2 * p.velocity2 + p.mass1 * p.restitution * relative) / totalMass : p.velocity2;
    const before = Math.min(t, collisionTime), after = collided ? t - collisionTime : 0;
    const x1 = -3 + p.velocity1 * before + v1 * after, x2 = 3 + p.velocity2 * before + v2 * after;
    const initialK = .5 * (p.mass1 * p.velocity1 ** 2 + p.mass2 * p.velocity2 ** 2), kinetic = .5 * (p.mass1 * v1 ** 2 + p.mass2 * v2 ** 2);
    return { time: t, ended: false, bodies: [body('body-a', x1, 0, .3, cyan, v1), body('body-b', x2, 0, .3, orange, v2)],
      observations: [obs('velocity1', 'Velocity A', v1, 'm/s'), obs('velocity2', 'Velocity B', v2, 'm/s', orange),
        obs('momentum', 'Total momentum', p.mass1 * v1 + p.mass2 * v2, 'kg·m/s', blue), obs('kinetic', 'Total kinetic energy', kinetic, 'J'),
        obs('energyLost', 'Kinetic energy lost', Math.max(0, initialK - kinetic), 'J', orange), obs('impulse', 'Impulse on A', p.mass1 * (v1 - p.velocity1), 'N·s')],
      description: `One-dimensional isolated bodies with 0.3 m contact radii. Instantaneous collision; no external force. ${collided ? 'Impact has occurred.' : 'Before impact (bodies moving apart never collide).'} Restitution 0 makes bodies move together.` };
  }),

  gravity: definition('gravity', 'Orbit laboratory', 'Investigate circular and elliptical paths around a fixed point mass.', [
    parameter('centralMass', 'Central mass', 'kg', 1e24, 1e25, 1e23, 5.972e24), parameter('radius', 'Initial orbital radius', 'm', 7e6, 2e7, 1e5, 7e6),
    parameter('speedFactor', 'Initial speed / circular speed', '', .75, 1.2, .01, 1),
    parameter('mass', 'Orbiting mass', 'kg', 100, 10000, 100, 1000),
  ], 12000, (p, t) => {
    const mu = G * p.centralMass, q2 = p.speedFactor ** 2, a = p.radius / (2 - q2), e = Math.abs(q2 - 1);
    const b = a * Math.sqrt(1 - e * e), n = Math.sqrt(mu / a ** 3);
    const atPeriapsis = q2 >= 1, orientation = atPeriapsis ? 1 : -1;
    const meanAnomaly = ((atPeriapsis ? 0 : Math.PI) + n * t) % TAU;
    // Bounded e <= 0.44 makes Newton's method converge rapidly from M.
    let eccentricAnomaly = meanAnomaly;
    for (let i = 0; i < 12; i++) eccentricAnomaly -= (eccentricAnomaly - e * Math.sin(eccentricAnomaly) - meanAnomaly) / (1 - e * Math.cos(eccentricAnomaly));
    const c = Math.cos(eccentricAnomaly), s = Math.sin(eccentricAnomaly), rate = n / (1 - e * c);
    const x = orientation * a * (c - e), y = orientation * b * s;
    const vx = -orientation * a * s * rate, vy = orientation * b * c * rate;
    const r = Math.hypot(x, y), speed = Math.hypot(vx, vy), kinetic = .5 * p.mass * speed * speed, potential = -mu * p.mass / r;
    return { time: t, ended: false, bodies: [body('central-mass', 0, 0, p.radius * .09, orange), body('orbiter', x, y, p.radius * .025, cyan, vx, vy)],
      observations: [obs('radius', 'Current radius', r, 'm'), obs('speed', 'Orbital speed', speed, 'm/s', blue),
        obs('force', 'Gravitational force', mu * p.mass / (r * r), 'N'), obs('period', 'Orbital period', TAU / n, 's', blue),
        obs('eccentricity', 'Eccentricity', e, ''), obs('totalEnergy', 'Orbital mechanical energy', kinetic + potential, 'J', orange),
        obs('angularMomentum', 'Angular momentum', p.mass * (x * vy - y * vx), 'kg·m²/s')],
      description: 'Newtonian bound Kepler orbit around a fixed point mass, with tangential initial velocity. Central marker and satellite sizes are illustrative, not physical surfaces. No atmosphere, collision surface, relativity, or other bodies.' };
  }),

  oscillations: definition('oscillations', 'Oscillation studio', 'Compare an ideal spring with a small-angle pendulum.', [
    parameter('mode', 'Mode: 0 spring · 1 pendulum', '', 0, 1, 1, 0), { ...mass(), default: 1 },
    parameter('stiffness', 'Spring stiffness', 'N/m', 1, 50, 1, 10), parameter('amplitude', 'Spring amplitude', 'm', .1, 3, .1, 1),
    parameter('length', 'Pendulum length', 'm', .2, 5, .1, 2), parameter('angle', 'Pendulum release angle', '°', 1, 15, 1, 10), gravity(),
  ], 20, (p, t) => {
    const pendulum = p.mode === 1, omega = Math.sqrt(pendulum ? p.g / p.length : p.stiffness / p.mass);
    const amplitude = pendulum ? p.length * rad(p.angle) : p.amplitude;
    const displacement = amplitude * Math.cos(omega * t), velocity = -amplitude * omega * Math.sin(omega * t);
    const stiffness = pendulum ? p.mass * p.g / p.length : p.stiffness;
    const kinetic = .5 * p.mass * velocity ** 2, potential = .5 * stiffness * displacement ** 2;
    const theta = displacement / p.length;
    return { time: t, ended: false, bodies: [pendulum ? body('bob', p.length * Math.sin(theta), -p.length * Math.cos(theta), .2, cyan,
      velocity * Math.cos(theta), velocity * Math.sin(theta)) : body('mass', displacement, 0, .35, cyan, velocity)],
      observations: [obs('displacement', pendulum ? 'Arc displacement' : 'Displacement', displacement, 'm'), obs('velocity', pendulum ? 'Signed tangential velocity' : 'Velocity', velocity, 'm/s', blue),
        obs('period', 'Period', TAU / omega, 's', orange), obs('frequency', 'Frequency', omega / TAU, 'Hz'),
        obs('kinetic', 'Kinetic energy', kinetic, 'J', blue), obs('potential', pendulum ? 'Small-angle potential energy' : 'Spring potential energy', potential, 'J', orange),
        obs('totalEnergy', 'Model mechanical energy', kinetic + potential, 'J')],
      description: pendulum ? 'Ideal small-angle pendulum: sin θ ≈ θ, amplitude ≤15°. Arc displacement follows simple harmonic motion; energy uses the matching quadratic approximation. Massless inextensible string, no damping.' :
        'Ideal Hooke-law spring, horizontal motion, massless spring and no damping. Released from rest at maximum displacement.' };
  }),
};

/** Missing/non-finite values use defaults; finite values clamp; only discrete mode is rounded. */
export function sanitizeParameters(family: Family, parameters: Parameters): Parameters {
  return Object.fromEntries(simulations[family].parameters.map(p => {
    const input = parameters[p.key];
    let value = Number.isFinite(input) ? Math.max(p.min, Math.min(p.max, input)) : p.default;
    if (p.key === 'mode') value = Math.round(value);
    return [p.key, value];
  }));
}

export function defaults(family: Family): Parameters {
  return Object.fromEntries(simulations[family].parameters.map(p => [p.key, p.default]));
}

export function evaluate(family: Family, parameters: Parameters, time: number): SimulationState {
  return simulations[family].evaluate(parameters, time);
}
