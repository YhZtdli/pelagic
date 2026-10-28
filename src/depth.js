// Depth is immersion below the normal surfaced waterline, in metres; positive is down.
// Class values are bounded gameplay approximations, not rated operating depths.
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const isSubmarine = ship => ship?.classData?.role === 'submarine';

export function depthProfile(ship) {
  const c = ship.classData || {}, beam = c.beamMeters || 14;
  const modern = c.era === 'modern', coastal = c.id === 'coastal_submarine', diesel = c.id === 'diesel_submarine';
  if (!isSubmarine(ship)) {
    const draftMeters = clamp(beam * .32, 1.5, 12);
    return {minDepthMeters: 0, maxDepthMeters: 0, defaultDepthMeters: 0, maxVerticalSpeed: 0, verticalAcceleration: 0,
      periscopeDepthMeters: 0, draftMeters, hullHeightMeters: draftMeters + Math.max(2, beam * .2), sailHeightMeters: 0};
  }
  const hullHeightMeters = beam * .9, draftMeters = hullHeightMeters * .75, sailHeightMeters = beam * .45;
  return {minDepthMeters: 0, maxDepthMeters: modern ? coastal ? 150 : diesel ? 250 : 400 : coastal ? 100 : 150,
    defaultDepthMeters: modern ? coastal ? 30 : diesel ? 50 : 80 : coastal ? 25 : 35,
    maxVerticalSpeed: modern ? coastal ? .9 : diesel ? 1.3 : 2 : coastal ? .5 : .65,
    verticalAcceleration: modern ? coastal ? .06 : diesel ? .08 : .12 : .05,
    periscopeDepthMeters: modern ? coastal ? 9 : diesel ? 12 : 18 : coastal ? 9 : 12,
    draftMeters, hullHeightMeters, sailHeightMeters};
}

export function verticalExtents(ship, position = ship) {
  const p = depthProfile(ship), depth = isSubmarine(ship) ? position.depthMeters ?? ship.depthMeters ?? p.defaultDepthMeters : 0;
  return {top: depth + p.draftMeters - p.hullHeightMeters - p.sailHeightMeters, bottom: depth + p.draftMeters};
}

export function verticalClearance(a, b, pa = a, pb = b) {
  const x = verticalExtents(a, pa), y = verticalExtents(b, pb);
  return Math.max(x.top - y.bottom, y.top - x.bottom);
}

export const isSubmerged = ship => isSubmarine(ship) && verticalExtents(ship).top > 0;

/** Exact time interval where two linearly moving vertical hull envelopes overlap. */
export function verticalSweepInterval(a, fromA, toA, b, fromB, toB) {
  const a0 = verticalExtents(a, fromA), a1 = verticalExtents(a, toA), b0 = verticalExtents(b, fromB), b1 = verticalExtents(b, toB);
  let start = 0, end = 1;
  for (const [from, to] of [[a0.bottom - b0.top, a1.bottom - b1.top], [b0.bottom - a0.top, b1.bottom - a1.top]]) {
    if (from < 0 && to < 0) return null;
    if (from < 0) start = Math.max(start, -from / (to - from));
    if (to < 0) end = Math.min(end, from / (from - to));
  }
  return start <= end ? {start, end} : null;
}

export function depthMotion(ship, dt) {
  const p = depthProfile(ship), from = ship.depthMeters ?? p.defaultDepthMeters;
  if (!isSubmarine(ship) || ship.status !== 'active' || ship.hp <= 0) return {depthMeters: from, verticalSpeed: 0};
  const target = clamp(ship.orderedDepthMeters ?? from, 0, p.maxDepthMeters), error = target - from;
  if (Math.abs(error) < 1e-7 && Math.abs(ship.verticalSpeed || 0) < p.verticalAcceleration * dt) return {depthMeters: target, verticalSpeed: 0};
  const old = ship.verticalSpeed || 0;
  const desired = Math.sign(error) * Math.min(p.maxVerticalSpeed, Math.sqrt(2 * p.verticalAcceleration * Math.abs(error)) * .85);
  let verticalSpeed = old + clamp(desired - old, -p.verticalAcceleration * dt, p.verticalAcceleration * dt);
  let depthMeters = from + (old + verticalSpeed) * .5 * dt;
  // A changed order cannot erase vertical momentum. Small overshoots settle
  // naturally; only a low-speed final arrival may snap to the exact station.
  if (Math.abs(error) <= p.verticalAcceleration * dt * dt && Math.abs(old) <= p.verticalAcceleration * dt && Math.abs(verticalSpeed) <= p.verticalAcceleration * dt) { depthMeters = target; verticalSpeed = 0; }
  if (depthMeters < 0 || depthMeters > p.maxDepthMeters) { depthMeters = clamp(depthMeters, 0, p.maxDepthMeters); verticalSpeed = 0; }
  return {depthMeters, verticalSpeed};
}

export function weaponLaunchDepth(ship, weapon) {
  if (!isSubmarine(ship)) return Infinity;
  const profile = depthProfile(ship);
  if (weapon.kind === 'torpedo') return ship.classData.era === 'modern' ? Math.min(profile.maxDepthMeters, 300) : profile.periscopeDepthMeters;
  if (weapon.kind === 'missile') return Math.min(profile.maxDepthMeters, ship.classData.id === 'diesel_submarine' ? 25 : 40);
  return 0;
}

export function depthWeaponRestriction(ship, weapon) {
  if (!isSubmarine(ship)) return '';
  const limit = weaponLaunchDepth(ship, weapon);
  return ship.depthMeters > limit + 1e-7 ? `Ascend to ${limit} m or shallower to use this weapon` : '';
}

/** ASW compatibility remains tied to the submarine role, even when exposed. */
export function depthTargetCompatible(target, weapon) {
  if (!isSubmarine(target)) return true;
  if (weapon.targets.includes('submarine')) return true;
  return !isSubmerged(target) && weapon.targets.includes('surface');
}

// Unsurveyed charts have no seabed model. These finite trigger bands are game
// parameters: 0-8 m for moored contacts, 0-80 m for modern influence sensing.
export function mineDepthEnvelope(mineType) {
  return {top: 0, bottom: mineType.era === 'modern' ? 80 : 8};
}

export function mineCanTrigger(ship, mineType) {
  if (!isSubmarine(ship)) return true;
  const hull = verticalExtents(ship), envelope = mineDepthEnvelope(mineType);
  return hull.bottom >= envelope.top && hull.top <= envelope.bottom;
}
