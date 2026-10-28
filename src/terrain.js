/** Deterministic geography shared by navigation and the chart renderer. */
export const TERRAIN_VERSION = 1;
const EPS = 1e-8;
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
const distance = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const signedArea = points => points.reduce((sum, p, i) => { const q = points[(i + 1) % points.length]; return sum + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
const hash = value => { let seed = 2166136261; for (const c of String(value)) seed = Math.imul(seed ^ c.charCodeAt(0), 16777619); return seed >>> 0; };
const random = seed => { let state = hash(seed) || 1; return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; }; };

export function polygonBounds(points) {
  const bounds = {minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity};
  for (const [x, y] of points) { bounds.minX = Math.min(bounds.minX, x); bounds.minY = Math.min(bounds.minY, y); bounds.maxX = Math.max(bounds.maxX, x); bounds.maxY = Math.max(bounds.maxY, y); }
  return bounds;
}

export function pointInPolygon(point, points, includeBoundary = true) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[j], b = points[i];
    if (includeBoundary && Math.abs(cross(a, b, point)) <= EPS && point[0] >= Math.min(a[0], b[0]) - EPS && point[0] <= Math.max(a[0], b[0]) + EPS && point[1] >= Math.min(a[1], b[1]) - EPS && point[1] <= Math.max(a[1], b[1]) + EPS) return true;
    if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

function properCrossing(a, b, c, d) {
  return cross(a, b, c) * cross(a, b, d) < -EPS && cross(c, d, a) * cross(c, d, b) < -EPS;
}

export function isSimplePolygon(points) {
  if (points.length < 3 || Math.abs(signedArea(points)) < EPS) return false;
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    if (!a.every(Number.isFinite) || distance(a, b) < EPS) return false;
    for (let j = i + 2; j < points.length; j++) {
      if (i === 0 && j === points.length - 1) continue;
      const c = points[j], d = points[(j + 1) % points.length];
      if (properCrossing(a, b, c, d)) return false;
      if (Math.abs(cross(a, b, c)) < EPS && c[0] >= Math.min(a[0], b[0]) - EPS && c[0] <= Math.max(a[0], b[0]) + EPS && c[1] >= Math.min(a[1], b[1]) - EPS && c[1] <= Math.max(a[1], b[1]) + EPS) return false;
    }
  }
  return true;
}

function segmentWithin(a, b, source) {
  if (![.25, .5, .75].every(t => pointInPolygon(lerp(a, b, t), source))) return false;
  for (let i = 0; i < source.length; i++) if (properCrossing(a, b, source[i], source[(i + 1) % source.length])) return false;
  return true;
}

function onBorder(a, b, width, height) {
  return (Math.abs(a[0]) < EPS && Math.abs(b[0]) < EPS) || (Math.abs(a[1]) < EPS && Math.abs(b[1]) < EPS) || (Math.abs(a[0] - width) < EPS && Math.abs(b[0] - width) < EPS) || (Math.abs(a[1] - height) < EPS && Math.abs(b[1] - height) < EPS);
}

function naturalCoast(source, width, height, seed) {
  if (source.length < 3 || !isSimplePolygon(source)) return source.map(p => [...p]);
  const bounds = polygonBounds(source), orientation = Math.sign(signedArea(source));
  const perimeter = source.reduce((sum, p, i) => sum + distance(p, source[(i + 1) % source.length]), 0);
  const span = Math.min(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  const rng = random(seed), spacing = perimeter / 64;
  const points = [];
  const corners = source.map((b, i) => {
    const a = source[(i + source.length - 1) % source.length], c = source[(i + 1) % source.length];
    const trim = .19 + rng() * .11, q = lerp(b, a, trim), r = lerp(b, c, trim);
    const rounded = cross(a, b, c) * orientation > EPS && !onBorder(a, b, width, height) && !onBorder(b, c, width, height) && segmentWithin(q, r, source);
    return {start: rounded ? q : b, end: rounded ? r : b, pivot: b, rounded};
  });
  for (let i = 0; i < source.length; i++) {
    const corner = corners[i];
    if (corner.rounded) for (let j = 0; j < 8; j++) {
      const t = j / 8;
      points.push(lerp(lerp(corner.start, corner.pivot, t), lerp(corner.pivot, corner.end, t), t));
    }
    const a = corner.end, b = corners[(i + 1) % source.length].start, edge = distance(a, b);
    if (onBorder(a, b, width, height)) { points.push([...a]); continue; }
    const count = Math.max(5, Math.min(30, Math.ceil(edge / spacing)));
    const nx = -(b[1] - a[1]) / edge * orientation, ny = (b[0] - a[0]) / edge * orientation;
    const phase = rng() * Math.PI * 2, phase2 = rng() * Math.PI * 2;
    const bayCenter = .3 + rng() * .4, bayDepth = i % 3 === 1 ? .85 : .12;
    // Erosion remains inside the authored footprint, preserving every original water route.
    const amplitude = Math.min(span * (.055 + rng() * .035), edge * .13);
    for (let j = 0; j < count; j++) {
      const t = j / count, base = lerp(a, b, t);
      const noise = .55 + .24 * Math.sin(t * Math.PI * (3.1 + i % 3) + phase) + .14 * Math.sin(t * Math.PI * 11.3 + phase2) + .07 * Math.sin(t * Math.PI * 23.7 + phase);
      let inset = amplitude * Math.sin(Math.PI * t) ** .65 * (noise + bayDepth * Math.exp(-(((t - bayCenter) / .2) ** 2)));
      let p = [base[0] + nx * inset, base[1] + ny * inset];
      for (let attempt = 0; attempt < 10 && !pointInPolygon(p, source); attempt++) { inset *= .5; p = [base[0] + nx * inset, base[1] + ny * inset]; }
      points.push(pointInPolygon(p, source) ? p : base);
    }
  }
  let coast = points;
  // Corner cutting removes polygonal capes. A concave notch is cut only when the
  // replacement segments stay on existing land; chart-border corners remain exact.
  for (let pass = 0; pass < 1; pass++) {
    const smooth = [];
    for (let i = 0; i < coast.length; i++) {
      const a = coast[(i + coast.length - 1) % coast.length], b = coast[i], c = coast[(i + 1) % coast.length];
      const border = onBorder(a, b, width, height) || onBorder(b, c, width, height);
      const q = lerp(b, a, .2), r = lerp(b, c, .2);
      if (!border && segmentWithin(q, r, source)) smooth.push(q, r);
      else smooth.push(b);
    }
    if (smooth.length <= 512 && isSimplePolygon(smooth)) coast = smooth;
  }
  if (!isSimplePolygon(coast) || coast.some((p, i) => !pointInPolygon(p, source) || !segmentWithin(p, coast[(i + 1) % coast.length], source))) return source.map(p => [...p]);
  return coast.map(([x, y]) => [Math.max(0, Math.min(width, Math.round(x * 1e8) / 1e8)), Math.max(0, Math.min(height, Math.round(y * 1e8) / 1e8))]);
}

/** Return a new map with simple, bounded natural coasts. Authored data is not mutated. */
export function naturalizeMap(map, seed = map.id || map.name || 'chart') {
  if (map.terrainVersion === TERRAIN_VERSION) return map;
  return {
    ...map,
    terrainVersion: TERRAIN_VERSION,
    land: (map.land || []).map((shape, index) => {
      const points = naturalCoast(shape.points, map.width, map.height, `${seed}:${index}`);
      return {...shape, points, bounds: polygonBounds(points)};
    })
  };
}
