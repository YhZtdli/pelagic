import { WEAPONS } from '../data/catalog.js';

const TAU = Math.PI * 2;
const COLORS = { ink: '#061522', ocean: '#0b2031', cyan: '#57d9d2', amber: '#ffbf69', white: '#dceaf0', red: '#fa7785' };
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const pointOf = p => Array.isArray(p) ? { x: finite(p[0]), y: finite(p[1]) } : { x: finite(p?.x), y: finite(p?.y) };
const roleOf = s => s.classData?.role || s.role || s.classId || 'destroyer';
const sideColor = side => side === 'red' ? COLORS.red : COLORS.cyan;
const rangeOf = value => Math.max(0, finite(typeof value === 'object' ? value?.range ?? value?.radius : value));
const weapons = Array.isArray(WEAPONS) ? Object.fromEntries(WEAPONS.map(w => [w.id, w])) : WEAPONS;
// Metres and tonnes are fallbacks for saves created before hull dimensions were recorded.
const HULL_DIMENSIONS = {
  carrier: [300, 52, 70000], battleship: [250, 33, 55000], cruiser: [185, 21, 14000],
  destroyer: [150, 18, 8000], frigate: [130, 15, 4500], corvette: [90, 11, 1400],
  submarine: [100, 10, 5000], amphibious: [210, 28, 23000], supply: [195, 28, 24000], patrol: [60, 9, 700]
};

/** Canvas-only view. Camera coordinates and all public pointer coordinates use CSS pixels. */
export class NavalRenderer {
  constructor(canvas, minimapCanvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.minimapCanvas = minimapCanvas;
    this.mctx = minimapCanvas?.getContext('2d', { alpha: false });
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.width = this.height = 1;
    this.dpr = 1;
    this.sinking = new Map();
    this._mapCache = null;
    this._fogKey = null;
    this._fogCanvas = this._newCanvas();
    this._fogCtx = this._fogCanvas.getContext('2d');
    this.resize();
    this.setGame(game);
  }

  _newCanvas() {
    const doc = this.canvas.ownerDocument || globalThis.document;
    return doc ? doc.createElement('canvas') : new OffscreenCanvas(1, 1);
  }

  get map() { return this.game?.map || { width: 220, height: 150, land: [], name: 'Operational waters' }; }

  setGame(game) {
    this.game = game;
    this._mapCache = null;
    this._fogKey = null;
    this.sinking.clear();
    this._lastTime = -1;
    this.fit();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, Math.round(rect.width || this.canvas.clientWidth || 800));
    this.height = Math.max(1, Math.round(rect.height || this.canvas.clientHeight || 600));
    this.dpr = clamp(finite(globalThis.devicePixelRatio, 1), 1, 3);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this._fogKey = null;
    this._fogCanvas.width = this.width;
    this._fogCanvas.height = this.height;
    if (this.minimapCanvas) {
      const miniRect = this.minimapCanvas.getBoundingClientRect();
      this.miniWidth = Math.max(1, Math.round(miniRect.width || this.minimapCanvas.clientWidth || 220));
      this.miniHeight = Math.max(1, Math.round(miniRect.height || this.minimapCanvas.clientHeight || 142));
      this.minimapCanvas.width = Math.round(this.miniWidth * this.dpr);
      this.minimapCanvas.height = Math.round(this.miniHeight * this.dpr);
    }
    this._updateBounds();
  }

  _dimensions() { return { w: Math.max(1, finite(this.map.width, 220)), h: Math.max(1, finite(this.map.height, 150)) }; }

  _updateBounds() {
    const { w, h } = this._dimensions();
    this._fitZoom = Math.max(.01, Math.min(Math.max(1, this.width - 56) / w, Math.max(1, this.height - 56) / h));
    this._minZoom = this._fitZoom * .62;
    this._maxZoom = Math.max(960, this._fitZoom * 72);
    this.camera.zoom = clamp(finite(this.camera.zoom, this._fitZoom), this._minZoom, this._maxZoom);
    this._clampCamera();
  }

  _clampCamera() {
    const { w, h } = this._dimensions();
    const padX = this.width / this.camera.zoom * .32;
    const padY = this.height / this.camera.zoom * .32;
    this.camera.x = clamp(finite(this.camera.x, w / 2), -padX, w + padX);
    this.camera.y = clamp(finite(this.camera.y, h / 2), -padY, h + padY);
  }

  fit() {
    this._updateBounds();
    const { w, h } = this._dimensions();
    this.camera = { x: w / 2, y: h / 2, zoom: this._fitZoom };
  }

  focus(x, y) {
    this.camera.x = finite(x, this.camera.x);
    this.camera.y = finite(y, this.camera.y);
    this._clampCamera();
  }

  worldToScreen(x, y) {
    return { x: (finite(x) - this.camera.x) * this.camera.zoom + this.width / 2, y: (finite(y) - this.camera.y) * this.camera.zoom + this.height / 2 };
  }

  screenToWorld(x, y) {
    return { x: (finite(x) - this.width / 2) / this.camera.zoom + this.camera.x, y: (finite(y) - this.height / 2) / this.camera.zoom + this.camera.y };
  }

  zoomAt(factor, screenX = this.width / 2, screenY = this.height / 2) {
    const anchor = this.screenToWorld(screenX, screenY);
    this.camera.zoom = clamp(this.camera.zoom * Math.max(.01, finite(factor, 1)), this._minZoom, this._maxZoom);
    this.camera.x = anchor.x - (screenX - this.width / 2) / this.camera.zoom;
    this.camera.y = anchor.y - (screenY - this.height / 2) / this.camera.zoom;
    this._clampCamera();
  }

  _visibleShips() {
    const all = this.game?.state?.ships || [];
    const ships = typeof this.game?.getVisibleShips === 'function' ? this.game.getVisibleShips('blue') : all.filter(s => s.side === 'blue' || s.detectedBy?.blue);
    return (ships || []).filter(s => s.status !== 'sunk' && Number.isFinite(s.x) && Number.isFinite(s.y));
  }

  pick(screenX, screenY, side) {
    let best = null;
    let distance = Infinity;
    for (const ship of this._visibleShips()) {
      if (ship.status !== 'active' || (side && ship.side !== side)) continue;
      const p = this.worldToScreen(ship.x, ship.y);
      const d = Math.hypot(p.x - screenX, p.y - screenY);
      if (d < Math.max(13, this._shipLength(ship) * .6) && d < distance) { best = ship; distance = d; }
    }
    return best;
  }

  getMinimapWorld(screenX, screenY) {
    const { w, h } = this._dimensions();
    const mm = this._miniTransform();
    return { x: clamp((finite(screenX) - mm.x) / mm.scale, 0, w), y: clamp((finite(screenY) - mm.y) / mm.scale, 0, h) };
  }

  _miniTransform() {
    const { w, h } = this._dimensions();
    const scale = Math.max(.001, Math.min(((this.miniWidth || 220) - 12) / w, ((this.miniHeight || 142) - 12) / h));
    return { scale, x: ((this.miniWidth || 220) - w * scale) / 2, y: ((this.miniHeight || 142) - h * scale) / 2 };
  }

  _landPolygons() {
    return (this.map.land || []).map(l => (l.points || l.polygon || (Array.isArray(l) ? l : [])).map(pointOf)).filter(p => p.length >= 3);
  }

  _polygon(ctx, points) {
    if (!points.length) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
  }

  _ensureTerrain() {
    const { w, h } = this._dimensions();
    if (this._mapCache?.source === this.map && this._mapCache.w === w && this._mapCache.h === h) return;
    const image = this._newCanvas();
    const scale = Math.min(2048 / Math.max(w, h), 14);
    image.width = Math.max(1, Math.ceil(w * scale));
    image.height = Math.max(1, Math.ceil(h * scale));
    const ctx = image.getContext('2d');
    ctx.scale(scale, scale);
    const ocean = ctx.createLinearGradient(0, 0, w, h);
    ocean.addColorStop(0, '#102c40'); ocean.addColorStop(.48, '#0b2234'); ocean.addColorStop(1, '#071b2b');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, w, h);
    // Deep-water contours are deterministic, so panning never makes terrain shimmer.
    ctx.lineWidth = .5 / scale;
    for (let j = 0; j < 38; j++) {
      const y = h * (j / 31 - .08);
      ctx.strokeStyle = j % 4 === 0 ? '#25445365' : '#1e3a4b45';
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const x = w * i / 80;
        const dy = Math.sin(i * .083 + j * .24) * h * .038 + Math.sin(i * .19 - j * .1) * h * .015;
        if (!i) ctx.moveTo(x, y + dy); else ctx.lineTo(x, y + dy);
      }
      ctx.stroke();
    }
    const land = this._landPolygons();
    ctx.lineJoin = 'round';
    for (const p of land) {
      for (const [width, color] of [[9, '#15374888'], [5.4, '#1a435280'], [2.7, '#24546275'], [1.1, '#35717a65']]) {
        this._polygon(ctx, p); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
      }
      this._polygon(ctx, p);
      const ground = ctx.createLinearGradient(0, 0, w * .3, h);
      ground.addColorStop(0, '#35504d'); ground.addColorStop(1, '#223b3c');
      ctx.fillStyle = ground; ctx.fill();
      ctx.strokeStyle = '#719084'; ctx.lineWidth = .6 / scale + .16; ctx.stroke();
      ctx.save();
      this._polygon(ctx, p); ctx.clip();
      const cx = p.reduce((sum, v) => sum + v.x, 0) / p.length;
      const cy = p.reduce((sum, v) => sum + v.y, 0) / p.length;
      for (let inset = .84; inset > .23; inset -= .17) {
        const contour = p.map(v => ({ x: cx + (v.x - cx) * inset, y: cy + (v.y - cy) * inset }));
        this._polygon(ctx, contour);
        ctx.fillStyle = '#6882700b'; ctx.fill();
        ctx.strokeStyle = '#9caa8124'; ctx.lineWidth = .7 / scale; ctx.stroke();
      }
      ctx.strokeStyle = '#aac0a00c'; ctx.lineWidth = 1 / scale;
      for (let y = 0; y < h; y += 3) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y - w * .3); ctx.stroke(); }
      ctx.restore();
    }
    this._mapCache = { source: this.map, image, w, h, land };
  }

  render(options = {}) {
    const ctx = this.ctx;
    if (!ctx) return;
    this._updateBounds();
    this._ensureTerrain();
    this.time = Math.max(0, finite(this.game?.state?.time));
    if (this.time < this._lastTime) this.sinking.clear();
    this._lastTime = this.time;
    this.selected = options.selectedIds instanceof Set ? options.selectedIds : new Set(options.selectedIds || []);
    this.visible = this._visibleShips();
    this.visibleById = new Map(this.visible.map(s => [s.id, s]));
    this.threats = typeof this.game?.getThreats === 'function' ? this.game.getThreats('blue') : null;
    this.threatIds = this.threats ? new Set(this.threats.map(p => p.id)) : null;
    this.orderTargets = new Map([...this.visible, ...(this.game?.state?.objectives || []), ...(this.threats || [])].map(entity => [entity.id, entity]));
    this.sensors = (this.game?.state?.ships || []).filter(s => s.side === 'blue' && s.status === 'active').map(s => ({ x: finite(s.x), y: finite(s.y), radar: s.emcon ? 0 : rangeOf(s.radar ?? s.classData?.radar), visual: rangeOf(s.visual ?? s.classData?.visual), sonar: rangeOf(s.sonar ?? s.classData?.sonar) }));
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.ink;
    ctx.fillRect(0, 0, this.width, this.height);
    const { w, h } = this._dimensions();
    const origin = this.worldToScreen(0, 0);
    ctx.save();
    ctx.shadowColor = '#0009'; ctx.shadowBlur = 24;
    ctx.fillStyle = COLORS.ocean; ctx.fillRect(origin.x, origin.y, w * this.camera.zoom, h * this.camera.zoom);
    ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.rect(origin.x, origin.y, w * this.camera.zoom, h * this.camera.zoom); ctx.clip();
    ctx.drawImage(this._mapCache.image, origin.x, origin.y, w * this.camera.zoom, h * this.camera.zoom);
    this._drawGrid();
    this._drawFog();
    this._drawObjectives(options.showLabels !== false);
    if (options.showSensors) this._drawSensors();
    if (options.showRanges) this._drawRanges();
    this._drawOrders();
    const visibleSorted = [...this.visible].sort((a, b) => Number(this.selected.has(a.id)) - Number(this.selected.has(b.id)));
    for (const ship of visibleSorted) this._drawShip(ship, options.hoverId === ship.id);
    this._drawProjectiles();
    this._drawEffects();
    if (options.showLabels !== false) this._drawLabels(options.hoverId);
    ctx.restore();
    this._drawMapBorder(origin, w, h);
    this._drawHud();
    if (options.selectionRect) this._drawSelection(options.selectionRect);
    this._drawMinimap();
  }

  _drawGrid() {
    const ctx = this.ctx;
    const { w, h } = this._dimensions();
    const step = this._niceStep(90 / this.camera.zoom);
    const a = this.screenToWorld(0, 0), b = this.screenToWorld(this.width, this.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#89b9c610';
    ctx.beginPath();
    for (let x = Math.max(0, Math.ceil(a.x / step) * step); x <= Math.min(w, b.x); x += step) { const p = this.worldToScreen(x, 0); ctx.moveTo(Math.round(p.x) + .5, 0); ctx.lineTo(Math.round(p.x) + .5, this.height); }
    for (let y = Math.max(0, Math.ceil(a.y / step) * step); y <= Math.min(h, b.y); y += step) { const p = this.worldToScreen(0, y); ctx.moveTo(0, Math.round(p.y) + .5); ctx.lineTo(this.width, Math.round(p.y) + .5); }
    ctx.stroke();
    ctx.fillStyle = '#80b5c028';
    for (let x = Math.max(0, Math.ceil(a.x / step) * step); x <= Math.min(w, b.x); x += step) {
      for (let y = Math.max(0, Math.ceil(a.y / step) * step); y <= Math.min(h, b.y); y += step) {
        const p = this.worldToScreen(x, y); ctx.fillRect(p.x - 2, p.y, 5, 1); ctx.fillRect(p.x, p.y - 2, 1, 5);
      }
    }
  }

  _niceStep(value) {
    const power = 10 ** Math.floor(Math.log10(Math.max(.001, value)));
    const n = value / power;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * power;
  }

  _drawFog() {
    const stamp = globalThis.performance?.now?.() ?? Date.now();
    const key = `${this.width}:${this.height}:${this.camera.x}:${this.camera.y}:${this.camera.zoom}:${this.sensors.map(s => `${s.radar}/${s.sonar}/${s.visual}`).join(',')}`;
    if (this._fogKey === key && (this._fogTime === this.time || stamp - this._fogStamp < 100)) { this.ctx.drawImage(this._fogCanvas, 0, 0); return; }
    this._fogKey = key; this._fogTime = this.time; this._fogStamp = stamp;
    const ctx = this._fogCtx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#020c16a6'; ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = 'destination-out';
    for (const sensor of this.sensors) {
      const radius = Math.max(sensor.radar, sensor.visual, sensor.sonar * .8) * this.camera.zoom;
      if (radius < 1) continue;
      const p = this.worldToScreen(sensor.x, sensor.y);
      if (p.x + radius < 0 || p.x - radius > this.width || p.y + radius < 0 || p.y - radius > this.height) continue;
      const grad = ctx.createRadialGradient(p.x, p.y, radius * .76, p.x, p.y, radius);
      grad.addColorStop(0, '#000e'); grad.addColorStop(.8, '#000b'); grad.addColorStop(1, '#0000');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, TAU); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    this.ctx.drawImage(this._fogCanvas, 0, 0);
  }

  _drawSensors() {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = '10px ui-monospace, Consolas, monospace';
    for (const ship of this.visible) {
      if (ship.side !== 'blue' || ship.status !== 'active') continue;
      const p = this.worldToScreen(ship.x, ship.y);
      const selected = this.selected.has(ship.id);
      const radar = Math.max(ship.emcon ? 0 : rangeOf(ship.radar), rangeOf(ship.visual));
      const sonar = rangeOf(ship.sonar);
      for (const [range, color, label] of [[radar, '#57d9d2', 'Sensor envelope'], [sonar, '#82a9e6', 'Sonar']]) {
        if (!range) continue;
        const radius = range * this.camera.zoom;
        ctx.strokeStyle = color; ctx.globalAlpha = selected ? .36 : .105;
        ctx.lineWidth = 1; ctx.setLineDash(label === 'Sonar' ? [2, 6] : [6, 5]);
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, TAU); ctx.stroke();
        if (selected && radius > 50) {
          ctx.globalAlpha = .6; ctx.fillStyle = color; ctx.setLineDash([]);
          ctx.fillText(`${label} ${Math.round(range)} km`, p.x + 7, p.y - radius + 15);
        }
      }
    }
    ctx.restore();
  }

  _drawRanges() {
    const ctx = this.ctx;
    ctx.save();
    for (const ship of this.visible.filter(s => this.selected.has(s.id)).slice(0, 4)) {
      const groups = new Map();
      for (const mount of ship.mounts || []) {
        const weapon = weapons?.[mount.weaponId] || mount;
        const range = rangeOf(weapon.range ?? weapon.maxRange ?? mount.range);
        if (range <= 0 || mount.ammo === 0 || ['ciws', 'aa'].includes(weapon.kind)) continue;
        const key = `${weapon.kind}:${Math.round(range)}`;
        if (!groups.has(key)) groups.set(key, { range, kind: weapon.kind, name: weapon.name || 'Weapon' });
      }
      for (const item of [...groups.values()].sort((a, b) => b.range - a.range).slice(0, 4)) {
        const p = this.worldToScreen(ship.x, ship.y), r = item.range * this.camera.zoom;
        const color = item.kind === 'torpedo' || item.kind === 'depthcharge' ? '#90b8e8' : item.kind === 'sam' ? '#57d9d2' : '#ffbf69';
        ctx.globalAlpha = .32; ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([3, 7]);
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.stroke();
        if (this.selected.size === 1 && r > 40) {
          ctx.globalAlpha = .75; ctx.fillStyle = color; ctx.font = '10px Inter, "Segoe UI", Arial, sans-serif';
          ctx.fillText(`${item.name} · ${item.range} km`, p.x + 7, p.y + r - 7);
        }
      }
    }
    ctx.restore();
  }

  _drawOrders() {
    const ctx = this.ctx;
    ctx.save();
    for (const ship of this.visible) {
      if (!this.selected.has(ship.id) || ship.status !== 'active') continue;
      const order = ship.order || {};
      const target = this.orderTargets.get(order.targetId);
      const attack = order.type === 'attack' && target;
      let points = [];
      if (attack) points = [{ x: target.x, y: target.y }];
      else if (ship.path?.length) points = ship.path.map(pointOf);
      else if (Number.isFinite(order.x) && Number.isFinite(order.y)) points = [{ x: order.x, y: order.y }];
      if (!points.length) continue;
      const color = attack ? COLORS.red : COLORS.cyan;
      const start = this.worldToScreen(ship.x, ship.y);
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.globalAlpha = .55;
      ctx.lineWidth = 1.25; ctx.setLineDash(attack ? [2, 6] : [7, 6]); ctx.lineDashOffset = -this.time * .5;
      ctx.beginPath(); ctx.moveTo(start.x, start.y);
      for (const point of points) { const p = this.worldToScreen(point.x, point.y); ctx.lineTo(p.x, p.y); }
      ctx.stroke(); ctx.setLineDash([]);
      const dest = this.worldToScreen(points.at(-1).x, points.at(-1).y);
      ctx.beginPath(); ctx.arc(dest.x, dest.y, attack ? 15 : 7, 0, TAU); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dest.x - 11, dest.y); ctx.lineTo(dest.x - 4, dest.y);
      ctx.moveTo(dest.x + 4, dest.y); ctx.lineTo(dest.x + 11, dest.y);
      ctx.moveTo(dest.x, dest.y - 11); ctx.lineTo(dest.x, dest.y - 4);
      ctx.moveTo(dest.x, dest.y + 4); ctx.lineTo(dest.x, dest.y + 11); ctx.stroke();
      if (!attack) {
        const prev = points.length > 1 ? this.worldToScreen(points.at(-2).x, points.at(-2).y) : start;
        const angle = Math.atan2(dest.y - prev.y, dest.x - prev.x);
        const mx = prev.x + (dest.x - prev.x) * .66, my = prev.y + (dest.y - prev.y) * .66;
        ctx.save(); ctx.translate(mx, my); ctx.rotate(angle);
        ctx.beginPath(); ctx.moveTo(-4, -3); ctx.lineTo(2, 0); ctx.lineTo(-4, 3); ctx.stroke(); ctx.restore();
      }
    }
    ctx.restore();
  }

  _shipDimensions(ship) {
    const [baseLength, baseBeam, baseTonnage] = HULL_DIMENSIONS[roleOf(ship)] || HULL_DIMENSIONS.destroyer;
    const data = ship.classData || ship;
    const tonnageScale = clamp(Math.cbrt(Math.max(1, finite(data.tonnage, baseTonnage)) / baseTonnage), .65, 1.3);
    const length = clamp(finite(data.lengthMeters, baseLength * tonnageScale), 25, 400);
    const beam = clamp(finite(data.beamMeters, baseBeam * tonnageScale), length * .07, length * .3);
    return { length, beam };
  }

  _shipLength(ship) {
    const { length } = this._shipDimensions(ship);
    // One world unit is one kilometre. Only the distant contact marker is exaggerated.
    return Math.max(clamp(6 + length / 90, 6.3, 10.5), length / 1000 * this.camera.zoom);
  }

  _shipBeam(ship) {
    const { length, beam } = this._shipDimensions(ship);
    return Math.max(1.7, this._shipLength(ship) * beam / length);
  }

  _onScreen(p, margin = 80) { return p.x > -margin && p.y > -margin && p.x < this.width + margin && p.y < this.height + margin; }

  _drawShip(ship, hovered) {
    const ctx = this.ctx, p = this.worldToScreen(ship.x, ship.y);
    const length = this._shipLength(ship), beam = this._shipBeam(ship), selected = this.selected.has(ship.id), role = roleOf(ship);
    if (!this._onScreen(p, Math.max(180, length * 3))) return;
    const color = sideColor(ship.side), heading = finite(ship.heading);
    let alive = 1;
    if (ship.status === 'sinking') {
      if (!this.sinking.has(ship.id)) this.sinking.set(ship.id, this.time);
      const duration = Math.max(1, finite(ship.sinkDuration, 40));
      alive = clamp(Number.isFinite(ship.sinkTimer) ? ship.sinkTimer / duration : 1 - (this.time - this.sinking.get(ship.id)) / duration, 0, 1);
      if (alive <= .01) return;
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    if (selected || hovered) {
      ctx.strokeStyle = color; ctx.lineWidth = selected ? 1.5 : 1;
      ctx.globalAlpha = selected ? .85 : .55;
      const radius = Math.max(9, length * .7);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.arc(0, 0, radius, i * Math.PI / 2 + .13, i * Math.PI / 2 + 1.14); ctx.stroke();
      }
      if (selected) {
        ctx.globalAlpha = .055; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, radius, 0, TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = alive;
    ctx.rotate(heading + (1 - alive) * .2);
    if (length >= 14 && ship.status === 'active' && finite(ship.speed) > .0005) {
      const wakeLength = length * clamp(.75 + finite(ship.speed) * 20, .8, 2);
      ctx.strokeStyle = role === 'submarine' ? '#6b9bad' : '#a8dce1';
      ctx.globalAlpha = role === 'submarine' ? .09 : .2;
      ctx.lineWidth = 1;
      for (const side of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(-length * .35, side * length * .12);
        ctx.quadraticCurveTo(-length * .7, side * length * .12, -length * .5 - wakeLength, side * length * .29); ctx.stroke();
        ctx.globalAlpha = .09;
        ctx.beginPath(); ctx.moveTo(-length * .3, side * length * .17);
        ctx.quadraticCurveTo(-length, side * length * .28, -length * .7 - wakeLength, side * length * .46); ctx.stroke();
        ctx.globalAlpha = .2;
      }
      ctx.fillStyle = '#d7edf2'; ctx.globalAlpha = .12;
      for (let i = 0; i < 6; i++) {
        const offset = ((this.time * .075 + i / 6) % 1);
        ctx.beginPath(); ctx.ellipse(-length * .45 - wakeLength * offset, Math.sin(i * 12) * length * .035, 2.5 * (1 - offset), .7, 0, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = alive;
    }
    if (ship.status === 'active' && (selected || hovered)) {
      ctx.strokeStyle = color; ctx.globalAlpha = .5;
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(length * .61, 0); ctx.lineTo(length * .95, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(length * .91, -3); ctx.lineTo(length, 0); ctx.lineTo(length * .91, 3); ctx.stroke();
    }
    ctx.globalAlpha = alive;
    const width = { carrier: .33, amphibious: .31, supply: .28, battleship: .25, submarine: .19, patrol: .24, corvette: .23 }[role] || .23;
    ctx.scale(length / 2 * (.75 + alive * .25), beam / (width * 2));
    const lw = 2 / length;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#000b'; ctx.shadowBlur = length >= 14 ? 3 : 0; ctx.shadowOffsetY = length >= 14 ? 1 : 0;
    ctx.beginPath();
    if (role === 'submarine') {
      ctx.moveTo(.77, -width); ctx.bezierCurveTo(1.09, -width, 1.09, width, .77, width);
      ctx.lineTo(-.66, width); ctx.quadraticCurveTo(-1, width * .7, -1, 0); ctx.quadraticCurveTo(-1, -width * .7, -.66, -width); ctx.closePath();
    } else {
      ctx.moveTo(1, 0); ctx.lineTo(.58, -width); ctx.lineTo(-.81, -width); ctx.lineTo(-.96, -width * .7); ctx.lineTo(-.96, width * .7); ctx.lineTo(-.81, width); ctx.lineTo(.58, width); ctx.closePath();
    }
    ctx.fillStyle = ship.side === 'red' ? '#bc8e98' : '#acc4cc'; ctx.fill();
    ctx.strokeStyle = selected ? color : ship.side === 'red' ? '#e2acb4' : '#d0e3e5'; ctx.stroke();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = ship.side === 'red' ? '#644b58' : '#3e5b69';
    ctx.strokeStyle = ship.side === 'red' ? '#d4a6ad' : '#bacfd5';
    if (length >= 12 && role === 'carrier') {
      ctx.fillStyle = '#526570';
      ctx.beginPath(); ctx.moveTo(.92, -.1); ctx.lineTo(.53, -.29); ctx.lineTo(-.88, -.29); ctx.lineTo(-.88, .29); ctx.lineTo(.61, .29); ctx.lineTo(.92, .1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#e0e2cd'; ctx.lineWidth = lw * .7;
      ctx.beginPath(); ctx.moveTo(-.79, .17); ctx.lineTo(.76, -.03); ctx.moveTo(-.78, .045); ctx.lineTo(.59, -.14); ctx.stroke();
      ctx.setLineDash([.09, .06]); ctx.beginPath(); ctx.moveTo(-.82, .11); ctx.lineTo(.7, -.08); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#c4ced0'; ctx.fillRect(.01, -.28, .38, .095); ctx.fillRect(.15, -.31, .075, .06);
      if (length > 29) {
        ctx.fillStyle = '#c0cbd0';
        for (let i = 0; i < 3; i++) { const x = -.55 + i * .25; ctx.beginPath(); if (/helicopter|helo/.test(ship.classId || ship.classData?.id || '')) { ctx.arc(x, 0, .09, 0, TAU); ctx.stroke(); } else { ctx.moveTo(x + .06, -.17); ctx.lineTo(x - .02, -.14); ctx.lineTo(x - .07, -.08); ctx.lineTo(x - .07, -.2); ctx.lineTo(x - .02, -.18); ctx.closePath(); ctx.fill(); } }
        ctx.strokeStyle = '#cad9d5'; ctx.beginPath(); ctx.moveTo(.42, .12); ctx.lineTo(.65, .12); ctx.moveTo(.42, .2); ctx.lineTo(.65, .2); ctx.stroke();
      }
    } else if (length >= 12 && role === 'submarine') {
      ctx.fillStyle = ship.side === 'red' ? '#815a6b' : '#5a8492';
      ctx.beginPath(); ctx.ellipse(.1, 0, .2, .1, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#d9e6e5'; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(.1, -.16); ctx.lineTo(.1, .16); ctx.moveTo(-.75, -.3); ctx.lineTo(-.75, .3); ctx.moveTo(-.98, 0); ctx.lineTo(-1.13, 0); ctx.stroke();
      ctx.fillStyle = '#a8c4cb'; ctx.fillRect(.09, -.035, .04, .07);
    } else if (length >= 12 && (role === 'supply' || role === 'amphibious')) {
      ctx.fillStyle = '#405a64'; ctx.fillRect(-.72, -width * .76, 1.1, width * 1.52);
      if (role === 'supply') {
        for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#799398' : '#9ca9a3'; ctx.fillRect(-.65 + i * .25, -.16, .17, .32); }
        ctx.fillStyle = '#d1dada'; ctx.fillRect(.42, -.17, .16, .34);
        ctx.strokeStyle = '#b5c9cc'; ctx.beginPath(); ctx.moveTo(-.55, 0); ctx.lineTo(.37, 0); ctx.stroke();
      } else {
        ctx.fillStyle = '#b0c2c5'; ctx.fillRect(.35, -.23, .29, .19);
        ctx.strokeStyle = '#b9cecc'; ctx.lineWidth = lw * .7;
        for (const x of [-.46, -.02]) { ctx.beginPath(); ctx.arc(x, .025, .13, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - .05, -.02); ctx.lineTo(x - .05, .07); ctx.moveTo(x + .05, -.02); ctx.lineTo(x + .05, .07); ctx.moveTo(x - .05, .025); ctx.lineTo(x + .05, .025); ctx.stroke(); }
      }
    } else if (length >= 12) {
      ctx.fillStyle = '#3e5661'; ctx.fillRect(-.43, -width * .66, .67, width * 1.32);
      ctx.fillStyle = ship.side === 'red' ? '#d0a5ad' : '#c5d3d5'; ctx.fillRect(.02, -.115, .25, .23);
      ctx.fillStyle = '#8b9ca0'; ctx.fillRect(-.3, -.09, .12, .18); ctx.fillRect(-.08, -.075, .1, .15);
      const turret = (x, scale = 1, barrels = 1) => {
        ctx.fillStyle = ship.side === 'red' ? '#d2a6af' : '#d2dfe0'; ctx.strokeStyle = '#243f4e';
        ctx.fillRect(x - .09 * scale, -.1 * scale, .18 * scale, .2 * scale);
        ctx.fillStyle = '#dce8e6';
        for (let i = 0; i < barrels; i++) ctx.fillRect(x + .04 * scale, (i - (barrels - 1) / 2) * .055 * scale - lw / 2, .21 * scale, Math.max(lw, .018));
      };
      if (role === 'battleship') { turret(.58, 1.15, 3); turret(.32, .95, 3); turret(-.64, 1.15, 3); }
      else if (role === 'cruiser') { turret(.59, 1, 2); turret(-.62, .9, 2); }
      else if (role === 'patrol') turret(.43, .85, 1);
      else {
        turret(.56, .85, 1); ctx.strokeStyle = '#cfdbd9'; ctx.lineWidth = lw * .6;
        if (role === 'frigate') {
          ctx.beginPath(); ctx.arc(-.62, 0, .16, 0, TAU); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-.68, -.07); ctx.lineTo(-.68, .07); ctx.moveTo(-.56, -.07); ctx.lineTo(-.56, .07); ctx.moveTo(-.68, 0); ctx.lineTo(-.56, 0); ctx.stroke();
        } else if (role === 'corvette') {
          ctx.fillStyle = '#a5b8be'; ctx.fillRect(-.58, -.12, .17, .07); ctx.fillRect(-.58, .05, .17, .07);
        } else {
          ctx.strokeRect(-.75, -.13, .27, .26); ctx.beginPath(); ctx.moveTo(-.615, -.13); ctx.lineTo(-.615, .13); ctx.moveTo(-.75, 0); ctx.lineTo(-.48, 0); ctx.stroke();
        }
      }
      if (role !== 'patrol') {
        ctx.strokeStyle = '#d8e5e5'; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(.05, -.24); ctx.lineTo(.05, .24); ctx.moveTo(-.07, 0); ctx.lineTo(.18, 0); ctx.stroke();
        ctx.fillStyle = '#e6efea'; ctx.fillRect(.025, -.035, .05, .07);
      }
    }
    // A tiny stern light keeps allegiance legible even at the smallest zoom.
    ctx.fillStyle = color; ctx.fillRect(-.88, -.07, .085, .14);
    ctx.restore();
    if (ship.status === 'sinking') { this._drawSinking(ship, p, length, alive); return; }
    const hp = clamp(finite(ship.hp) / Math.max(1, finite(ship.maxHp, 1)), 0, 1);
    if (selected || hovered || (hp < .96 && this.camera.zoom >= 20)) {
      const barWidth = clamp(length * 1.15, 27, 62), y = p.y + length * .55 + 5;
      ctx.fillStyle = '#061522de'; ctx.fillRect(p.x - barWidth / 2 - 2, y - 2, barWidth + 4, 6);
      ctx.fillStyle = '#45606b'; ctx.fillRect(p.x - barWidth / 2, y, barWidth, 2);
      ctx.fillStyle = hp < .28 ? COLORS.red : hp < .55 ? COLORS.amber : color; ctx.fillRect(p.x - barWidth / 2, y, barWidth * hp, 2);
    }
    if (ship.manual && selected) {
      ctx.fillStyle = COLORS.amber; ctx.font = 'bold 9px ui-monospace, monospace'; ctx.textAlign = 'center';
      ctx.fillText('M', p.x, p.y - length * .68 - 5); ctx.textAlign = 'left';
    }
  }

  _drawSinking(ship, p, length, alive) {
    const ctx = this.ctx;
    ctx.save(); ctx.globalAlpha = Math.min(.8, alive + .2);
    for (let i = 0; i < 3; i++) {
      const age = (this.time * .05 + i / 3) % 1;
      const x = p.x + Math.sin(i * 14) * length * .13 + age * 13;
      const y = p.y - age * length * .8;
      const r = (.6 + age * 2.6) * clamp(length / 16, .5, 3);
      const smoke = ctx.createRadialGradient(x, y, 0, x, y, r);
      smoke.addColorStop(0, `rgba(25,31,37,${.5 * (1 - age)})`); smoke.addColorStop(1, 'rgba(25,31,37,0)');
      ctx.fillStyle = smoke; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = '#9db9c0'; ctx.globalAlpha = .16 * (1 - alive);
    ctx.beginPath(); ctx.ellipse(p.x, p.y, length * (.7 + .4 * (1 - alive)), length * .32, finite(ship.heading), 0, TAU); ctx.stroke();
    ctx.fillStyle = '#ffbe75'; ctx.globalAlpha = .7 * alive;
    ctx.beginPath(); ctx.arc(p.x - 2, p.y, 1.7 + Math.sin(this.time * 2) * .5, 0, TAU); ctx.fill();
    ctx.restore();
  }

  _drawLabels(hoverId) {
    const ctx = this.ctx, boxes = [];
    ctx.save(); ctx.font = '10px Inter, "Segoe UI", Arial, sans-serif';
    const ordered = [...this.visible].sort((a, b) => Number(this.selected.has(b.id) || b.id === hoverId) - Number(this.selected.has(a.id) || a.id === hoverId));
    for (const ship of ordered) {
      const selected = this.selected.has(ship.id), important = selected || ship.id === hoverId;
      if (!important && this.camera.zoom < 18) continue;
      const p = this.worldToScreen(ship.x, ship.y);
      if (!this._onScreen(p, 10)) continue;
      const text = (ship.name || ship.classData?.name || ship.classId || 'Vessel') + (ship.status === 'sinking' ? ' · Sinking' : '');
      const width = ctx.measureText(text).width + 10;
      const length = this._shipLength(ship), hp = finite(ship.hp) / Math.max(1, finite(ship.maxHp, 1));
      const box = { x: p.x - width / 2, y: p.y + length * .55 + (selected || hp < .96 ? 13 : 7), w: width, h: 17 };
      if (!important && boxes.some(b => box.x < b.x + b.w + 3 && box.x + box.w > b.x - 3 && box.y < b.y + b.h && box.y + box.h > b.y)) continue;
      boxes.push(box);
      ctx.fillStyle = important ? '#061522e0' : '#0615229c';
      ctx.fillRect(box.x, box.y - 3, box.w, box.h);
      ctx.fillStyle = ship.status === 'sinking' ? '#a99691' : selected ? COLORS.white : ship.side === 'red' ? '#e5a2aa' : '#9ab7c4';
      ctx.fillText(text, box.x + 5, box.y + 9);
    }
    ctx.restore();
  }

  _drawObjectives(showLabels) {
    const ctx = this.ctx;
    const objectives = this.game?.state?.objectives || this.map.objectives || [];
    ctx.save();
    for (const obj of objectives) {
      if (!Number.isFinite(obj.x) || !Number.isFinite(obj.y)) continue;
      const p = this.worldToScreen(obj.x, obj.y);
      if (!this._onScreen(p, 100)) continue;
      const color = obj.owner === 'blue' ? COLORS.cyan : obj.owner === 'red' ? COLORS.red : COLORS.amber;
      ctx.translate(p.x, p.y); ctx.globalAlpha = .7;
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([2, 5]);
      ctx.beginPath(); ctx.arc(0, 0, 27, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#0a1b25e0'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(16, 0); ctx.lineTo(0, 16); ctx.lineTo(-16, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 1.4;
      if (obj.kind === 'port') {
        ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, 7); ctx.moveTo(-5, -3); ctx.lineTo(5, -3); ctx.moveTo(-7, 2); ctx.quadraticCurveTo(-6, 8, 0, 8); ctx.quadraticCurveTo(6, 8, 7, 2); ctx.moveTo(-7, 2); ctx.lineTo(-3, 4); ctx.moveTo(7, 2); ctx.lineTo(3, 4); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, -9, 2, 0, TAU); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(-5, 8); ctx.lineTo(-5, -8); ctx.lineTo(6, -8); ctx.lineTo(3, -4); ctx.lineTo(6, 0); ctx.lineTo(-5, 0); ctx.stroke();
      }
      const cap = typeof obj.capture === 'number' ? obj.capture : finite(obj.capture?.progress);
      if (cap > 0) { ctx.strokeStyle = obj.captureSide ? sideColor(obj.captureSide) : color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 22, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(cap / 100, 0, 1)); ctx.stroke(); }
      if (showLabels) {
        const name = obj.name || (obj.kind === 'port' ? 'Strategic port' : 'Control point');
        ctx.font = '11px Inter, "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'center';
        const tw = ctx.measureText(name).width;
        ctx.fillStyle = '#061522bd'; ctx.fillRect(-tw / 2 - 6, 31, tw + 12, 19);
        ctx.fillStyle = color; ctx.fillText(name, 0, 44); ctx.textAlign = 'left';
      }
      if (obj.maxHp && obj.hp < obj.maxHp) {
        ctx.fillStyle = '#223d48'; ctx.fillRect(-17, 24, 34, 2);
        ctx.fillStyle = color; ctx.fillRect(-17, 24, 34 * clamp(obj.hp / obj.maxHp, 0, 1), 2);
      }
      ctx.translate(-p.x, -p.y);
    }
    ctx.restore();
  }

  _visibleAt(x, y) {
    return this.sensors.some(s => Math.hypot(x - s.x, y - s.y) <= Math.max(s.radar, s.visual, s.sonar));
  }

  _projectileVisible(projectile) {
    if (this.threatIds && ['missile', 'aircraft', 'torpedo'].includes(projectile.kind)) return this.threatIds.has(projectile.id);
    return this.sensors.some(s => Math.hypot(projectile.x - s.x, projectile.y - s.y) < (projectile.kind === 'torpedo' ? Math.max(1.5, s.sonar * .5) : Math.max(s.visual, s.radar * .65)));
  }

  _projectileStyle(projectile) {
    const zoom = this.camera.zoom, kind = projectile.kind || 'missile';
    const shell = !['missile', 'sam', 'aircraft', 'torpedo', 'depthcharge'].includes(kind);
    if (shell) {
      return { visible: zoom >= 45, length: clamp(.5 + (zoom - 45) / 220, .5, 1.3), alpha: zoom < 80 ? .45 : .8, tail: 0, shell: true };
    }
    const strategic = zoom < 12;
    const threat = projectile.side === 'red' && ['missile', 'aircraft', 'torpedo'].includes(kind) && this._projectileVisible(projectile);
    if (strategic) return { visible: threat, length: kind === 'aircraft' ? 1.8 : 1.4, alpha: .8, tail: 0, strategic: true };
    const length = kind === 'aircraft' ? clamp(zoom * .018, 1.6, 4.2)
      : kind === 'torpedo' ? clamp(zoom * .012, 1.2, 3.2)
      : kind === 'depthcharge' ? clamp(zoom * .006, .8, 1.5) : clamp(1.4 + zoom * .011, 1.4, 4);
    const tail = zoom < 45 || kind === 'depthcharge' ? 0 : Math.min(kind === 'aircraft' ? 2.5 : 3.5, length);
    return { visible: true, length, alpha: .9, tail };
  }

  _drawProjectiles() {
    const ctx = this.ctx;
    const projectiles = this.game?.state?.projectiles || [];
    ctx.save();
    for (const projectile of projectiles) {
      if (projectile.status === 'expired' || !Number.isFinite(projectile.x) || !Number.isFinite(projectile.y)) continue;
      if (projectile.side === 'red' && !this._projectileVisible(projectile)) continue;
      const style = this._projectileStyle(projectile);
      if (!style.visible) continue;
      const p = this.worldToScreen(projectile.x, projectile.y), kind = projectile.kind || 'missile';
      if (!this._onScreen(p, 12)) continue;
      const color = kind === 'torpedo' || kind === 'depthcharge' ? '#a6d9ce' : kind === 'sam' || kind === 'ciws' ? '#91e5e6' : kind === 'aircraft' ? (projectile.side === 'red' ? '#ffc2c4' : '#d7eef0') : '#ffd18b';
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(finite(projectile.heading));
      const half = style.length / 2;
      // Exhaust is deliberately bounded in screen space: a fast weapon never leaves a chart-spanning beam.
      if (style.tail > 0) {
        const exhaust = ctx.createLinearGradient(-half, 0, -half - style.tail, 0);
        exhaust.addColorStop(0, color + '66'); exhaust.addColorStop(1, color + '00');
        ctx.strokeStyle = exhaust; ctx.lineWidth = .6; ctx.globalAlpha = .35;
        ctx.beginPath(); ctx.moveTo(-half, 0); ctx.lineTo(-half - style.tail, 0); ctx.stroke();
      }
      ctx.globalAlpha = style.alpha; ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = .45;
      if (style.shell || style.strategic) {
        ctx.beginPath(); ctx.arc(0, 0, half, 0, TAU); ctx.fill();
      } else if (kind === 'aircraft') {
        const helicopter = projectile.weaponId === 'air_asw' || /helicopter|helo|heli|rotor/i.test((projectile.weaponId || '') + ' ' + (weapons?.[projectile.weaponId]?.name || ''));
        if (helicopter) {
          ctx.beginPath(); ctx.ellipse(half * .2, 0, half * .55, half * .25, 0, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.moveTo(-half, 0); ctx.lineTo(half * .4, 0); ctx.stroke();
          ctx.rotate(this.time * 2.7); ctx.globalAlpha = .45;
          ctx.beginPath(); ctx.moveTo(-half, 0); ctx.lineTo(half, 0); ctx.moveTo(0, -half); ctx.lineTo(0, half); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(0, -half * .2); ctx.lineTo(-half * .45, -half * .85);
          ctx.lineTo(-half * .75, -half * .85); ctx.lineTo(-half * .4, -half * .16); ctx.lineTo(-half, -half * .3);
          ctx.lineTo(-half, half * .3); ctx.lineTo(-half * .4, half * .16); ctx.lineTo(-half * .75, half * .85);
          ctx.lineTo(-half * .45, half * .85); ctx.lineTo(0, half * .2); ctx.closePath(); ctx.fill();
        }
      } else if (kind === 'missile' || kind === 'sam') {
        const width = Math.max(.35, style.length * .12);
        ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(-half, -width); ctx.lineTo(-half * .65, 0); ctx.lineTo(-half, width); ctx.closePath(); ctx.fill();
      } else if (kind === 'torpedo') {
        ctx.beginPath(); ctx.ellipse(0, 0, half, Math.max(.3, half * .18), 0, 0, TAU); ctx.fill();
      } else {
        ctx.fillRect(-half, -half, style.length, style.length);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  _drawEffects() {
    const ctx = this.ctx;
    ctx.save();
    for (const effect of this.game?.state?.effects || []) {
      if (!Number.isFinite(effect.x) || !Number.isFinite(effect.y) || finite(effect.ttl) <= 0) continue;
      if (this.camera.zoom < 20 && ['launch', 'splash', 'wake', 'intercept'].includes(effect.kind)) continue;
      const nearTrack = this.visible.some(s => Math.hypot(s.x - effect.x, s.y - effect.y) < 3);
      const nearSensor = this.sensors.some(s => Math.hypot(s.x - effect.x, s.y - effect.y) < (effect.kind === 'intercept' ? Math.max(s.visual, s.radar * .65) : s.visual * 1.5));
      if (!nearTrack && !nearSensor) continue;
      const p = this.worldToScreen(effect.x, effect.y);
      if (!this._onScreen(p, 100)) continue;
      const life = clamp(finite(effect.ttl) / Math.max(.01, finite(effect.maxTtl, 3)), 0, 1);
      const progress = 1 - life;
      const base = clamp(rangeOf(effect.radius) * this.camera.zoom * .16, effect.kind === 'explosion' ? 1.5 : .5, effect.kind === 'explosion' ? 18 : 6);
      const radius = Math.max(.3, base * (.25 + progress * 1.4));
      if (['splash', 'wake', 'intercept'].includes(effect.kind)) {
        ctx.strokeStyle = effect.kind === 'intercept' ? '#d4f8f5' : '#9dbfcb';
        ctx.globalAlpha = life * .7; ctx.lineWidth = effect.kind === 'intercept' ? 1.3 : .9;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, radius, effect.kind === 'intercept' ? radius : radius * .55, 0, 0, TAU); ctx.stroke();
        if (effect.kind === 'intercept') {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) { const angle = i * TAU / 6 + .3; ctx.moveTo(p.x + Math.cos(angle) * radius * .2, p.y + Math.sin(angle) * radius * .2); ctx.lineTo(p.x + Math.cos(angle) * radius * .7, p.y + Math.sin(angle) * radius * .7); }
          ctx.stroke();
        } else { ctx.globalAlpha = life * .35; ctx.beginPath(); ctx.ellipse(p.x, p.y, radius * .6, radius * .3, 0, 0, TAU); ctx.stroke(); }
      } else {
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        glow.addColorStop(0, `rgba(255,237,194,${life * .85})`);
        glow.addColorStop(.18, `rgba(255,182,95,${life * .8})`);
        glow.addColorStop(.48, `rgba(221,108,69,${life * .35})`);
        glow.addColorStop(1, 'rgba(190,81,54,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#ffdb9e'; ctx.globalAlpha = life * life * .55; ctx.lineWidth = .9;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius * .8, 0, TAU); ctx.stroke();
        if (effect.kind !== 'launch') {
          ctx.globalAlpha = life * .65;
          for (let i = 0; i < 7; i++) {
            const angle = i * 2.39996 + finite(effect.x) * .1;
            const dist = radius * (.45 + (i % 3) * .17);
            ctx.beginPath(); ctx.moveTo(p.x + Math.cos(angle) * dist, p.y + Math.sin(angle) * dist); ctx.lineTo(p.x + Math.cos(angle) * (dist + 3 * life), p.y + Math.sin(angle) * (dist + 3 * life)); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  _drawMapBorder(origin, w, h) {
    const ctx = this.ctx, zoom = this.camera.zoom;
    ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = '#52798870';
    ctx.strokeRect(origin.x + .5, origin.y + .5, w * zoom, h * zoom);
    const step = this._niceStep(110 / zoom), a = this.screenToWorld(0, 0), b = this.screenToWorld(this.width, this.height);
    const topY = Math.max(0, origin.y), leftX = Math.max(0, origin.x);
    ctx.font = '9px ui-monospace, Consolas, monospace'; ctx.fillStyle = '#799ba9'; ctx.strokeStyle = '#6f929a75';
    ctx.textAlign = 'center';
    if (topY < this.height - 22) {
      for (let x = Math.max(0, Math.ceil(a.x / step) * step); x <= Math.min(w, b.x); x += step) {
        const p = this.worldToScreen(x, 0);
        if (p.x < 18 || p.x > this.width - 60) continue;
        ctx.beginPath(); ctx.moveTo(p.x, topY); ctx.lineTo(p.x, topY + 4); ctx.stroke();
        ctx.fillText(`${Math.round(x * 10) / 10}`, p.x, topY + 15);
      }
    }
    ctx.textAlign = 'left';
    if (leftX < this.width - 40) {
      for (let y = Math.max(0, Math.ceil(a.y / step) * step); y <= Math.min(h, b.y); y += step) {
        const p = this.worldToScreen(0, y);
        if (p.y < 30 || p.y > this.height - 50) continue;
        ctx.beginPath(); ctx.moveTo(leftX, p.y); ctx.lineTo(leftX + 4, p.y); ctx.stroke();
        ctx.fillText(`${Math.round(y * 10) / 10}`, leftX + 8, p.y + 3);
      }
    }
    ctx.restore();
  }

  _drawHud() {
    const ctx = this.ctx;
    ctx.save();
    const x = this.width - 32, y = 42;
    ctx.fillStyle = '#06152280'; ctx.beginPath(); ctx.arc(x, y, 21, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#71909d'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x, y + 12); ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y); ctx.stroke();
    ctx.fillStyle = '#bacdd1'; ctx.beginPath(); ctx.moveTo(x, y - 15); ctx.lineTo(x - 4, y - 4); ctx.lineTo(x + 4, y - 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b1c7cf'; ctx.font = '10px ui-monospace, Consolas, monospace'; ctx.textAlign = 'center'; ctx.fillText('N', x, y - 23);
    const distance = this._niceStep(80 / this.camera.zoom), length = distance * this.camera.zoom;
    const left = 21, bottom = this.height - 23;
    ctx.fillStyle = '#061522c4'; ctx.fillRect(left - 8, bottom - 25, length + 74, 38);
    ctx.strokeStyle = '#a6bec7'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(left, bottom - 5); ctx.lineTo(left, bottom); ctx.lineTo(left + length, bottom); ctx.lineTo(left + length, bottom - 5); ctx.moveTo(left + length / 2, bottom); ctx.lineTo(left + length / 2, bottom - 3); ctx.stroke();
    ctx.textAlign = 'left'; ctx.fillStyle = '#9bb6c3'; ctx.fillText('0', left, bottom - 9);
    ctx.textAlign = 'right'; ctx.fillText(`${Number(distance.toPrecision(3))} km`, left + length, bottom - 9);
    ctx.textAlign = 'left'; ctx.fillStyle = '#547a89'; ctx.fillText('CHART', left + length + 12, bottom - 1);
    ctx.restore();
  }

  _drawSelection(rect) {
    const ctx = this.ctx;
    const x = finite(rect.x), y = finite(rect.y), w = finite(rect.w), h = finite(rect.h);
    ctx.save(); ctx.fillStyle = '#57d9d216'; ctx.strokeStyle = '#70e6dd'; ctx.lineWidth = 1;
    ctx.fillRect(x, y, w, h); ctx.strokeRect(Math.round(x) + .5, Math.round(y) + .5, w, h);
    ctx.restore();
  }

  _drawMinimap() {
    const ctx = this.mctx;
    if (!ctx) return;
    const { w, h } = this._dimensions(), mm = this._miniTransform();
    const width = this.miniWidth, height = this.miniHeight;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.globalAlpha = 1; ctx.fillStyle = '#061522'; ctx.fillRect(0, 0, width, height);
    ctx.save(); ctx.beginPath(); ctx.rect(mm.x, mm.y, w * mm.scale, h * mm.scale); ctx.clip();
    ctx.drawImage(this._mapCache.image, mm.x, mm.y, w * mm.scale, h * mm.scale);
    ctx.fillStyle = '#020c1666'; ctx.fillRect(mm.x, mm.y, w * mm.scale, h * mm.scale);
    ctx.strokeStyle = '#7098a21e'; ctx.lineWidth = .5;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(mm.x + w * mm.scale * i / 4, mm.y); ctx.lineTo(mm.x + w * mm.scale * i / 4, mm.y + h * mm.scale);
      ctx.moveTo(mm.x, mm.y + h * mm.scale * i / 4); ctx.lineTo(mm.x + w * mm.scale, mm.y + h * mm.scale * i / 4); ctx.stroke();
    }
    for (const objective of this.game?.state?.objectives || this.map.objectives || []) {
      const x = mm.x + finite(objective.x) * mm.scale, y = mm.y + finite(objective.y) * mm.scale;
      ctx.strokeStyle = objective.owner === 'neutral' ? COLORS.amber : sideColor(objective.owner); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 4); ctx.lineTo(x - 4, y); ctx.closePath(); ctx.stroke();
    }
    const markerLength = clamp(4.2 - Math.sqrt(this.visible.length) * .18, 2.1, 3.5);
    for (const ship of this.visible) {
      if (ship.status === 'sunk') continue;
      const x = mm.x + ship.x * mm.scale, y = mm.y + ship.y * mm.scale;
      ctx.save(); ctx.translate(x, y); ctx.rotate(finite(ship.heading));
      ctx.fillStyle = sideColor(ship.side); ctx.globalAlpha = ship.status === 'sinking' ? .35 : .9;
      ctx.beginPath(); ctx.moveTo(markerLength * .6, 0); ctx.lineTo(-markerLength * .4, -markerLength * .3); ctx.lineTo(-markerLength * .4, markerLength * .3); ctx.closePath(); ctx.fill();
      if (this.selected.has(ship.id)) { ctx.strokeStyle = '#e5f9f8'; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(0, 0, 3.2, 0, TAU); ctx.stroke(); }
      ctx.restore();
    }
    const a = this.screenToWorld(0, 0), b = this.screenToWorld(this.width, this.height);
    const vx = mm.x + a.x * mm.scale, vy = mm.y + a.y * mm.scale, vw = (b.x - a.x) * mm.scale, vh = (b.y - a.y) * mm.scale;
    ctx.fillStyle = '#9bd9dc0e'; ctx.fillRect(vx, vy, vw, vh);
    ctx.strokeStyle = '#c4eeee'; ctx.lineWidth = 1; ctx.strokeRect(vx, vy, vw, vh);
    ctx.restore();
    ctx.strokeStyle = '#41616e'; ctx.lineWidth = 1; ctx.strokeRect(mm.x + .5, mm.y + .5, w * mm.scale, h * mm.scale);
    ctx.fillStyle = '#9bb9c5'; ctx.font = '8px ui-monospace, monospace'; ctx.fillText('N', width - 12, 12);
  }
}

export default NavalRenderer;




