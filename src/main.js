import {saveCampaign, loadCampaign, downloadCampaign} from './browser-storage.js';
import { ERAS, FACTIONS, MAPS, MODES, WEAPONS, SHIP_CLASSES, createFleet } from '../data/catalog.js';
import { NavalGame } from './engine.js';
import { NavalRenderer } from './renderer.js';

const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtTime = seconds => { const t=Math.max(0,Math.floor(seconds)); return [Math.floor(t/3600),Math.floor(t/60)%60,t%60].map(n=>String(n).padStart(2,'0')).join(':'); };
const number = (n,d=0) => Number.isFinite(n)?n.toFixed(d):'—';
const doctrineNames={carrier:'Carrier aviation',balanced:'Combined arms',missile:'Missile strike',submarine:'Undersea warfare',littoral:'Littoral defense'};
const modeIcons={encounter:'⌖',port_defense:'♜',port_assault:'↗',island_control:'◇',convoy:'≋'};
const weaponIcons={missile:'↗',sam:'⌁',gun:'⊙',ciws:'⋮',torpedo:'➝',depthcharge:'⋮',aircraft:'✈',aa:'⌁'};
const orderNames={move:'Underway',attack:'Attacking',auto:'Autonomous',idle:'Standby',stop:'Stop',patrol:'Patrolling',escort:'Escort',retreat:'Withdrawing',hold:'Holding station'};
let config={era:'modern',blueFaction:FACTIONS[0]?.id,redFaction:FACTIONS[1]?.id,mapId:MAPS[0]?.id,mode:'encounter',scale:'standard'};
let game=null, renderer=null, selected=new Set(), targetId=null, activeWeapon=null, inputMode=null;
let paused=true,speed=1,operationStarted=false,showSensors=false,showRanges=false,showLabels=true,hoverId=null,selectionRect=null;
let pointer=null, panKey=false, resultShown=false, frameLast=0, uiLast=0, groups={}, previousEvents='', lastInspectorSignature='';
let fleetDOM=new Map(), pausedBeforeDialog=false, fpsFrames=0,fpsStart=0,inspectorHeld=false;
const canvas=$('sea-canvas');

function shipIcon(role='destroyer') {
 const shapes={carrier:'M12 1L21 9V36L18 41H5L3 35V10L8 1ZM7 10V32M15 8V35M19 15H23V25H19',battleship:'M12 1L20 12V31L17 41H7L4 31V12ZM8 9H16V16H8ZM8 27H16V34H8ZM10 18H14V24H10',cruiser:'M12 1L18 12V33L15 41H9L6 33V12ZM9 12H15V18H9ZM9 27H15V32H9',submarine:'M12 2Q18 2 18 13V32Q18 41 12 41Q6 41 6 32V13Q6 2 12 2ZM10 15H14V26H10M3 30H21',amphibious:'M12 2L21 9V38H3V9ZM7 16H17V32H7',supply:'M12 2L20 10V37H4V10ZM7 16H17V21H7ZM7 26H17V31H7'};
 return `<svg class="fleet-icon" viewBox="0 0 26 44" aria-hidden="true"><path d="${shapes[role]||'M12 1L18 13V32L15 41H9L6 32V13ZM9 15H15V25H9'}" fill="currentColor" fill-opacity=".15" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
}
function toast(text,type='info') { const div=document.createElement('div'); div.className=`toast ${type}`; div.textContent=text; $('toast-container').append(div); setTimeout(()=>div.remove(),4600); while($('toast-container').children.length>4) $('toast-container').firstChild.remove(); }
function showError(error) { console.error(error); $('boot-error').hidden=false; $('boot-error').textContent=`Unable to start the game\n\n${error?.message||error}\n\nOpen the published game URL in a modern desktop browser. Local previews need an HTTP server.\nSee the browser console for error details.`; }
window.addEventListener('error',event=>{ if(!game) showError(event.error||event.message); });
window.addEventListener('unhandledrejection',event=>{console.error(event.reason); if(game)toast(event.reason?.message||'Operation failed. Please try again.','error'); else showError(event.reason);});

function initSetup() {
 $('era-options').innerHTML=ERAS.map(e=>`<button data-era="${e.id}" class="${e.id===config.era?'active':''}">${escape(e.name)} <small>${e.id==='modern'?'MODERN':'1939–1945'}</small></button>`).join('');
 const options=[1,2,3,4,5].map(t=>`<optgroup label="${['Oceanic powers','Regional powers','Regional fleets','Littoral fleets','Coastal navies'][t-1]}">${FACTIONS.filter(f=>f.tier===t).map(f=>`<option value="${f.id}">${escape(f.name)}</option>`).join('')}</optgroup>`).join('');
 $('blue-faction').innerHTML=options; $('red-faction').innerHTML=options;
 $('blue-faction').value=config.blueFaction; $('red-faction').value=config.redFaction;
 $('map-select').innerHTML=MAPS.map(m=>`<option value="${m.id}">${escape(m.name)}</option>`).join('');
 $('map-select').value=config.mapId; $('fleet-scale').value=config.scale;
 $('mode-options').innerHTML=MODES.map(m=>`<button class="mode-card ${m.id===config.mode?'active':''}" data-mode="${m.id}"><span class="mode-icon">${modeIcons[m.id]||'◇'}</span>${escape(m.name)}</button>`).join('');
 $('faction-count').textContent=FACTIONS.length; $('map-count').textContent=String(MAPS.length).padStart(2,'0');
 updateSetup();
}
function updateSetup(){
 config.blueFaction=$('blue-faction').value;config.redFaction=$('red-faction').value;config.mapId=$('map-select').value;config.scale=$('fleet-scale').value;
 for(const side of ['blue','red']){const f=FACTIONS.find(f=>f.id===config[`${side}Faction`]);$(`${side}-description`).textContent=`${doctrineNames[f?.doctrine]||'Combined arms'} · ${f?.description||''}`;}
 const map=MAPS.find(m=>m.id===config.mapId);$('map-description').textContent=map?.description||'';
 $('mode-description').textContent=MODES.find(m=>m.id===config.mode)?.description||'';
 $('fleet-preview').innerHTML=['blue','red'].map(side=>{const fleet=createFleet(config.era,config[`${side}Faction`],side,config.scale);const count={};for(const id of fleet){const s=SHIP_CLASSES[config.era][id];count[s?.shortName||s?.name||id]=(count[s?.shortName||s?.name||id]||0)+1;}return `<div><strong class="${side}">${fleet.length}</strong>${side==='blue'?'Friendly':'Enemy'} vessels<small>${Object.entries(count).map(([name,n])=>`${escape(name)} ${n}`).join(' · ')}</small></div>`;}).join('');
}
$('era-options').addEventListener('click',e=>{const b=e.target.closest('[data-era]');if(!b)return;config.era=b.dataset.era;for(const el of $('era-options').children)el.classList.toggle('active',el===b);updateSetup();});
$('mode-options').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(!b)return;config.mode=b.dataset.mode;for(const el of $('mode-options').children)el.classList.toggle('active',el===b);updateSetup();});
for(const id of ['blue-faction','red-faction','map-select','fleet-scale'])$(id).addEventListener('change',updateSetup);

function startGame(restored=null,ui=null){
 try{game=restored||new NavalGame({...config,seed:Date.now()>>>0});}catch(error){showError(error);return;}
 config={...config,...game.config};selected=new Set();targetId=null;activeWeapon=null;inputMode=null;groups={};resultShown=false;paused=restored?ui?.paused!==false:true;speed=restored&&[1,5,15,30,60].includes(ui?.speed)?ui.speed:1;
 operationStarted=!!restored&&(ui?.operationStarted===true||game.state.time>0);
 if(Array.isArray(ui?.selected))selected=new Set(ui.selected.filter(id=>game.getShip(id)?.side==='blue'&&game.getShip(id)?.status==='active'));
 game.setManualShip(selected.size===1?[...selected][0]:null);
 $('briefing').hidden=true;$('battle').hidden=false;
 for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();
 if(renderer)renderer.setGame(game);else renderer=new NavalRenderer(canvas,$('minimap'),game);
 renderer.resize();renderer.fit();if(ui?.camera&&['x','y','zoom'].every(k=>Number.isFinite(ui.camera[k])))Object.assign(renderer.camera,ui.camera);
 $('operation-name').textContent=MODES.find(m=>m.id===config.mode)?.name||'Naval operation';
 $('operation-subtitle').textContent=`${ERAS.find(e=>e.id===config.era)?.name||config.era} / ${FACTIONS.find(f=>f.id===config.blueFaction)?.name||'Friendly'} vs ${FACTIONS.find(f=>f.id===config.redFaction)?.name||'Enemy'}`;
 $('fleet-faction').textContent=FACTIONS.find(f=>f.id===config.blueFaction)?.name||'Your fleet';
 $('map-name').textContent=game.map.name;$('map-dimensions').textContent=`${game.map.width} × ${game.map.height} km`;
 $('speed-options').innerHTML=[1,5,15,30,60].map(n=>`<button data-speed="${n}" class="${n===speed?'active':''}">${n}×</button>`).join('');
 fpsFrames=0;fpsStart=performance.now();inspectorHeld=false;$('toast-container').replaceChildren();fleetDOM.clear();$('fleet-list').replaceChildren();lastInspectorSignature='';previousEvents='';setPaused(paused);updateUI();canvas.focus();
 if(!restored)toast('Planning at 1×. Select ships and plot a course, then choose Start operation.');else toast(`Saved operation restored${paused?' — review your orders, then resume.':'.'}`);
}
$('deploy').addEventListener('click',()=>startGame());
function setSelected(ids){selected=new Set([...ids].filter(id=>{const s=game?.getShip(id);return s?.side==='blue'&&s.status==='active';}));game?.setManualShip(selected.size===1?[...selected][0]:null);activeWeapon=null;inputMode=null;lastInspectorSignature='';updateUI();}
function selectionShips(){return [...selected].map(id=>game.getShip(id)).filter(s=>s?.status==='active');}
function setPaused(value){paused=value;if(!paused)operationStarted=true;const label=paused?(operationStarted?'Resume operation':'Start operation'):'Pause operation';$('pause').textContent=`${paused?'▶':'Ⅱ'} ${label}`;$('pause').title=`${label} (Space)`;$('pause').setAttribute('aria-label',label);$('pause').classList.toggle('active',paused);$('pause-overlay').hidden=!paused||!!game?.state.result;$('pause-title').textContent=operationStarted?'TACTICAL PAUSE':'PLAN YOUR OPERATION';$('pause-hint').textContent=operationStarted?'Inspect contacts and issue orders, then resume when ready.':'Select ships, plot a course, then choose Start operation. Use higher speeds for transit.';if(game)updateOperationStage();}
$('pause').onclick=()=>{if(game&&!game.state.result)setPaused(!paused);};
function setSpeed(value){speed=value;for(const el of $('speed-options').children)el.classList.toggle('active',Number(el.dataset.speed)===speed);}
function visibleEnemies(){return game.getVisibleShips('blue').filter(s=>s.side==='red'&&s.status==='active');}
function incomingWeapons(){return game.getThreats('blue').filter(p=>p.phase!=='return'&&(!p.targetId||game.getShip(p.targetId)?.side==='blue'||game.state.objectives.some(o=>o.id===p.targetId&&o.owner==='blue')));}
function updateOperationStage(){const incoming=incomingWeapons(),contact=visibleEnemies();const firing=game.state.projectiles.some(p=>p.status==='active'&&(p.side==='blue'||incoming.some(t=>t.id===p.id)));$('operation-stage').textContent=paused?'Planning':firing?'Engaged':contact.length?'Contact':'Transit';$('operation-stage').dataset.stage=paused?'planning':firing?'engaged':contact.length?'contact':'transit';}
$('speed-options').onclick=e=>{const b=e.target.closest('[data-speed]');if(!b)return;setSpeed(Number(b.dataset.speed));};
function arm(mode){if(!selected.size)return toast('Select friendly vessels first.','warn');inputMode=inputMode===mode?null:mode;if(mode!=='fire')activeWeapon=null;updateUI();}
$('cmd-move').onclick=()=>arm('move');$('cmd-attack').onclick=()=>{if(selected.size===1&&!activeWeapon){toast('Manual control: choose a weapon in the right panel first.','warn');return;}arm(selected.size===1?'fire':'attack');};
$('cmd-stop').onclick=()=>{if(selected.size){game.stop([...selected]);toast('Stop order issued.');updateUI();}};
function focusSelection(){const ships=selectionShips();if(ships.length){renderer.focus(ships.reduce((a,s)=>a+s.x,0)/ships.length,ships.reduce((a,s)=>a+s.y,0)/ships.length);}}
$('cmd-focus').onclick=focusSelection;
$('formation').onchange=()=>{if(selected.size){const ships=selectionShips();const moving=ships.filter(s=>s.order?.type==='move');const center=(moving.length?moving.map(s=>s.order):ships).reduce((p,s,i,a)=>({x:p.x+s.x/a.length,y:p.y+s.y/a.length}),{x:0,y:0});game.commandMove([...selected],center,$('formation').value);toast('Formation updated.');}};
$('select-all').onclick=()=>{if(game)setSelected(game.state.ships.filter(s=>s.side==='blue'&&s.status==='active').map(s=>s.id));};
$('fit-map').onclick=()=>renderer?.fit();
for(const [id,toggle] of [['toggle-sensors',()=>showSensors=!showSensors],['toggle-ranges',()=>showRanges=!showRanges],['toggle-labels',()=>showLabels=!showLabels]])$(id).onclick=()=>$(id).classList.toggle('active',toggle());

function updateFleet(){
 const ships=game.state.ships.filter(s=>s.side==='blue'&&s.status!=='sunk');$('fleet-count').textContent=ships.filter(s=>s.status==='active').length;
 const ids=new Set(ships.map(s=>s.id));for(const [id,row]of fleetDOM)if(!ids.has(id)){row.remove();fleetDOM.delete(id);}
 for(const ship of ships){let row=fleetDOM.get(ship.id);if(!row){row=document.createElement('button');row.className='fleet-row';row.dataset.id=ship.id;row.innerHTML=`${shipIcon(ship.classData?.role||ship.classId)}<span class="fleet-text"><strong></strong><small><span class="class-label"></span><span class="order-label"></span></small><span class="mini-hp"><i></i></span></span><i class="manual-dot" hidden></i>`;row.onclick=e=>{const ids=e.shiftKey?new Set(selected):new Set();if(e.shiftKey&&ids.has(ship.id))ids.delete(ship.id);else ids.add(ship.id);setSelected(ids);};row.ondblclick=()=>renderer.focus(ship.x,ship.y);$('fleet-list').append(row);fleetDOM.set(ship.id,row);}
 row.classList.toggle('selected',selected.has(ship.id));row.classList.toggle('sinking',ship.status==='sinking');row.querySelector('strong').textContent=ship.name;row.querySelector('.class-label').textContent=ship.classData?.shortName||ship.classData?.name||ship.classId;row.querySelector('.order-label').textContent=ship.status==='sinking'?'Sinking':ship.manual?'Manual':orderNames[ship.order?.type]||'Auto';const ratio=Math.max(0,ship.hp/ship.maxHp);row.querySelector('.mini-hp i').style.width=`${100*ratio}%`;row.querySelector('.mini-hp i').classList.toggle('danger',ratio<.3);row.querySelector('.manual-dot').hidden=!ship.manual;
 }
}
function objectiveHTML(){return (game.state.objectives||[]).map(o=>`<div class="objective-card"><div><span>${escape(o.name)}</span><span class="owner-${o.owner}">${({blue:'Friendly',red:'Enemy',neutral:'Neutral'})[o.owner]||'Target'}</span></div>${o.maxHp?`<div class="mini-hp"><i style="width:${Math.max(0,o.hp/o.maxHp*100)}%"></i></div>`:''}<small>${o.capture?`Capture ${number(o.capture)}%`:`Position ${number(o.x)} / ${number(o.y)} km`}</small></div>`).join('');}
function getTarget(){return game.getVisibleShips('blue').find(s=>s.id===targetId)||game.getThreats('blue').find(p=>p.id===targetId)||game.state.objectives.find(o=>o.id===targetId);}
function targetHTML(){const t=getTarget();return t?`<div class="target-box"><small>DESIGNATED TARGET</small>${escape(t.name||WEAPONS[t.weaponId]?.name||'Air contact')}${t.status==='sinking'?' · Disabled':''}</div>`:'';}
function shipSpecs(s){const cd=s.classData||{};return `<div class="spec-grid"><div><span>Speed / maximum</span><b>${number((s.speed||0)/.000514444,1)} / ${number(cd.speed)} kn</b></div><div><span>Current order</span><b>${orderNames[s.order?.type]||'Autonomous'}</b></div><div><span>Radar / sonar</span><b>${number(s.radar)} / ${number(s.sonar)} km</b></div><div><span>Displacement</span><b>${cd.tonnage?Number(cd.tonnage).toLocaleString():'—'} t</b></div></div>`;}
function weaponsHTML(s){return `<div class="section-mini-title"><span>Fire control</span><span class="eyebrow">MANUAL FIRE</span></div><div class="weapons">${s.mounts.map(m=>{const w=WEAPONS[m.weaponId];if(!w)return '';const assessment=Math.max(0,(m.nextSalvoAt||0)-game.state.time);const cycle=w.engagementCycle?`<small class="weapon-cycle">${w.salvoSize||1}-round salvo · ${number(w.engagementCycle)} sim s cycle${assessment>0&&!(m.salvoRemaining>0)?`<br>Assessment ${Math.ceil(assessment)} sim s`:''}</small>`:'';return `<button class="weapon-button ${activeWeapon===m.weaponId?'active':''}" data-weapon="${m.weaponId}" ${m.ammo<=0||m.cooldown>0?'disabled':''}><span class="weapon-symbol">${weaponIcons[w.kind]||'⌖'}</span><div><strong>${escape(w.name)}</strong><small>${number(w.range,w.range<10?1:0)} km effective range${w.nominalRange&&w.nominalRange!==w.range?` (${number(w.nominalRange)} km nominal)`:''}<br>${m.ammo<=0?'Empty':m.cooldown>0?`${Math.ceil(m.cooldown)} sim s cooldown`:'Ready'}${w.kind==='aircraft'?` · airborne ${m.airborne||0}`:''}</small>${cycle}</div><span class="ammo">${m.ammo}<small>/ ${m.capacity}</small></span></button>`;}).join('')}</div><p class="weapon-hint">Select a weapon, then click a target to fire once. Right-click fires the selected weapon. Select incoming contacts for air defense. All weapon timers use simulation seconds.</p>`;}
function threatsHTML(ship){const threats=game.getThreats('blue').filter(p=>p.side!=='blue').sort((a,b)=>Math.hypot(a.x-ship.x,a.y-ship.y)-Math.hypot(b.x-ship.x,b.y-ship.y)).slice(0,4);return `<div class="section-mini-title" style="margin-top:17px"><span>Incoming contacts</span><span class="eyebrow">${threats.length?'TRACKING':'CLEAR'}</span></div>${threats.length?threats.map(t=>`<button class="threat-row" data-threat="${escape(t.id)}"><span>${escape(WEAPONS[t.weaponId]?.name||t.kind)}</span><span>${number(Math.hypot(t.x-ship.x,t.y-ship.y),1)} km ⌖</span></button>`).join(''):'<p class="field-note">No incoming ordnance detected.</p>'}`;}
function renderInspector(){if(inspectorHeld)return;const ships=selectionShips();let html,title;
 if(!ships.length){title='Theatre overview';const blue=game.state.ships.filter(s=>s.side==='blue'&&s.status==='active').length;const red=game.getVisibleShips('blue').filter(s=>s.side==='red'&&s.status==='active').length;html=`<p class="empty-intro">Read the theatre and assign orders. Drag to command a fleet, or select one vessel for full manual fire control.</p><div class="theatre-stats"><div class="stat-box"><b class="owner-blue">${blue}</b><small>FRIENDLY VESSELS</small></div><div class="stat-box"><b class="owner-red">${red}</b><small>DETECTED CONTACTS</small></div></div><div class="section-mini-title"><span>Mission objectives</span><span class="eyebrow">OBJECTIVES</span></div>${objectiveHTML()}<p class="field-note" style="margin-top:16px">${escape(MODES.find(m=>m.id===config.mode)?.description||'Defeat the opposing fleet.')}</p>`;
 }else if(ships.length===1){const s=ships[0];title='Vessel command';html=`<div class="ship-title">${shipIcon(s.classData?.role||s.classId)}<div><h3>${escape(s.name)}</h3><p>${escape(s.classData?.name||s.classId)}</p></div></div><div class="health-label"><span>Hull integrity</span><span>${number(Math.max(0,s.hp))} / ${s.maxHp}</span></div><div class="health-bar"><i style="width:${Math.max(0,100*s.hp/s.maxHp)}%;background:${s.hp/s.maxHp<.3?'var(--red)':'var(--cyan)'}"></i></div><div class="manual-notice"><strong>● FULL MANUAL CONTROL</strong>Automatic attack and interception are OFF. Clear your selection to restore autonomous control.</div>${shipSpecs(s)}${targetHTML()}${weaponsHTML(s)}${typeof game.setEmcon==='function'?`<button class="emcon-button ${s.emcon?'active':''}" data-emcon="${s.id}">Radio silence: ${s.emcon?'ON':'OFF'}</button>`:''}${threatsHTML(s)}`;
 }else{title='Fleet command';const hp=ships.reduce((a,s)=>a+s.hp,0),max=ships.reduce((a,s)=>a+s.maxHp,0);const classes={};for(const s of ships){const name=s.classData?.name||s.classId;classes[name]=(classes[name]||0)+1;}html=`<div class="ship-title">${shipIcon('carrier')}<div><h3>${ships.length} vessels selected</h3><p>Unified orders · Autonomous engagement</p></div></div><div class="health-label"><span>Fleet hull integrity</span><span>${number(hp/max*100)}%</span></div><div class="health-bar"><i style="width:${hp/max*100}%"></i></div><div class="spec-grid">${Object.entries(classes).map(([name,count])=>`<div><span>${escape(name)}</span><b>${count} ships</b></div>`).join('')}</div><p class="empty-intro">Right-click water to move in formation, or a detected enemy to concentrate fire. Each vessel selects weapons and intercepts threats autonomously.</p>${targetHTML()}<div class="section-mini-title" style="margin-top:19px"><span>Engagement policy</span></div><div class="stance-buttons">${[['balanced','Balanced'],['aggressive','Aggressive'],['conserve','Conserve']].map(([v,n])=>`<button data-stance="${v}" class="${ships.every(s=>s.stance===v)?'active':''}">${n}</button>`).join('')}</div><div class="section-mini-title" style="margin-top:20px"><span>Mission objectives</span></div>${objectiveHTML()}`;}
 $('inspector-title').textContent=title;
 // Preserve scroll position while combat values update.
 if(html!==lastInspectorSignature){const content=$('inspector-content');const scroll=content.scrollTop;const focused=document.activeElement;const focusKey=content.contains(focused)?['weapon','stance','emcon','threat'].find(k=>focused.dataset?.[k]):null;const focusValue=focusKey?focused.dataset[focusKey]:null;content.innerHTML=html;content.scrollTop=scroll;if(focusKey){const replacement=[...content.querySelectorAll(`[data-${focusKey}]`)].find(el=>el.dataset[focusKey]===focusValue);replacement?.focus({preventScroll:true});}lastInspectorSignature=html;}
}
$('inspector-content').addEventListener('pointerdown',()=>{inspectorHeld=true;});
window.addEventListener('pointerup',()=>requestAnimationFrame(()=>{inspectorHeld=false;}));
window.addEventListener('pointercancel',()=>{inspectorHeld=false;});
$('inspector-content').addEventListener('click',event=>{
 const weapon=event.target.closest('[data-weapon]');if(weapon){activeWeapon=activeWeapon===weapon.dataset.weapon?null:weapon.dataset.weapon;inputMode=activeWeapon?'fire':null;updateUI();return;}
 const stance=event.target.closest('[data-stance]');if(stance){game.setStance([...selected],stance.dataset.stance);updateUI();return;}
 const emcon=event.target.closest('[data-emcon]');if(emcon){const s=game.getShip(emcon.dataset.emcon);game.setEmcon([s.id],!s.emcon);updateUI();return;}
 const threat=event.target.closest('[data-threat]');if(threat){targetId=threat.dataset.threat;if(activeWeapon&&selected.size===1)fireTarget(targetId);else{toast('Contact designated. Select a SAM or close-in weapon.');updateUI();}}
});
function updateUI(){if(!game)return;let changed=false;for(const id of selected)if(game.getShip(id)?.status!=='active'){selected.delete(id);changed=true;}if(changed){game.setManualShip(selected.size===1?[...selected][0]:null);activeWeapon=null;inputMode=null;}
 $('sim-clock').textContent=fmtTime(game.state.time);updateOperationStage();updateFleet();renderInspector();
 const ships=selectionShips();$('selection-summary').innerHTML=ships.length?`<b>${ships.length===1?escape(ships[0].name):`${ships.length} vessels selected`}</b><small>${ships.length===1?'MANUAL · AUTO DEFENSE OFF':'AUTO ENGAGEMENT ENABLED'}</small>`:'<b>Fleet standing by</b><small>Click or drag to select friendly vessels</small>';
 for(const id of ['cmd-move','cmd-attack','cmd-stop','cmd-focus','formation'])$(id).disabled=!ships.length;
 $('cmd-move').classList.toggle('active',inputMode==='move');$('cmd-attack').classList.toggle('active',inputMode==='attack'||inputMode==='fire');
 $('targeting-banner').hidden=!inputMode;$('targeting-banner').textContent=inputMode==='fire'?`⌖ ${WEAPONS[activeWeapon]?.name||'Fire control'}: click a target to fire · Esc cancels`:inputMode==='move'?'↗ Click water to move · Esc cancels':'⌖ Click a detected target · Esc cancels';
 $('footer-status').textContent=game.state.result?'OPERATION COMPLETE':paused?'TACTICAL PAUSE':selected.size===1?'MANUAL VESSEL CONTROL':'COMMAND LINK ONLINE';
 const score=game.state.score||{};const objectiveText={encounter:'Reduce enemy combat strength by 75%',port_defense:'Protect your port until the attackers withdraw or time expires',port_assault:'Destroy the enemy port',island_control:`Accumulate ${number(game.config.captureTarget/60)} minutes of island control`,convoy:'Escort at least 60% of transports to extraction'};
 const mission=typeof game.getMissionStatus==='function'?game.getMissionStatus():{text:objectiveText[config.mode]||'Complete the mission objective',detail:config.mode==='island_control'?`BLUE ${fmtTime(score.blue||0)} · RED ${fmtTime(score.red||0)}`:'',remaining:Math.max(0,game.config.duration-game.state.time)};
 $('mission-strip').innerHTML=`<b>TASK</b><span>${escape(mission.text)}</span>${mission.detail?`<span class="mission-progress">${escape(mission.detail)}</span>`:''}<span class="mission-time">${fmtTime(mission.remaining)} remaining</span>`;
 const events=game.state.events.slice(-35).reverse();const signature=events.map(e=>`${e.time}|${e.text}`).join(';');if(signature!==previousEvents){$('event-feed').innerHTML=events.map(e=>`<div class="event-item ${e.side==='red'?'red':''}"><time>${fmtTime(e.time).slice(3)}</time><span>${escape(e.text)}</span></div>`).join('');previousEvents=signature;}
 if(game.state.result&&!resultShown){resultShown=true;setPaused(true);showResult();}
}

function fireTarget(target){const id=[...selected][0];if(!id||!activeWeapon)return toast('Select a vessel and a weapon first.','warn');if(typeof target==='string')targetId=target;const result=game.fireWeapon(id,activeWeapon,target);if(result?.ok){toast(`${WEAPONS[activeWeapon]?.name||'Weapon'} launched`);inputMode=null;}else toast(result?.reason||'Unable to fire at this target.','warn');updateUI();}
function targetAt(x,y){const ship=renderer.pick(x,y);if(ship&&ship.side==='red'&&ship.status==='active')return ship;const world=renderer.screenToWorld(x,y);const radius=Math.max(1,12/renderer.camera.zoom);const threats=game.getThreats('blue').filter(p=>p.side!=='blue');const objects=[...threats,...game.state.objectives.filter(o=>o.owner!=='blue')];return objects.filter(o=>Math.hypot(o.x-world.x,o.y-world.y)<=radius).sort((a,b)=>Math.hypot(a.x-world.x,a.y-world.y)-Math.hypot(b.x-world.x,b.y-world.y))[0]||null;}
function issueAt(x,y,forceMove=false){if(!selected.size){toast('Select friendly vessels first.','warn');return;}const target=forceMove?null:targetAt(x,y);if(target){targetId=target.id;if(selected.size===1){if(activeWeapon)fireTarget(targetId);else{toast('Target designated. Select a weapon to fire in manual control.','warn');updateUI();}}else{game.commandAttack([...selected],target.id);inputMode=null;toast('Fleet attack order issued.');updateUI();}}else{if(inputMode==='fire'){toast('Choose a detected enemy, hostile objective or incoming contact. Empty water is not a firing target.','warn');return;}if(inputMode==='attack'){toast('Choose a detected enemy, objective or incoming contact.','warn');return;}game.commandMove([...selected],renderer.screenToWorld(x,y),$('formation').value);inputMode=null;toast(`Move order issued to ${selected.size} vessels.`);updateUI();}}
function canvasPoint(event){const rect=canvas.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top};}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{if(!game||e.button>2)return;e.preventDefault();canvas.focus();const p=canvasPoint(e);pointer={...p,startX:p.x,startY:p.y,button:e.button,shift:e.shiftKey,panning:e.button===1||panKey,moved:false};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!renderer)return;const p=canvasPoint(e),world=renderer.screenToWorld(p.x,p.y);$('pointer-coordinates').textContent=`X ${number(world.x,1)} / Y ${number(world.y,1)} km`;
 if(pointer){const dx=p.x-pointer.x,dy=p.y-pointer.y;if(Math.hypot(p.x-pointer.startX,p.y-pointer.startY)>5)pointer.moved=true;if(pointer.button===2&&pointer.moved)pointer.panning=true;if(pointer.panning){renderer.camera.x-=dx/renderer.camera.zoom;renderer.camera.y-=dy/renderer.camera.zoom;}else if(pointer.button===0&&pointer.moved)selectionRect={x:Math.min(p.x,pointer.startX),y:Math.min(p.y,pointer.startY),w:Math.abs(p.x-pointer.startX),h:Math.abs(p.y-pointer.startY)};pointer.x=p.x;pointer.y=p.y;$('map-tooltip').hidden=true;}
 else{const ship=renderer.pick(p.x,p.y);hoverId=ship?.id||null;$('map-tooltip').hidden=!ship;if(ship){$('map-tooltip').innerHTML=`${escape(ship.name)}<small>${escape(ship.classData?.name||ship.classId)} · ${ship.side==='blue'?'Friendly':'Enemy'}${ship.side==='blue'?` · Hull ${number(Math.max(0,ship.hp/ship.maxHp*100))}%`:''}</small>`;$('map-tooltip').style.left=`${Math.min(p.x+16,canvas.clientWidth-195)}px`;$('map-tooltip').style.top=`${Math.min(p.y+16,canvas.clientHeight-65)}px`;}}
});
canvas.addEventListener('pointerup',e=>{if(!pointer)return;const p=canvasPoint(e),old=pointer;pointer=null;
 if(old.panning){selectionRect=null;return;}if(old.button===2){issueAt(p.x,p.y);return;}if(old.button!==0)return;
 if(selectionRect&&old.moved){const ids=old.shift?new Set(selected):new Set();for(const ship of game.state.ships){if(ship.side!=='blue'||ship.status!=='active')continue;const sp=renderer.worldToScreen(ship.x,ship.y);if(sp.x>=selectionRect.x&&sp.x<=selectionRect.x+selectionRect.w&&sp.y>=selectionRect.y&&sp.y<=selectionRect.y+selectionRect.h)ids.add(ship.id);}selectionRect=null;setSelected(ids);return;}
 selectionRect=null;if(inputMode){issueAt(p.x,p.y,inputMode==='move');return;}
 const ship=renderer.pick(p.x,p.y);if(ship?.side==='blue'){const ids=old.shift?new Set(selected):new Set();if(old.shift&&ids.has(ship.id))ids.delete(ship.id);else ids.add(ship.id);setSelected(ids);}else if(ship?.side==='red'){targetId=ship.id;updateUI();}else setSelected([]);
});
canvas.addEventListener('pointercancel',()=>{pointer=null;selectionRect=null;});
canvas.addEventListener('pointerleave',()=>{hoverId=null;$('map-tooltip').hidden=true;});
canvas.addEventListener('wheel',e=>{e.preventDefault();if(renderer){const p=canvasPoint(e);renderer.zoomAt(Math.exp(-Math.max(-200,Math.min(200,e.deltaY))*.0015),p.x,p.y);}},{passive:false});
$('minimap').onclick=e=>{if(renderer){const rect=$('minimap').getBoundingClientRect();const w=renderer.getMinimapWorld(e.clientX-rect.left,e.clientY-rect.top);renderer.focus(w.x,w.y);}};
window.addEventListener('resize',()=>renderer?.resize());
window.addEventListener('keydown',e=>{if(!game||$('battle').hidden||document.querySelector('dialog[open]')||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
 const key=e.key.toLowerCase();if(e.code==='Space'){e.preventDefault();if(!e.repeat&&!game.state.result)setPaused(!paused);return;}
 if(key==='escape'){inputMode=null;activeWeapon=null;setSelected([]);return;}
 if(e.ctrlKey&&key==='a'){e.preventDefault();$('select-all').click();return;}
 if(/^[1-9]$/.test(key)){e.preventDefault();if(e.ctrlKey){groups[key]=[...selected];toast(`Group ${key} stored (${selected.size} vessels)`);}else if(groups[key])setSelected(groups[key]);return;}
 if(key==='m')arm('move');else if(key==='a')$('cmd-attack').click();else if(key==='s')$('cmd-stop').click();else if(key==='f')focusSelection();else if(key==='v')$('toggle-sensors').click();else if(key==='r')$('toggle-ranges').click();else if(key==='l')$('toggle-labels').click();else if(key==='home'){e.preventDefault();renderer.fit();}else if(key==='shift')panKey=false;else if(['arrowup','arrowdown','arrowleft','arrowright'].includes(key)){e.preventDefault();const step=35/renderer.camera.zoom;renderer.camera.x+=key==='arrowright'?step:key==='arrowleft'?-step:0;renderer.camera.y+=key==='arrowdown'?step:key==='arrowup'?-step:0;}
});
window.addEventListener('blur',()=>{inspectorHeld=false;pointer=null;selectionRect=null;if(game&&!$('battle').hidden&&!game.state.result)setPaused(true);});

function openDialog(id){pausedBeforeDialog=paused;if(id==='menu-dialog')$('resume').textContent=pausedBeforeDialog?'Return to planning':'Resume operation';if(game&&!$('battle').hidden)setPaused(true);$(id).showModal();}
function closeDialog(id){$(id).close();if(game&&!game.state.result)setPaused(pausedBeforeDialog);}
for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>closeDialog(b.dataset.close);
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog(dialog.id);});
$('open-help-menu').onclick=()=>openDialog('help-dialog');$('battle-help').onclick=()=>openDialog('help-dialog');$('battle-menu').onclick=()=>openDialog('menu-dialog');$('resume').onclick=()=>closeDialog('menu-dialog');
function returnToMenu(){for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();setPaused(true);$('battle').hidden=true;$('briefing').hidden=false;initSetup();}
$('back-to-menu').onclick=returnToMenu;$('new-operation').onclick=returnToMenu;$('review-battle').onclick=()=>{$('result-dialog').close();};
function showResult(){const r=game.state.result;$('result-title').textContent=r.winner==='blue'?'Mission accomplished':r.winner==='red'?'Operation failed':'Operation concluded';$('result-symbol').textContent=r.winner==='blue'?'◇':r.winner==='red'?'△':'◎';$('result-symbol').style.color=r.winner==='blue'?'var(--cyan)':'var(--amber)';$('result-reason').textContent=r.reason;const own=game.state.ships.filter(s=>s.side==='blue');const enemies=game.state.ships.filter(s=>s.side==='red');$('result-stats').innerHTML=`<div><b>${own.filter(s=>s.status==='active').length}/${own.length}</b><span>FRIENDLY SURVIVORS</span></div><div><b>${enemies.filter(s=>s.status!=='active').length}</b><span>ENEMY LOSSES</span></div><div><b>${fmtTime(game.state.time)}</b><span>ELAPSED</span></div>`;$('result-dialog').showModal();}
function savePayload(){return {format:'pelagic-save',version:1,savedAt:new Date().toISOString(),snapshot:game.serialize(),ui:{speed,paused:document.querySelector('dialog[open]')?pausedBeforeDialog:paused,operationStarted,camera:{...renderer.camera},selected:[...selected]}};}
async function saveGame(exported=false){
 if(!game)return;
 const payload=savePayload();
 if(exported){const name=downloadCampaign(payload);$('save-status').textContent=`Downloaded: ${name}`;toast('Save downloaded as a JSON file.');}
 else{await saveCampaign(payload);$('save-status').textContent='Saved in this browser.';toast('Game saved in this browser. Download a backup to move it to another device.');}
}
async function restorePayload(payload){if(payload?.format!=='pelagic-save'||payload.version!==1||!payload.snapshot)throw new Error('Not a compatible PELAGIC save.');const restored=NavalGame.restore(payload.snapshot);if(!restored?.state?.ships||!restored.map)throw new Error('The save is incomplete.');startGame(restored,payload.ui);}
async function loadGame(){try{await restorePayload(await loadCampaign());}catch(error){if($('battle').hidden){$('load-menu').textContent=error.message;setTimeout(()=>$('load-menu').textContent='Load saved game ↗',6000);}else toast(error.message,'warn');}}
$('save-game').onclick=()=>saveGame().catch(e=>toast(e.message,'error'));$('export-game').onclick=()=>saveGame(true).catch(e=>toast(e.message,'error'));$('load-game').onclick=loadGame;$('load-menu').onclick=loadGame;$('import-game').onclick=()=>$('import-file').click();
$('import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>20*1024*1024)throw new Error('The save file is too large.');await restorePayload(JSON.parse(await file.text()));}catch(error){toast(`Load failed: ${error.message}`,'warn');}e.target.value='';};

function frame(now){try{const elapsed=frameLast?Math.min((now-frameLast)/1000,.1):0;frameLast=now;if(game&&!$('battle').hidden){if(!paused&&!game.state.result){game.update(elapsed*speed);}else if(game.state.result)game.update(elapsed);renderer.render({selectedIds:selected,selectionRect,showSensors,showLabels,showRanges,hoverId});if(now-uiLast>200){updateUI();uiLast=now;$('zoom-readout').textContent=`${number(renderer.camera.zoom,1)} px/km`;}
 fpsFrames++;if(now-fpsStart>1000){$('fps-readout').textContent=`${Math.round(fpsFrames*1000/(now-fpsStart))} FPS · BROWSER`;fpsFrames=0;fpsStart=now;}}
 }catch(error){setPaused(true);console.error(error);toast(`Simulation paused: ${error.message}`,'error');return;}requestAnimationFrame(frame);}
initSetup();requestAnimationFrame(frame);
// Small read-only diagnostics for local automated smoke checks.
window.__naval={get game(){return game;},get renderer(){return renderer;},get selected(){return [...selected];},get paused(){return paused;},get speed(){return speed;},get config(){return {...config};}};


