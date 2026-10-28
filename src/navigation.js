// Ship motion and contact geometry. Horizontal distances are kilometres, depth metres.
import {depthProfile, depthMotion, verticalClearance, verticalExtents, verticalSweepInterval} from './depth.js?v=1.4.0';
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrap = a => ((a + Math.PI) % TAU + TAU) % TAU - Math.PI;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const dot = (a, b) => a.x * b.x + a.y * b.y;
const mobile = s => s.status === 'active' && s.hp > 0 && s.maxSpeed > 0 && s.classData.role !== 'coastal';
const solid = s => s.status !== 'sunk' && !s.evacuated && s.classData.role !== 'coastal';
const pose = s => ({x: s.x, y: s.y, heading: s.heading, depthMeters: s.depthMeters ?? depthProfile(s).defaultDepthMeters});
const mix = (a, b, t) => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, heading: wrap(a.heading + wrap(b.heading - a.heading) * t), depthMeters: (a.depthMeters || 0) + ((b.depthMeters || 0) - (a.depthMeters || 0)) * t});

export function hullDimensions(ship) {
  const length = Math.max(.008, (ship.classData.lengthMeters || 100) / 1000);
  const beam = Math.min(length, Math.max(.004, (ship.classData.beamMeters || 14) / 1000));
  return {length, beam, radius: beam / 2, halfAxis: (length - beam) / 2};
}

function spine(ship, p) {
  const {halfAxis, radius} = hullDimensions(ship), x = Math.cos(p.heading) * halfAxis, y = Math.sin(p.heading) * halfAxis;
  return {a: {x: p.x - x, y: p.y - y}, b: {x: p.x + x, y: p.y + y}, radius};
}

function pointSegment(p, a, b) {
  const x = b.x - a.x, y = b.y - a.y, d = x * x + y * y;
  const t = d ? clamp(((p.x - a.x) * x + (p.y - a.y) * y) / d, 0, 1) : 0;
  return Math.hypot(p.x - a.x - x * t, p.y - a.y - y * t);
}

function segmentDistance(a, b, c, d) {
  const cross = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const abC = cross(a, b, c), abD = cross(a, b, d), cdA = cross(c, d, a), cdB = cross(c, d, b);
  if ((abC > 0 && abD < 0 || abC < 0 && abD > 0) && (cdA > 0 && cdB < 0 || cdA < 0 && cdB > 0)) return 0;
  return Math.min(pointSegment(a, c, d), pointSegment(b, c, d), pointSegment(c, a, b), pointSegment(d, a, b));
}

/** Signed capsule clearance: negative means intersecting hulls, zero means touching. */
export function hullClearance(a, b, poseA = a, poseB = b) {
  const ca = spine(a, poseA), cb = spine(b, poseB);
  return segmentDistance(ca.a, ca.b, cb.a, cb.b) - ca.radius - cb.radius;
}

/** Conservative continuous bound, including the bow/stern swept by a turn.
 * Adaptive subdivision uses a Lipschitz bound for translation and rotation;
 * endpoint-only checks cannot detect a bow swinging through another hull.
 */
export function sweptHullClearance(a, fromA, toA, b, fromB, toB) {
  const motion = distance(fromA, toA) + distance(fromB, toB)
    + hullDimensions(a).halfAxis * Math.abs(wrap(toA.heading - fromA.heading))
    + hullDimensions(b).halfAxis * Math.abs(wrap(toB.heading - fromB.heading));
  const at = t => hullClearance(a, b, mix(fromA, toA, t), mix(fromB, toB, t));
  const left = at(0), right = at(1);
  if (!motion) return left;
  function interval(lo, hi, c0, c1, depth) {
    const mid = (lo + hi) / 2, cm = at(mid);
    const bound = Math.min(c0, cm, c1) - motion * (hi - lo) / 4;
    if (bound > 1e-8 || depth >= 12 || Math.min(c0, cm, c1) < -1e-7) return bound;
    return Math.min(interval(lo, mid, c0, cm, depth + 1), interval(mid, hi, cm, c1, depth + 1));
  }
  return interval(0, 1, left, right, 0);
}

/** Clearance of the complete hull envelope, expressed in kilometres. */
export function volumeClearance(a, b, pa = a, pb = b) {
  return Math.max(hullClearance(a, b, pa, pb), verticalClearance(a, b, pa, pb) / 1000);
}

/** Restrict the continuous horizontal sweep to the exact vertical overlap interval. */
export function sweptVolumeClearance(a, fromA, toA, b, fromB, toB) {
  const interval = verticalSweepInterval(a, fromA, toA, b, fromB, toB);
  if (!interval) return Math.min(verticalClearance(a, b, fromA, fromB), verticalClearance(a, b, toA, toB)) / 1000;
  return sweptHullClearance(a, mix(fromA, toA, interval.start), mix(fromA, toA, interval.end),
    b, mix(fromB, toB, interval.start), mix(fromB, toB, interval.end));
}

function hullWater(game, ship, from, to) {
  // A conservative sweep of the spine and its beam also keeps rotating hulls
  // clear of coastlines. Navigation routes already have larger coastal margins.
  const shape = hullDimensions(ship), rotation = Math.abs(wrap(to.heading - from.heading));
  const count = Math.max(1, Math.ceil((distance(from, to) + shape.halfAxis * rotation) / .015));
  let old = spine(ship, from);
  for (let i = 1; i <= count; i++) {
    const next = spine(ship, mix(from, to, i / count));
    const margin = shape.radius + shape.halfAxis * rotation / count;
    if (!game._segmentClear(next.a, next.b, margin) || !game._segmentClear(old.a, next.a, margin) || !game._segmentClear(old.b, next.b, margin)) return false;
    old = next;
  }
  return true;
}

// A deliberately compact manoeuvring approximation: larger hulls build and
// shed way more slowly. These are gameplay response times, not sea-trial data.
function acceleration(ship) { return ship.maxSpeed / (18 + hullDimensions(ship).length * 90); }
function braking(ship) { return Math.max(.00001, ship.maxSpeed / (10 + hullDimensions(ship).length * 35)); }

function turn(ship, heading, dt) {
  // Propeller wash retains limited steerage near rest; full rudder authority
  // requires water flow, so a stopped hull cannot spin at full turning rate.
  const steerage = .4 + .6 * clamp(ship.speed / Math.max(.0001, ship.maxSpeed * .4), 0, 1);
  const limit = ship.classData.turnRate * Math.PI / 180 * steerage;
  const angularAccel = ship.classData.turnRate * Math.PI / 180 / (4 + hullDimensions(ship).length * 10);
  const error = wrap(heading - ship.heading);
  const wanted = Math.sign(error) * Math.min(limit, Math.sqrt(2 * angularAccel * Math.abs(error)), Math.abs(error) / dt);
  const rate = (ship.turnVelocity || 0) + clamp(wanted - (ship.turnVelocity || 0), -angularAccel * dt, angularAccel * dt);
  return {heading: wrap(ship.heading + rate * dt), turnVelocity: rate};
}

function stationDestination(game, s) {
  if (s.order.type !== 'move' || !s.order.arrived) return null;
  const station = s.order;
  const threats = s.localContacts.map(id => game.getShip(id)).filter(t => t && mobile(t) && t.side !== s.side && distance(t, station) < 2.5);
  const target = threats.sort((a, b) => distance(s, a) - distance(s, b) || a.id.localeCompare(b.id))[0];
  const incoming = game.state.projectiles.find(p => p.side !== s.side && p.targetId === s.id && p.status === 'active' && ['missile', 'torpedo', 'gun', 'aircraft'].includes(p.kind) && game._projectileVisible(p, s.side) && distance(s, p) < (p.kind === 'torpedo' ? 2 : 8));
  const freshDamage = game.state.time - s.lastDamageTime < 20;
  const danger = incoming || target;
  const key = incoming ? `incoming:${incoming.id}` : target ? `${target.id}:${Math.floor(target.x / .5)}:${Math.floor(target.y / .5)}:${Math.floor(s.hp / s.maxHp * 5)}` : freshDamage ? `damage:${Math.floor(s.lastDamageTime / 15)}` : 'clear';
  if (key !== s.stationResponseKey && game.state.time >= (s.stationResponseAt || 0)) {
    s.stationResponseKey = key; s.stationResponseAt = game.state.time + 30;
    if (danger || freshDamage) {
      // A completed player station permits a bounded defensive adjustment,
      // never a pursuit or a replacement for a new explicit order.
      const bearing = incoming ? Math.atan2(s.y - incoming.y, s.x - incoming.x) + Math.PI / 2
        : target ? Math.atan2(station.y - target.y, station.x - target.x) : s.heading + Math.PI / 2;
      const next = {x: station.x + Math.cos(bearing) * .4, y: station.y + Math.sin(bearing) * .4};
      s.stationNavigation = game._segmentClear(s, next, .18) ? next : null;
      if (s.stationNavigation) s.tactics = 'Local station defense';
    } else if (distance(s, station) > .06) {
      s.stationNavigation = {x: station.x, y: station.y}; s.tactics = 'Return to assigned station';
    }
    s.pathTarget = null;
  }
  if (s.stationNavigation && distance(s, s.stationNavigation) < .025 && s.speed < .00015) { s.stationNavigation = null; s.path = []; s.pathTarget = null; }
  return s.stationNavigation;
}

function routeIntent(game, s, dt) {
  let destination = null;
  if (['move', 'lay_mines', 'sweep'].includes(s.order.type)) destination = s.order;
  if (s.order.type === 'move' && s.order.arrived) destination = stationDestination(game, s);
  if (s.order.type === 'sweep') {
    const mine = game.getVisibleMines(s.side).filter(m => m.side !== s.side && distance(m, s.order) < 6).sort((a, b) => distance(a, s) - distance(b, s))[0];
    if (mine) destination = distance(s, mine) > s.classData.mineSweepRange * .7 ? mine : null;
  } else if (!destination && s.order.type !== 'hold' && !s.order.arrived && s.navigation) destination = s.navigation;
  if (destination) game._navigate(s, destination);
  else s.path = [];
  while (s.path.length > 1 && distance(s, s.path[0]) < .15) s.path.shift();
  const waypoint = s.path[0] || null;
  let heading = s.heading, speed = 0;
  if (waypoint && destination) {
    const remaining = distance(s, waypoint), final = s.path.length === 1;
    heading = Math.atan2(waypoint.y - s.y, waypoint.x - s.x);
    const error = Math.abs(wrap(heading - s.heading));
    // Slow before a tight turn, including astern destinations, rather than
    // drawing a full-speed circle or snapping the bow to the new bearing.
    speed = s.maxSpeed * (.55 + .45 * s.hp / s.maxHp) * Math.cos(Math.min(Math.PI / 2, error)) ** 2;
    if (s.formationSpeed) speed = Math.min(speed, s.formationSpeed);
    if (s.order.type === 'sweep') speed = Math.min(speed, 4 * 1.852 / 3600);
    if (s.order.type === 'lay_mines' && s.order.laid > 0) speed = Math.min(speed, 6 * 1.852 / 3600);
    if (final) speed = Math.min(speed, Math.sqrt(2 * braking(s) * Math.max(0, remaining - .018)) * .88);
    // Pure-pursuit curvature bounds the approach speed by the turn actually
    // available near rest. Without this cap a small station offset becomes an
    // unreachable circle, even though straight-line stopping distance is short.
    if (error > .05) speed = Math.min(speed, s.classData.turnRate * Math.PI / 180 * .4 * remaining / (2 * Math.max(.05, Math.sin(error))));
    if (final && remaining < .025 && s.speed < .00015) {
      speed = 0; heading = s.heading; s.path = []; s.pathTarget = null;
      if (s.order.type === 'move' && !s.order.arrived) {
        s.order.arrived = true; s.stationResponseKey = null; s.stationResponseAt = 0;
      }
    }
    const stopDistance = s.speed * s.speed / (2 * braking(s));
    const probe = {x: s.x + Math.cos(s.heading) * Math.max(.12, stopDistance + .12), y: s.y + Math.sin(s.heading) * Math.max(.12, stopDistance + .12)};
    if (!game._segmentClear(s, probe, hullDimensions(s).beam / 2 + .03)) {
      speed = 0;
      if (!game._segmentClear(s, waypoint, .16) && game.state.time - (s.routeAttemptTime || 0) > 5) s.pathTarget = null;
    }
  }
  return {heading, speed, destination, waypoint};
}

function threatToCourse(s, other, intent) {
  if (verticalClearance(s, other) > .5) return null;
  const d = distance(s, other), a = hullDimensions(s), b = hullDimensions(other);
  if (d > .95 || d < 1e-9) return null;
  const forward = {x: Math.cos(intent.heading), y: Math.sin(intent.heading)};
  const relative = {x: other.x - s.x, y: other.y - s.y};
  const along = dot(relative, forward);
  const lateral = forward.x * relative.y - forward.y * relative.x;
  const moving = mobile(other) && other.speed > .0004;
  const ours = Math.max(s.speed, intent.speed * .8, s.maxSpeed * .25);
  const theirs = moving ? other.speed : 0;
  const rv = {x: Math.cos(other.heading) * theirs - forward.x * ours, y: Math.sin(other.heading) * theirs - forward.y * ours};
  const vv = dot(rv, rv), closing = -dot(relative, rv);
  const time = vv > 1e-10 ? clamp(closing / vv, 0, 55) : 0;
  const p = {...s, x: s.x + forward.x * ours * time, y: s.y + forward.y * ours * time, heading: intent.heading};
  const q = {...other, x: other.x + Math.cos(other.heading) * theirs * time, y: other.y + Math.sin(other.heading) * theirs * time};
  const clearance = hullClearance(s, other, p, q);
  const margin = .025 + (a.beam + b.beam) * .5;
  // A stopped hull lying across the route needs its complete projected length.
  const routeWidth = b.halfAxis * Math.abs(Math.sin(wrap(other.heading - intent.heading))) + b.radius + a.radius + .025;
  const stationaryBlock = !moving && along > 0 && along < Math.min(.75, .25 + ours * 35) && Math.abs(lateral) < routeWidth;
  if (!stationaryBlock && (closing <= 0 || clearance > margin || time < .01)) return null;
  const headingDifference = Math.abs(wrap(other.heading - s.heading));
  const headOn = moving && headingDifference > Math.PI * .72 && Math.abs(lateral) < d * .55;
  const overtaking = moving && headingDifference < Math.PI * .32 && along > 0 && s.speed >= other.speed * .95;
  const giveWay = !moving || headOn || overtaking || lateral > .001 || Math.abs(lateral) <= .001 && s.id.localeCompare(other.id) > 0;
  return {other, d, along, lateral, moving, time, headOn, overtaking, giveWay, forward, routeWidth};
}

function avoid(game, s, intent, ships) {
  const activeAvoid = s.avoidance;
  if (activeAvoid) {
    const obstacle = ships.find(o => o.id === activeAvoid.otherId && solid(o) && verticalClearance(s, o) <= .5);
    const f = {x: Math.cos(activeAvoid.course), y: Math.sin(activeAvoid.course)};
    const beyond = obstacle && dot({x: obstacle.x - s.x, y: obstacle.y - s.y}, f) < -(hullDimensions(s).length + hullDimensions(obstacle).length) * .65;
    if (!obstacle || beyond || distance(s, activeAvoid) < .055 || distance(s, obstacle) > 1.1) s.avoidance = null;
  }
  if (!s.avoidance && intent.speed > 0) {
    const threats = ships.filter(o => o.id !== s.id && solid(o)).map(o => threatToCourse(s, o, intent)).filter(Boolean).sort((a, b) => a.time - b.time || a.d - b.d || a.other.id.localeCompare(b.other.id));
    const threat = threats.find(t => t.giveWay) || threats[0];
    if (threat) {
      if (!threat.giveWay && threat.d > .26 + hullDimensions(s).length) {
        // Stand-on traffic keeps course; the crossing/overtaking ship yields.
        intent.speed *= .85;
      } else {
        const {other, forward: f} = threat;
        const right = {x: -f.y, y: f.x};
        const lateral = Math.max(.12, threat.routeWidth + hullDimensions(s).length * .5 + .035);
        const advance = Math.max(.18, hullDimensions(other).length * .7 + .1);
        const base = {x: other.x + f.x * advance, y: other.y + f.y * advance};
        const candidates = [1, -1].map(sign => ({x: base.x + right.x * lateral * sign, y: base.y + right.y * lateral * sign, sign}));
        const goal = candidates.find(p => game._segmentClear(s, p, .09) && game._segmentClear(p, p, .12));
        if (goal) s.avoidance = {...goal, otherId: other.id, course: intent.heading};
        else intent.speed = 0;
      }
    }
  }
  if (s.avoidance) {
    intent.heading = Math.atan2(s.avoidance.y - s.y, s.avoidance.x - s.x);
    const error = Math.abs(wrap(intent.heading - s.heading));
    intent.speed = Math.min(s.maxSpeed * .65, Math.max(intent.speed, s.maxSpeed * .12)) * Math.cos(Math.min(Math.PI / 2, error)) ** 3;
    if (error > .05) intent.speed = Math.min(intent.speed, s.classData.turnRate * Math.PI / 180 * .4 * distance(s, s.avoidance) / (2 * Math.max(.05, Math.sin(error))));
    const obstacle = ships.find(o => o.id === s.avoidance.otherId);
    if (obstacle) {
      const gap = hullClearance(s, obstacle), relative = Math.atan2(obstacle.y - s.y, obstacle.x - s.x);
      if (Math.abs(wrap(relative - s.heading)) < .8) intent.speed = Math.min(intent.speed, Math.sqrt(2 * braking(s) * Math.max(0, gap - .035)) * .7);
    }
  }
  return intent;
}

function safeDepthMotion(ship, dt, ships) {
  const profile = depthProfile(ship);
  if (!profile.maxVerticalSpeed) return depthMotion(ship, dt);
  let orderedDepthMeters = ship.orderedDepthMeters;
  const horizon = Math.min(45, Math.max(2, Math.abs(ship.verticalSpeed || 0) / profile.verticalAcceleration + 2));
  const from = pose(ship), projected = {...from, x: ship.x + Math.cos(ship.heading) * ship.speed * horizon, y: ship.y + Math.sin(ship.heading) * ship.speed * horizon};
  const extent = verticalExtents(ship);
  for (const other of ships) {
    if (other === ship || distance(ship, other) > 1.5) continue;
    const q = pose(other), next = {...q, x: other.x + Math.cos(other.heading) * other.speed * horizon, y: other.y + Math.sin(other.heading) * other.speed * horizon};
    if (sweptHullClearance(ship, from, projected, other, q, next) > .02) continue;
    const obstacle = verticalExtents(other), otherProfile = depthProfile(other);
    const stoppingTravel = velocity => velocity > 0 ? velocity * velocity / (2 * Math.max(.01, otherProfile.verticalAcceleration)) + velocity * dt : 0;
    if (extent.top >= obstacle.bottom) {
      const ceiling = obstacle.bottom - (extent.top - ship.depthMeters) + .5 + stoppingTravel(other.verticalSpeed || 0);
      orderedDepthMeters = Math.max(orderedDepthMeters, Math.min(ship.depthMeters, ceiling));
    } else if (extent.bottom <= obstacle.top) {
      const floor = obstacle.top - (extent.bottom - ship.depthMeters) - .5 - stoppingTravel(-(other.verticalSpeed || 0));
      orderedDepthMeters = Math.min(orderedDepthMeters, Math.max(ship.depthMeters, floor));
    }
  }
  ship.depthBlocked = Math.abs(orderedDepthMeters - ship.orderedDepthMeters) > .01;
  return depthMotion({...ship, orderedDepthMeters}, dt);
}

function proposal(game, s, dt, ships) {
  const from = pose(s);
  if (!mobile(s)) return {ship: s, from, to: from, speed: 0, turnVelocity: 0, verticalSpeed: 0};
  s.depthBlocked = false; const depth = safeDepthMotion(s, dt, ships);
  const intent = avoid(game, s, routeIntent(game, s, dt), ships);
  const turning = turn(s, intent.heading, dt);
  const accel = acceleration(s);
  let speed = s.speed + clamp(intent.speed - s.speed, -braking(s) * dt, accel * dt);
  if (speed < 1e-8) speed = 0;
  let to = {x: s.x + Math.cos(wrap((s.heading + turning.heading) / 2)) * (speed + s.speed) / 2 * dt,
    y: s.y + Math.sin(wrap((s.heading + turning.heading) / 2)) * (speed + s.speed) / 2 * dt, heading: turning.heading};
  // Use the shortest angular arc even when crossing the +/-pi boundary.
  const midHeading = s.heading + wrap(turning.heading - s.heading) / 2;
  to.x = s.x + Math.cos(midHeading) * (speed + s.speed) / 2 * dt;
  to.y = s.y + Math.sin(midHeading) * (speed + s.speed) / 2 * dt;
  if (!hullWater(game, s, from, to)) {
    // Contact is the final safety brake, after normal route braking above.
    to = {...from, heading: turning.heading}; speed = 0;
    if (!hullWater(game, s, from, to)) { to = from; turning.turnVelocity = 0; }
    s.pathTarget = null;
  }
  to = {...to, depthMeters: depth.depthMeters};
  return {ship: s, from, to, speed, turnVelocity: turning.turnVelocity, verticalSpeed: depth.verticalSpeed};
}

function recoverOverlaps(game, plans, dt) {
  for (const p of plans) {
    const s = p.ship;
    if (!mobile(s) || p.frozen) continue;
    let x = 0, y = 0, count = 0;
    for (const q of plans) {
      if (p === q || verticalClearance(s, q.ship, p.from, q.from) > 0 || distance(p.from, q.from) > (hullDimensions(s).length + hullDimensions(q.ship).length) / 2 + .05) continue;
      const clearance = hullClearance(s, q.ship, p.from, q.from);
      // Continue a legacy recovery until there is rudder room. Stopping at
      // zero penetration leaves opposed bows contact-locked on the next step.
      if (clearance >= -1e-7 && !(s.contactRecoverySpeed > 0 && clearance < .05)) continue;
      let dx = p.from.x - q.from.x, dy = p.from.y - q.from.y, d = Math.hypot(dx, dy);
      if (d < 1e-7) {
        const sign = s.id.localeCompare(q.ship.id) < 0 ? 1 : -1;
        const reference = sign > 0 ? p.from : q.from;
        dx = -Math.sin(reference.heading) * sign; dy = Math.cos(reference.heading) * sign; d = 1;
      }
      x += dx / d; y += dy / d; count++;
    }
    if (!count) { s.contactRecoverySpeed = 0; continue; }
    // Old saves may already contain intersections. Separate gradually at a
    // bounded harbour speed; never teleport, reset orders, or ignore new hulls.
    const d = Math.hypot(x, y) || 1;
    s.contactRecoverySpeed = Math.min(s.maxSpeed * .12, (s.contactRecoverySpeed || 0) + acceleration(s) * dt);
    const to = {...p.from, depthMeters: p.to.depthMeters, x: p.from.x + x / d * s.contactRecoverySpeed * dt, y: p.from.y + y / d * s.contactRecoverySpeed * dt};
    if (hullWater(game, s, p.from, to)) { p.to = to; p.speed = s.contactRecoverySpeed; p.turnVelocity = 0; p.recovering = true; }
  }
}

function pairSafe(p, q) {
  const a0 = verticalExtents(p.ship, p.from), a1 = verticalExtents(p.ship, p.to), b0 = verticalExtents(q.ship, q.from), b1 = verticalExtents(q.ship, q.to);
  // A vertical supporting plane also permits departing or sliding at contact.
  if (a0.top >= b0.bottom - 1e-9 && a1.top >= b1.bottom - 1e-9 || b0.top >= a0.bottom - 1e-9 && b1.top >= a1.bottom - 1e-9) return true;
  if (!verticalSweepInterval(p.ship, p.from, p.to, q.ship, q.from, q.to)) return true;
  const broad = (hullDimensions(p.ship).length + hullDimensions(q.ship).length) / 2 + distance(p.from, p.to) + distance(q.from, q.to) + .002;
  if (distance(p.from, q.from) > broad) return true;
  const initial = volumeClearance(p.ship, q.ship, p.from, q.from);
  if (initial < -1e-7) {
    // Existing overlap may only separate, never gain a new penetration.
    return volumeClearance(p.ship, q.ship, p.to, q.to) >= initial - 1e-9 && (verticalClearance(p.ship, q.ship, p.to, q.to) > verticalClearance(p.ship, q.ship, p.from, q.from) || distance(p.to, q.to) >= distance(p.from, q.from) - 1e-10);
  }
  if (initial < .000001 && hullClearance(p.ship, q.ship, p.from, q.from) >= -1e-9) {
    const [a, b] = closestSpines(p.ship, q.ship, p.from, q.from);
    const d = distance(a, b);
    if (d > 1e-12) {
      const nx = (b.x - a.x) / d, ny = (b.y - a.y) / d;
      const separation = ((q.to.x - q.from.x) - (p.to.x - p.from.x)) * nx + ((q.to.y - q.from.y) - (p.to.y - p.from.y)) * ny;
      const rotation = hullDimensions(p.ship).halfAxis * Math.abs(wrap(p.to.heading - p.from.heading)) + hullDimensions(q.ship).halfAxis * Math.abs(wrap(q.to.heading - q.from.heading));
      // The initial separating support plane remains valid throughout the
      // sweep, including any bow rotation. Touching hulls can depart freely.
      if (separation >= rotation && initial >= -1e-9) return true;
    }
  }
  return sweptVolumeClearance(p.ship, p.from, p.to, q.ship, q.from, q.to) >= -1e-9;
}

function closestSpines(a, b, pa, pb) {
  const sa = spine(a, pa), sb = spine(b, pb);
  const nearest = (p, u, v) => {
    const dx = v.x - u.x, dy = v.y - u.y;
    const t = clamp(((p.x - u.x) * dx + (p.y - u.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    return {x: u.x + dx * t, y: u.y + dy * t};
  };
  const pairs = [[sa.a, nearest(sa.a, sb.a, sb.b)], [sa.b, nearest(sa.b, sb.a, sb.b)],
    [nearest(sb.a, sa.a, sa.b), sb.a], [nearest(sb.b, sa.a, sa.b), sb.b]];
  return pairs.sort((u, v) => distance(u[0], u[1]) - distance(v[0], v[1]))[0];
}

function contactImpact(game, p, q, originalP, originalQ, dt) {
  const a = p.ship, b = q.ship;
  // Invalid legacy overlap is not a new physical impact. Only contact reached
  // by this swept movement can cause damage, never a precautionary near miss.
  if (volumeClearance(a, b, p.from, q.from) < -1e-7 || volumeClearance(a, b, p.to, q.to) > .000025) return;
  a.collisionContacts ||= {}; b.collisionContacts ||= {};
  if (Object.hasOwn(a.collisionContacts, b.id) || Object.hasOwn(b.collisionContacts, a.id)) return;
  const [ca, cb] = closestSpines(a, b, p.to, q.to);
  let nx = cb.x - ca.x, ny = cb.y - ca.y, length = Math.hypot(nx, ny);
  if (length < 1e-10) { nx = q.to.x - p.to.x; ny = q.to.y - p.to.y; length = Math.hypot(nx, ny) || 1; }
  nx /= length; ny /= length;
  const velocity = (r, end, point) => {
    const omega = wrap(end.heading - r.from.heading) / dt;
    return {x: (end.x - r.from.x) / dt - omega * (point.y - r.to.y), y: (end.y - r.from.y) / dt + omega * (point.x - r.to.x)};
  };
  const va = velocity(p, originalP, ca), vb = velocity(q, originalQ, cb), vx = va.x - vb.x, vy = va.y - vb.y;
  const verticalContact = verticalClearance(a, b, p.to, q.to) / 1000 > hullClearance(a, b, p.to, q.to);
  const za = verticalExtents(a, p.to), zb = verticalExtents(b, q.to), nz = Math.sign(zb.top + zb.bottom - za.top - za.bottom);
  const vz = ((originalP.depthMeters - p.from.depthMeters) - (originalQ.depthMeters - q.from.depthMeters)) / dt / 1000;
  const normal = Math.max(0, verticalContact ? vz * nz : vx * nx + vy * ny);
  const tangent = verticalContact ? Math.hypot(vx, vy) : Math.hypot(vx * ny - vy * nx, vz);
  if (normal < 1e-7) return;
  // Squared normal speed approximates impact energy. Tangential rubbing adds
  // much less energy; broadside structure is more vulnerable than the bow.
  const effective = Math.hypot(normal, tangent * .12), reference = 10 * 1.852 / 3600;
  const severity = clamp(.0005 + .065 * (effective / reference) ** 2, .0005, .55);
  const massA = Math.max(1, a.classData.tonnage), massB = Math.max(1, b.classData.tonnage);
  const geometry = s => verticalContact ? 1.25 : 1.25 - .4 * Math.abs(Math.cos(s.heading) * nx + Math.sin(s.heading) * ny);
  const damageA = a.maxHp * severity * (2 * massB / (massA + massB)) * geometry(a);
  const damageB = b.maxHp * severity * (2 * massA / (massA + massB)) * geometry(b);
  a.collisionContacts[b.id] = game.state.time; b.collisionContacts[a.id] = game.state.time;
  const weapon = {kind: 'collision'};
  game._damage(a, damageA, weapon, b.side); game._damage(b, damageB, weapon, a.side);
  game._event(`${a.name} and ${b.name} collided`, a.side, 'observed', a);
  game._effect('impact', {x: (ca.x + cb.x) / 2, y: (ca.y + cb.y) / 2}, .18, 2);
}

/** Integrate all motion from one snapshot, then commit only swept-safe moves. */
export function advanceFleet(game, dt, only = null) {
  const ships = game.state.ships.filter(solid);
  const plans = ships.map(s => only && !only.includes(s) ? {ship: s, from: pose(s), to: pose(s), speed: s.speed, turnVelocity: s.turnVelocity || 0, verticalSpeed: s.verticalSpeed || 0, frozen: true} : proposal(game, s, dt, ships));
  // Contact memory survives save/load and is released only after separation.
  for (const p of plans) if (!p.frozen && p.ship.collisionContacts) for (const id of Object.keys(p.ship.collisionContacts)) {
    const q = plans.find(q => q.ship.id === id);
    if (!q || hullClearance(p.ship, q.ship) > .02 || verticalClearance(p.ship, q.ship) > .5) delete p.ship.collisionContacts[id];
  }
  recoverOverlaps(game, plans, dt);
  for (let pass = 0; pass < plans.length + 2; pass++) {
    let changed = false;
    for (let i = 0; i < plans.length; i++) for (let j = i + 1; j < plans.length; j++) {
      const p = plans[i], q = plans[j];
      if (pairSafe(p, q)) continue;
      const pTo = p.to, qTo = q.to;
      let lo = 0, hi = 1;
      for (let n = 0; n < 18; n++) {
        const m = (lo + hi) / 2;
        p.to = mix(p.from, pTo, m); q.to = mix(q.from, qTo, m);
        if (pairSafe(p, q)) lo = m; else hi = m;
      }
      const fraction = Math.max(0, lo - .00001);
      p.to = mix(p.from, pTo, fraction); q.to = mix(q.from, qTo, fraction);
      contactImpact(game, p, q, pTo, qTo, dt);
      p.speed *= fraction; q.speed *= fraction; p.turnVelocity *= fraction; q.turnVelocity *= fraction;
      for (const [r, original] of [[p, pTo], [q, qTo]]) if (!r.frozen && Math.abs(original.depthMeters - r.from.depthMeters) > 1e-10) {
        r.verticalSpeed = 0; r.ship.depthBlocked = true;
      }

      changed = true;
    }
    if (!changed) break;
    if (pass === plans.length + 1) for (const p of plans) { p.to = p.from; p.speed = 0; p.turnVelocity = 0; p.verticalSpeed = 0; }
  }
  for (const p of plans) {
    if (only && !only.includes(p.ship)) continue;
    Object.assign(p.ship, p.to, {speed: mobile(p.ship) ? p.speed : 0, turnVelocity: p.turnVelocity, verticalSpeed: mobile(p.ship) ? p.verticalSpeed : 0});
    if (p.ship.status !== 'active') { p.ship.orderedDepthMeters = p.ship.depthMeters; p.ship.depthBlocked = false; }
  }
}
