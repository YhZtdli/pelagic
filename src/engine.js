import { MAPS, FACTIONS, SHIP_CLASSES, WEAPONS, createFleet } from '../data/catalog.js';

const TAU = Math.PI * 2;
const KNOT = 1.852 / 3600;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
const wrap = a => ((a + Math.PI) % TAU + TAU) % TAU - Math.PI;
const clone = x => JSON.parse(JSON.stringify(x));
const alive = s => s.status === 'active' && s.hp > 0;
const enemy = side => side === 'blue' ? 'red' : 'blue';
const roleIs = (s, ...roles) => roles.includes(s.classData.role);
const isAir = p => p.kind === 'aircraft';
const isThreat = p => ['missile', 'aircraft', 'torpedo'].includes(p.kind);
const VALUE = {carrier: 10, battleship: 8, cruiser: 6, destroyer: 4, frigate: 3, submarine: 5, amphibious: 6, supply: 5, corvette: 2, patrol: 1};

/** Deterministic naval simulation. Coordinates are kilometres; all clocks use simulation seconds. */
export class NavalGame {
  constructor({era = 'modern', blueFaction, redFaction, mapId, mode = 'encounter', scale = 'standard', seed = 41729} = {}) {
    const eraId = SHIP_CLASSES[era] ? era : Object.keys(SHIP_CLASSES)[0];
    const blue = FACTIONS.find(f => f.id === blueFaction) || FACTIONS[0];
    const red = FACTIONS.find(f => f.id === redFaction) || FACTIONS[Math.min(1, FACTIONS.length - 1)];
    const sourceMap = MAPS.find(m => m.id === mapId) || MAPS[0];
    this.config = {era: eraId, blueFaction: blue.id, redFaction: red.id, mapId: sourceMap.id, mode, scale, seed: (Number(seed) >>> 0) || 1, duration: 10800, captureTarget: 1800, balanceVersion: 2};
    this.map = clone(sourceMap);
    // Expand the chart itself, preserving coast geometry and real km/second units.
    // Fleets begin beyond surface sensors and must transit before a firing solution exists.
    const theatreScale = eraId === 'modern' ? 3.6 : 2.4;
    this.map.width = Math.round(this.map.width * theatreScale * 10) / 10;
    this.map.height = Math.round(this.map.height * theatreScale * 10) / 10;
    for (const point of [...Object.values(this.map.spawns), ...(this.map.objectives || [])]) {
      point.x *= theatreScale; point.y *= theatreScale;
    }
    for (const island of this.map.land || []) island.points = island.points.map(([x, y]) => [x * theatreScale, y * theatreScale]);
    const passage = distance(this.map.spawns.blue, this.map.spawns.red) / (24 * KNOT);
    this.config.duration = Math.ceil((mode.startsWith('port_') ? passage + 5400 : passage * .5 + 7200) / 300) * 300;
    this._seed = (Number(seed) >>> 0) || 1;
    this._nextId = 1;
    this._sensorClock = 0;
    this._aiClock = {blue: 0, red: 0};
    this._objectiveClock = 0;
    this._defenseClock = 0;
    this._accumulator = 0;
    this._salvoReservations = {};
    this.singleManualId = null;
    this._gridCache = null;
    this.state = {time: 0, ships: [], projectiles: [], effects: [], events: [], objectives: [], result: null, score: {blue: 0, red: 0}};
    for (const side of ['blue', 'red']) {
      const faction = side === 'blue' ? blue : red;
      const classes = createFleet(eraId, faction.id, side, scale);
      const spawn = this.map.spawns[side];
      const heading = angle(spawn, this.map.spawns[enemy(side)]);
      const reserved = [];
      classes.forEach((classId, index) => {
        const role = SHIP_CLASSES[eraId][classId].role;
        const row = Math.floor(index / 5), col = (index % 5) - 2;
        const forward = role === 'carrier' ? -9 : role === 'supply' ? -14 : role === 'submarine' ? 12 : 2 + row * 4.5;
        const lateral = role === 'carrier' ? (index % 2 ? 5 : -5) : role === 'submarine' ? (index % 2 ? 1 : -1) * (14 + row * 2) : col * 5.5;
        const offset = {x: spawn.x + Math.cos(heading) * forward - Math.sin(heading) * lateral, y: spawn.y + Math.sin(heading) * forward + Math.cos(heading) * lateral};
        const point = this._formationWaterSlot(offset, reserved, null, 3) || this._nearestWater(offset);
        reserved.push(point);
        const ship = this._addShip(classId, side, faction, point, heading, index);
        for (const mount of ship.mounts) if (WEAPONS[mount.weaponId].engagementCycle) mount.nextSalvoAt = 45 + index * 13 % 90;
      });
    }
    this.state.objectives = (this.map.objectives || []).map((o, i) => ({...clone(o), id: o.id || `objective-${i}`, owner: o.owner || 'neutral', initialOwner: o.owner || 'neutral', hp: o.kind === 'port' ? 5200 : 2200, maxHp: o.kind === 'port' ? 5200 : 2200, capture: 0}));
    this._prepareMode();
    this._updateSensors();
    this._event('Fleet deployed. Distances use kilometres; ship speeds use real knots.');
  }

  rng() {
    let x = this._seed;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this._seed = x >>> 0;
    return this._seed / 4294967296;
  }

  _id(prefix) { return `${prefix}-${this._nextId++}`; }
  getShip(id) { return this.state.ships.find(s => s.id === id); }
  _entity(id) { return typeof id === 'string' ? this.getShip(id) || this.state.projectiles.find(p => p.id === id && p.status === 'active' && !p.retired && p.hp > 0) || this.state.objectives.find(o => o.id === id && o.hp > 0) : undefined; }
  _faction(side) { return FACTIONS.find(f => f.id === this.config[`${side}Faction`]) || FACTIONS[0]; }

  _addShip(classId, side, faction, p, heading, index = 0) {
    const c = SHIP_CLASSES[this.config.era][classId];
    if (!c) throw new Error(`Unknown ship class: ${this.config.era}/${classId}`);
    const tech = faction.tech || 1;
    const ship = {
      id: this._id(side), side, classId, name: `${c.shortName || c.name} ${String(index + 1).padStart(2, '0')}`, classData: clone(c), tech,
      x: p.x, y: p.y, heading, speed: 0, maxSpeed: c.speed * KNOT, hp: c.hp, maxHp: c.hp,
      armor: c.armor, radar: c.radar * tech, sonar: c.sonar * tech, visual: c.visual, signature: c.signature,
      status: 'active', sinkTimer: 0, manual: false, stance: 'balanced', formation: 'line', order: {type: 'auto', explicit: false},
      mounts: c.weapons.map(m => ({...m, capacity: m.capacity ?? m.ammo, ammo: m.ammo, cooldown: 0, nextSalvoAt: 0, salvoRemaining: 0, salvoTargetId: null, fireControlTargetId: null, solutionReadyAt: 0, airborne: 0, lost: 0, rearming: [], sortieStores: WEAPONS[m.weaponId]?.kind === 'aircraft' ? m.ammo * 2 : 0})),
      path: [], pathTarget: null, navigation: null, localContacts: [], detectedBy: {blue: side === 'blue', red: side === 'red'},
      lastContact: {}, commRange: 120 * tech, emcon: false, convoy: false, evacuated: false, lastDamageTime: -999, tactics: null
    };
    this.state.ships.push(ship);
    return ship;
  }

  _prepareMode() {
    const mode = this.config.mode;
    if (!['encounter', 'port_defense', 'port_assault', 'island_control', 'convoy'].includes(mode)) this.config.mode = 'encounter';
    for (const side of ['blue', 'red']) {
      if (!this.state.objectives.some(o => o.kind === 'port' && o.owner === side)) {
        const p = this._nearestWater(this.map.spawns[side]);
        this.state.objectives.push({id: `port-${side}`, ...p, name: side === 'blue' ? 'Blue Home Port' : 'Red Home Port', kind: 'port', owner: side, initialOwner: side, hp: 5200, maxHp: 5200, capture: 0});
      }
    }
    if (!this.state.objectives.some(o => o.kind === 'island')) {
      const p = this._nearestWater({x: this.map.width / 2, y: this.map.height / 2});
      this.state.objectives.push({id: 'central-control', ...p, name: 'Central Control Zone', kind: 'island', owner: 'neutral', initialOwner: 'neutral', hp: 2200, maxHp: 2200, capture: 0});
    }
    if (mode === 'convoy') {
      const supply = Object.values(SHIP_CLASSES[this.config.era]).find(c => c.role === 'supply');
      let convoys = this.state.ships.filter(s => s.side === 'blue' && roleIs(s, 'supply'));
      if (supply) while (convoys.length < 3) {
        const base = this.map.spawns.blue;
        convoys.push(this._addShip(supply.id, 'blue', this._faction('blue'), this._nearestWater({x: base.x, y: base.y + 5 + convoys.length * 3}), angle(base, this.map.spawns.red), this.state.ships.length));
      }
      if (!convoys.length) convoys = this.state.ships.filter(s => s.side === 'blue').slice(0, 2);
      this.convoyIds = convoys.map(s => s.id);
      this.convoyGoal = this._nearestWater({x: this.map.spawns.red.x, y: clamp(this.map.spawns.red.y + this.map.height * .3, 8, this.map.height - 8)});
      for (const s of convoys) { s.convoy = true; s.order = {type: 'move', ...this.convoyGoal, explicit: false}; }
      this.state.objectives.push({id: 'convoy-exit', ...this.convoyGoal, name: 'Convoy Extraction Zone', kind: 'exit', owner: 'blue', initialOwner: 'blue', hp: 1, maxHp: 1, capture: 0});
      this.config.duration = Math.ceil(Math.max(10800, distance(this.map.spawns.blue, this.convoyGoal) / Math.max(.003, Math.min(...convoys.map(s => s.maxSpeed))) * 1.8 + 3600) / 300) * 300;
    }
  }

  setManualShip(id = null) {
    const chosen = id ? this.getShip(id) : null;
    this.singleManualId = chosen && chosen.side === 'blue' && alive(chosen) ? id : null;
    for (const s of this.state.ships) {
      const wasManual = s.manual;
      s.manual = s.id === this.singleManualId;
      if (wasManual && !s.manual) {
        if (s.order.temporaryManualHold) {
          s.order = s.orderBeforeManual ? clone(s.orderBeforeManual) : {type: 'auto', explicit: false};
          s.path = []; s.navigation = null; s.pathTarget = null;
        }
        s.orderBeforeManual = null;
      }
      if (s.manual && !wasManual && !s.order.explicit) {
        s.orderBeforeManual = clone(s.order);
        s.order = {type: 'hold', explicit: true, temporaryManualHold: true};
        s.path = []; s.navigation = null; s.pathTarget = null;
      }
    }
  }

  commandMove(ids, point, formation = 'line') {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return {ok: false, reason: 'Invalid coordinates'};
    const ships = this._orderedShips(ids);
    if (!ships.length) return {ok: false, reason: 'Select an operational friendly ship'};
    this.setFormation(ids, formation);
    const center = ships.reduce((p, s) => ({x: p.x + s.x / ships.length, y: p.y + s.y / ships.length}), {x: 0, y: 0});
    const heading = angle(center, point);
    const desired = this._fitFormation(ships.length, point, formation, heading), reserved = [], plans = [];
    for (let i = 0; i < ships.length; i++) {
      let target = this._formationWaterSlot(desired[i], reserved);
      if (!target) return {ok: false, reason: 'Insufficient navigable water for this formation'};
      let path = this._route(ships[i], target);
      if (!path.length) {
        target = this._formationWaterSlot(desired[i], reserved, candidate => {
          const route = this._route(ships[i], candidate);
          if (route.length) { path = route; return true; }
          return false;
        });
      }
      if (!target || !path.length) return {ok: false, reason: 'No navigable route for the complete formation'};
      reserved.push(target); plans.push({ship: ships[i], target, path});
    }
    for (const {ship, target, path} of plans) {
      ship.order = {type: 'move', ...target, explicit: true}; ship.path = path; ship.pathTarget = target; ship.navigation = null;
      ship.routeFailed = false; ship.routeAttemptTime = this.state.time;
    }
    return {ok: true, reason: ''};
  }

  commandAttack(ids, targetId) {
    const target = this._entity(targetId);
    if (!target) return {ok: false, reason: 'Target unavailable'};
    const ships = this._orderedShips(ids);
    if (!ships.length) return {ok: false, reason: 'Select an operational friendly ship'};
    const reason = this._targetCheck(ships[0], target);
    if (reason) return {ok: false, reason};
    for (const s of ships) { s.order = {type: 'attack', targetId, explicit: true}; s.path = []; s.pathTarget = null; s.navigation = null; }
    return {ok: true, reason: ''};
  }

  _orderedShips(ids) { return [...new Set(ids || [])].map(id => this.getShip(id)).filter(s => s && alive(s) && s.side === 'blue'); }
  setFormation(ids, formation) {
    const ships = this._orderedShips(ids), pace = Math.min(...ships.map(s => s.maxSpeed));
    for (const s of ships) { s.formation = ['line', 'column', 'wedge', 'screen'].includes(formation) ? formation : 'line'; s.formationSpeed = ships.length > 1 ? pace : null; }
  }
  setStance(ids, stance) { for (const s of this._orderedShips(ids)) s.stance = ['balanced', 'aggressive', 'conserve'].includes(stance) ? stance : 'balanced'; }
  setEmcon(ids, enabled) { for (const s of this._orderedShips(ids)) s.emcon = Boolean(enabled); }
  stop(ids) { for (const s of this._orderedShips(ids)) { s.order = {type: 'hold', explicit: true}; s.path = []; s.pathTarget = null; s.navigation = null; } }

  _formationOffset(i, count, formation) {
    if (count === 1) return {x: 0, y: 0};
    if (formation === 'column') return {x: -(i - (count - 1) / 2) * 2.8, y: 0};
    if (formation === 'wedge') return {x: -Math.ceil(i / 2) * 2.3, y: i === 0 ? 0 : (i % 2 ? -1 : 1) * Math.ceil(i / 2) * 2.3};
    if (formation === 'screen') return {x: Math.cos(i / count * TAU) * 5, y: Math.sin(i / count * TAU) * 5};
    return {x: 0, y: (i - (count - 1) / 2) * 2.8};
  }

  _fitFormation(count, point, formation, heading) {
    const cosine = Math.cos(heading), sine = Math.sin(heading);
    const offsets = Array.from({length: count}, (_, i) => {
      const p = this._formationOffset(i, count, formation);
      return {x: p.x * cosine - p.y * sine, y: p.x * sine + p.y * cosine};
    });
    const minX = Math.min(...offsets.map(p => p.x)), maxX = Math.max(...offsets.map(p => p.x));
    const minY = Math.min(...offsets.map(p => p.y)), maxY = Math.max(...offsets.map(p => p.y));
    const margin = .8;
    const scale = Math.min(1, (this.map.width - margin * 2) / Math.max(.001, maxX - minX), (this.map.height - margin * 2) / Math.max(.001, maxY - minY));
    // Fit and translate the entire envelope; clipping individual slots would stack ships.
    const anchor = {x: clamp(point.x, margin - minX * scale, this.map.width - margin - maxX * scale), y: clamp(point.y, margin - minY * scale, this.map.height - margin - maxY * scale)};
    return offsets.map(p => ({x: anchor.x + p.x * scale, y: anchor.y + p.y * scale}));
  }

  _formationWaterSlot(desired, reserved, reachable = null, separation = 1) {
    let routeAttempts = 0;
    const usable = p => p.x >= .6 && p.y >= .6 && p.x <= this.map.width - .6 && p.y <= this.map.height - .6 && reserved.every(other => distance(other, p) >= separation - 1e-8) && this._segmentClear(p, p, .25) && (!reachable || ++routeAttempts <= 96 && reachable(p));
    if (usable(desired)) return desired;
    const center = this._nearestWater(desired);
    if (usable(center)) return center;
    const extent = Math.hypot(this.map.width, this.map.height);
    for (let radius = .55; radius <= extent; radius += .55) {
      const samples = Math.max(16, Math.min(80, Math.ceil(TAU * radius / .55)));
      for (let i = 0; i < samples; i++) {
        if (reachable && routeAttempts >= 96) return null;
        const candidate = {x: center.x + Math.cos(i / samples * TAU) * radius, y: center.y + Math.sin(i / samples * TAU) * radius};
        if (usable(candidate)) return candidate;
      }
    }
    return null;
  }

  getVisibleShips(side = 'blue') { return this.state.ships.filter(s => s.status !== 'sunk' && (s.side === side || s.detectedBy[side])); }
  getThreats(side = 'blue') { return this.state.projectiles.filter(p => p.status === 'active' && !p.retired && p.hp > 0 && p.side !== side && isThreat(p) && this._projectileVisible(p, side)); }
  _projectileVisible(p, side) { return this.state.ships.some(s => s.side === side && alive(s) && distance(s, p) < (p.kind === 'torpedo' ? Math.max(1.5, s.sonar * .5) : Math.max(s.visual, s.emcon ? s.visual : s.radar * .65))); }
  _event(text, side, visibility = 'public', subject = null) {
    // The event log is player-facing; hostile logistics and unseen losses stay private.
    if (side === 'red' && (visibility === 'private' || visibility === 'observed' && !subject?.detectedBy?.blue)) return;
    this.state.events.push({time: this.state.time, text, ...(side ? {side} : {})});
    if (this.state.events.length > 100) this.state.events.splice(0, this.state.events.length - 100);
  }
  _effect(kind, p, radius = .7, ttl = 3) { this.state.effects.push({id: this._id('fx'), kind, x: p.x, y: p.y, radius, ttl, maxTtl: ttl}); }

  _onLand(point, padding = 0) {
    if (point.x < padding || point.y < padding || point.x > this.map.width - padding || point.y > this.map.height - padding) return true;
    for (const shape of this.map.land || []) {
      const pts = shape.points || [];
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > point.y) !== (yj > point.y) && point.x < (xj - xi) * (point.y - yi) / ((yj - yi) || 1e-9) + xi) inside = !inside;
      }
      if (inside) return true;
      if (padding > 0 && pts.some(([x, y]) => Math.hypot(point.x - x, point.y - y) < padding)) return true;
    }
    return false;
  }

  _nearestWater(point) {
    const p = {x: clamp(point.x, .6, this.map.width - .6), y: clamp(point.y, .6, this.map.height - .6)};
    if (this._segmentClear(p, p, .25)) return p;
    for (let r = .6; r < Math.max(this.map.width, this.map.height); r += .8) for (let i = 0; i < 24; i++) {
      const q = {x: p.x + Math.cos(i * TAU / 24) * r, y: p.y + Math.sin(i * TAU / 24) * r};
      if (this._segmentClear(q, q, .25)) return q;
    }
    return {x: this.map.spawns.blue.x, y: this.map.spawns.blue.y};
  }

  _segmentClear(a, b, margin = .16) {
    if (this._onLand(a) || this._onLand(b)) return false;
    if ([a, b].some(p => p.x < margin || p.y < margin || p.x > this.map.width - margin || p.y > this.map.height - margin)) return false;
    const cross = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    const pointSegmentSq = (p, q, r) => {
      const dx = r.x - q.x, dy = r.y - q.y, lengthSq = dx * dx + dy * dy;
      const t = lengthSq ? clamp(((p.x - q.x) * dx + (p.y - q.y) * dy) / lengthSq, 0, 1) : 0;
      return (p.x - q.x - t * dx) ** 2 + (p.y - q.y - t * dy) ** 2;
    };
    for (const shape of this.map.land || []) {
      const points = shape.points;
      for (let i = 0; i < points.length; i++) {
        const c = {x: points[i][0], y: points[i][1]}, next = points[(i + 1) % points.length], d = {x: next[0], y: next[1]};
        const overlap = Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x)) <= Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x)) + 1e-9 && Math.max(Math.min(a.y, b.y), Math.min(c.y, d.y)) <= Math.min(Math.max(a.y, b.y), Math.max(c.y, d.y)) + 1e-9;
        if (overlap && cross(a, b, c) * cross(a, b, d) <= 0 && cross(c, d, a) * cross(c, d, b) <= 0) return false;
        if (margin > 0 && Math.min(pointSegmentSq(a, c, d), pointSegmentSq(b, c, d), pointSegmentSq(c, a, b), pointSegmentSq(d, a, b)) < margin * margin) return false;
      }
    }
    return true;
  }
  /** A* over a shared water grid, followed by visibility-based waypoint smoothing. */
  _route(from, destination) {
    const goal = this._nearestWater(destination);
    if (this._segmentClear(from, goal)) return [goal];
    if (!this._gridCache) {
      const cell = clamp(Math.min(this.map.width, this.map.height) / 65, .8, 3);
      const width = Math.ceil(this.map.width / cell), height = Math.ceil(this.map.height / cell);
      const blocked = new Uint8Array(width * height);
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) blocked[y * width + x] = this._onLand({x: (x + .5) * cell, y: (y + .5) * cell}, .2) ? 1 : 0;
      this._gridCache = {cell, width, height, blocked};
    }
    const {cell, width, height, blocked} = this._gridCache;
    const pos = id => ({x: (id % width + .5) * cell, y: (Math.floor(id / width) + .5) * cell});
    const near = p => {
      const cx = clamp(Math.floor(p.x / cell), 0, width - 1), cy = clamp(Math.floor(p.y / cell), 0, height - 1);
      for (let r = 0; r < 10; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx, y = cy + dy, id = y * width + x;
        if (x >= 0 && x < width && y >= 0 && y < height && !blocked[id] && this._segmentClear(p, pos(id))) return id;
      }
      return -1;
    };
    const start = near(from), end = near(goal);
    if (start < 0 || end < 0) return [];
    const costs = new Float64Array(blocked.length).fill(Infinity), parents = new Int32Array(blocked.length).fill(-1), closed = new Uint8Array(blocked.length);
    const heap = [];
    const push = item => { heap.push(item); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][1] <= item[1]) break; heap[i] = heap[p]; i = p; } heap[i] = item; };
    const pop = () => { const top = heap[0], tail = heap.pop(); if (heap.length) { let i = 0; while (i * 2 + 1 < heap.length) { let k = i * 2 + 1; if (k + 1 < heap.length && heap[k + 1][1] < heap[k][1]) k++; if (heap[k][1] >= tail[1]) break; heap[i] = heap[k]; i = k; } heap[i] = tail; } return top; };
    costs[start] = 0; push([start, distance(pos(start), pos(end))]);
    while (heap.length) {
      const [id] = pop();
      if (closed[id]) continue;
      if (id === end) break;
      closed[id] = 1;
      const x = id % width, y = Math.floor(id / width);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy, nid = ny * width + nx;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height || blocked[nid] || closed[nid]) continue;
        if (dx && dy && (blocked[y * width + nx] || blocked[ny * width + x])) continue;
        const g = costs[id] + Math.hypot(dx, dy) * cell;
        if (g >= costs[nid] || !this._segmentClear(pos(id), pos(nid))) continue;
        costs[nid] = g; parents[nid] = id; push([nid, g + distance(pos(nid), pos(end))]);
      }
    }
    if (end !== start && parents[end] < 0) return [];
    const nodes = [goal];
    for (let id = end; id >= 0; id = parents[id]) { nodes.push(pos(id)); if (id === start) break; }
    nodes.reverse();
    const path = []; let cursor = from, i = 0;
    while (i < nodes.length) {
      let furthest = i;
      for (let j = nodes.length - 1; j >= i; j--) if (this._segmentClear(cursor, nodes[j])) { furthest = j; break; }
      path.push(nodes[furthest]); cursor = nodes[furthest]; i = furthest + 1;
    }
    return path;
  }

  _navigate(s, destination) {
    if (!destination) return;
    const target = this._nearestWater(destination);
    if (s.pathTarget && distance(s.pathTarget, target) < 2 && (s.path.length || s.routeFailed && this.state.time - (s.routeAttemptTime || 0) < 8)) return;
    s.path = this._route(s, target); s.pathTarget = target;
    s.routeFailed = !s.path.length; s.routeAttemptTime = this.state.time;
  }

  _moveShip(s, dt) {
    let destination = null;
    if (s.order.type === 'move') destination = s.order;
    else if (!s.manual && s.navigation) destination = s.navigation;
    if (destination) this._navigate(s, destination);
    else s.path = [];
    while (s.path.length && distance(s, s.path[0]) < .22) s.path.shift();
    let wantedSpeed = 0;
    if (s.path.length) {
      const waypoint = s.path[0];
      let wantedHeading = angle(s, waypoint);
      let avoidance = 0;
      for (const other of this.state.ships) {
        if (other.id === s.id || other.status !== 'active') continue;
        const d = distance(s, other);
        if (d > .8 || d < .00001) continue;
        const relative = wrap(angle(s, other) - s.heading);
        if (Math.abs(relative) < Math.PI * .6) avoidance += (relative >= 0 ? -1 : 1) * (.8 - d) * 1.7;
      }
      wantedHeading += clamp(avoidance, -1.1, 1.1);
      const turn = s.classData.turnRate * Math.PI / 180 * dt;
      s.heading = wrap(s.heading + clamp(wrap(wantedHeading - s.heading), -turn, turn));
      const error = Math.abs(wrap(wantedHeading - s.heading));
      wantedSpeed = s.maxSpeed * (error > 1.5 ? .2 : error > .65 ? .55 : 1) * (.55 + .45 * s.hp / s.maxHp);
      if (s.formationSpeed) wantedSpeed = Math.min(wantedSpeed, s.formationSpeed);
      const probe = {x: s.x + Math.cos(s.heading) * Math.max(.5, wantedSpeed * 20), y: s.y + Math.sin(s.heading) * Math.max(.5, wantedSpeed * 20)};
      if (!this._segmentClear(s, probe, .1)) {
        wantedSpeed = 0;
        if (!this._segmentClear(s, waypoint, .16) && this.state.time - (s.routeAttemptTime || 0) > 5) s.pathTarget = null;
        // A slow pivot is permitted even in manual mode as collision avoidance.
        s.heading = wrap(s.heading + clamp(wrap(angle(s, waypoint) - s.heading), -turn, turn));
      }
    } else if (s.order.type === 'move' && destination && distance(s, destination) < .5) {
      s.order = {type: 'hold', explicit: Boolean(s.order.explicit)}; s.pathTarget = null;
    }
    const accel = s.maxSpeed / 24;
    s.speed += clamp(wantedSpeed - s.speed, -accel * dt * 2, accel * dt);
    if (s.speed < 1e-7) s.speed = 0;
    const next = {x: s.x + Math.cos(s.heading) * s.speed * dt, y: s.y + Math.sin(s.heading) * s.speed * dt};
    if (this._segmentClear(s, next, .08)) { s.x = next.x; s.y = next.y; }
    else { s.speed = 0; s.pathTarget = null; }
  }

  _updateSensors() {
    const ships = this.state.ships.filter(alive);
    for (const s of this.state.ships) s.detectedBy = {blue: s.side === 'blue', red: s.side === 'red'};
    for (const observer of ships) {
      const contacts = [];
      for (const target of ships) {
        if (observer.side === target.side) continue;
        const d = distance(observer, target);
        const submarine = roleIs(target, 'submarine');
        const firing = this.state.time - (target.lastFired ?? -999) < 18;
        let range = submarine ? observer.sonar * (.6 + target.speed / Math.max(target.maxSpeed, .001) * .55) : Math.max(observer.visual, observer.emcon ? 0 : Math.min(observer.radar, this.config.era === 'modern' ? 40 : 26) * Math.sqrt(Math.max(.15, target.signature)) * (target.emcon ? .82 : 1));
        if (firing) range = Math.max(range, Math.min(observer.visual * 1.25, this.config.era === 'modern' ? 40 : 30));
        const lineClear = d < 1.5 || this._segmentClear(observer, target, 0);
        if (d <= range && lineClear) { contacts.push(target.id); observer.lastContact[target.id] = this.state.time; }
      }
      observer.localContacts = contacts;
    }
    // Airborne patrol/strike aircraft relay surface tracks through their carrier.
    for (const aircraft of this.state.projectiles.filter(p => p.kind === 'aircraft' && p.status === 'active')) {
      const carrier = this.getShip(aircraft.carrierId);
      if (!carrier || !alive(carrier)) continue;
      const radius = this.config.era === 'modern' ? 32 : 16;
      for (const target of ships) if (target.side !== aircraft.side && !roleIs(target, 'submarine') && distance(aircraft, target) < radius && !carrier.localContacts.includes(target.id)) carrier.localContacts.push(target.id);
    }
    // Connected communication components share tracks, without global omniscience.
    for (const side of ['blue', 'red']) {
      const friendly = ships.filter(s => s.side === side), visited = new Set();
      for (const seed of friendly) {
        if (visited.has(seed.id)) continue;
        const component = [], queue = [seed], tracks = new Set(); visited.add(seed.id);
        while (queue.length) {
          const s = queue.pop(); component.push(s); s.localContacts.forEach(id => tracks.add(id));
          for (const mate of friendly) if (!visited.has(mate.id) && distance(s, mate) <= Math.min(s.commRange, mate.commRange) * (s.emcon || mate.emcon ? .65 : 1)) { visited.add(mate.id); queue.push(mate); }
        }
        for (const s of component) { s.localContacts = [...tracks]; for (const id of tracks) { const contact = this.getShip(id); if (contact) contact.detectedBy[side] = true; } }
      }
    }
    for (const s of this.state.ships) if (s.status === 'sinking') {
      for (const side of ['blue', 'red']) if (ships.some(observer => observer.side === side && distance(observer, s) < observer.visual * 1.5)) s.detectedBy[side] = true;
    }
  }

  _targetCategory(target) {
    if (target.classData) return roleIs(target, 'submarine') ? 'submarine' : 'surface';
    if (target.weaponId) return target.kind === 'aircraft' ? 'air' : 'projectile';
    return 'objective';
  }

  _targetCheck(ship, target) {
    // Resolve current entities, never client coordinates or stale copies of contacts.
    if (!target || this._entity(target.id) !== target || !Number.isFinite(target.x) || !Number.isFinite(target.y)) return 'Select an available target';
    if ((target.side && target.side === ship.side) || (!target.side && target.owner === ship.side)) return 'Friendly targets cannot be attacked';
    if (target.classData && (!alive(target) || !target.detectedBy?.[ship.side])) return 'Target lost or undetected';
    if (target.weaponId && !this._projectileVisible(target, ship.side)) return 'Incoming target outside sensor coverage';
    if (!target.classData && !target.weaponId && (target.hp <= 0 || target.kind === 'exit')) return 'Target is not an operational combat objective';
    return '';
  }

  _weaponCheck(ship, mount, target) {
    const weapon = WEAPONS[mount?.weaponId];
    if (!ship || !alive(ship)) return 'Ship is no longer operational';
    if (!mount || !weapon) return 'This weapon is not fitted to the ship';
    if (weapon.era && weapon.era !== 'all' && weapon.era !== this.config.era) return 'Weapon does not belong to this era';
    if (mount.ammo <= 0) return 'Ammunition depleted';
    if (mount.cooldown > .001) return `Weapon reloading (${Math.ceil(mount.cooldown)} s)`;
    const targetReason = this._targetCheck(ship, target);
    if (targetReason) return targetReason;
    const category = this._targetCategory(target);
    if (!weapon.targets.includes(category)) return 'Weapon incompatible with this target';
    if (target.kind === 'torpedo' && ['sam', 'aa', 'ciws', 'aircraft'].includes(weapon.kind)) return 'This weapon cannot intercept underwater torpedoes';
    const d = distance(ship, target);
    if (d > weapon.range) return `Beyond weapon range (${weapon.range} km)`;
    if (d < (weapon.minRange || 0)) return 'Target inside minimum weapon range';
    if (['torpedo', 'depthcharge'].includes(weapon.kind) && !this._segmentClear(ship, target, 0)) return 'Land blocks the underwater firing path';
    return '';
  }

  fireWeapon(shipId, weaponId, targetOrPoint) {
    if (this.state.result) return {ok: false, reason: 'Battle has ended'};
    const ship = this.getShip(shipId), mount = ship?.mounts.find(m => m.weaponId === weaponId);
    const targetId = typeof targetOrPoint === 'string' ? targetOrPoint : targetOrPoint?.id;
    const target = this._entity(targetId);
    const reason = this._weaponCheck(ship, mount, target);
    if (reason) return {ok: false, reason};
    const weapon = WEAPONS[weaponId];
    mount.ammo--; mount.cooldown = weapon.cooldown; ship.lastFired = this.state.time;
    if (weapon.kind === 'aircraft') mount.airborne++;
    const travel = distance(ship, target) / Math.max(.001, weapon.speed);
    let lead = target.classData && ['gun', 'aa', 'ciws', 'depthcharge'].includes(weapon.kind) ? Math.min(travel, 100) : 0;
    if (target.classData && weapon.kind === 'torpedo' && this.config.era !== 'modern') {
      // WWII torpedoes receive a launch-time intercept solution and then run straight.
      const vx = Math.cos(target.heading) * target.speed, vy = Math.sin(target.heading) * target.speed;
      const rx = target.x - ship.x, ry = target.y - ship.y;
      const a = vx * vx + vy * vy - weapon.speed * weapon.speed, b = 2 * (rx * vx + ry * vy), c = rx * rx + ry * ry;
      const discriminant = b * b - 4 * a * c;
      const roots = Math.abs(a) < 1e-9 ? [-c / b] : discriminant >= 0 ? [(-b + Math.sqrt(discriminant)) / (2 * a), (-b - Math.sqrt(discriminant)) / (2 * a)] : [];
      const positive = roots.filter(t => Number.isFinite(t) && t > 0);
      lead = Math.min(positive.length ? Math.min(...positive) : travel, weapon.range / weapon.speed);
    }
    const aim = {x: target.x + Math.cos(target.heading || 0) * (target.speed || 0) * lead, y: target.y + Math.sin(target.heading || 0) * (target.speed || 0) * lead};
    const projectile = {
      id: this._id('p'), side: ship.side, kind: weapon.kind, weaponId, sourceId: ship.id,
      x: ship.x, y: ship.y, heading: angle(ship, aim), speed: weapon.speed, targetId: target.id,
      aim, remaining: weapon.kind === 'aircraft' ? weapon.range * 2.5 : weapon.range,
      ttl: weapon.kind === 'aircraft' ? weapon.range * 2.5 / Math.max(.01, weapon.speed) + 180 : weapon.range * 1.2 / Math.max(.001, weapon.speed) + 10,
      status: 'active', damage: weapon.damage, accuracy: clamp(weapon.accuracy * (.78 + ship.tech * .22), .05, .98),
      hp: weapon.kind === 'aircraft' ? 70 * ship.tech : weapon.kind === 'missile' ? 30 : 5,
      maxHp: weapon.kind === 'aircraft' ? 70 * ship.tech : weapon.kind === 'missile' ? 30 : 5,
      homing: ['missile', 'sam', 'aircraft'].includes(weapon.kind) || (weapon.kind === 'torpedo' && this.config.era === 'modern'),
      phase: weapon.kind === 'aircraft' ? 'outbound' : null, carrierId: weapon.kind === 'aircraft' ? ship.id : null,
      launchTime: this.state.time, travelled: 0, retired: false
    };
    this.state.projectiles.push(projectile);
    this._effect('launch', ship, weapon.kind === 'aircraft' ? .5 : .35, 1.5);
    if (weapon.kind === 'aircraft') this._event(`${ship.name} launched ${weapon.name}; ${mount.ammo} aircraft ready`, ship.side, 'private');
    return {ok: true, reason: '', projectileId: projectile.id};
  }

  _damage(target, rawDamage, weapon, sourceSide) {
    if (target.weaponId) {
      target.hp -= rawDamage;
      if (target.hp <= 0) { this._effect('intercept', target, .7, 2); this._retireProjectile(target, true); }
      return;
    }
    if (target.classData && !alive(target)) return;
    const penetration = ['torpedo', 'depthcharge'].includes(weapon.kind) ? .15 : ['missile', 'aircraft'].includes(weapon.kind) ? .4 : .85;
    const mitigation = target.classData ? clamp((target.armor || 0) * penetration, 0, .8) : .1;
    const damage = Math.max(1, rawDamage * (1 - mitigation));
    target.hp = Math.max(0, target.hp - damage);
    if (target.classData) {
      target.lastDamageTime = this.state.time;
      if (target.hp === 0) this._sink(target, sourceSide);
    } else if (target.hp === 0) this._event(`${target.name} destroyed`, sourceSide);
  }

  _sink(ship, sourceSide) {
    if (ship.status !== 'active') return;
    ship.status = 'sinking'; ship.hp = 0; ship.speed = 0; ship.path = []; ship.navigation = null;
    ship.sinkDuration = clamp(24 + (ship.classData.tonnage || 2000) / 1600, 24, 65); ship.sinkTimer = ship.sinkDuration;
    ship.order = {type: 'disabled', explicit: false};
    if (ship.manual) this.setManualShip(null);
    this._effect('explosion', ship, 1.6, 8);
    this._event(`${ship.side === 'blue' ? 'Friendly' : 'Enemy'} ${ship.name} is critically damaged and sinking`, ship.side, 'observed', ship);
    if (sourceSide && sourceSide !== ship.side && this.config.mode !== 'island_control') this.state.score[sourceSide] += VALUE[ship.classData.role] || 2;
  }

  _retireProjectile(p, destroyed = false) {
    if (p.retired) return;
    p.retired = true; p.status = 'expired';
    if (isAir(p)) {
      const carrier = this.getShip(p.carrierId), mount = carrier?.mounts.find(m => m.weaponId === p.weaponId);
      if (mount) {
        mount.airborne = Math.max(0, mount.airborne - 1);
        if (destroyed) { mount.lost++; this._event(`${carrier.name} lost one aircraft`, carrier.side, 'private'); }
      }
    }
  }

  _hit(p, target) {
    const weapon = WEAPONS[p.weaponId];
    let probability = p.accuracy;
    // Long-range shellfire needs ranging corrections; maximum range is not maximum accuracy.
    if (p.kind === 'gun') probability *= clamp(1 - .65 * (p.travelled / Math.max(1, weapon.range)) ** 2, .25, 1);
    if (target?.classData) {
      probability *= 1 - .1 * target.speed / Math.max(target.maxSpeed, .001);
      if (['missile', 'aircraft'].includes(p.kind) && target.tech > 1 && !target.emcon) probability *= 1 - (target.tech - 1) * .28;
    }
    if (target && this.rng() < probability) {
      this._damage(target, p.damage * (.85 + this.rng() * .3), weapon, p.side);
      this._effect('impact', target, isAir(p) ? 1.2 : .6, 3);
    } else this._effect('splash', p, .5, 2);
  }

  _canTrack(p, target) {
    if (!target.classData && !target.weaponId) return true; // Fixed, charted installations.
    let seeker = p.kind === 'torpedo' ? 6 : p.kind === 'aircraft' ? (this.config.era === 'modern' ? 32 : 16) : p.kind === 'sam' ? 12 : 24;
    if (target.classData && roleIs(target, 'submarine')) seeker = Math.min(seeker, 6);
    if (distance(p, target) <= seeker && (p.kind !== 'torpedo' || this._segmentClear(p, target, 0))) return true;
    if (p.kind === 'torpedo') return false;
    const source = this.getShip(p.sourceId);
    if (!source || !alive(source) || distance(source, p) > source.commRange * 1.5) return false;
    return target.classData ? source.localContacts.includes(target.id) : this._projectileVisible(target, p.side);
  }

  _stepAircraft(p, dt) {
    let target = this._entity(p.targetId);
    if (p.phase === 'outbound' && (!target || (target.classData && !alive(target)) || target.status === 'expired')) {
      target = p.aim; // Search the last known position instead of reading hidden loss state.
    }
    if (p.phase === 'return') {
      const carrier = this.getShip(p.carrierId);
      if (!carrier || !alive(carrier)) {
        const alternate = this.state.ships.find(s => s.side === p.side && alive(s) && roleIs(s, 'carrier') && s.mounts.some(m => m.weaponId === p.weaponId && m.ammo + m.airborne + m.rearming.length + (m.parked || 0) < m.capacity));
        if (alternate) {
          const old = carrier?.mounts.find(m => m.weaponId === p.weaponId);
          if (old) old.airborne = Math.max(0, old.airborne - 1);
          alternate.mounts.find(m => m.weaponId === p.weaponId).airborne++; p.carrierId = alternate.id; target = alternate;
        } else { p.ttl = Math.min(p.ttl, 80); target = p.aim; }
      } else target = carrier;
      if (target?.classData && target.side === p.side && distance(p, target) < .65) {
        const mount = target.mounts.find(m => m.weaponId === p.weaponId);
        this._retireProjectile(p);
        if (mount.sortieStores > 0) { mount.sortieStores--; mount.rearming.push(this.config.era === 'modern' ? 90 : 120); }
        else mount.parked = (mount.parked || 0) + 1;
        this._event(`${target.name} recovered an aircraft${mount.sortieStores > 0 ? '; rearming' : '; aviation stores depleted'}`, p.side, 'private');
        return;
      }
    }
    if (target) {
      const tracked = p.phase === 'return' || !target.id || this._canTrack(p, target);
      if (p.phase === 'outbound' && tracked) p.aim = {x: target.x, y: target.y};
      const steering = tracked ? target : p.aim;
      const desired = angle(p, steering);
      p.heading = wrap(p.heading + clamp(wrap(desired - p.heading), -.14 * dt, .14 * dt));
      if (p.phase === 'outbound' && distance(p, steering) < .85 + p.speed * dt) {
        if (tracked && target.id) this._hit(p, target); else this._effect('splash', steering, .8, 3);
        p.phase = 'return';
      }
    }
    p.x += Math.cos(p.heading) * p.speed * dt; p.y += Math.sin(p.heading) * p.speed * dt;
    p.remaining -= p.speed * dt; p.ttl -= dt; p.travelled += p.speed * dt;
    if (p.ttl <= 0 || p.remaining <= 0) this._retireProjectile(p, true);
  }

  _stepProjectile(p, dt) {
    if (p.status !== 'active') return;
    if (isAir(p)) { this._stepAircraft(p, dt); return; }
    const target = this._entity(p.targetId);
    if (p.homing && target && (!target.classData || alive(target)) && this._canTrack(p, target)) {
      const interceptTime = Math.min(12, distance(p, target) / Math.max(.02, p.speed));
      const lead = target.weaponId ? interceptTime * .6 : 0;
      p.aim = {x: target.x + Math.cos(target.heading || 0) * (target.speed || 0) * lead, y: target.y + Math.sin(target.heading || 0) * (target.speed || 0) * lead};
      const rate = p.kind === 'torpedo' ? .07 : 1.25;
      p.heading = wrap(p.heading + clamp(wrap(angle(p, p.aim) - p.heading), -rate * dt, rate * dt));
    }
    const previous = {x: p.x, y: p.y};
    p.x += Math.cos(p.heading) * p.speed * dt; p.y += Math.sin(p.heading) * p.speed * dt;
    p.remaining -= p.speed * dt; p.ttl -= dt; p.travelled += p.speed * dt;
    if (p.kind === 'torpedo' && !this._segmentClear(previous, p, 0)) { this._effect('splash', p); this._retireProjectile(p); return; }
    const hitRadius = target?.weaponId ? .16 : p.kind === 'depthcharge' ? .65 : .22;
    const closest = t => {
      const dx = p.x - previous.x, dy = p.y - previous.y, d2 = dx * dx + dy * dy;
      const fraction = d2 ? clamp(((t.x - previous.x) * dx + (t.y - previous.y) * dy) / d2, 0, 1) : 0;
      return Math.hypot(t.x - previous.x - dx * fraction, t.y - previous.y - dy * fraction);
    };
    if (target && (!target.classData || alive(target)) && closest(target) <= hitRadius) { this._hit(p, target); this._retireProjectile(p); return; }
    const passedAim = distance(p, p.aim) < Math.max(.2, p.speed * dt) || (p.travelled > distance(this.getShip(p.sourceId) || previous, p.aim) + 1 && !p.homing);
    const lostGuidance = p.homing && (!target || target.classData && !alive(target) || !this._canTrack(p, target));
    if (passedAim && (!p.homing || lostGuidance)) {
      if (target && (!target.classData || alive(target)) && closest(target) < .9) this._hit(p, target); else this._effect('splash', p, .4, 2);
      this._retireProjectile(p); return;
    }
    if (p.remaining <= 0 || p.ttl <= 0 || p.x < -15 || p.y < -15 || p.x > this.map.width + 15 || p.y > this.map.height + 15) this._retireProjectile(p);
  }

  _sideObjective(side) {
    const hostile = enemy(side), objectives = this.state.objectives;
    if (this.config.mode === 'convoy') {
      if (side === 'blue') return this.convoyGoal;
      const convoy = this.state.ships.filter(s => s.convoy && alive(s));
      return convoy.find(s => s.detectedBy.red) || {x: this.map.width * .58, y: this.map.height * .62};
    }
    if (this.config.mode === 'island_control') return objectives.filter(o => o.kind === 'island' && o.hp > 0).sort((a, b) => (a.owner === side ? 1 : 0) - (b.owner === side ? 1 : 0))[0];
    if (this.config.mode === 'port_defense' && side === 'blue') return objectives.find(o => o.kind === 'port' && o.initialOwner === 'blue');
    if (this.config.mode === 'port_assault' && side === 'red') return objectives.find(o => o.kind === 'port' && o.initialOwner === 'red');
    return objectives.find(o => o.kind === 'port' && o.initialOwner === hostile);
  }

  _defend(ship) {
    if (ship.manual) return;
    const threats = this.getThreats(ship.side).filter(p => p.kind !== 'torpedo' && distance(ship, p) < Math.max(ship.radar * .7, 15));
    const friendlies = this.state.ships.filter(s => s.side === ship.side && alive(s));
    const danger = p => {
      const victim = this.getShip(p.targetId);
      const nearest = friendlies.reduce((d, s) => Math.min(d, distance(s, p)), Infinity);
      return (victim?.id === ship.id ? 20 : victim && roleIs(victim, 'carrier', 'supply') ? 16 : 6) + 25 / Math.max(1, nearest) + (p.kind === 'missile' ? 12 : 2);
    };
    threats.sort((a, b) => danger(b) - danger(a));
    for (const mount of ship.mounts) {
      const w = WEAPONS[mount.weaponId];
      if (!w.targets.some(t => t === 'projectile' || t === 'air')) continue;
      this._invalidateFireControl(mount, w, threats);
      for (const threat of threats) {
        if (this._weaponCheck(ship, mount, threat)) continue;
        const d = distance(ship, threat);
        if (w.kind === 'sam' && d < 2.5 && ship.mounts.some(m => WEAPONS[m.weaponId].kind === 'ciws' && m.ammo > 0 && m.cooldown <= 0)) continue;
        const inbound = this.state.projectiles.filter(p => p.side === ship.side && p.targetId === threat.id && p.status === 'active' && p.kind !== 'aircraft');
        if (inbound.reduce((sum, p) => sum + p.damage * p.accuracy, 0) > threat.hp * 1.4) continue;
        if (threat.kind === 'aircraft' && threat.phase === 'return' && ship.stance === 'conserve' && d > 8) continue;
        if (w.kind === 'aircraft' && this.state.time < (mount.nextSalvoAt || 0)) continue;
        const fired = this.fireWeapon(ship.id, mount.weaponId, threat.id);
        if (fired.ok) { this._recordAutoShot(mount, w, threat); break; }
      }
    }
  }

  _targetPriority(ship, target) {
    const d = distance(ship, target);
    if (!target.classData) return this.config.mode.startsWith('port_') ? 20 / (1 + d / 45) : 2;
    const base = VALUE[target.classData.role] || 2;
    const vulnerability = 1 + .9 * (1 - target.hp / target.maxHp);
    const committed = this.state.projectiles.filter(p => p.side === ship.side && p.targetId === target.id && p.status === 'active').reduce((sum, p) => sum + p.damage * p.accuracy, 0);
    const saturation = ship.side === 'red' ? clamp(1 - committed / Math.max(1, target.hp) * .7, .05, 1) : 1;
    return base * vulnerability * saturation / (1 + d / 35) * (target.convoy && this.config.mode === 'convoy' ? 3 : 1);
  }

  _recordAutoShot(mount, weapon, target) {
    if (!weapon.engagementCycle) return;
    if (!(mount.salvoRemaining > 0)) {
      mount.salvoRemaining = Math.min(weapon.salvoSize || 1, mount.ammo + 1);
      mount.salvoTargetId = target.id;
    }
    mount.salvoRemaining--;
    if (mount.salvoRemaining <= 0) {
      // The launcher can physically fire faster. This is an AI assessment interval.
      mount.nextSalvoAt = this.state.time + weapon.engagementCycle;
      mount.salvoTargetId = null;
    }
  }

  _invalidateFireControl(mount, weapon, targets) {
    if (mount.fireControlTargetId && !targets.some(t => t.id === mount.fireControlTargetId)) {
      mount.fireControlTargetId = null; mount.solutionReadyAt = 0;
    }
    if (mount.salvoRemaining > 0 && !targets.some(t => t.id === mount.salvoTargetId)) {
      mount.salvoRemaining = 0; mount.salvoTargetId = null;
      mount.nextSalvoAt = Math.max(mount.nextSalvoAt || 0, this.state.time + (weapon.engagementCycle || 0));
    }
  }

  _attackAutonomously(ship, targets = []) {
    if (ship.manual || roleIs(ship, 'supply')) return;
    targets = targets.filter(target => !this._targetCheck(ship, target));
    const candidates = [];
    for (const mount of ship.mounts) {
      const w = WEAPONS[mount.weaponId];
      if (!w.targets.some(t => ['surface', 'submarine', 'objective'].includes(t))) continue;
      // Even an empty contact list must release stale aims and unfinished salvos.
      this._invalidateFireControl(mount, w, targets);
      if (this.state.time < (mount.nextSalvoAt || 0)) continue;
      const options = [];
      for (const target of targets) {
        if (this._weaponCheck(ship, mount, target)) continue;
        if (mount.salvoRemaining > 0 && target.id !== mount.salvoTargetId) continue;
        const distanceKm = distance(ship, target), quantity = mount.ammo / Math.max(1, mount.capacity);
        const expensive = w.cost > 2;
        if (ship.stance === 'conserve' && quantity < .2 && expensive && target.classData && target.hp > target.maxHp * .4 && distanceKm > w.range * .65) continue;
        const committed = this.state.projectiles.filter(p => p.side === ship.side && p.targetId === target.id && p.status === 'active' && p.phase !== 'return');
        const capital = target.classData && roleIs(target, 'carrier', 'battleship');
        const allocation = w.kind === 'missile' ? (capital || !target.classData ? 6 : 4) : w.kind === 'aircraft' ? (capital || !target.classData ? 4 : 2) : w.kind === 'torpedo' ? 2 : Infinity;
        if (committed.filter(p => p.kind === w.kind).length >= allocation) continue;
        if (committed.reduce((sum, p) => sum + p.damage * p.accuracy, 0) >= target.hp * 1.25) continue;
        if (w.kind === 'aircraft' && mount.airborne >= Math.min(6, Math.max(2, Math.ceil(mount.capacity * .25)))) continue;
        const expected = w.damage * w.accuracy * (1 - (target.armor || 0) * (w.kind === 'gun' ? .85 : .3));
        const overkill = target.hp ? Math.min(1, target.hp / Math.max(1, expected)) : 1;
        const costPenalty = 1 + Math.max(0, w.cost) * (ship.stance === 'aggressive' ? .15 : ship.stance === 'conserve' ? 1 : .5);
        let utility = this._targetPriority(ship, target) * expected * overkill * (.35 + .65 * quantity) / costPenalty;
        if (w.kind === 'gun' && distanceKm < w.range * .8) utility *= 1.7;
        if (w.kind === 'torpedo' && target.classData && roleIs(target, 'submarine')) utility *= 1.6;
        options.push({mount, target, utility, weapon: w});
      }
      options.sort((a, b) => b.utility - a.utility);
      const choice = options.find(c => c.target.id === mount.fireControlTargetId) || options[0];
      if (!choice) continue;
      if (mount.fireControlTargetId !== choice.target.id) {
        mount.fireControlTargetId = choice.target.id;
        mount.solutionReadyAt = this.state.time + (w.kind === 'gun' ? (this.config.era === 'modern' ? 8 : 12) : w.kind === 'torpedo' ? 35 : w.kind === 'aircraft' ? 45 : 25);
      }
      if (this.state.time + 1e-8 >= mount.solutionReadyAt) candidates.push(choice);
    }
    candidates.sort((a, b) => b.utility - a.utility);
    if (candidates[0]) {
      const {mount, target, weapon} = candidates[0];
      if (this.fireWeapon(ship.id, mount.weaponId, target.id).ok) this._recordAutoShot(mount, weapon, target);
    }
  }

  _combatRange(ship, target) {
    const weapons = ship.mounts.filter(m => m.ammo > 0 && WEAPONS[m.weaponId].targets.includes(target && !target.classData ? 'objective' : target?.classData && roleIs(target, 'submarine') ? 'submarine' : 'surface')).map(m => WEAPONS[m.weaponId]);
    const preferred = roleIs(ship, 'submarine') ? weapons.filter(w => w.kind === 'torpedo') : weapons.filter(w => w.kind !== 'aircraft');
    return Math.max(weapons.length ? .3 : 2, ...(preferred.length ? preferred : weapons).map(w => w.kind === 'missile' && target?.classData ? Math.min(w.range * .65, Math.max(24, Math.min(ship.radar * .8, 38))) : w.range * .7));
  }

  _think(side) {
    const fleet = this.state.ships.filter(s => s.side === side && alive(s));
    const objective = this._sideObjective(side);
    const carriers = fleet.filter(s => roleIs(s, 'carrier'));
    const leader = carriers[0] || fleet.find(s => roleIs(s, 'cruiser', 'battleship')) || fleet[0];
    const front = {x: (this.map.spawns.blue.x + this.map.spawns.red.x) / 2, y: (this.map.spawns.blue.y + this.map.spawns.red.y) / 2};
    fleet.forEach((ship, index) => {
      if (ship.manual) return;

      let targets = ship.localContacts.map(id => this.getShip(id)).filter(s => s && !this._targetCheck(ship, s));
      const orderedTarget = ship.order.type === 'attack' ? this._entity(ship.order.targetId) : null;
      const specified = orderedTarget && !this._targetCheck(ship, orderedTarget) ? orderedTarget : null;
      if (specified && (!specified.classData || specified.detectedBy[side])) targets = [specified];
      else targets.sort((a, b) => this._targetPriority(ship, b) - this._targetPriority(ship, a));
      const objectiveAttack = objective?.id && objective.hp > 0 && objective.owner !== side && objective.kind !== 'exit' && this.config.mode !== 'island_control';
      if (!specified && objectiveAttack && ['port_defense', 'port_assault'].includes(this.config.mode)) targets.push(objective);
      this._attackAutonomously(ship, targets);
      if (ship.order.type === 'move' || ship.order.type === 'hold' && ship.order.explicit) return;
      const target = specified && (!specified.classData || specified.detectedBy[side]) ? specified : targets.find(t => t.classData) || (objectiveAttack && ['port_defense', 'port_assault'].includes(this.config.mode) ? objective : null);
      if (ship.convoy) { ship.navigation = this.convoyGoal; return; }
      if (roleIs(ship, 'supply')) {
        const ownPort = this.state.objectives.find(o => o.kind === 'port' && o.initialOwner === side);
        ship.navigation = ownPort; ship.tactics = 'Rear support'; return;
      }
      if (ship.hp < ship.maxHp * .22 && !ship.order.explicit) {
        ship.navigation = this.map.spawns[side]; ship.tactics = 'Damage withdrawal'; return;
      }
      if (target) {
        const d = distance(ship, target), wanted = roleIs(ship, 'carrier') ? (this.config.era === 'modern' ? 65 : 28) : this._combatRange(ship, target);
        const bearing = angle(target, ship);
        if (d < wanted * .55 && (side === 'red' || roleIs(ship, 'carrier'))) {
          ship.navigation = {x: target.x + Math.cos(bearing) * wanted, y: target.y + Math.sin(bearing) * wanted}; ship.tactics = 'Maintain standoff';
        } else if (d > wanted * .85) {
          const flank = side === 'red' && (roleIs(ship, 'submarine') || index % 4 === 2) ? (index % 2 ? -.7 : .7) : 0;
          ship.navigation = {x: target.x + Math.cos(bearing + flank) * wanted * .7, y: target.y + Math.sin(bearing + flank) * wanted * .7};
          ship.tactics = flank ? 'Flanking' : 'Closing to engage';
        } else { ship.navigation = null; ship.path = []; ship.tactics = 'Fire support'; }
      } else if (side === 'red') {
        const base = this.config.mode === 'encounter' ? front : objective || front;
        const goalBearing = angle(this.map.spawns[side], base);
        if (roleIs(ship, 'carrier')) {
          const standoff = this.config.era === 'modern' ? 45 : 22;
          ship.navigation = {x: base.x - Math.cos(goalBearing) * standoff, y: base.y - Math.sin(goalBearing) * standoff}; ship.tactics = 'Air support';
        } else if (carriers.length && ['destroyer', 'frigate', 'cruiser'].includes(ship.classData.role) && index % 3 !== 0) {
          const screenAngle = index / Math.max(1, fleet.length) * TAU;
          ship.navigation = {x: leader.x + Math.cos(screenAngle) * 6 + Math.cos(goalBearing) * 3, y: leader.y + Math.sin(screenAngle) * 6 + Math.sin(goalBearing) * 3}; ship.tactics = 'Carrier screen';
        } else {
          const offset = roleIs(ship, 'submarine') ? (index % 2 ? 16 : -16) : (index % 7 - 3) * 4.5;
          ship.navigation = {x: base.x - Math.sin(goalBearing) * offset, y: base.y + Math.cos(goalBearing) * offset}; ship.tactics = roleIs(ship, 'submarine') ? 'Submarine flanking ambush' : 'Formation advance';
        }
      } else {
        const base = this.config.mode === 'island_control' || this.config.mode === 'convoy' ? objective || front : this.config.mode.startsWith('port_') ? objective : front;
        const offset = this._formationOffset(index, fleet.length, ship.formation);
        ship.navigation = {x: base.x + offset.x, y: base.y + offset.y}; ship.tactics = 'Basic autonomous navigation';
      }
      if (ship.navigation) ship.navigation = this._nearestWater(ship.navigation);
    });
  }

  _updateObjectives(dt) {
    const active = this.state.ships.filter(alive);
    if (this.config.mode === 'island_control') {
      for (const objective of this.state.objectives.filter(o => o.kind === 'island' && o.hp > 0)) {
        const nearby = active.filter(s => !roleIs(s, 'submarine', 'supply', 'carrier') && distance(s, objective) < 5);
        const power = {blue: 0, red: 0};
        for (const ship of nearby) power[ship.side] += roleIs(ship, 'amphibious') ? 3 : 1;
        const challenger = power.blue > 0 && power.red === 0 ? 'blue' : power.red > 0 && power.blue === 0 ? 'red' : null;
        if (challenger && challenger !== objective.owner) {
          if (objective.captureSide !== challenger) { objective.capture = Math.max(0, objective.capture - dt * 2); if (objective.capture === 0) objective.captureSide = challenger; }
          if (objective.captureSide === challenger) objective.capture = Math.min(100, objective.capture + dt * Math.min(.5, .2 + power[challenger] * .08));
          if (objective.capture >= 100) { objective.owner = challenger; objective.capture = 0; objective.captureSide = null; this._event(`${objective.name} captured by ${challenger === 'blue' ? 'friendly' : 'enemy'} forces`, challenger); }
        } else if (!challenger || challenger === objective.owner) objective.capture = Math.max(0, objective.capture - dt * .6);
        if (objective.owner !== 'neutral' && !(power.blue > 0 && power.red > 0)) this.state.score[objective.owner] += dt / Math.max(1, this.state.objectives.filter(o => o.kind === 'island' && o.hp > 0).length);
      }
    }
    if (this.config.mode === 'convoy') {
      for (const ship of active.filter(s => s.convoy)) if (distance(ship, this.convoyGoal) < 3) {
        ship.evacuated = true; ship.status = 'sunk'; ship.speed = 0; ship.path = []; ship.navigation = null; this.state.score.blue++;
        this._event(`${ship.name} reached the extraction zone safely`, 'blue');
      }
    }
  }

  _remainingPower(side) {
    const ships = this.state.ships.filter(s => s.side === side && !roleIs(s, 'supply'));
    const original = ships.reduce((sum, ship) => sum + (VALUE[ship.classData.role] || 2), 0);
    if (!original) return this.state.ships.some(s => s.side === side && alive(s)) ? 1 : 0;
    return ships.reduce((sum, ship) => sum + (alive(ship) ? (VALUE[ship.classData.role] || 2) * (.4 + .6 * ship.hp / ship.maxHp) : 0), 0) / original;
  }

  getMissionStatus() {
    const mode = this.config.mode, bluePower = this._remainingPower('blue'), redPower = this._remainingPower('red');
    const power = 'Combat power: friendly ' + Math.round(bluePower * 100) + '% / enemy ' + Math.round(redPower * 100) + '%';
    const text = {encounter: 'Force the enemy to withdraw: reduce its weighted combat power below 25%.', port_defense: 'Protect your port until relief arrives, or force the attacking fleet to withdraw.', port_assault: 'Destroy the hostile port before the deadline; defeating its fleet alone is insufficient.', island_control: 'Secure control zones, then accumulate 30 minutes of full-area control.', convoy: 'Extract at least 60% of the transports; destroying the enemy alone is insufficient.'}[mode];
    let detail = power;
    if (mode === 'island_control') detail = 'Control: ' + Math.floor(this.state.score.blue / 60) + ' / ' + Math.ceil(this.config.captureTarget / 60) + ' min; enemy ' + Math.floor(this.state.score.red / 60) + ' min';
    if (mode === 'convoy') {
      const transports = this.state.ships.filter(s => this.convoyIds.includes(s.id));
      detail = transports.filter(s => s.evacuated).length + ' / ' + Math.ceil(transports.length * .6) + ' transports extracted';
    }
    return {text, detail, remaining: Math.max(0, this.config.duration - this.state.time), bluePower, redPower};
  }

  _finish(winner, reason) {
    if (this.state.result) return;
    this.state.result = {winner, reason};
    this._event(`${winner === 'blue' ? 'Victory' : winner === 'red' ? 'Defeat' : 'Battle over'}: ${reason}`);
  }

  _checkVictory() {
    if (this.state.result) return;
    const active = this.state.ships.filter(alive), blue = active.filter(s => s.side === 'blue'), red = active.filter(s => s.side === 'red');
    const mode = this.config.mode;
    const bluePort = this.state.objectives.find(o => o.kind === 'port' && o.initialOwner === 'blue');
    const redPort = this.state.objectives.find(o => o.kind === 'port' && o.initialOwner === 'red');
    if (mode === 'port_defense' && bluePort?.hp <= 0) return this._finish('red', 'The defended port was destroyed');
    if (mode === 'port_assault' && redPort?.hp <= 0) return this._finish('blue', 'The enemy port was destroyed');
    if (mode === 'convoy') {
      const convoy = this.state.ships.filter(s => this.convoyIds.includes(s.id));
      const required = Math.ceil(convoy.length * .6), escaped = convoy.filter(s => s.evacuated).length;
      if (escaped >= required) return this._finish('blue', `${escaped} transports extracted safely`);
      if (convoy.filter(s => alive(s) || s.evacuated).length < required) return this._finish('red', 'Too many transports lost; convoy protection failed');
    }
    if (mode === 'island_control') {
      if (this.state.score.blue >= this.config.captureTarget) return this._finish('blue', 'Island control score reached');
      if (this.state.score.red >= this.config.captureTarget) return this._finish('red', 'Enemy reached the island control score');
    }
    const bPower = this._remainingPower('blue'), rPower = this._remainingPower('red');
    if (mode === 'encounter') {
      if (!blue.length && !red.length) return this._finish('draw', 'Both fleets are no longer operational');
      if (!blue.length || bPower <= .25 && rPower > .25) return this._finish('red', 'Friendly force lost at least 75% of its weighted combat power and withdrew');
      if (!red.length || rPower <= .25 && bPower > .25) return this._finish('blue', 'Enemy force lost at least 75% of its weighted combat power and withdrew');
      if (bPower <= .25 && rPower <= .25) return this._finish('draw', 'Both forces are combat ineffective and disengaged');
    }
    if (mode === 'port_defense') {
      if (!blue.length || bPower <= .25) return this._finish('red', 'The defending fleet was overwhelmed; the harbor is no longer protected');
      if (!red.length || rPower <= .25) return this._finish('blue', 'The assault force withdrew after unsustainable combat losses');
    }
    if (mode === 'port_assault' && (!blue.length || bPower <= .25)) return this._finish('red', 'The attacking force lost the combat power required to continue the assault');
    if (this.state.time >= this.config.duration) {
      if (mode === 'port_defense') return this._finish('blue', 'Port held until reinforcements arrived');
      if (mode === 'port_assault') return this._finish('red', 'Assault time expired with the enemy port operational');
      if (mode === 'convoy') return this._finish('red', 'Transports did not extract before the deadline');
      if (mode === 'island_control') return this._finish(this.state.score.blue === this.state.score.red ? 'draw' : this.state.score.blue > this.state.score.red ? 'blue' : 'red', 'Time expired; control score determines the outcome');
      return this._finish(Math.abs(bPower - rPower) < .1 ? 'draw' : bPower > rPower ? 'blue' : 'red', 'Operational window closed; relative combat losses determine the outcome');
    }
  }

  update(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    // External callers may pass minutes at once. Integrate in bounded physical steps.
    this._accumulator += Math.min(dt, 86400);
    while (this._accumulator >= .2 - 1e-8) {
      const step = .2; this._accumulator = Math.max(0, this._accumulator - step);
      if (this._accumulator < 1e-8) this._accumulator = 0;
      if (this.state.result) {
        // Finish visible sinking animations after combat stops, without further decisions or movement.
        for (const ship of this.state.ships) if (ship.status === 'sinking') { ship.sinkTimer = Math.max(0, ship.sinkTimer - step); if (ship.sinkTimer === 0) ship.status = 'sunk'; }
        for (const effect of this.state.effects) effect.ttl -= step;
        this.state.effects = this.state.effects.filter(e => e.ttl > 0);
        continue;
      }
      this.state.time += step;
      for (const ship of this.state.ships) {
        if (ship.status === 'sinking') { ship.sinkTimer = Math.max(0, ship.sinkTimer - step); if (ship.sinkTimer === 0) ship.status = 'sunk'; continue; }
        if (!alive(ship)) continue;
        for (const mount of ship.mounts) {
          mount.cooldown = Math.max(0, mount.cooldown - step);
          const ready = mount.rearming.filter(t => t <= step).length;
          mount.rearming = mount.rearming.filter(t => t > step).map(t => t - step);
          mount.ammo = Math.min(mount.capacity, mount.ammo + ready);
        }
      }
      this._sensorClock -= step;
      if (this._sensorClock <= 1e-8) { this._updateSensors(); this._sensorClock += 2; }
      this._defenseClock -= step;
      if (this._defenseClock <= 1e-8) {
        for (const ship of this.state.ships) if (alive(ship)) this._defend(ship);
        this._defenseClock += .6;
      }
      for (const side of ['red', 'blue']) {
        this._aiClock[side] -= step;
        if (this._aiClock[side] <= 1e-8) { this._think(side); this._aiClock[side] += side === 'red' ? 2 : 5; }
      }
      for (const ship of this.state.ships) if (alive(ship)) this._moveShip(ship, step);
      for (const projectile of [...this.state.projectiles]) this._stepProjectile(projectile, step);
      this.state.projectiles = this.state.projectiles.filter(p => p.status === 'active');
      for (const effect of this.state.effects) effect.ttl -= step;
      this.state.effects = this.state.effects.filter(e => e.ttl > 0).slice(-500);
      this._updateObjectives(step);
      this._checkVictory();
    }
  }

  serialize() {
    return clone({version: 1, config: this.config, map: this.map, state: this.state, seed: this._seed, nextId: this._nextId, sensorClock: this._sensorClock, aiClock: this._aiClock, objectiveClock: this._objectiveClock, defenseClock: this._defenseClock, accumulator: this._accumulator, singleManualId: this.singleManualId, convoyIds: this.convoyIds || [], convoyGoal: this.convoyGoal || null});
  }

  static restore(snapshot) {
    if (!snapshot || snapshot.version !== 1 || !snapshot.state || !snapshot.config || !snapshot.map) throw new Error('Unsupported save format or version');
    let encoded;
    try { encoded = JSON.stringify(snapshot); } catch { throw new Error('Invalid save: data must be JSON-compatible'); }
    if (!encoded || encoded.length > 16 * 1024 * 1024) throw new Error('Invalid save: file exceeds the 16 MB limit');
    const data = JSON.parse(encoded), game = Object.create(NavalGame.prototype);
    validateSnapshot(data);
    game.config = data.config; game.map = data.map; game.state = data.state;
    game._seed = data.seed >>> 0; game._nextId = data.nextId; game._sensorClock = data.sensorClock; game._aiClock = data.aiClock;
    game._objectiveClock = data.objectiveClock; game._defenseClock = data.defenseClock ?? 0; game._accumulator = data.accumulator || 0; game.singleManualId = data.singleManualId; game.convoyIds = data.convoyIds; game.convoyGoal = data.convoyGoal;
    game._gridCache = null; game._salvoReservations = {};
    return game;
  }
}

function validateSnapshot(data) {
  const check = (condition, message) => { if (!condition) throw new Error('Invalid save: ' + message); };
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  const number = (value, min = 0, max = 1e8) => Number.isFinite(value) && value >= min && value <= max;
  const integer = (value, min = 0, max = 1e8) => Number.isInteger(value) && number(value, min, max);
  const string = (value, max = 256) => typeof value === 'string' && value.length > 0 && value.length <= max;
  const array = (value, max, label) => { check(Array.isArray(value) && value.length <= max, label + ' is missing or too large'); return value; };
  const side = value => value === 'blue' || value === 'red';
  const {config, map, state} = data;
  check(object(config) && object(map) && object(state), 'configuration, map and state are required');
  check(Object.hasOwn(SHIP_CLASSES, config.era), 'unknown era');
  check(['encounter', 'port_defense', 'port_assault', 'island_control', 'convoy'].includes(config.mode), 'unknown mode');
  check(['small', 'standard', 'large'].includes(config.scale), 'unknown fleet scale');
  check(FACTIONS.some(f => f.id === config.blueFaction) && FACTIONS.some(f => f.id === config.redFaction), 'unknown faction');
  check(MAPS.some(m => m.id === config.mapId), 'unknown map');
  check(number(config.duration, .1) && number(config.captureTarget, .1) && number(config.seed, 0, Number.MAX_SAFE_INTEGER), 'invalid scenario timing or seed');
  check(number(map.width, 1, 2000) && number(map.height, 1, 2000), 'map dimensions out of bounds');
  const point = (p, padding = 0) => object(p) && number(p.x, -padding, map.width + padding) && number(p.y, -padding, map.height + padding);
  check(object(map.spawns) && point(map.spawns.blue) && point(map.spawns.red), 'invalid spawn coordinates');
  let vertices = 0;
  for (const land of array(map.land, 128, 'terrain')) {
    check(object(land), 'invalid terrain polygon');
    const points = array(land.points, 2048, 'polygon vertices'); vertices += points.length;
    check(points.length >= 3 && vertices <= 16384 && points.every(p => Array.isArray(p) && p.length === 2 && number(p[0], 0, map.width) && number(p[1], 0, map.height)), 'invalid polygon coordinates');
  }
  check(number(state.time) && object(state.score) && number(state.score.blue) && number(state.score.red), 'invalid battle clock or score');
  check(state.result === null || object(state.result) && ['blue', 'red', 'draw'].includes(state.result.winner) && string(state.result.reason, 2048), 'invalid battle outcome');
  check(integer(data.seed, 0, 4294967295) && integer(data.nextId, 1, 1e9), 'invalid random state or ID counter');
  check(number(data.sensorClock, -.21, 3) && object(data.aiClock) && number(data.aiClock.blue, -.21, 6) && number(data.aiClock.red, -.21, 3), 'invalid simulation clocks');
  check(data.defenseClock === undefined || number(data.defenseClock, -.21, .60001), 'invalid defense clock');
  check(number(data.objectiveClock, 0, 10) && number(data.accumulator ?? 0, 0, .200001), 'invalid simulation remainder');
  const ids = new Set(), shipIds = new Set();
  const unique = (id, label) => { check(string(id, 128) && !ids.has(id), 'invalid or duplicate ' + label + ' ID'); ids.add(id); };
  const reference = id => id === null || id === undefined || string(id, 128);
  const order = value => object(value) && ['auto', 'hold', 'move', 'attack', 'disabled'].includes(value.type) && typeof value.explicit === 'boolean' && (value.type !== 'move' || point(value)) && (value.type !== 'attack' || string(value.targetId, 128)) && (value.temporaryManualHold === undefined || typeof value.temporaryManualHold === 'boolean');
  const ships = array(state.ships, 256, 'ships'); check(ships.length > 0, 'fleet is empty');
  for (const ship of ships) {
    check(object(ship), 'invalid ship'); unique(ship.id, 'ship'); shipIds.add(ship.id);
    const canonical = Object.hasOwn(SHIP_CLASSES[config.era], ship.classId) ? SHIP_CLASSES[config.era][ship.classId] : null;
    check(canonical && object(ship.classData) && ship.classData.id === ship.classId && ship.classData.era === config.era && ship.classData.role === canonical.role, 'invalid ship class');
    check(side(ship.side) && string(ship.name, 160) && point(ship), 'invalid ship identity or coordinates');
    check(number(ship.heading, -Math.PI - .0001, Math.PI + .0001) && number(ship.speed, 0, 1) && number(ship.maxSpeed, .00001, 1), 'invalid ship motion');
    check(number(ship.maxHp, 1, 1e7) && number(ship.hp, 0, ship.maxHp) && ['active', 'sinking', 'sunk'].includes(ship.status), 'invalid ship health or status');
    check((ship.status !== 'active' || ship.hp > 0) && (ship.status === 'active' || ship.speed === 0), 'ship status conflicts with physical state');
    check(number(ship.sinkTimer, 0, 3600) && (ship.sinkDuration === undefined || number(ship.sinkDuration, 1, 3600)), 'invalid sinking clock');
    for (const field of ['hp', 'speed', 'turnRate', 'armor', 'radar', 'sonar', 'visual', 'signature', 'tonnage']) check(number(ship.classData[field], 0, 1e7), 'invalid class parameter ' + field);
    check(Array.isArray(ship.classData.weapons) && ship.classData.weapons.length === canonical.weapons.length && ship.classData.weapons.every((m, i) => object(m) && m.weaponId === canonical.weapons[i].weaponId), 'invalid class armament');
    check(ship.formationSpeed == null || number(ship.formationSpeed, 0, 1), 'invalid formation pace');
    check(ship.routeAttemptTime === undefined || number(ship.routeAttemptTime), 'invalid route retry clock');
    check(ship.lastFired === undefined || number(ship.lastFired), 'invalid firing timestamp');
    check(ship.tactics == null || string(ship.tactics, 160), 'invalid tactical label');
    check(number(ship.tech, .1, 5) && number(ship.armor, 0, 1) && number(ship.signature, 0, 10), 'invalid ship protection or technology');
    for (const field of ['radar', 'sonar', 'visual', 'commRange']) check(number(ship[field], 0, 2000), 'invalid ship sensor or communications range');
    check(typeof ship.manual === 'boolean' && typeof ship.emcon === 'boolean' && typeof ship.convoy === 'boolean' && typeof ship.evacuated === 'boolean', 'invalid ship control flags');
    check(['balanced', 'aggressive', 'conserve'].includes(ship.stance) && ['line', 'column', 'wedge', 'screen'].includes(ship.formation), 'invalid stance or formation');
    check(order(ship.order) && (ship.orderBeforeManual == null || order(ship.orderBeforeManual)), 'invalid ship orders');
    check(ship.navigation === null || point(ship.navigation), 'invalid navigation target');
    check(ship.pathTarget === null || point(ship.pathTarget), 'invalid route target');
    check(array(ship.path, 4096, 'route').every(p => point(p)), 'invalid route coordinates');
    check(array(ship.localContacts, 256, 'contacts').every(id => string(id, 128)), 'invalid contact IDs');
    check(object(ship.detectedBy) && typeof ship.detectedBy.blue === 'boolean' && typeof ship.detectedBy.red === 'boolean', 'invalid detection flags');
    check(object(ship.lastContact) && Object.keys(ship.lastContact).length <= 256 && Object.values(ship.lastContact).every(t => number(t)), 'invalid contact history');
    const mounts = array(ship.mounts, 32, 'weapon mounts'); check(mounts.length === canonical.weapons.length, 'missing weapon mounts');
    const seenWeapons = new Set();
    for (const mount of mounts) {
      check(object(mount), 'invalid weapon mount');
      const weapon = WEAPONS[mount.weaponId], original = canonical.weapons.find(m => m.weaponId === mount.weaponId);
      check(weapon && original && weapon.era === config.era && !seenWeapons.has(mount.weaponId), 'invalid mounted weapon'); seenWeapons.add(mount.weaponId);
      check(mount.capacity === original.capacity && integer(mount.ammo, 0, mount.capacity) && number(mount.cooldown, 0, 1e6), 'invalid ammunition or cooldown');
      for (const field of ['nextSalvoAt', 'solutionReadyAt']) check(mount[field] === undefined || number(mount[field], 0, 1e9), 'invalid weapon planning clock');
      check(mount.salvoRemaining === undefined || integer(mount.salvoRemaining, 0, 32), 'invalid salvo allocation');
      for (const field of ['fireControlTargetId', 'salvoTargetId']) check(reference(mount[field]), 'invalid fire-control reference');
      mount.nextSalvoAt ??= 0; mount.solutionReadyAt ??= 0; mount.salvoRemaining ??= 0; mount.salvoTargetId ??= null; mount.fireControlTargetId ??= null;
      check(integer(mount.airborne, 0, mount.capacity) && integer(mount.lost, 0, 10000) && integer(mount.sortieStores, 0, mount.capacity * 2), 'invalid aircraft inventory');
      check(array(mount.rearming, mount.capacity, 'rearming aircraft').every(t => number(t, 0, 1e5)), 'invalid rearming clocks');
      check(mount.parked === undefined || integer(mount.parked, 0, mount.capacity), 'invalid parked aircraft count');
    }
    // Catalog definitions are trusted; mutable combat state remains from the save.
    ship.classData = clone(canonical);
  }
  check(data.singleManualId === null || shipIds.has(data.singleManualId), 'manual ship does not exist');
  for (const ship of ships) check(ship.manual === (ship.id === data.singleManualId) && (!ship.manual || ship.side === 'blue' && ship.status === 'active'), 'inconsistent manual control state');
  for (const p of array(state.projectiles, 8192, 'projectiles')) {
    check(object(p), 'invalid projectile'); unique(p.id, 'projectile');
    const weapon = WEAPONS[p.weaponId];
    check(weapon && weapon.era === config.era && p.kind === weapon.kind && side(p.side) && point(p, 10000) && point(p.aim, 10000), 'invalid projectile type or coordinates');
    check(shipIds.has(p.sourceId) && reference(p.targetId) && p.status === 'active' && typeof p.homing === 'boolean' && p.retired === false, 'invalid projectile state');
    check(number(p.heading, -Math.PI - .0001, Math.PI + .0001) && number(p.speed, .000001, 10) && number(p.remaining, 0, 10000) && number(p.ttl, 0, 1e6), 'invalid projectile motion');
    check(number(p.damage, 0, 1e7) && number(p.accuracy, 0, 1) && number(p.maxHp, .000001, 1e7) && number(p.hp, .000001, p.maxHp) && number(p.launchTime) && number(p.travelled, 0, 10000), 'invalid projectile combat parameters');
    if (p.kind === 'aircraft') check(['outbound', 'return'].includes(p.phase) && shipIds.has(p.carrierId), 'invalid aircraft recovery state');
    if (config.era !== 'modern' && p.kind === 'torpedo') check(!p.homing, 'WWII torpedoes must be unguided');
  }
  for (const ship of ships) for (const mount of ship.mounts) {
    const flights = state.projectiles.filter(p => p.kind === 'aircraft' && p.carrierId === ship.id && p.weaponId === mount.weaponId).length;
    check(mount.airborne === flights, 'aircraft count does not match active sorties');
    if (WEAPONS[mount.weaponId].kind === 'aircraft') check(mount.ammo + mount.airborne + mount.rearming.length + (mount.parked || 0) <= mount.capacity, 'aircraft inventory exceeds hangar capacity');
    else check(mount.airborne === 0 && mount.rearming.length === 0 && mount.sortieStores === 0, 'non-aircraft mount contains aircraft');
  }
  for (const objective of array(state.objectives, 64, 'objectives')) {
    check(object(objective), 'invalid objective'); unique(objective.id, 'objective');
    check(point(objective) && string(objective.name, 160) && ['port', 'island', 'exit'].includes(objective.kind) && ['blue', 'red', 'neutral'].includes(objective.owner) && ['blue', 'red', 'neutral'].includes(objective.initialOwner), 'invalid objective identity');
    check(number(objective.maxHp, 1, 1e7) && number(objective.hp, 0, objective.maxHp) && number(objective.capture, 0, 100) && (objective.captureSide == null || side(objective.captureSide)), 'invalid objective state');
  }
  for (const effect of array(state.effects, 1000, 'effects')) check(object(effect) && point(effect, 10000) && string(effect.kind, 40) && number(effect.ttl, 0, 10000) && number(effect.maxTtl, .01, 10000) && number(effect.radius, 0, 100), 'invalid visual effect');
  for (const event of array(state.events, 100, 'events')) check(object(event) && number(event.time) && string(event.text, 2048) && (event.side === undefined || side(event.side)), 'invalid battle event');
  check(array(data.convoyIds, 256, 'convoy IDs').every(id => shipIds.has(id)), 'invalid convoy membership');
  check(data.convoyGoal === null || point(data.convoyGoal), 'invalid convoy destination');
  if (config.mode === 'convoy') check(data.convoyIds.length > 0 && point(data.convoyGoal), 'convoy objective is missing');
}

export default NavalGame;



