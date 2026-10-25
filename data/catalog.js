/** PELAGIC / NAVAL COMMAND: offline catalog. Distance: km; ship speed: knots; weapon speed: km/s; time: seconds. See docs/SOURCES.md. */
// Tier 1 is strongest; tier 5 is local coastal strength. All nations and equipment names are fictional.
// Port markers represent offshore anchorages; island objectives represent nearby landing or blockade waters.
export const ERAS = [
  {
    "id": "modern",
    "name": "Modern warfare",
    "description": "Late Cold War to modern technology: missiles, layered air defense, carrier aviation and submarine warfare."
  },
  {
    "id": "ww2",
    "name": "World War II",
    "description": "1939-1945 technology: naval artillery, straight-running torpedoes, propeller aircraft and early radar."
  }
];

export const FACTIONS = [
  {
    "id": "canglan",
    "name": "Azurean Federation",
    "description": "A major oceanic aviation force built around powerful carriers and complete escort groups.",
    "doctrine": "carrier",
    "tier": 1,
    "color": "#51c7dc",
    "tech": 1.25,
    "fleetScale": 1.4
  },
  {
    "id": "yaohai",
    "name": "Dawnreach League",
    "description": "Strong naval aviation favors reconnaissance and rapid maneuver over coastal numbers.",
    "doctrine": "carrier",
    "tier": 1,
    "color": "#82a8ff",
    "tech": 1.22,
    "fleetScale": 1.34
  },
  {
    "id": "xuanchao",
    "name": "Darktide Union",
    "description": "Large strike groups concentrate firepower; their WWII tradition favors heavy guns and torpedoes.",
    "doctrine": "missile",
    "tier": 1,
    "color": "#e8b46e",
    "tech": 1.2,
    "fleetScale": 1.38
  },
  {
    "id": "landun",
    "name": "Stormshield Republic",
    "description": "Balanced air defense, antisubmarine escorts and capital ships support several missions at once.",
    "doctrine": "balanced",
    "tier": 1,
    "color": "#b6a2ed",
    "tech": 1.21,
    "fleetScale": 1.3
  },
  {
    "id": "xingqiong",
    "name": "Astral Maritime State",
    "description": "Elite naval aviation receives priority, with strong protection for its carrier core.",
    "doctrine": "carrier",
    "tier": 1,
    "color": "#66cba2",
    "tech": 1.23,
    "fleetScale": 1.28
  },
  {
    "id": "shuangwan",
    "name": "Frosthaven Federation",
    "description": "Oceanic submarines lead the force while surface escorts secure their operating routes.",
    "doctrine": "submarine",
    "tier": 1,
    "color": "#8db7ca",
    "tech": 1.18,
    "fleetScale": 1.32
  },
  {
    "id": "chifan",
    "name": "Crimsonsail Commonwealth",
    "description": "Numerous launch platforms create opportunities for concentrated salvo attacks.",
    "doctrine": "missile",
    "tier": 1,
    "color": "#e98787",
    "tech": 1.16,
    "fleetScale": 1.36
  },
  {
    "id": "yunjia",
    "name": "Cloudcape Kingdom",
    "description": "A capital-ship tradition is supported by mature oceanic logistics and escort forces.",
    "doctrine": "balanced",
    "tier": 1,
    "color": "#a8bd72",
    "tech": 1.19,
    "fleetScale": 1.26
  },
  {
    "id": "bailu",
    "name": "Whiteheron Republic",
    "description": "Medium carrier groups protect trade routes through fighter and antisubmarine cooperation.",
    "doctrine": "carrier",
    "tier": 2,
    "color": "#d7a0c9",
    "tech": 1.16,
    "fleetScale": 1.22
  },
  {
    "id": "chenxi",
    "name": "Firstlight Federation",
    "description": "Multirole ships shift readily between coastal defense and ocean escort missions.",
    "doctrine": "balanced",
    "tier": 2,
    "color": "#87cad0",
    "tech": 1.14,
    "fleetScale": 1.2
  },
  {
    "id": "cangfeng",
    "name": "Steelwind Alliance",
    "description": "Fast destroyers and heavy antiship weapons form the offensive core.",
    "doctrine": "missile",
    "tier": 2,
    "color": "#c7c3a1",
    "tech": 1.13,
    "fleetScale": 1.24
  },
  {
    "id": "jinlu",
    "name": "Goldmist Duchy",
    "description": "A compact, advanced force uses island chains and coastal cover to its advantage.",
    "doctrine": "littoral",
    "tier": 2,
    "color": "#b295da",
    "tech": 1.18,
    "fleetScale": 1.08
  },
  {
    "id": "shenlan",
    "name": "Deepgale Federation",
    "description": "Elite submarines and dedicated antisubmarine frigates emphasize blockade and ambush.",
    "doctrine": "submarine",
    "tier": 2,
    "color": "#9ac9a5",
    "tech": 1.15,
    "fleetScale": 1.18
  },
  {
    "id": "yinsha",
    "name": "Silversand Republic",
    "description": "Escort destroyers support substantial replenishment and amphibious transport forces.",
    "doctrine": "balanced",
    "tier": 2,
    "color": "#d7aa82",
    "tech": 1.12,
    "fleetScale": 1.16
  },
  {
    "id": "hailin",
    "name": "Wintersea Commonwealth",
    "description": "Widely dispersed submarines rely on surface ships for air cover and contact confirmation.",
    "doctrine": "submarine",
    "tier": 2,
    "color": "#9fb3e3",
    "tech": 1.1,
    "fleetScale": 1.23
  },
  {
    "id": "feiyu",
    "name": "Scarletwing Kingdom",
    "description": "Medium carriers provide air support within compact escort formations.",
    "doctrine": "carrier",
    "tier": 2,
    "color": "#dca2a0",
    "tech": 1.14,
    "fleetScale": 1.14
  },
  {
    "id": "xinglan",
    "name": "Starcrest Republic",
    "description": "A few advanced strike ships prioritize accurate opening attacks.",
    "doctrine": "missile",
    "tier": 2,
    "color": "#51c7dc",
    "tech": 1.17,
    "fleetScale": 1.1
  },
  {
    "id": "yuegang",
    "name": "Moonharbor Federation",
    "description": "Busy harbors and numerous light combatants favor port defense and short sorties.",
    "doctrine": "littoral",
    "tier": 2,
    "color": "#82a8ff",
    "tech": 1.09,
    "fleetScale": 1.21
  },
  {
    "id": "leijia",
    "name": "Thundercape Alliance",
    "description": "Firepower and magazine depth take priority; numbers offset weaker sensors.",
    "doctrine": "missile",
    "tier": 2,
    "color": "#e8b46e",
    "tech": 1.08,
    "fleetScale": 1.25
  },
  {
    "id": "wuhai",
    "name": "Mistsea Free State",
    "description": "Covert submarine operations are supported by patrol ships guarding their approaches.",
    "doctrine": "submarine",
    "tier": 2,
    "color": "#b6a2ed",
    "tech": 1.12,
    "fleetScale": 1.12
  },
  {
    "id": "qingtao",
    "name": "Clearwave Republic",
    "description": "A complete escort fleet uses a few heavier ships for command and fire support.",
    "doctrine": "balanced",
    "tier": 3,
    "color": "#66cba2",
    "tech": 1.07,
    "fleetScale": 1.1
  },
  {
    "id": "liuguang",
    "name": "Glimmer Kingdom",
    "description": "Light carriers provide limited air cover and must remain with their frigate screen.",
    "doctrine": "carrier",
    "tier": 3,
    "color": "#8db7ca",
    "tech": 1.08,
    "fleetScale": 1.04
  },
  {
    "id": "wujiao",
    "name": "Blackreef Federation",
    "description": "Numerous missile boats and patrol craft exploit broken coastlines to close the range.",
    "doctrine": "littoral",
    "tier": 3,
    "color": "#e98787",
    "tech": 1.01,
    "fleetScale": 1.14
  },
  {
    "id": "hanxing",
    "name": "Coldstar Republic",
    "description": "Conventional submarines maintain an underwater presence in narrow straits.",
    "doctrine": "submarine",
    "tier": 3,
    "color": "#a8bd72",
    "tech": 1.06,
    "fleetScale": 1.08
  },
  {
    "id": "chenhu",
    "name": "Amberdeep League",
    "description": "Regional strike forces share a tradition of missile salvos and WWII torpedo attacks.",
    "doctrine": "missile",
    "tier": 3,
    "color": "#d7a0c9",
    "tech": 1.02,
    "fleetScale": 1.12
  },
  {
    "id": "longwan",
    "name": "Opalbay Duchy",
    "description": "A smaller, well-maintained fleet values capable sensors and escort survival.",
    "doctrine": "balanced",
    "tier": 3,
    "color": "#87cad0",
    "tech": 1.09,
    "fleetScale": 0.99
  },
  {
    "id": "luoxing",
    "name": "Starfall Maritime State",
    "description": "Light frigates maintain the watch while fast craft intercept between islands.",
    "doctrine": "littoral",
    "tier": 3,
    "color": "#c7c3a1",
    "tech": 1.04,
    "fleetScale": 1.07
  },
  {
    "id": "qingsha",
    "name": "Greensand Federation",
    "description": "Numerous general-purpose escorts defend an extensive coastline.",
    "doctrine": "balanced",
    "tier": 3,
    "color": "#b295da",
    "tech": 1,
    "fleetScale": 1.16
  },
  {
    "id": "yinfeng",
    "name": "Silverleaf Republic",
    "description": "Quiet submarines and antisubmarine search take precedence over surface firepower.",
    "doctrine": "submarine",
    "tier": 3,
    "color": "#9ac9a5",
    "tech": 1.08,
    "fleetScale": 1.02
  },
  {
    "id": "chiyue",
    "name": "Redmoon Commonwealth",
    "description": "Older ships receive firepower upgrades for concentrated attacks at closer range.",
    "doctrine": "missile",
    "tier": 3,
    "color": "#d7aa82",
    "tech": 0.99,
    "fleetScale": 1.15
  },
  {
    "id": "zhenhai",
    "name": "Crownsea Alliance",
    "description": "Limited naval aviation supports amphibious transports in offshore island operations.",
    "doctrine": "carrier",
    "tier": 3,
    "color": "#9fb3e3",
    "tech": 1.05,
    "fleetScale": 1.06
  },
  {
    "id": "suyun",
    "name": "Palewind Republic",
    "description": "A balanced regional navy protects supply routes and maintains maritime patrols.",
    "doctrine": "balanced",
    "tier": 3,
    "color": "#dca2a0",
    "tech": 1.03,
    "fleetScale": 1.09
  },
  {
    "id": "mowan",
    "name": "Inkbay Federation",
    "description": "A substantial submarine force needs coordinated searches to overcome ordinary sensors.",
    "doctrine": "submarine",
    "tier": 3,
    "color": "#51c7dc",
    "tech": 0.98,
    "fleetScale": 1.13
  },
  {
    "id": "honglan",
    "name": "Prism Isles Union",
    "description": "An efficient light fleet favors dispersed patrols and rapid concentration.",
    "doctrine": "littoral",
    "tier": 3,
    "color": "#82a8ff",
    "tech": 1.06,
    "fleetScale": 1
  },
  {
    "id": "tongchao",
    "name": "Bronzetide Republic",
    "description": "Numerous small launch platforms deliver dense salvos but have limited air-defense endurance.",
    "doctrine": "missile",
    "tier": 3,
    "color": "#e8b46e",
    "tech": 0.97,
    "fleetScale": 1.17
  },
  {
    "id": "qinghui",
    "name": "Brightwater Duchy",
    "description": "Small aviation platforms provide reconnaissance and support while conserving aircraft.",
    "doctrine": "carrier",
    "tier": 3,
    "color": "#b6a2ed",
    "tech": 1.02,
    "fleetScale": 1.01
  },
  {
    "id": "qinghe",
    "name": "Reedshore State",
    "description": "Economical frigates and older destroyers conduct coastal escort duties.",
    "doctrine": "balanced",
    "tier": 4,
    "color": "#66cba2",
    "tech": 0.95,
    "fleetScale": 0.98
  },
  {
    "id": "shiqiao",
    "name": "Stonebridge Republic",
    "description": "Harbors and straits receive priority; small combatants provide a numerical advantage.",
    "doctrine": "littoral",
    "tier": 4,
    "color": "#8db7ca",
    "tech": 0.91,
    "fleetScale": 1
  },
  {
    "id": "lanyu",
    "name": "Gale Isles League",
    "description": "Advanced light ships use island cover for brief, deliberate engagements.",
    "doctrine": "littoral",
    "tier": 4,
    "color": "#e98787",
    "tech": 0.97,
    "fleetScale": 0.9
  },
  {
    "id": "wuxia",
    "name": "Misthaven Duchy",
    "description": "A few conventional submarines cooperate with escorts to deny passage through straits.",
    "doctrine": "submarine",
    "tier": 4,
    "color": "#a8bd72",
    "tech": 0.94,
    "fleetScale": 0.94
  },
  {
    "id": "shuangye",
    "name": "Frostleaf Republic",
    "description": "Older equipment is offset by greater numbers and steady escort formations.",
    "doctrine": "balanced",
    "tier": 4,
    "color": "#d7a0c9",
    "tech": 0.9,
    "fleetScale": 1.02
  },
  {
    "id": "yuzhu",
    "name": "Rainreed Free State",
    "description": "Patrol vessels and light antisubmarine ships concentrate on coastal security.",
    "doctrine": "littoral",
    "tier": 4,
    "color": "#87cad0",
    "tech": 0.96,
    "fleetScale": 0.89
  },
  {
    "id": "lantie",
    "name": "Blueiron Alliance",
    "description": "Small strike ships expend limited heavy weapons before falling back on naval guns.",
    "doctrine": "missile",
    "tier": 4,
    "color": "#c7c3a1",
    "tech": 0.92,
    "fleetScale": 0.99
  },
  {
    "id": "haimian",
    "name": "Seafleece Isles",
    "description": "Small aviation support platforms operate with escorts and limited sortie reserves.",
    "doctrine": "carrier",
    "tier": 4,
    "color": "#b295da",
    "tech": 0.93,
    "fleetScale": 0.92
  },
  {
    "id": "shaqiu",
    "name": "Dunesea State",
    "description": "Coastal patrol and transport escort dominate a fleet retaining some older combatants.",
    "doctrine": "balanced",
    "tier": 4,
    "color": "#9ac9a5",
    "tech": 0.89,
    "fleetScale": 1.03
  },
  {
    "id": "hanlu",
    "name": "Coldmist Republic",
    "description": "Coastal submarines wait in ambush while surface units search the outer approaches.",
    "doctrine": "submarine",
    "tier": 4,
    "color": "#d7aa82",
    "tech": 0.95,
    "fleetScale": 0.91
  },
  {
    "id": "yuelan",
    "name": "Moonwind Duchy",
    "description": "Few platforms but capable sensors favor careful deployment along key passages.",
    "doctrine": "littoral",
    "tier": 4,
    "color": "#9fb3e3",
    "tech": 0.98,
    "fleetScale": 0.86
  },
  {
    "id": "chijing",
    "name": "Redcrystal League",
    "description": "Light-ship firepower comes first; numbers and maneuver matter after magazines run low.",
    "doctrine": "missile",
    "tier": 4,
    "color": "#dca2a0",
    "tech": 0.88,
    "fleetScale": 1.04
  },
  {
    "id": "pingchao",
    "name": "Stilltide Federation",
    "description": "A practical coastal escort force balances port defense with transport protection.",
    "doctrine": "balanced",
    "tier": 4,
    "color": "#51c7dc",
    "tech": 0.94,
    "fleetScale": 0.93
  },
  {
    "id": "wuse",
    "name": "Fivecolors Maritime State",
    "description": "Dispersed fast craft and light frigates can gather quickly to defend island harbors.",
    "doctrine": "littoral",
    "tier": 4,
    "color": "#82a8ff",
    "tech": 0.9,
    "fleetScale": 0.97
  },
  {
    "id": "shengwan",
    "name": "Reedbay Republic",
    "description": "Conventional submarines provide deterrence through concealment and disciplined torpedo use.",
    "doctrine": "submarine",
    "tier": 4,
    "color": "#e8b46e",
    "tech": 0.92,
    "fleetScale": 0.95
  },
  {
    "id": "zilan",
    "name": "Violet Isles Union",
    "description": "Small aviation platforms support island transport and require close escort protection.",
    "doctrine": "carrier",
    "tier": 4,
    "color": "#b6a2ed",
    "tech": 0.91,
    "fleetScale": 0.9
  },
  {
    "id": "ludeng",
    "name": "Staglight Duchy",
    "description": "A light patrol fleet defends one harbor region using the coast to shorten its front.",
    "doctrine": "littoral",
    "tier": 5,
    "color": "#66cba2",
    "tech": 0.84,
    "fleetScale": 0.82
  },
  {
    "id": "baimo",
    "name": "Whitefoam Free State",
    "description": "Older frigates form the core of a force supported by a few patrol craft.",
    "doctrine": "balanced",
    "tier": 5,
    "color": "#8db7ca",
    "tech": 0.82,
    "fleetScale": 0.86
  },
  {
    "id": "xingsha",
    "name": "Starsand Isles",
    "description": "A small, capable patrol force emphasizes maneuver and early warning.",
    "doctrine": "littoral",
    "tier": 5,
    "color": "#e98787",
    "tech": 0.87,
    "fleetScale": 0.76
  },
  {
    "id": "heiqi",
    "name": "Blackstone State",
    "description": "A few old submarines and light ships defend their bay with basic antisubmarine equipment.",
    "doctrine": "submarine",
    "tier": 5,
    "color": "#a8bd72",
    "tech": 0.79,
    "fleetScale": 0.88
  },
  {
    "id": "chilu",
    "name": "Redreed Republic",
    "description": "Scarce resources go into light strike craft, leaving sustained air defense weak.",
    "doctrine": "missile",
    "tier": 5,
    "color": "#d7a0c9",
    "tech": 0.8,
    "fleetScale": 0.85
  },
  {
    "id": "qianwan",
    "name": "Shallowbay Duchy",
    "description": "A compact harbor patrol force lacks capital ships and sustained oceanic reach.",
    "doctrine": "littoral",
    "tier": 5,
    "color": "#87cad0",
    "tech": 0.85,
    "fleetScale": 0.73
  },
  {
    "id": "lingxi",
    "name": "Belltide Free State",
    "description": "Escorts, patrols and transports protect short supply routes.",
    "doctrine": "balanced",
    "tier": 5,
    "color": "#c7c3a1",
    "tech": 0.81,
    "fleetScale": 0.8
  },
  {
    "id": "liuyan",
    "name": "Glassrock Isles",
    "description": "Light fast craft dispersed among islands can concentrate against local threats.",
    "doctrine": "littoral",
    "tier": 5,
    "color": "#b295da",
    "tech": 0.83,
    "fleetScale": 0.78
  },
  {
    "id": "muchen",
    "name": "Duskmere Republic",
    "description": "Older submarines conduct ambushes with limited surface support and electronics.",
    "doctrine": "submarine",
    "tier": 5,
    "color": "#9ac9a5",
    "tech": 0.76,
    "fleetScale": 0.84
  },
  {
    "id": "yunling",
    "name": "Cloudbell State",
    "description": "A small local fleet relies on escorts to share offensive and defensive duties.",
    "doctrine": "balanced",
    "tier": 5,
    "color": "#d7aa82",
    "tech": 0.78,
    "fleetScale": 0.75
  },
  {
    "id": "qinglu",
    "name": "Greendew Duchy",
    "description": "Limited patrol forces must conserve ammunition and avoid a capital-ship battle.",
    "doctrine": "littoral",
    "tier": 5,
    "color": "#9fb3e3",
    "tech": 0.74,
    "fleetScale": 0.7
  },
  {
    "id": "wanying",
    "name": "Eveninglight Free State",
    "description": "The smallest coastal guard relies on sheltered harbors, small craft and a few escorts.",
    "doctrine": "littoral",
    "tier": 5,
    "color": "#dca2a0",
    "tech": 0.7,
    "fleetScale": 0.65
  }
];

export const MODES = [
  {
    "id": "encounter",
    "name": "Encounter",
    "description": "Find and defeat the hostile fleet while coordinating escorts, ammunition and shared contacts."
  },
  {
    "id": "port_defense",
    "name": "Port defense",
    "description": "Protect your harbor against incoming ships and air strikes."
  },
  {
    "id": "port_assault",
    "name": "Port strike",
    "description": "Break through the naval screen and neutralize the hostile harbor."
  },
  {
    "id": "island_control",
    "name": "Island control",
    "description": "Hold neutral control zones and prevent the enemy from retaking them."
  },
  {
    "id": "convoy",
    "name": "Convoy escort",
    "description": "Escort transports through the battle area while avoiding the enemy main force."
  }
];

export const WEAPONS = {
  "asm_standard": {
    "id": "asm_standard",
    "name": "Seaspear antiship missile",
    "kind": "missile",
    "range": 130,
    "minRange": 4,
    "speed": 0.26,
    "damage": 340,
    "cooldown": 4,
    "accuracy": 0.78,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 8,
    "era": "modern",
    "salvoSize": 2,
    "salvoInterval": 4,
    "engagementCycle": 150,
    "roundsPerShot": 1
  },
  "asm_stealth": {
    "id": "asm_stealth",
    "name": "Shadowhawk antiship missile",
    "kind": "missile",
    "range": 220,
    "minRange": 6,
    "speed": 0.27,
    "damage": 360,
    "cooldown": 4,
    "accuracy": 0.88,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 12,
    "era": "modern",
    "salvoSize": 2,
    "salvoInterval": 4,
    "engagementCycle": 180,
    "roundsPerShot": 1
  },
  "asm_heavy": {
    "id": "asm_heavy",
    "name": "Thunderhead antiship missile",
    "kind": "missile",
    "range": 180,
    "minRange": 8,
    "speed": 0.72,
    "damage": 490,
    "cooldown": 6,
    "accuracy": 0.76,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 15,
    "era": "modern",
    "salvoSize": 2,
    "salvoInterval": 6,
    "engagementCycle": 180,
    "roundsPerShot": 1
  },
  "asm_coastal": {
    "id": "asm_coastal",
    "name": "Reeffang light missile",
    "kind": "missile",
    "range": 80,
    "minRange": 2,
    "speed": 0.25,
    "damage": 240,
    "cooldown": 5,
    "accuracy": 0.73,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 6,
    "era": "modern",
    "salvoSize": 2,
    "salvoInterval": 5,
    "engagementCycle": 150,
    "roundsPerShot": 1
  },
  "land_attack": {
    "id": "land_attack",
    "name": "Fartide land-attack missile",
    "kind": "missile",
    "range": 300,
    "minRange": 10,
    "speed": 0.24,
    "damage": 480,
    "cooldown": 6,
    "accuracy": 0.87,
    "targets": [
      "objective"
    ],
    "cost": 15,
    "era": "modern",
    "salvoSize": 1,
    "salvoInterval": 6,
    "engagementCycle": 210,
    "roundsPerShot": 1
  },
  "sam_long": {
    "id": "sam_long",
    "name": "Skyguard area-defense SAM",
    "kind": "sam",
    "range": 140,
    "minRange": 3,
    "speed": 1.02,
    "damage": 110,
    "cooldown": 5,
    "accuracy": 0.78,
    "targets": [
      "air",
      "projectile"
    ],
    "cost": 5,
    "era": "modern"
  },
  "sam_medium": {
    "id": "sam_medium",
    "name": "Cloudshield medium SAM",
    "kind": "sam",
    "range": 45,
    "minRange": 0.8,
    "speed": 0.95,
    "damage": 90,
    "cooldown": 4,
    "accuracy": 0.81,
    "targets": [
      "air",
      "projectile"
    ],
    "cost": 3,
    "era": "modern"
  },
  "sam_short": {
    "id": "sam_short",
    "name": "Swift point-defense SAM",
    "kind": "sam",
    "range": 10,
    "minRange": 0.25,
    "speed": 0.8,
    "damage": 70,
    "cooldown": 3,
    "accuracy": 0.79,
    "targets": [
      "air",
      "projectile"
    ],
    "cost": 2,
    "era": "modern"
  },
  "ciws_20": {
    "id": "ciws_20",
    "name": "20 mm CIWS burst",
    "kind": "ciws",
    "range": 1.8,
    "minRange": 0,
    "speed": 1.05,
    "damage": 36,
    "cooldown": 1.4,
    "accuracy": 0.65,
    "targets": [
      "air",
      "projectile"
    ],
    "cost": 0.15,
    "era": "modern"
  },
  "ciws_30": {
    "id": "ciws_30",
    "name": "30 mm CIWS burst",
    "kind": "ciws",
    "range": 2.4,
    "minRange": 0,
    "speed": 0.96,
    "damage": 44,
    "cooldown": 1.7,
    "accuracy": 0.68,
    "targets": [
      "air",
      "projectile"
    ],
    "cost": 0.2,
    "era": "modern"
  },
  "gun_127": {
    "id": "gun_127",
    "name": "127 mm automatic gun",
    "kind": "gun",
    "range": 16,
    "minRange": 0.4,
    "speed": 0.62,
    "damage": 38,
    "cooldown": 6,
    "accuracy": 0.73,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 0.18,
    "era": "modern",
    "nominalRange": 24,
    "roundsPerShot": 1
  },
  "gun_76": {
    "id": "gun_76",
    "name": "76 mm rapid-fire gun",
    "kind": "gun",
    "range": 9,
    "minRange": 0.15,
    "speed": 0.72,
    "damage": 18,
    "cooldown": 2,
    "accuracy": 0.7,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 0.08,
    "era": "modern",
    "nominalRange": 16,
    "roundsPerShot": 1
  },
  "gun_57": {
    "id": "gun_57",
    "name": "57 mm light naval gun",
    "kind": "gun",
    "range": 6,
    "minRange": 0.1,
    "speed": 0.75,
    "damage": 11,
    "cooldown": 1.5,
    "accuracy": 0.68,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 0.04,
    "era": "modern",
    "nominalRange": 9,
    "roundsPerShot": 1
  },
  "gun_406_refit": {
    "id": "gun_406_refit",
    "name": "406 mm retained main gun",
    "kind": "gun",
    "range": 28,
    "minRange": 2,
    "speed": 0.63,
    "damage": 170,
    "cooldown": 35,
    "accuracy": 0.66,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 0.7,
    "era": "modern",
    "nominalRange": 38,
    "roundsPerShot": 1
  },
  "torpedo_heavy": {
    "id": "torpedo_heavy",
    "name": "Deepcurrent heavy torpedo",
    "kind": "torpedo",
    "range": 32,
    "minRange": 0.6,
    "speed": 0.0283,
    "damage": 620,
    "cooldown": 10,
    "accuracy": 0.81,
    "targets": [
      "surface",
      "submarine"
    ],
    "cost": 9,
    "era": "modern",
    "salvoSize": 2,
    "salvoInterval": 10,
    "engagementCycle": 210,
    "roundsPerShot": 1
  },
  "torpedo_light": {
    "id": "torpedo_light",
    "name": "Silverdart ASW torpedo",
    "kind": "torpedo",
    "range": 11,
    "minRange": 0.35,
    "speed": 0.0237,
    "damage": 290,
    "cooldown": 8,
    "accuracy": 0.74,
    "targets": [
      "submarine"
    ],
    "cost": 4,
    "era": "modern",
    "salvoSize": 1,
    "salvoInterval": 8,
    "engagementCycle": 180,
    "roundsPerShot": 1
  },
  "torpedo_coastal": {
    "id": "torpedo_coastal",
    "name": "Bayshadow torpedo",
    "kind": "torpedo",
    "range": 18,
    "minRange": 0.4,
    "speed": 0.0257,
    "damage": 480,
    "cooldown": 12,
    "accuracy": 0.73,
    "targets": [
      "surface",
      "submarine"
    ],
    "cost": 6,
    "era": "modern",
    "salvoSize": 2,
    "salvoInterval": 12,
    "engagementCycle": 240,
    "roundsPerShot": 1
  },
  "depthcharge_modern": {
    "id": "depthcharge_modern",
    "name": "Short-range depth charge",
    "kind": "depthcharge",
    "range": 0.9,
    "minRange": 0,
    "speed": 0.012,
    "damage": 230,
    "cooldown": 18,
    "accuracy": 0.56,
    "targets": [
      "submarine"
    ],
    "cost": 0.6,
    "era": "modern"
  },
  "air_strike": {
    "id": "air_strike",
    "name": "Carrier strike jet",
    "kind": "aircraft",
    "range": 240,
    "minRange": 1,
    "speed": 0.23,
    "damage": 310,
    "cooldown": 30,
    "accuracy": 0.78,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 5,
    "era": "modern",
    "salvoSize": 2,
    "salvoInterval": 30,
    "engagementCycle": 180
  },
  "air_fighter": {
    "id": "air_fighter",
    "name": "Carrier fighter jet",
    "kind": "aircraft",
    "range": 220,
    "minRange": 0,
    "speed": 0.25,
    "damage": 100,
    "cooldown": 30,
    "accuracy": 0.78,
    "targets": [
      "air"
    ],
    "cost": 4,
    "era": "modern",
    "salvoSize": 2,
    "salvoInterval": 30,
    "engagementCycle": 180
  },
  "air_asw": {
    "id": "air_asw",
    "name": "ASW helicopter",
    "kind": "aircraft",
    "range": 70,
    "minRange": 0,
    "speed": 0.065,
    "damage": 260,
    "cooldown": 60,
    "accuracy": 0.72,
    "targets": [
      "submarine"
    ],
    "cost": 3,
    "era": "modern",
    "salvoSize": 1,
    "salvoInterval": 60,
    "engagementCycle": 180
  },
  "ww2_gun_406": {
    "id": "ww2_gun_406",
    "name": "406 mm heavy naval gun",
    "kind": "gun",
    "range": 24,
    "minRange": 2,
    "speed": 0.62,
    "damage": 170,
    "cooldown": 40,
    "accuracy": 0.56,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 0.7,
    "era": "ww2",
    "nominalRange": 38,
    "roundsPerShot": 1
  },
  "ww2_gun_356": {
    "id": "ww2_gun_356",
    "name": "356 mm main battery",
    "kind": "gun",
    "range": 22,
    "minRange": 1.6,
    "speed": 0.6,
    "damage": 135,
    "cooldown": 45,
    "accuracy": 0.54,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 0.6,
    "era": "ww2",
    "nominalRange": 32,
    "roundsPerShot": 1
  },
  "ww2_gun_203": {
    "id": "ww2_gun_203",
    "name": "203 mm cruiser gun",
    "kind": "gun",
    "range": 18,
    "minRange": 0.9,
    "speed": 0.66,
    "damage": 72,
    "cooldown": 16,
    "accuracy": 0.58,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 0.3,
    "era": "ww2",
    "nominalRange": 28,
    "roundsPerShot": 1
  },
  "ww2_gun_152": {
    "id": "ww2_gun_152",
    "name": "152 mm cruiser gun",
    "kind": "gun",
    "range": 14,
    "minRange": 0.5,
    "speed": 0.66,
    "damage": 43,
    "cooldown": 10,
    "accuracy": 0.61,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 0.2,
    "era": "ww2",
    "nominalRange": 22,
    "roundsPerShot": 1
  },
  "ww2_gun_127": {
    "id": "ww2_gun_127",
    "name": "127 mm dual-purpose gun",
    "kind": "gun",
    "range": 10,
    "minRange": 0.25,
    "speed": 0.58,
    "damage": 27,
    "cooldown": 6,
    "accuracy": 0.6,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 0.13,
    "era": "ww2",
    "nominalRange": 16,
    "roundsPerShot": 1
  },
  "ww2_gun_102": {
    "id": "ww2_gun_102",
    "name": "102 mm escort gun",
    "kind": "gun",
    "range": 8,
    "minRange": 0.2,
    "speed": 0.55,
    "damage": 22,
    "cooldown": 8,
    "accuracy": 0.55,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 0.1,
    "era": "ww2",
    "nominalRange": 12,
    "roundsPerShot": 1
  },
  "ww2_aa_127": {
    "id": "ww2_aa_127",
    "name": "127 mm AA battery",
    "kind": "aa",
    "range": 7,
    "minRange": 0.2,
    "speed": 0.62,
    "damage": 55,
    "cooldown": 5,
    "accuracy": 0.42,
    "targets": [
      "air"
    ],
    "cost": 0.2,
    "era": "ww2"
  },
  "ww2_aa_40": {
    "id": "ww2_aa_40",
    "name": "40 mm AA burst",
    "kind": "aa",
    "range": 3.5,
    "minRange": 0,
    "speed": 0.84,
    "damage": 28,
    "cooldown": 1.8,
    "accuracy": 0.48,
    "targets": [
      "air"
    ],
    "cost": 0.08,
    "era": "ww2"
  },
  "ww2_aa_20": {
    "id": "ww2_aa_20",
    "name": "20 mm AA burst",
    "kind": "aa",
    "range": 1.3,
    "minRange": 0,
    "speed": 0.8,
    "damage": 15,
    "cooldown": 1.2,
    "accuracy": 0.4,
    "targets": [
      "air"
    ],
    "cost": 0.04,
    "era": "ww2"
  },
  "ww2_torpedo": {
    "id": "ww2_torpedo",
    "name": "533 mm straight torpedo",
    "kind": "torpedo",
    "range": 5.5,
    "minRange": 0.4,
    "speed": 0.02315,
    "damage": 530,
    "cooldown": 8,
    "accuracy": 0.54,
    "targets": [
      "surface"
    ],
    "cost": 5,
    "era": "ww2",
    "salvoSize": 2,
    "salvoInterval": 8,
    "engagementCycle": 180,
    "roundsPerShot": 1
  },
  "ww2_torpedo_long": {
    "id": "ww2_torpedo_long",
    "name": "Long-range straight torpedo",
    "kind": "torpedo",
    "range": 18,
    "minRange": 0.6,
    "speed": 0.0252,
    "damage": 670,
    "cooldown": 10,
    "accuracy": 0.57,
    "targets": [
      "surface"
    ],
    "cost": 8,
    "era": "ww2",
    "salvoSize": 2,
    "salvoInterval": 10,
    "engagementCycle": 210,
    "roundsPerShot": 1
  },
  "ww2_torpedo_sub": {
    "id": "ww2_torpedo_sub",
    "name": "Submarine straight torpedo",
    "kind": "torpedo",
    "range": 8,
    "minRange": 0.4,
    "speed": 0.0216,
    "damage": 560,
    "cooldown": 12,
    "accuracy": 0.6,
    "targets": [
      "surface"
    ],
    "cost": 6,
    "era": "ww2",
    "salvoSize": 2,
    "salvoInterval": 12,
    "engagementCycle": 240,
    "roundsPerShot": 1
  },
  "ww2_depthcharge": {
    "id": "ww2_depthcharge",
    "name": "Stern depth charge",
    "kind": "depthcharge",
    "range": 0.45,
    "minRange": 0,
    "speed": 0.009,
    "damage": 240,
    "cooldown": 10,
    "accuracy": 0.44,
    "targets": [
      "submarine"
    ],
    "cost": 0.25,
    "era": "ww2"
  },
  "ww2_depthcharge_ahead": {
    "id": "ww2_depthcharge_ahead",
    "name": "Ahead-throwing ASW mortar",
    "kind": "depthcharge",
    "range": 0.8,
    "minRange": 0,
    "speed": 0.045,
    "damage": 190,
    "cooldown": 20,
    "accuracy": 0.57,
    "targets": [
      "submarine"
    ],
    "cost": 0.4,
    "era": "ww2"
  },
  "ww2_air_strike": {
    "id": "ww2_air_strike",
    "name": "Carrier strike aircraft",
    "kind": "aircraft",
    "range": 180,
    "minRange": 0.5,
    "speed": 0.115,
    "damage": 220,
    "cooldown": 45,
    "accuracy": 0.62,
    "targets": [
      "surface",
      "objective"
    ],
    "cost": 3,
    "era": "ww2",
    "salvoSize": 2,
    "salvoInterval": 45,
    "engagementCycle": 240
  },
  "ww2_air_fighter": {
    "id": "ww2_air_fighter",
    "name": "Carrier fighter aircraft",
    "kind": "aircraft",
    "range": 180,
    "minRange": 0,
    "speed": 0.145,
    "damage": 70,
    "cooldown": 45,
    "accuracy": 0.63,
    "targets": [
      "air"
    ],
    "cost": 2,
    "era": "ww2",
    "salvoSize": 2,
    "salvoInterval": 45,
    "engagementCycle": 240
  },
  "ww2_air_asw": {
    "id": "ww2_air_asw",
    "name": "Carrier ASW patrol aircraft",
    "kind": "aircraft",
    "range": 100,
    "minRange": 0,
    "speed": 0.095,
    "damage": 200,
    "cooldown": 60,
    "accuracy": 0.51,
    "targets": [
      "submarine"
    ],
    "cost": 2,
    "era": "ww2",
    "salvoSize": 1,
    "salvoInterval": 60,
    "engagementCycle": 240
  }
};

export const SHIP_CLASSES = {
  "modern": {
    "carrier": {
      "id": "carrier",
      "name": "Skysea-class large aircraft carrier",
      "shortName": "Large CV",
      "role": "carrier",
      "era": "modern",
      "hp": 5200,
      "armor": 0.18,
      "speed": 30,
      "turnRate": 0.22,
      "radar": 65,
      "sonar": 0,
      "visual": 32,
      "signature": 1,
      "weapons": [
        {
          "weaponId": "air_strike",
          "ammo": 48,
          "capacity": 48
        },
        {
          "weaponId": "air_fighter",
          "ammo": 12,
          "capacity": 12
        },
        {
          "weaponId": "sam_short",
          "ammo": 32,
          "capacity": 32
        },
        {
          "weaponId": "ciws_20",
          "ammo": 124,
          "capacity": 124
        }
      ],
      "description": "A large air-wing carrier requiring destroyer and antisubmarine protection.",
      "tonnage": 96000,
      "crew": 4700,
      "lengthMeters": 332,
      "beamMeters": 41
    },
    "fleet_carrier": {
      "id": "fleet_carrier",
      "name": "Cloudspire-class fleet carrier",
      "shortName": "Fleet CV",
      "role": "carrier",
      "era": "modern",
      "hp": 3900,
      "armor": 0.16,
      "speed": 29,
      "turnRate": 0.28,
      "radar": 58,
      "sonar": 0,
      "visual": 30,
      "signature": 0.94,
      "weapons": [
        {
          "weaponId": "air_strike",
          "ammo": 28,
          "capacity": 28
        },
        {
          "weaponId": "air_fighter",
          "ammo": 10,
          "capacity": 10
        },
        {
          "weaponId": "sam_short",
          "ammo": 24,
          "capacity": 24
        },
        {
          "weaponId": "ciws_20",
          "ammo": 93,
          "capacity": 93
        }
      ],
      "description": "A medium aviation core with fewer aircraft and defensive missiles than a large carrier.",
      "tonnage": 62000,
      "crew": 2400,
      "lengthMeters": 280,
      "beamMeters": 34
    },
    "light_carrier": {
      "id": "light_carrier",
      "name": "Seakite-class light carrier",
      "shortName": "Light CV",
      "role": "carrier",
      "era": "modern",
      "hp": 2600,
      "armor": 0.11,
      "speed": 27,
      "turnRate": 0.35,
      "radar": 45,
      "sonar": 0,
      "visual": 27,
      "signature": 0.82,
      "weapons": [
        {
          "weaponId": "air_strike",
          "ammo": 12,
          "capacity": 12
        },
        {
          "weaponId": "air_fighter",
          "ammo": 6,
          "capacity": 6
        },
        {
          "weaponId": "sam_short",
          "ammo": 16,
          "capacity": 16
        },
        {
          "weaponId": "ciws_20",
          "ammo": 62,
          "capacity": 62
        }
      ],
      "description": "A compact carrier that must conserve aircraft and remain behind its escort screen.",
      "tonnage": 28000,
      "crew": 1250,
      "lengthMeters": 228,
      "beamMeters": 29
    },
    "helicopter_carrier": {
      "id": "helicopter_carrier",
      "name": "Cloudbridge-class ASW carrier",
      "shortName": "ASW Carrier",
      "role": "carrier",
      "era": "modern",
      "hp": 2350,
      "armor": 0.1,
      "speed": 24,
      "turnRate": 0.33,
      "radar": 42,
      "sonar": 10,
      "visual": 26,
      "signature": 0.83,
      "weapons": [
        {
          "weaponId": "air_asw",
          "ammo": 12,
          "capacity": 12
        },
        {
          "weaponId": "sam_short",
          "ammo": 12,
          "capacity": 12
        },
        {
          "weaponId": "ciws_20",
          "ammo": 62,
          "capacity": 62
        }
      ],
      "description": "Carries antisubmarine helicopters only, with no fixed-wing strike aircraft.",
      "tonnage": 21000,
      "crew": 700,
      "lengthMeters": 200,
      "beamMeters": 32
    },
    "battleship": {
      "id": "battleship",
      "name": "Stonepeak-class refit battleship",
      "shortName": "Refit BB",
      "role": "battleship",
      "era": "modern",
      "hp": 5700,
      "armor": 0.62,
      "speed": 31,
      "turnRate": 0.2,
      "radar": 42,
      "sonar": 0,
      "visual": 31,
      "signature": 1,
      "weapons": [
        {
          "weaponId": "gun_406_refit",
          "ammo": 720,
          "capacity": 720
        },
        {
          "weaponId": "gun_127",
          "ammo": 1100,
          "capacity": 1100
        },
        {
          "weaponId": "asm_standard",
          "ammo": 16,
          "capacity": 16
        },
        {
          "weaponId": "land_attack",
          "ammo": 24,
          "capacity": 24
        },
        {
          "weaponId": "ciws_20",
          "ammo": 124,
          "capacity": 124
        }
      ],
      "description": "A fictional reserve ship inspired by late Cold War refits, combining heavy guns with limited missiles.",
      "tonnage": 58000,
      "crew": 1550,
      "lengthMeters": 270,
      "beamMeters": 33
    },
    "cruiser": {
      "id": "cruiser",
      "name": "Skybalance-class air-defense cruiser",
      "shortName": "AA Cruiser",
      "role": "cruiser",
      "era": "modern",
      "hp": 2350,
      "armor": 0.17,
      "speed": 31,
      "turnRate": 0.55,
      "radar": 65,
      "sonar": 22,
      "visual": 27,
      "signature": 0.85,
      "weapons": [
        {
          "weaponId": "asm_stealth",
          "ammo": 16,
          "capacity": 16
        },
        {
          "weaponId": "sam_long",
          "ammo": 56,
          "capacity": 56
        },
        {
          "weaponId": "sam_medium",
          "ammo": 24,
          "capacity": 24
        },
        {
          "weaponId": "gun_127",
          "ammo": 700,
          "capacity": 700
        },
        {
          "weaponId": "ciws_20",
          "ammo": 62,
          "capacity": 62
        },
        {
          "weaponId": "torpedo_light",
          "ammo": 18,
          "capacity": 18
        }
      ],
      "description": "An area-defense core with layered interception and antisubmarine weapons.",
      "tonnage": 12000,
      "crew": 430,
      "lengthMeters": 173,
      "beamMeters": 18
    },
    "strike_cruiser": {
      "id": "strike_cruiser",
      "name": "Thundertide-class strike cruiser",
      "shortName": "Strike CG",
      "role": "cruiser",
      "era": "modern",
      "hp": 3100,
      "armor": 0.24,
      "speed": 30,
      "turnRate": 0.4,
      "radar": 62,
      "sonar": 24,
      "visual": 29,
      "signature": 0.95,
      "weapons": [
        {
          "weaponId": "asm_heavy",
          "ammo": 20,
          "capacity": 20
        },
        {
          "weaponId": "sam_long",
          "ammo": 40,
          "capacity": 40
        },
        {
          "weaponId": "sam_medium",
          "ammo": 24,
          "capacity": 24
        },
        {
          "weaponId": "gun_127",
          "ammo": 900,
          "capacity": 900
        },
        {
          "weaponId": "ciws_30",
          "ammo": 80,
          "capacity": 80
        },
        {
          "weaponId": "torpedo_light",
          "ammo": 18,
          "capacity": 18
        }
      ],
      "description": "A large antiship platform that benefits from dedicated air-defense escorts.",
      "tonnage": 22000,
      "crew": 680,
      "lengthMeters": 250,
      "beamMeters": 28
    },
    "destroyer": {
      "id": "destroyer",
      "name": "Longwind-class multirole destroyer",
      "shortName": "Destroyer",
      "role": "destroyer",
      "era": "modern",
      "hp": 1650,
      "armor": 0.13,
      "speed": 31,
      "turnRate": 0.7,
      "radar": 52,
      "sonar": 22,
      "visual": 25,
      "signature": 0.68,
      "weapons": [
        {
          "weaponId": "asm_standard",
          "ammo": 8,
          "capacity": 8
        },
        {
          "weaponId": "sam_long",
          "ammo": 32,
          "capacity": 32
        },
        {
          "weaponId": "sam_medium",
          "ammo": 24,
          "capacity": 24
        },
        {
          "weaponId": "gun_127",
          "ammo": 600,
          "capacity": 600
        },
        {
          "weaponId": "ciws_20",
          "ammo": 62,
          "capacity": 62
        },
        {
          "weaponId": "torpedo_light",
          "ammo": 12,
          "capacity": 12
        }
      ],
      "description": "A versatile combatant for area air defense, surface warfare and antisubmarine operations.",
      "tonnage": 8500,
      "crew": 290,
      "lengthMeters": 155,
      "beamMeters": 20
    },
    "stealth_destroyer": {
      "id": "stealth_destroyer",
      "name": "Hiddengale-class advanced destroyer",
      "shortName": "Advanced DD",
      "role": "destroyer",
      "era": "modern",
      "hp": 1850,
      "armor": 0.14,
      "speed": 30,
      "turnRate": 0.62,
      "radar": 62,
      "sonar": 26,
      "visual": 26,
      "signature": 0.46,
      "weapons": [
        {
          "weaponId": "asm_stealth",
          "ammo": 16,
          "capacity": 16
        },
        {
          "weaponId": "sam_long",
          "ammo": 40,
          "capacity": 40
        },
        {
          "weaponId": "sam_medium",
          "ammo": 24,
          "capacity": 24
        },
        {
          "weaponId": "gun_127",
          "ammo": 680,
          "capacity": 680
        },
        {
          "weaponId": "ciws_30",
          "ammo": 80,
          "capacity": 80
        },
        {
          "weaponId": "torpedo_light",
          "ammo": 18,
          "capacity": 18
        }
      ],
      "description": "Improved sensors and a reduced signature still depend on shared contacts beyond the horizon.",
      "tonnage": 10500,
      "crew": 240,
      "lengthMeters": 183,
      "beamMeters": 24
    },
    "missile_destroyer": {
      "id": "missile_destroyer",
      "name": "Swiftstorm-class strike destroyer",
      "shortName": "Strike DD",
      "role": "destroyer",
      "era": "modern",
      "hp": 1580,
      "armor": 0.12,
      "speed": 33,
      "turnRate": 0.74,
      "radar": 46,
      "sonar": 15,
      "visual": 25,
      "signature": 0.72,
      "weapons": [
        {
          "weaponId": "asm_heavy",
          "ammo": 12,
          "capacity": 12
        },
        {
          "weaponId": "sam_medium",
          "ammo": 32,
          "capacity": 32
        },
        {
          "weaponId": "gun_127",
          "ammo": 700,
          "capacity": 700
        },
        {
          "weaponId": "ciws_30",
          "ammo": 80,
          "capacity": 80
        },
        {
          "weaponId": "torpedo_light",
          "ammo": 12,
          "capacity": 12
        }
      ],
      "description": "Trades some long-range air defense for stronger antiship salvos.",
      "tonnage": 7600,
      "crew": 300,
      "lengthMeters": 170,
      "beamMeters": 19
    },
    "legacy_destroyer": {
      "id": "legacy_destroyer",
      "name": "Farsail-class legacy destroyer",
      "shortName": "Legacy DD",
      "role": "destroyer",
      "era": "modern",
      "hp": 1200,
      "armor": 0.1,
      "speed": 30,
      "turnRate": 0.72,
      "radar": 34,
      "sonar": 12,
      "visual": 23,
      "signature": 0.76,
      "weapons": [
        {
          "weaponId": "asm_standard",
          "ammo": 8,
          "capacity": 8
        },
        {
          "weaponId": "sam_short",
          "ammo": 16,
          "capacity": 16
        },
        {
          "weaponId": "gun_127",
          "ammo": 800,
          "capacity": 800
        },
        {
          "weaponId": "ciws_20",
          "ammo": 31,
          "capacity": 31
        },
        {
          "weaponId": "torpedo_light",
          "ammo": 9,
          "capacity": 9
        }
      ],
      "description": "A limited refit relies on point defense and coordinated escort support.",
      "tonnage": 4800,
      "crew": 280,
      "lengthMeters": 144,
      "beamMeters": 15
    },
    "frigate": {
      "id": "frigate",
      "name": "Clearsea-class multirole frigate",
      "shortName": "Frigate",
      "role": "frigate",
      "era": "modern",
      "hp": 1000,
      "armor": 0.08,
      "speed": 28,
      "turnRate": 0.92,
      "radar": 42,
      "sonar": 19,
      "visual": 23,
      "signature": 0.52,
      "weapons": [
        {
          "weaponId": "asm_standard",
          "ammo": 8,
          "capacity": 8
        },
        {
          "weaponId": "sam_medium",
          "ammo": 24,
          "capacity": 24
        },
        {
          "weaponId": "gun_76",
          "ammo": 600,
          "capacity": 600
        },
        {
          "weaponId": "ciws_20",
          "ammo": 31,
          "capacity": 31
        },
        {
          "weaponId": "torpedo_light",
          "ammo": 12,
          "capacity": 12
        }
      ],
      "description": "A balanced, economical escort suited to patrols and the outer screen.",
      "tonnage": 4600,
      "crew": 170,
      "lengthMeters": 137,
      "beamMeters": 16
    },
    "asw_frigate": {
      "id": "asw_frigate",
      "name": "Wavelistener-class ASW frigate",
      "shortName": "ASW Frigate",
      "role": "frigate",
      "era": "modern",
      "hp": 980,
      "armor": 0.08,
      "speed": 28,
      "turnRate": 0.94,
      "radar": 40,
      "sonar": 34,
      "visual": 23,
      "signature": 0.48,
      "weapons": [
        {
          "weaponId": "asm_standard",
          "ammo": 4,
          "capacity": 4
        },
        {
          "weaponId": "sam_medium",
          "ammo": 16,
          "capacity": 16
        },
        {
          "weaponId": "gun_76",
          "ammo": 500,
          "capacity": 500
        },
        {
          "weaponId": "torpedo_light",
          "ammo": 18,
          "capacity": 18
        },
        {
          "weaponId": "air_asw",
          "ammo": 2,
          "capacity": 2
        },
        {
          "weaponId": "ciws_20",
          "ammo": 31,
          "capacity": 31
        }
      ],
      "description": "Strong sonar and ASW helicopters protect the main force from submarine attacks.",
      "tonnage": 5100,
      "crew": 180,
      "lengthMeters": 142,
      "beamMeters": 16
    },
    "light_frigate": {
      "id": "light_frigate",
      "name": "Ripple-class light frigate",
      "shortName": "Light FF",
      "role": "frigate",
      "era": "modern",
      "hp": 760,
      "armor": 0.06,
      "speed": 27,
      "turnRate": 1.1,
      "radar": 30,
      "sonar": 12,
      "visual": 21,
      "signature": 0.45,
      "weapons": [
        {
          "weaponId": "asm_coastal",
          "ammo": 4,
          "capacity": 4
        },
        {
          "weaponId": "sam_short",
          "ammo": 8,
          "capacity": 8
        },
        {
          "weaponId": "gun_76",
          "ammo": 450,
          "capacity": 450
        },
        {
          "weaponId": "torpedo_light",
          "ammo": 6,
          "capacity": 6
        }
      ],
      "description": "A coastal escort with limited air-defense magazines and combat endurance.",
      "tonnage": 2400,
      "crew": 125,
      "lengthMeters": 105,
      "beamMeters": 13
    },
    "corvette": {
      "id": "corvette",
      "name": "Reefshield-class corvette",
      "shortName": "Corvette",
      "role": "corvette",
      "era": "modern",
      "hp": 590,
      "armor": 0.045,
      "speed": 28,
      "turnRate": 1.35,
      "radar": 27,
      "sonar": 10,
      "visual": 19,
      "signature": 0.32,
      "weapons": [
        {
          "weaponId": "asm_coastal",
          "ammo": 8,
          "capacity": 8
        },
        {
          "weaponId": "sam_short",
          "ammo": 8,
          "capacity": 8
        },
        {
          "weaponId": "gun_76",
          "ammo": 320,
          "capacity": 320
        },
        {
          "weaponId": "depthcharge_modern",
          "ammo": 16,
          "capacity": 16
        }
      ],
      "description": "A small coastal combatant carrying substantial antiship firepower.",
      "tonnage": 1300,
      "crew": 80,
      "lengthMeters": 90,
      "beamMeters": 12
    },
    "missile_corvette": {
      "id": "missile_corvette",
      "name": "Flashtide-class missile boat",
      "shortName": "Missile Boat",
      "role": "corvette",
      "era": "modern",
      "hp": 390,
      "armor": 0.025,
      "speed": 37,
      "turnRate": 1.8,
      "radar": 23,
      "sonar": 0,
      "visual": 17,
      "signature": 0.25,
      "weapons": [
        {
          "weaponId": "asm_standard",
          "ammo": 4,
          "capacity": 4
        },
        {
          "weaponId": "gun_57",
          "ammo": 260,
          "capacity": 260
        },
        {
          "weaponId": "ciws_20",
          "ammo": 31,
          "capacity": 31
        }
      ],
      "description": "A fast coastal striker with limited self-defense after its missiles are expended.",
      "tonnage": 560,
      "crew": 42,
      "lengthMeters": 58,
      "beamMeters": 9
    },
    "asw_corvette": {
      "id": "asw_corvette",
      "name": "Tideseeker-class ASW corvette",
      "shortName": "ASW Corvette",
      "role": "corvette",
      "era": "modern",
      "hp": 570,
      "armor": 0.04,
      "speed": 27,
      "turnRate": 1.4,
      "radar": 25,
      "sonar": 20,
      "visual": 19,
      "signature": 0.33,
      "weapons": [
        {
          "weaponId": "gun_76",
          "ammo": 350,
          "capacity": 350
        },
        {
          "weaponId": "sam_short",
          "ammo": 8,
          "capacity": 8
        },
        {
          "weaponId": "torpedo_light",
          "ammo": 12,
          "capacity": 12
        },
        {
          "weaponId": "depthcharge_modern",
          "ammo": 24,
          "capacity": 24
        }
      ],
      "description": "Prioritizes submarine search and escort duty over long-range antiship missiles.",
      "tonnage": 1450,
      "crew": 88,
      "lengthMeters": 94,
      "beamMeters": 12
    },
    "submarine": {
      "id": "submarine",
      "name": "Deepshade-class nuclear attack submarine",
      "shortName": "Attack SSN",
      "role": "submarine",
      "era": "modern",
      "hp": 1150,
      "armor": 0.08,
      "speed": 29,
      "turnRate": 0.6,
      "radar": 0,
      "sonar": 45,
      "visual": 7,
      "signature": 0.12,
      "weapons": [
        {
          "weaponId": "torpedo_heavy",
          "ammo": 22,
          "capacity": 22
        },
        {
          "weaponId": "asm_standard",
          "ammo": 8,
          "capacity": 8
        }
      ],
      "description": "An oceanic submarine combining long-range sonar with heavyweight torpedoes.",
      "tonnage": 7200,
      "crew": 125,
      "lengthMeters": 110,
      "beamMeters": 10
    },
    "diesel_submarine": {
      "id": "diesel_submarine",
      "name": "Quietbay-class conventional submarine",
      "shortName": "Diesel SSK",
      "role": "submarine",
      "era": "modern",
      "hp": 730,
      "armor": 0.06,
      "speed": 19,
      "turnRate": 0.8,
      "radar": 0,
      "sonar": 30,
      "visual": 6,
      "signature": 0.09,
      "weapons": [
        {
          "weaponId": "torpedo_coastal",
          "ammo": 16,
          "capacity": 16
        },
        {
          "weaponId": "asm_coastal",
          "ammo": 4,
          "capacity": 4
        }
      ],
      "description": "Lower submerged speed favors deliberate ambushes in restricted waters.",
      "tonnage": 2300,
      "crew": 45,
      "lengthMeters": 68,
      "beamMeters": 7
    },
    "coastal_submarine": {
      "id": "coastal_submarine",
      "name": "Hiddensand-class coastal submarine",
      "shortName": "Coastal SSK",
      "role": "submarine",
      "era": "modern",
      "hp": 470,
      "armor": 0.045,
      "speed": 14,
      "turnRate": 0.95,
      "radar": 0,
      "sonar": 20,
      "visual": 5,
      "signature": 0.11,
      "weapons": [
        {
          "weaponId": "torpedo_coastal",
          "ammo": 8,
          "capacity": 8
        }
      ],
      "description": "A small submarine with limited mobility and torpedo reserves.",
      "tonnage": 950,
      "crew": 28,
      "lengthMeters": 50,
      "beamMeters": 5
    },
    "amphibious": {
      "id": "amphibious",
      "name": "Cloudferry-class amphibious dock ship",
      "shortName": "Amphib LPD",
      "role": "amphibious",
      "era": "modern",
      "hp": 2700,
      "armor": 0.1,
      "speed": 22,
      "turnRate": 0.34,
      "radar": 38,
      "sonar": 0,
      "visual": 26,
      "signature": 0.86,
      "weapons": [
        {
          "weaponId": "gun_76",
          "ammo": 480,
          "capacity": 480
        },
        {
          "weaponId": "sam_short",
          "ammo": 16,
          "capacity": 16
        },
        {
          "weaponId": "ciws_20",
          "ammo": 62,
          "capacity": 62
        },
        {
          "weaponId": "air_asw",
          "ammo": 2,
          "capacity": 2
        }
      ],
      "description": "A transport for island and harbor operations, with helicopters providing limited ASW support.",
      "tonnage": 23000,
      "crew": 520,
      "lengthMeters": 210,
      "beamMeters": 32
    },
    "landing_ship": {
      "id": "landing_ship",
      "name": "Tideferry-class landing ship",
      "shortName": "Landing LST",
      "role": "amphibious",
      "era": "modern",
      "hp": 1450,
      "armor": 0.07,
      "speed": 18,
      "turnRate": 0.5,
      "radar": 26,
      "sonar": 0,
      "visual": 23,
      "signature": 0.7,
      "weapons": [
        {
          "weaponId": "gun_57",
          "ammo": 450,
          "capacity": 450
        },
        {
          "weaponId": "sam_short",
          "ammo": 8,
          "capacity": 8
        }
      ],
      "description": "A slow coastal landing transport that requires escort protection.",
      "tonnage": 6800,
      "crew": 150,
      "lengthMeters": 132,
      "beamMeters": 20
    },
    "supply": {
      "id": "supply",
      "name": "Fartide-class replenishment ship",
      "shortName": "Supply AOR",
      "role": "supply",
      "era": "modern",
      "hp": 2300,
      "armor": 0.04,
      "speed": 20,
      "turnRate": 0.32,
      "radar": 26,
      "sonar": 0,
      "visual": 25,
      "signature": 0.95,
      "weapons": [
        {
          "weaponId": "gun_57",
          "ammo": 300,
          "capacity": 300
        },
        {
          "weaponId": "ciws_20",
          "ammo": 31,
          "capacity": 31
        }
      ],
      "description": "A lightly armed logistics ship and a critical convoy objective.",
      "tonnage": 30000,
      "crew": 160,
      "lengthMeters": 200,
      "beamMeters": 27
    },
    "transport": {
      "id": "transport",
      "name": "Seabridge-class transport",
      "shortName": "Transport",
      "role": "supply",
      "era": "modern",
      "hp": 1400,
      "armor": 0.025,
      "speed": 17,
      "turnRate": 0.4,
      "radar": 20,
      "sonar": 0,
      "visual": 23,
      "signature": 0.8,
      "weapons": [
        {
          "weaponId": "gun_57",
          "ammo": 180,
          "capacity": 180
        }
      ],
      "description": "A slow cargo vessel unable to withstand major combatants without an escort.",
      "tonnage": 12000,
      "crew": 55,
      "lengthMeters": 155,
      "beamMeters": 22
    },
    "patrol": {
      "id": "patrol",
      "name": "Seasparrow-class patrol vessel",
      "shortName": "Patrol OPV",
      "role": "patrol",
      "era": "modern",
      "hp": 370,
      "armor": 0.03,
      "speed": 25,
      "turnRate": 1.65,
      "radar": 24,
      "sonar": 0,
      "visual": 18,
      "signature": 0.27,
      "weapons": [
        {
          "weaponId": "gun_57",
          "ammo": 350,
          "capacity": 350
        },
        {
          "weaponId": "depthcharge_modern",
          "ammo": 8,
          "capacity": 8
        }
      ],
      "description": "Gun patrol and harbor security duties take priority over heavy weapons.",
      "tonnage": 780,
      "crew": 45,
      "lengthMeters": 65,
      "beamMeters": 10
    },
    "fast_patrol": {
      "id": "fast_patrol",
      "name": "Flyingtide-class fast patrol boat",
      "shortName": "Fast Patrol",
      "role": "patrol",
      "era": "modern",
      "hp": 210,
      "armor": 0.015,
      "speed": 40,
      "turnRate": 2.4,
      "radar": 18,
      "sonar": 0,
      "visual": 15,
      "signature": 0.17,
      "weapons": [
        {
          "weaponId": "gun_57",
          "ammo": 220,
          "capacity": 220
        }
      ],
      "description": "A fast but fragile craft suited to patrols and pursuit of light targets.",
      "tonnage": 220,
      "crew": 18,
      "lengthMeters": 42,
      "beamMeters": 7
    }
  },
  "ww2": {
    "carrier": {
      "id": "carrier",
      "name": "Farvault-class fleet carrier",
      "shortName": "Fleet CV",
      "role": "carrier",
      "era": "ww2",
      "hp": 3600,
      "armor": 0.16,
      "speed": 32,
      "turnRate": 0.28,
      "radar": 27,
      "sonar": 0,
      "visual": 30,
      "signature": 1,
      "weapons": [
        {
          "weaponId": "ww2_air_strike",
          "ammo": 48,
          "capacity": 48
        },
        {
          "weaponId": "ww2_air_fighter",
          "ammo": 24,
          "capacity": 24
        },
        {
          "weaponId": "ww2_aa_127",
          "ammo": 480,
          "capacity": 480
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 240,
          "capacity": 240
        }
      ],
      "description": "A large propeller-aircraft carrier with limited early-radar search capability.",
      "tonnage": 34000,
      "crew": 2600,
      "lengthMeters": 265,
      "beamMeters": 30
    },
    "armored_carrier": {
      "id": "armored_carrier",
      "name": "Ironvault-class armored carrier",
      "shortName": "Armored CV",
      "role": "carrier",
      "era": "ww2",
      "hp": 3900,
      "armor": 0.28,
      "speed": 30,
      "turnRate": 0.27,
      "radar": 26,
      "sonar": 0,
      "visual": 29,
      "signature": 0.98,
      "weapons": [
        {
          "weaponId": "ww2_air_strike",
          "ammo": 30,
          "capacity": 30
        },
        {
          "weaponId": "ww2_air_fighter",
          "ammo": 18,
          "capacity": 18
        },
        {
          "weaponId": "ww2_aa_127",
          "ammo": 500,
          "capacity": 500
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 240,
          "capacity": 240
        }
      ],
      "description": "Stronger protection comes at the expense of a smaller air group.",
      "tonnage": 33000,
      "crew": 2200,
      "lengthMeters": 230,
      "beamMeters": 29
    },
    "light_carrier": {
      "id": "light_carrier",
      "name": "Driftwing-class light carrier",
      "shortName": "Light CV",
      "role": "carrier",
      "era": "ww2",
      "hp": 2100,
      "armor": 0.09,
      "speed": 30,
      "turnRate": 0.4,
      "radar": 23,
      "sonar": 0,
      "visual": 27,
      "signature": 0.82,
      "weapons": [
        {
          "weaponId": "ww2_air_strike",
          "ammo": 18,
          "capacity": 18
        },
        {
          "weaponId": "ww2_air_fighter",
          "ammo": 12,
          "capacity": 12
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 180,
          "capacity": 180
        },
        {
          "weaponId": "ww2_aa_20",
          "ammo": 160,
          "capacity": 160
        }
      ],
      "description": "Can keep pace with the fleet but has a weaker hull and fewer aircraft.",
      "tonnage": 15000,
      "crew": 1500,
      "lengthMeters": 190,
      "beamMeters": 22
    },
    "escort_carrier": {
      "id": "escort_carrier",
      "name": "Cloudboat-class escort carrier",
      "shortName": "Escort CVE",
      "role": "carrier",
      "era": "ww2",
      "hp": 1600,
      "armor": 0.06,
      "speed": 18,
      "turnRate": 0.38,
      "radar": 20,
      "sonar": 0,
      "visual": 25,
      "signature": 0.78,
      "weapons": [
        {
          "weaponId": "ww2_air_strike",
          "ammo": 8,
          "capacity": 8
        },
        {
          "weaponId": "ww2_air_fighter",
          "ammo": 8,
          "capacity": 8
        },
        {
          "weaponId": "ww2_air_asw",
          "ammo": 6,
          "capacity": 6
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 140,
          "capacity": 140
        },
        {
          "weaponId": "ww2_aa_20",
          "ammo": 120,
          "capacity": 120
        }
      ],
      "description": "A slow aviation platform protecting convoy routes against air and submarine attacks.",
      "tonnage": 11000,
      "crew": 850,
      "lengthMeters": 156,
      "beamMeters": 21
    },
    "battleship": {
      "id": "battleship",
      "name": "Highpeak-class fast battleship",
      "shortName": "Fast BB",
      "role": "battleship",
      "era": "ww2",
      "hp": 5200,
      "armor": 0.65,
      "speed": 32,
      "turnRate": 0.24,
      "radar": 28,
      "sonar": 0,
      "visual": 31,
      "signature": 1,
      "weapons": [
        {
          "weaponId": "ww2_gun_406",
          "ammo": 900,
          "capacity": 900
        },
        {
          "weaponId": "ww2_gun_127",
          "ammo": 1800,
          "capacity": 1800
        },
        {
          "weaponId": "ww2_aa_127",
          "ammo": 700,
          "capacity": 700
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 360,
          "capacity": 360
        }
      ],
      "description": "Heavy armor, large main guns and dense AA batteries anchor the battle line.",
      "tonnage": 57000,
      "crew": 2700,
      "lengthMeters": 270,
      "beamMeters": 33
    },
    "old_battleship": {
      "id": "old_battleship",
      "name": "Stoneguard-class old battleship",
      "shortName": "Legacy BB",
      "role": "battleship",
      "era": "ww2",
      "hp": 4300,
      "armor": 0.58,
      "speed": 22,
      "turnRate": 0.2,
      "radar": 19,
      "sonar": 0,
      "visual": 30,
      "signature": 1,
      "weapons": [
        {
          "weaponId": "ww2_gun_356",
          "ammo": 720,
          "capacity": 720
        },
        {
          "weaponId": "ww2_gun_127",
          "ammo": 1200,
          "capacity": 1200
        },
        {
          "weaponId": "ww2_aa_127",
          "ammo": 450,
          "capacity": 450
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 240,
          "capacity": 240
        }
      ],
      "description": "Strong protection but low speed favor harbor support and a steady battle line.",
      "tonnage": 35000,
      "crew": 1800,
      "lengthMeters": 190,
      "beamMeters": 30
    },
    "battlecruiser": {
      "id": "battlecruiser",
      "name": "Peakchaser-class battlecruiser",
      "shortName": "Battlecr.",
      "role": "battleship",
      "era": "ww2",
      "hp": 3650,
      "armor": 0.4,
      "speed": 31,
      "turnRate": 0.32,
      "radar": 22,
      "sonar": 0,
      "visual": 30,
      "signature": 0.96,
      "weapons": [
        {
          "weaponId": "ww2_gun_356",
          "ammo": 650,
          "capacity": 650
        },
        {
          "weaponId": "ww2_gun_152",
          "ammo": 1000,
          "capacity": 1000
        },
        {
          "weaponId": "ww2_aa_127",
          "ammo": 400,
          "capacity": 400
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 220,
          "capacity": 220
        }
      ],
      "description": "Trades armor for speed in pursuit and flank-support missions.",
      "tonnage": 36000,
      "crew": 1900,
      "lengthMeters": 240,
      "beamMeters": 30
    },
    "cruiser": {
      "id": "cruiser",
      "name": "Fiercewave-class heavy cruiser",
      "shortName": "Heavy CA",
      "role": "cruiser",
      "era": "ww2",
      "hp": 2200,
      "armor": 0.28,
      "speed": 33,
      "turnRate": 0.55,
      "radar": 22,
      "sonar": 0,
      "visual": 27,
      "signature": 0.8,
      "weapons": [
        {
          "weaponId": "ww2_gun_203",
          "ammo": 850,
          "capacity": 850
        },
        {
          "weaponId": "ww2_gun_127",
          "ammo": 950,
          "capacity": 950
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 200,
          "capacity": 200
        },
        {
          "weaponId": "ww2_torpedo_long",
          "ammo": 12,
          "capacity": 12
        }
      ],
      "description": "Heavy guns and long-range torpedoes provide strong flank firepower.",
      "tonnage": 14000,
      "crew": 1050,
      "lengthMeters": 205,
      "beamMeters": 21
    },
    "light_cruiser": {
      "id": "light_cruiser",
      "name": "Cleargale-class light cruiser",
      "shortName": "Light CL",
      "role": "cruiser",
      "era": "ww2",
      "hp": 1650,
      "armor": 0.19,
      "speed": 32,
      "turnRate": 0.66,
      "radar": 22,
      "sonar": 4,
      "visual": 26,
      "signature": 0.72,
      "weapons": [
        {
          "weaponId": "ww2_gun_152",
          "ammo": 1200,
          "capacity": 1200
        },
        {
          "weaponId": "ww2_gun_127",
          "ammo": 700,
          "capacity": 700
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 220,
          "capacity": 220
        },
        {
          "weaponId": "ww2_torpedo",
          "ammo": 6,
          "capacity": 6
        }
      ],
      "description": "Rapid medium-caliber gunfire suppresses light ships, with a useful AA screen.",
      "tonnage": 9500,
      "crew": 800,
      "lengthMeters": 185,
      "beamMeters": 19
    },
    "aa_cruiser": {
      "id": "aa_cruiser",
      "name": "Clearwatch-class AA cruiser",
      "shortName": "AA Cruiser",
      "role": "cruiser",
      "era": "ww2",
      "hp": 1550,
      "armor": 0.14,
      "speed": 32,
      "turnRate": 0.68,
      "radar": 26,
      "sonar": 0,
      "visual": 26,
      "signature": 0.71,
      "weapons": [
        {
          "weaponId": "ww2_gun_127",
          "ammo": 1100,
          "capacity": 1100
        },
        {
          "weaponId": "ww2_aa_127",
          "ammo": 900,
          "capacity": 900
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 280,
          "capacity": 280
        },
        {
          "weaponId": "ww2_torpedo",
          "ammo": 8,
          "capacity": 8
        }
      ],
      "description": "Provides concentrated antiaircraft gunfire rather than a heavy main battery.",
      "tonnage": 7800,
      "crew": 690,
      "lengthMeters": 165,
      "beamMeters": 16
    },
    "destroyer": {
      "id": "destroyer",
      "name": "Swiftwind-class fleet destroyer",
      "shortName": "Fleet DD",
      "role": "destroyer",
      "era": "ww2",
      "hp": 850,
      "armor": 0.07,
      "speed": 36,
      "turnRate": 0.95,
      "radar": 20,
      "sonar": 5,
      "visual": 23,
      "signature": 0.46,
      "weapons": [
        {
          "weaponId": "ww2_gun_127",
          "ammo": 1050,
          "capacity": 1050
        },
        {
          "weaponId": "ww2_torpedo",
          "ammo": 10,
          "capacity": 10
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 120,
          "capacity": 120
        },
        {
          "weaponId": "ww2_depthcharge",
          "ammo": 50,
          "capacity": 50
        }
      ],
      "description": "A general-purpose screen with guns, torpedoes, AA weapons and depth charges.",
      "tonnage": 2900,
      "crew": 320,
      "lengthMeters": 115,
      "beamMeters": 12
    },
    "torpedo_destroyer": {
      "id": "torpedo_destroyer",
      "name": "Shocktide-class torpedo destroyer",
      "shortName": "Torpedo DD",
      "role": "destroyer",
      "era": "ww2",
      "hp": 900,
      "armor": 0.065,
      "speed": 35,
      "turnRate": 0.9,
      "radar": 16,
      "sonar": 4,
      "visual": 23,
      "signature": 0.48,
      "weapons": [
        {
          "weaponId": "ww2_gun_127",
          "ammo": 900,
          "capacity": 900
        },
        {
          "weaponId": "ww2_torpedo_long",
          "ammo": 16,
          "capacity": 16
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 90,
          "capacity": 90
        },
        {
          "weaponId": "ww2_depthcharge",
          "ammo": 24,
          "capacity": 24
        }
      ],
      "description": "Heavy torpedo capacity and range offset weaker radar and air defense.",
      "tonnage": 2800,
      "crew": 250,
      "lengthMeters": 120,
      "beamMeters": 11
    },
    "old_destroyer": {
      "id": "old_destroyer",
      "name": "Oldsail-class destroyer",
      "shortName": "Legacy DD",
      "role": "destroyer",
      "era": "ww2",
      "hp": 620,
      "armor": 0.05,
      "speed": 31,
      "turnRate": 1.1,
      "radar": 10,
      "sonar": 3,
      "visual": 21,
      "signature": 0.43,
      "weapons": [
        {
          "weaponId": "ww2_gun_102",
          "ammo": 600,
          "capacity": 600
        },
        {
          "weaponId": "ww2_torpedo",
          "ammo": 6,
          "capacity": 6
        },
        {
          "weaponId": "ww2_aa_20",
          "ammo": 90,
          "capacity": 90
        },
        {
          "weaponId": "ww2_depthcharge",
          "ammo": 24,
          "capacity": 24
        }
      ],
      "description": "An early light destroyer with limited firepower and search capability.",
      "tonnage": 1700,
      "crew": 150,
      "lengthMeters": 96,
      "beamMeters": 10
    },
    "frigate": {
      "id": "frigate",
      "name": "Tideguard-class destroyer escort",
      "shortName": "Escort DE",
      "role": "frigate",
      "era": "ww2",
      "hp": 650,
      "armor": 0.05,
      "speed": 24,
      "turnRate": 1.05,
      "radar": 17,
      "sonar": 6,
      "visual": 21,
      "signature": 0.42,
      "weapons": [
        {
          "weaponId": "ww2_gun_102",
          "ammo": 500,
          "capacity": 500
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 110,
          "capacity": 110
        },
        {
          "weaponId": "ww2_depthcharge",
          "ammo": 60,
          "capacity": 60
        },
        {
          "weaponId": "ww2_depthcharge_ahead",
          "ammo": 24,
          "capacity": 24
        }
      ],
      "description": "Accepts lower speed in exchange for reliable antisubmarine escort capability.",
      "tonnage": 1700,
      "crew": 180,
      "lengthMeters": 95,
      "beamMeters": 11
    },
    "asw_frigate": {
      "id": "asw_frigate",
      "name": "Wavelistener-class escort frigate",
      "shortName": "ASW Escort",
      "role": "frigate",
      "era": "ww2",
      "hp": 620,
      "armor": 0.045,
      "speed": 20,
      "turnRate": 1.15,
      "radar": 15,
      "sonar": 7,
      "visual": 21,
      "signature": 0.4,
      "weapons": [
        {
          "weaponId": "ww2_gun_102",
          "ammo": 450,
          "capacity": 450
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 100,
          "capacity": 100
        },
        {
          "weaponId": "ww2_depthcharge",
          "ammo": 70,
          "capacity": 70
        },
        {
          "weaponId": "ww2_depthcharge_ahead",
          "ammo": 28,
          "capacity": 28
        }
      ],
      "description": "Sonar and ahead-throwing ASW weapons protect slower transports.",
      "tonnage": 1500,
      "crew": 140,
      "lengthMeters": 92,
      "beamMeters": 11
    },
    "corvette": {
      "id": "corvette",
      "name": "Beaconreef-class escort corvette",
      "shortName": "Corvette",
      "role": "corvette",
      "era": "ww2",
      "hp": 440,
      "armor": 0.035,
      "speed": 16,
      "turnRate": 1.4,
      "radar": 12,
      "sonar": 5,
      "visual": 18,
      "signature": 0.32,
      "weapons": [
        {
          "weaponId": "ww2_gun_102",
          "ammo": 350,
          "capacity": 350
        },
        {
          "weaponId": "ww2_aa_20",
          "ammo": 90,
          "capacity": 90
        },
        {
          "weaponId": "ww2_depthcharge",
          "ammo": 40,
          "capacity": 40
        }
      ],
      "description": "An economical small escort with limited pursuit speed and damage resistance.",
      "tonnage": 1050,
      "crew": 85,
      "lengthMeters": 62,
      "beamMeters": 10
    },
    "submarine": {
      "id": "submarine",
      "name": "Abyss-class fleet submarine",
      "shortName": "Fleet Sub",
      "role": "submarine",
      "era": "ww2",
      "hp": 700,
      "armor": 0.055,
      "speed": 9,
      "turnRate": 0.75,
      "radar": 0,
      "sonar": 12,
      "visual": 5,
      "signature": 0.16,
      "weapons": [
        {
          "weaponId": "ww2_torpedo_sub",
          "ammo": 24,
          "capacity": 24
        }
      ],
      "description": "Uses realistic submerged speed and attacks surface targets with straight-running torpedoes.",
      "tonnage": 2400,
      "crew": 75,
      "lengthMeters": 95,
      "beamMeters": 8
    },
    "coastal_submarine": {
      "id": "coastal_submarine",
      "name": "Bayghost-class coastal submarine",
      "shortName": "Coastal Sub",
      "role": "submarine",
      "era": "ww2",
      "hp": 430,
      "armor": 0.04,
      "speed": 7.5,
      "turnRate": 0.95,
      "radar": 0,
      "sonar": 8,
      "visual": 4,
      "signature": 0.14,
      "weapons": [
        {
          "weaponId": "ww2_torpedo_sub",
          "ammo": 10,
          "capacity": 10
        }
      ],
      "description": "A covert approach is essential because submerged speed and torpedo reserves are limited.",
      "tonnage": 800,
      "crew": 38,
      "lengthMeters": 65,
      "beamMeters": 6
    },
    "amphibious": {
      "id": "amphibious",
      "name": "Waveferry-class tank landing ship",
      "shortName": "Landing LST",
      "role": "amphibious",
      "era": "ww2",
      "hp": 1200,
      "armor": 0.045,
      "speed": 12,
      "turnRate": 0.55,
      "radar": 9,
      "sonar": 0,
      "visual": 22,
      "signature": 0.73,
      "weapons": [
        {
          "weaponId": "ww2_aa_40",
          "ammo": 140,
          "capacity": 140
        },
        {
          "weaponId": "ww2_aa_20",
          "ammo": 120,
          "capacity": 120
        }
      ],
      "description": "Carries heavy equipment toward a landing area under escort protection.",
      "tonnage": 4100,
      "crew": 115,
      "lengthMeters": 100,
      "beamMeters": 15
    },
    "landing_transport": {
      "id": "landing_transport",
      "name": "Cloudlanding-class attack transport",
      "shortName": "Attack AP",
      "role": "amphibious",
      "era": "ww2",
      "hp": 1700,
      "armor": 0.05,
      "speed": 18,
      "turnRate": 0.42,
      "radar": 13,
      "sonar": 0,
      "visual": 24,
      "signature": 0.85,
      "weapons": [
        {
          "weaponId": "ww2_gun_102",
          "ammo": 250,
          "capacity": 250
        },
        {
          "weaponId": "ww2_aa_40",
          "ammo": 180,
          "capacity": 180
        },
        {
          "weaponId": "ww2_aa_20",
          "ammo": 120,
          "capacity": 120
        }
      ],
      "description": "A large troop transport that relies mainly on its escort formation for protection.",
      "tonnage": 11000,
      "crew": 400,
      "lengthMeters": 150,
      "beamMeters": 21
    },
    "supply": {
      "id": "supply",
      "name": "Longtide-class supply ship",
      "shortName": "Supply Ship",
      "role": "supply",
      "era": "ww2",
      "hp": 1700,
      "armor": 0.025,
      "speed": 16,
      "turnRate": 0.38,
      "radar": 10,
      "sonar": 0,
      "visual": 23,
      "signature": 0.9,
      "weapons": [
        {
          "weaponId": "ww2_gun_102",
          "ammo": 180,
          "capacity": 180
        },
        {
          "weaponId": "ww2_aa_20",
          "ammo": 80,
          "capacity": 80
        }
      ],
      "description": "A large logistics target with limited defensive armament.",
      "tonnage": 15000,
      "crew": 120,
      "lengthMeters": 160,
      "beamMeters": 22
    },
    "transport": {
      "id": "transport",
      "name": "Seabarge-class freighter",
      "shortName": "Freighter",
      "role": "supply",
      "era": "ww2",
      "hp": 1250,
      "armor": 0.02,
      "speed": 12,
      "turnRate": 0.4,
      "radar": 0,
      "sonar": 0,
      "visual": 22,
      "signature": 0.83,
      "weapons": [
        {
          "weaponId": "ww2_aa_20",
          "ammo": 60,
          "capacity": 60
        }
      ],
      "description": "A slow cargo ship unable to fight warships on equal terms.",
      "tonnage": 10500,
      "crew": 55,
      "lengthMeters": 135,
      "beamMeters": 18
    },
    "patrol": {
      "id": "patrol",
      "name": "Baywatch-class patrol boat",
      "shortName": "Patrol Boat",
      "role": "patrol",
      "era": "ww2",
      "hp": 240,
      "armor": 0.02,
      "speed": 24,
      "turnRate": 1.7,
      "radar": 7,
      "sonar": 2.5,
      "visual": 15,
      "signature": 0.22,
      "weapons": [
        {
          "weaponId": "ww2_aa_20",
          "ammo": 100,
          "capacity": 100
        },
        {
          "weaponId": "ww2_depthcharge",
          "ammo": 12,
          "capacity": 12
        }
      ],
      "description": "Conducts coastal patrol and limited ASW duties without heavy weapons.",
      "tonnage": 350,
      "crew": 24,
      "lengthMeters": 45,
      "beamMeters": 7
    },
    "torpedo_boat": {
      "id": "torpedo_boat",
      "name": "Flyingwave-class torpedo boat",
      "shortName": "Torpedo PT",
      "role": "patrol",
      "era": "ww2",
      "hp": 150,
      "armor": 0.01,
      "speed": 39,
      "turnRate": 2.6,
      "radar": 0,
      "sonar": 0,
      "visual": 13,
      "signature": 0.13,
      "weapons": [
        {
          "weaponId": "ww2_torpedo",
          "ammo": 4,
          "capacity": 4
        },
        {
          "weaponId": "ww2_aa_20",
          "ammo": 80,
          "capacity": 80
        }
      ],
      "description": "A fast craft with just four torpedoes, relying on maneuver once they are spent.",
      "tonnage": 95,
      "crew": 14,
      "lengthMeters": 24,
      "beamMeters": 6
    }
  }
};

export const MAPS = [
  {
    "id": "open_ocean",
    "name": "Open Ocean",
    "description": "Unobstructed water for carrier, antiship and submarine warfare.",
    "width": 54,
    "height": 36,
    "land": [],
    "spawns": {
      "blue": {
        "x": 6.6,
        "y": 18
      },
      "red": {
        "x": 47.4,
        "y": 18
      }
    },
    "objectives": [
      {
        "x": 4.5,
        "y": 18,
        "name": "West Supply Anchorage",
        "kind": "port",
        "owner": "blue"
      },
      {
        "x": 49.5,
        "y": 18,
        "name": "East Supply Anchorage",
        "kind": "port",
        "owner": "red"
      },
      {
        "x": 27,
        "y": 18,
        "name": "Central Route Station",
        "kind": "island",
        "owner": "neutral"
      }
    ]
  },
  {
    "id": "coast",
    "name": "Longcape Coast",
    "description": "A broken northern coast frames the inshore route; open southern water permits a flank approach.",
    "width": 54,
    "height": 36,
    "land": [
      {
        "points": [
          [
            0,
            0
          ],
          [
            54,
            0
          ],
          [
            54,
            7.199999999999999
          ],
          [
            46.5,
            8.7
          ],
          [
            39,
            6.6
          ],
          [
            33.6,
            11.4
          ],
          [
            25.8,
            9
          ],
          [
            18,
            12.6
          ],
          [
            9.9,
            8.1
          ],
          [
            0,
            9.6
          ]
        ]
      }
    ],
    "spawns": {
      "blue": {
        "x": 6.6,
        "y": 23.4
      },
      "red": {
        "x": 47.4,
        "y": 23.4
      }
    },
    "objectives": [
      {
        "x": 6,
        "y": 12.6,
        "name": "Whitesand Anchorage",
        "kind": "port",
        "owner": "blue"
      },
      {
        "x": 48.3,
        "y": 12,
        "name": "Northcape Anchorage",
        "kind": "port",
        "owner": "red"
      },
      {
        "x": 27,
        "y": 13.5,
        "name": "Cape Control Zone",
        "kind": "island",
        "owner": "neutral"
      }
    ]
  },
  {
    "id": "islands",
    "name": "Shattered Isles",
    "description": "Islands divide sightlines and routes, offering a central passage and two flanking approaches.",
    "width": 72,
    "height": 48,
    "land": [
      {
        "points": [
          [
            22,
            10.4
          ],
          [
            26.8,
            7.6000000000000005
          ],
          [
            31.200000000000003,
            11.600000000000001
          ],
          [
            29.200000000000003,
            16.8
          ],
          [
            23.200000000000003,
            15.600000000000001
          ]
        ]
      },
      {
        "points": [
          [
            41.2,
            8
          ],
          [
            48.400000000000006,
            10
          ],
          [
            50,
            16
          ],
          [
            44,
            18.400000000000002
          ],
          [
            40.400000000000006,
            13.600000000000001
          ]
        ]
      },
      {
        "points": [
          [
            25.200000000000003,
            31.6
          ],
          [
            30.8,
            29.200000000000003
          ],
          [
            33.6,
            35.2
          ],
          [
            29.200000000000003,
            40
          ],
          [
            23.6,
            37.6
          ]
        ]
      },
      {
        "points": [
          [
            44.400000000000006,
            30
          ],
          [
            50.400000000000006,
            32
          ],
          [
            53.2,
            37.6
          ],
          [
            46.400000000000006,
            41.6
          ],
          [
            42.400000000000006,
            36.800000000000004
          ]
        ]
      }
    ],
    "spawns": {
      "blue": {
        "x": 8.8,
        "y": 24
      },
      "red": {
        "x": 63.2,
        "y": 24
      }
    },
    "objectives": [
      {
        "x": 6.800000000000001,
        "y": 24,
        "name": "West Reef Harbor",
        "kind": "port",
        "owner": "blue"
      },
      {
        "x": 66,
        "y": 24,
        "name": "East Reef Harbor",
        "kind": "port",
        "owner": "red"
      },
      {
        "x": 35.2,
        "y": 23.200000000000003,
        "name": "Central Island Passage",
        "kind": "island",
        "owner": "neutral"
      },
      {
        "x": 32.4,
        "y": 8.8,
        "name": "North Landing Zone",
        "kind": "island",
        "owner": "neutral"
      },
      {
        "x": 37.6,
        "y": 37.2,
        "name": "South Landing Zone",
        "kind": "island",
        "owner": "neutral"
      }
    ]
  },
  {
    "id": "strait",
    "name": "Twin Cape Strait",
    "description": "The shortest passage runs between two capes that channel fleets into columns.",
    "width": 72,
    "height": 48,
    "land": [
      {
        "points": [
          [
            25.200000000000003,
            0
          ],
          [
            44,
            0
          ],
          [
            43.6,
            11.200000000000001
          ],
          [
            40.400000000000006,
            16.8
          ],
          [
            32.800000000000004,
            17.2
          ],
          [
            28.8,
            11.600000000000001
          ]
        ]
      },
      {
        "points": [
          [
            28.8,
            48
          ],
          [
            47.2,
            48
          ],
          [
            44.400000000000006,
            35.2
          ],
          [
            41.2,
            30.8
          ],
          [
            34.4,
            30.400000000000002
          ],
          [
            30.8,
            36.4
          ]
        ]
      }
    ],
    "spawns": {
      "blue": {
        "x": 8.8,
        "y": 24
      },
      "red": {
        "x": 63.2,
        "y": 24
      }
    },
    "objectives": [
      {
        "x": 6.4,
        "y": 24,
        "name": "West Strait Anchorage",
        "kind": "port",
        "owner": "blue"
      },
      {
        "x": 66.4,
        "y": 24,
        "name": "East Strait Anchorage",
        "kind": "port",
        "owner": "red"
      },
      {
        "x": 36.800000000000004,
        "y": 24,
        "name": "Strait Chokepoint",
        "kind": "island",
        "owner": "neutral"
      }
    ]
  },
  {
    "id": "harbor",
    "name": "Atoll Harbor",
    "description": "Two headlands enclose an eastern harbor whose entrance must be breached.",
    "width": 72,
    "height": 48,
    "land": [
      {
        "points": [
          [
            52,
            0
          ],
          [
            72,
            0
          ],
          [
            72,
            13.600000000000001
          ],
          [
            63.2,
            14.8
          ],
          [
            60,
            18.400000000000002
          ],
          [
            54,
            18
          ],
          [
            49.6,
            12.4
          ]
        ]
      },
      {
        "points": [
          [
            52.800000000000004,
            48
          ],
          [
            72,
            48
          ],
          [
            72,
            34.800000000000004
          ],
          [
            63.2,
            33.6
          ],
          [
            59.6,
            30
          ],
          [
            54,
            30.8
          ],
          [
            50,
            37.2
          ]
        ]
      },
      {
        "points": [
          [
            20.8,
            10
          ],
          [
            26.400000000000002,
            9.600000000000001
          ],
          [
            29.6,
            14
          ],
          [
            26.400000000000002,
            18
          ],
          [
            21.6,
            16
          ]
        ]
      }
    ],
    "spawns": {
      "blue": {
        "x": 8.8,
        "y": 24
      },
      "red": {
        "x": 64,
        "y": 24
      }
    },
    "objectives": [
      {
        "x": 6,
        "y": 24,
        "name": "Offshore Staging Area",
        "kind": "port",
        "owner": "blue"
      },
      {
        "x": 67.2,
        "y": 24,
        "name": "Atoll Anchorage",
        "kind": "port",
        "owner": "red"
      },
      {
        "x": 50.800000000000004,
        "y": 24,
        "name": "Harbor Entrance",
        "kind": "island",
        "owner": "neutral"
      },
      {
        "x": 32.800000000000004,
        "y": 14,
        "name": "North Reef Approach",
        "kind": "island",
        "owner": "neutral"
      }
    ]
  },
  {
    "id": "archipelago",
    "name": "Echo Archipelago",
    "description": "Three passages through the island chain reward coordinated divisions and flank pressure.",
    "width": 72,
    "height": 48,
    "land": [
      {
        "points": [
          [
            22.8,
            0
          ],
          [
            29.200000000000003,
            0
          ],
          [
            30.400000000000002,
            8.8
          ],
          [
            26.400000000000002,
            12
          ],
          [
            22,
            8.4
          ]
        ]
      },
      {
        "points": [
          [
            37.6,
            0
          ],
          [
            44.800000000000004,
            0
          ],
          [
            46,
            8.8
          ],
          [
            40.800000000000004,
            12
          ],
          [
            37.2,
            7.2
          ]
        ]
      },
      {
        "points": [
          [
            22.8,
            19.6
          ],
          [
            28,
            17.6
          ],
          [
            31.200000000000003,
            22
          ],
          [
            28.8,
            26.400000000000002
          ],
          [
            23.6,
            27.6
          ],
          [
            20.8,
            23.6
          ]
        ]
      },
      {
        "points": [
          [
            40.400000000000006,
            18.400000000000002
          ],
          [
            45.6,
            17.2
          ],
          [
            49.6,
            21.6
          ],
          [
            47.2,
            26.8
          ],
          [
            41.6,
            28.400000000000002
          ],
          [
            38.400000000000006,
            23.6
          ]
        ]
      },
      {
        "points": [
          [
            22.400000000000002,
            40
          ],
          [
            27.200000000000003,
            36.800000000000004
          ],
          [
            30.8,
            41.6
          ],
          [
            30,
            48
          ],
          [
            22,
            48
          ]
        ]
      },
      {
        "points": [
          [
            39.6,
            40
          ],
          [
            44.400000000000006,
            37.2
          ],
          [
            48.400000000000006,
            41.2
          ],
          [
            49.2,
            48
          ],
          [
            40,
            48
          ]
        ]
      }
    ],
    "spawns": {
      "blue": {
        "x": 8.8,
        "y": 24
      },
      "red": {
        "x": 63.2,
        "y": 24
      }
    },
    "objectives": [
      {
        "x": 6,
        "y": 24,
        "name": "West Island Anchorage",
        "kind": "port",
        "owner": "blue"
      },
      {
        "x": 66.4,
        "y": 24,
        "name": "East Island Anchorage",
        "kind": "port",
        "owner": "red"
      },
      {
        "x": 34.800000000000004,
        "y": 13.600000000000001,
        "name": "North Channel",
        "kind": "island",
        "owner": "neutral"
      },
      {
        "x": 34.800000000000004,
        "y": 24,
        "name": "Center Channel",
        "kind": "island",
        "owner": "neutral"
      },
      {
        "x": 34.800000000000004,
        "y": 34.4,
        "name": "South Channel",
        "kind": "island",
        "owner": "neutral"
      }
    ]
  },
  {
    "id": "crescent",
    "name": "Crescent Bay",
    "description": "A curved southern shore encloses the bay while open northern water offers room to maneuver.",
    "width": 72,
    "height": 48,
    "land": [
      {
        "points": [
          [
            0,
            48
          ],
          [
            72,
            48
          ],
          [
            72,
            35.2
          ],
          [
            62.800000000000004,
            36.4
          ],
          [
            52.800000000000004,
            40.400000000000006
          ],
          [
            41.6,
            43.2
          ],
          [
            32,
            42.800000000000004
          ],
          [
            22,
            40
          ],
          [
            11.600000000000001,
            36.4
          ],
          [
            0,
            34.4
          ]
        ]
      },
      {
        "points": [
          [
            33.6,
            18.8
          ],
          [
            38.400000000000006,
            17.2
          ],
          [
            42.800000000000004,
            20.8
          ],
          [
            41.2,
            26
          ],
          [
            36.4,
            28
          ],
          [
            32,
            24
          ]
        ]
      }
    ],
    "spawns": {
      "blue": {
        "x": 8.8,
        "y": 24
      },
      "red": {
        "x": 63.2,
        "y": 24
      }
    },
    "objectives": [
      {
        "x": 8,
        "y": 31.200000000000003,
        "name": "West Crescent Harbor",
        "kind": "port",
        "owner": "blue"
      },
      {
        "x": 64.4,
        "y": 32,
        "name": "East Crescent Harbor",
        "kind": "port",
        "owner": "red"
      },
      {
        "x": 36.4,
        "y": 31.200000000000003,
        "name": "Inner Bay Landing Zone",
        "kind": "island",
        "owner": "neutral"
      },
      {
        "x": 36,
        "y": 12.4,
        "name": "Northern Sea Route",
        "kind": "island",
        "owner": "neutral"
      }
    ]
  },
  {
    "id": "fjord",
    "name": "Frostscar Fjord",
    "description": "The shores narrow the waterway and a central island forces a choice of passage.",
    "width": 72,
    "height": 48,
    "land": [
      {
        "points": [
          [
            0,
            0
          ],
          [
            72,
            0
          ],
          [
            72,
            10
          ],
          [
            60.400000000000006,
            13.600000000000001
          ],
          [
            49.6,
            11.600000000000001
          ],
          [
            40,
            15.600000000000001
          ],
          [
            30,
            12.4
          ],
          [
            18.8,
            15.200000000000001
          ],
          [
            9.600000000000001,
            11.200000000000001
          ],
          [
            0,
            14
          ]
        ]
      },
      {
        "points": [
          [
            0,
            48
          ],
          [
            72,
            48
          ],
          [
            72,
            37.2
          ],
          [
            61.2,
            34.800000000000004
          ],
          [
            50.800000000000004,
            38
          ],
          [
            41.2,
            34
          ],
          [
            30.8,
            36.800000000000004
          ],
          [
            20,
            33.2
          ],
          [
            9.600000000000001,
            37.6
          ],
          [
            0,
            34.800000000000004
          ]
        ]
      },
      {
        "points": [
          [
            33.6,
            21.200000000000003
          ],
          [
            38,
            20.400000000000002
          ],
          [
            40.400000000000006,
            23.6
          ],
          [
            38.400000000000006,
            26.8
          ],
          [
            34,
            27.200000000000003
          ],
          [
            31.6,
            24
          ]
        ]
      }
    ],
    "spawns": {
      "blue": {
        "x": 8.8,
        "y": 24
      },
      "red": {
        "x": 63.2,
        "y": 24
      }
    },
    "objectives": [
      {
        "x": 6,
        "y": 24,
        "name": "West Bay Anchorage",
        "kind": "port",
        "owner": "blue"
      },
      {
        "x": 66,
        "y": 24,
        "name": "East Bay Anchorage",
        "kind": "port",
        "owner": "red"
      },
      {
        "x": 36.4,
        "y": 17.6,
        "name": "North Fjord Passage",
        "kind": "island",
        "owner": "neutral"
      },
      {
        "x": 36.4,
        "y": 30.8,
        "name": "South Fjord Passage",
        "kind": "island",
        "owner": "neutral"
      }
    ]
  },
  {
    "id": "convoy_lane",
    "name": "Bluewater Route",
    "description": "Scattered islands frame an open transport corridor with little cover along its central route.",
    "width": 54,
    "height": 36,
    "land": [
      {
        "points": [
          [
            13.2,
            3.5999999999999996
          ],
          [
            17.099999999999998,
            2.1
          ],
          [
            20.099999999999998,
            6
          ],
          [
            17.7,
            9.6
          ],
          [
            13.799999999999999,
            9
          ]
        ]
      },
      {
        "points": [
          [
            30.9,
            4.2
          ],
          [
            35.1,
            2.6999999999999997
          ],
          [
            38.4,
            6.6
          ],
          [
            36.9,
            10.2
          ],
          [
            32.4,
            10.799999999999999
          ]
        ]
      },
      {
        "points": [
          [
            17.099999999999998,
            27.3
          ],
          [
            21.599999999999998,
            25.5
          ],
          [
            25.5,
            29.099999999999998
          ],
          [
            23.7,
            33.3
          ],
          [
            18.599999999999998,
            33.6
          ]
        ]
      },
      {
        "points": [
          [
            36.6,
            26.7
          ],
          [
            40.8,
            25.8
          ],
          [
            44.699999999999996,
            29.7
          ],
          [
            42.3,
            33.9
          ],
          [
            38.4,
            33
          ]
        ]
      }
    ],
    "spawns": {
      "blue": {
        "x": 6,
        "y": 18
      },
      "red": {
        "x": 48,
        "y": 18
      }
    },
    "objectives": [
      {
        "x": 3.5999999999999996,
        "y": 18,
        "name": "Convoy Departure Port",
        "kind": "port",
        "owner": "blue"
      },
      {
        "x": 50.699999999999996,
        "y": 18,
        "name": "Convoy Arrival Port",
        "kind": "port",
        "owner": "red"
      },
      {
        "x": 19.5,
        "y": 18,
        "name": "First Route Marker",
        "kind": "island",
        "owner": "neutral"
      },
      {
        "x": 34.5,
        "y": 18,
        "name": "Second Route Marker",
        "kind": "island",
        "owner": "neutral"
      }
    ]
  },
  {
    "id": "three_islands",
    "name": "Three Outposts",
    "description": "Three island control zones offer depth, letting forces contest the flanks or strike the center.",
    "width": 72,
    "height": 48,
    "land": [
      {
        "points": [
          [
            21.6,
            9.200000000000001
          ],
          [
            26,
            7.2
          ],
          [
            31.200000000000003,
            9.600000000000001
          ],
          [
            32.800000000000004,
            14.4
          ],
          [
            28.400000000000002,
            17.6
          ],
          [
            23.200000000000003,
            15.200000000000001
          ]
        ]
      },
      {
        "points": [
          [
            35.2,
            20
          ],
          [
            40,
            18.400000000000002
          ],
          [
            44.800000000000004,
            22
          ],
          [
            43.6,
            27.200000000000003
          ],
          [
            38.400000000000006,
            30
          ],
          [
            33.6,
            26
          ]
        ]
      },
      {
        "points": [
          [
            21.200000000000003,
            32.4
          ],
          [
            26,
            30.400000000000002
          ],
          [
            31.200000000000003,
            33.2
          ],
          [
            32,
            38.400000000000006
          ],
          [
            26.8,
            41.2
          ],
          [
            22,
            39.2
          ]
        ]
      }
    ],
    "spawns": {
      "blue": {
        "x": 8.8,
        "y": 24
      },
      "red": {
        "x": 63.2,
        "y": 24
      }
    },
    "objectives": [
      {
        "x": 6,
        "y": 24,
        "name": "Western Home Port",
        "kind": "port",
        "owner": "blue"
      },
      {
        "x": 66.4,
        "y": 24,
        "name": "Eastern Home Port",
        "kind": "port",
        "owner": "red"
      },
      {
        "x": 28,
        "y": 20.400000000000002,
        "name": "North Island Zone",
        "kind": "island",
        "owner": "neutral"
      },
      {
        "x": 47.2,
        "y": 24.8,
        "name": "Center Island Zone",
        "kind": "island",
        "owner": "neutral"
      },
      {
        "x": 27.6,
        "y": 27.6,
        "name": "South Island Zone",
        "kind": "island",
        "owner": "neutral"
      }
    ]
  }
];

const recipes={modern:{
carrier:[['carrier','cruiser','destroyer','asw_frigate','submarine','destroyer','frigate','supply'],['fleet_carrier','destroyer','asw_frigate','frigate','diesel_submarine','frigate','supply'],['light_carrier','legacy_destroyer','asw_frigate','frigate','corvette','diesel_submarine','transport'],['helicopter_carrier','light_frigate','asw_corvette','corvette','patrol','transport']],
balanced:[['battleship','cruiser','stealth_destroyer','destroyer','asw_frigate','submarine','amphibious','supply'],['cruiser','destroyer','frigate','asw_frigate','diesel_submarine','amphibious','supply'],['legacy_destroyer','frigate','asw_frigate','corvette','diesel_submarine','landing_ship','supply'],['light_frigate','corvette','asw_corvette','patrol','coastal_submarine','transport']],
missile:[['strike_cruiser','missile_destroyer','cruiser','missile_destroyer','frigate','submarine','missile_corvette','supply'],['strike_cruiser','missile_destroyer','destroyer','frigate','missile_corvette','diesel_submarine','supply'],['missile_destroyer','legacy_destroyer','corvette','missile_corvette','light_frigate','diesel_submarine','transport'],['corvette','missile_corvette','light_frigate','missile_corvette','patrol','transport']],
submarine:[['submarine','submarine','cruiser','asw_frigate','destroyer','submarine','frigate','supply'],['submarine','diesel_submarine','destroyer','asw_frigate','diesel_submarine','frigate','supply'],['diesel_submarine','diesel_submarine','asw_frigate','legacy_destroyer','coastal_submarine','corvette','transport'],['coastal_submarine','coastal_submarine','light_frigate','asw_corvette','patrol','transport']],
littoral:[['destroyer','frigate','missile_corvette','corvette','asw_corvette','diesel_submarine','amphibious','supply'],['destroyer','asw_frigate','corvette','missile_corvette','diesel_submarine','landing_ship','supply'],['frigate','corvette','missile_corvette','asw_corvette','diesel_submarine','fast_patrol','transport'],['light_frigate','corvette','asw_corvette','patrol','fast_patrol','transport']]
},ww2:{
carrier:[['carrier','battleship','aa_cruiser','destroyer','frigate','submarine','destroyer','supply'],['armored_carrier','cruiser','aa_cruiser','destroyer','frigate','submarine','supply'],['light_carrier','light_cruiser','destroyer','frigate','submarine','corvette','supply'],['escort_carrier','old_destroyer','frigate','corvette','patrol','transport']],
balanced:[['battleship','battlecruiser','cruiser','destroyer','frigate','submarine','landing_transport','supply'],['battleship','cruiser','light_cruiser','destroyer','frigate','submarine','supply'],['old_battleship','light_cruiser','destroyer','frigate','submarine','amphibious','supply'],['old_destroyer','frigate','corvette','coastal_submarine','patrol','transport']],
missile:[['battlecruiser','cruiser','torpedo_destroyer','torpedo_destroyer','destroyer','submarine','aa_cruiser','supply'],['cruiser','light_cruiser','torpedo_destroyer','destroyer','torpedo_boat','submarine','supply'],['light_cruiser','torpedo_destroyer','old_destroyer','torpedo_boat','frigate','submarine','supply'],['old_destroyer','torpedo_boat','frigate','torpedo_boat','patrol','transport']],
submarine:[['submarine','submarine','cruiser','destroyer','asw_frigate','submarine','frigate','supply'],['submarine','submarine','light_cruiser','destroyer','asw_frigate','coastal_submarine','supply'],['submarine','coastal_submarine','old_destroyer','asw_frigate','coastal_submarine','frigate','supply'],['coastal_submarine','coastal_submarine','frigate','corvette','patrol','transport']],
littoral:[['light_cruiser','destroyer','torpedo_destroyer','frigate','corvette','submarine','amphibious','supply'],['light_cruiser','destroyer','frigate','torpedo_boat','coastal_submarine','amphibious','supply'],['old_destroyer','frigate','corvette','torpedo_boat','coastal_submarine','patrol','transport'],['frigate','corvette','torpedo_boat','patrol','coastal_submarine','transport']]
}};
const hashString=str=>Array.from(str).reduce((h,ch)=>Math.imul(h^ch.charCodeAt(0),16777619)>>>0,2166136261);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
/** Stable mirrored composition. Runtime ships must clone their mounts. */
export function createFleet(era,factionId,side,scale='standard') {
if(!SHIP_CLASSES[era])throw new RangeError(`Unknown era:${era}`);
const faction=FACTIONS.find(f=>f.id===factionId);
if(!faction)throw new RangeError(`Unknown faction:${factionId}`);
if(!['blue','red'].includes(side))throw new RangeError(`Unknown side:${side}`);
if(!['small','standard','large'].includes(scale))throw new RangeError(`Unknown fleet size:${scale}`);
const band=faction.tier<=1?0:faction.tier===2?1:faction.tier===3?2:3;
const [base,min,max]=scale==='small'?[6,5,8]:scale==='large'?[22,18,28]:[11,8,16];
const count=clamp(Math.round(base*faction.fleetScale),min,max),seed=hashString(faction.id);
const recipe=recipes[era][faction.doctrine][band],fleet=recipe.slice(0,Math.min(count,recipe.length));
if((fleet.length<count||count>=7)&&!fleet.some(id=>SHIP_CLASSES[era][id].role==='supply'))fleet[fleet.length-1]=faction.tier<=3?'supply':'transport';
const filler=recipe.filter(id=>!['carrier','battleship','supply','amphibious'].includes(SHIP_CLASSES[era][id].role));
while(fleet.length<count)fleet.push(filler[(seed+fleet.length*3+(fleet.length>>1))%filler.length]);
if(era==='modern'&&faction.tech>=1.15){const i=fleet.indexOf('destroyer');if(i>=0)fleet[i]='stealth_destroyer';}
if(era==='modern'&&faction.doctrine==='balanced'&&faction.tier===2&&seed%2===0)fleet[0]='battleship';
if(era==='ww2'&&faction.doctrine==='carrier'&&faction.tier===1&&seed%2===0)fleet[0]='armored_carrier';
if(scale==='large'&&faction.doctrine==='carrier'&&faction.tier<=2)fleet[fleet.length-2]='light_carrier';
if(scale==='large'&&faction.doctrine==='balanced')fleet[fleet.length-2]=era==='modern'?(faction.tier<=3?'amphibious':'landing_ship'):'amphibious';
if(faction.tier===5&&faction.doctrine!=='submarine'){const i=fleet.findIndex((id,i)=>i>0&&SHIP_CLASSES[era][id].role==='corvette');if(i>=0)fleet[i]='patrol';}
return fleet;
}
function pointInPolygon(point,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>point.y)!==(b[1]>point.y)&&point.x<(b[0]-a[0])*(point.y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export function validateCatalog(){
const errors=[],check=(ok,msg)=>{if(!ok)errors.push(msg);},finite=(v,a,b=Infinity)=>Number.isFinite(v)&&v>=a&&v<=b;
const roles=['carrier','battleship','cruiser','destroyer','frigate','corvette','submarine','amphibious','supply','patrol'];
const kinds=['missile','sam','gun','ciws','torpedo','depthcharge','aircraft','aa'],targets=['surface','submarine','air','projectile','objective'];
check(FACTIONS.length===64,'Expected 64 factions');check(new Set(FACTIONS.map(f=>f.id)).size===FACTIONS.length,'Duplicate faction ID');check(new Set(FACTIONS.map(f=>f.name)).size===FACTIONS.length,'Duplicate faction name');
for(const f of FACTIONS){check(Number.isInteger(f.tier)&&finite(f.tier,1,5),`${f.id}:invalid tier`);check(finite(f.tech,.7,1.25)&&finite(f.fleetScale,.65,1.4),`${f.id}:multiplier out of bounds`);check(Object.hasOwn(recipes.modern,f.doctrine),`${f.id}:invalid doctrine`);check(Boolean(f.name&&f.description&&f.color),`${f.id}:missing faction details`);}
for(const [id,v] of Object.entries(WEAPONS)){check(v.id===id&&kinds.includes(v.kind),`${id}:invalid weapon ID or kind`);check(['modern','ww2','both'].includes(v.era),`${id}:invalid era`);check(finite(v.range,.01)&&finite(v.minRange,0,v.range),`${id}:invalid range`);check(finite(v.speed,.0001,2)&&finite(v.damage,0)&&finite(v.cooldown,.01),`${id}:invalid motion or damage parameters`);check(finite(v.accuracy,0,1)&&finite(v.cost,0),`${id}:invalid accuracy or cost`);check(v.targets.length>0&&v.targets.every(t=>targets.includes(t)),`${id}:invalid target type`);check(v.era!=='ww2'||!['missile','sam','ciws'].includes(v.kind),`${id}:anachronistic WWII weapon`);}
for(const era of ERAS){const classes=SHIP_CLASSES[era.id];for(const role of roles)check(Object.values(classes).some(s=>s.role===role),`${era.id}:missing${role}`);
for(const [id,s] of Object.entries(classes)){check(id===s.id&&s.era===era.id&&roles.includes(s.role),`${era.id}/${id}:invalid identity`);check(finite(s.hp,1)&&finite(s.armor,0,.8)&&finite(s.speed,1,50)&&finite(s.turnRate,.01,5),`${era.id}/${id}:invalid hull parameters`);check(finite(s.radar,0,100)&&finite(s.sonar,0,100)&&finite(s.visual,0,50)&&finite(s.signature,0,1),`${era.id}/${id}:invalid sensor parameters`);check(finite(s.tonnage,1)&&Number.isInteger(s.crew)&&s.crew>0,`${era.id}/${id}:invalid displacement or complement`);check(era.id!=='ww2'||s.radar<=30,`${era.id}/${id}:anachronistic radar range`);
for(const mt of s.weapons){const v=WEAPONS[mt.weaponId];check(Boolean(v),`${era.id}/${id}:unknown weapon${mt.weaponId}`);check(!v||v.era===era.id||v.era==='both',`${era.id}/${id}:anachronistic loadout`);check(Number.isInteger(mt.ammo)&&Number.isInteger(mt.capacity)&&mt.ammo>=0&&mt.ammo<=mt.capacity&&mt.capacity>0,`${era.id}/${id}:invalid ammunition`);}}
for(const f of FACTIONS)for(const scale of ['small','standard','large']){try{const fleet=createFleet(era.id,f.id,'blue',scale),[min,max]=scale==='small'?[5,8]:scale==='large'?[18,28]:[8,16];check(fleet.length>=min&&fleet.length<=max,`${era.id}/${f.id}/${scale}:invalid fleet size`);check(fleet.every(id=>classes[id]),`${era.id}/${f.id}/${scale}:unknown ship class`);check(JSON.stringify(fleet)===JSON.stringify(createFleet(era.id,f.id,'red',scale)),`${era.id}/${f.id}:mirrored fleets differ`);}catch(e){errors.push(`${era.id}/${f.id}:${e.message}`);}}}
check(MAPS.length>=10&&new Set(MAPS.map(m=>m.id)).size===MAPS.length,'Insufficient maps or duplicate map ID');
for(const map of MAPS){check(finite(map.width,20)&&finite(map.height,20),`${map.id}:invalid map dimensions`);for(const p of map.land)check(p.points.length>=3&&p.points.every(([x,y])=>finite(x,0,map.width)&&finite(y,0,map.height)),`${map.id}:invalid land vertices`);
const points=[...Object.values(map.spawns),...map.objectives];for(const p of points){check(finite(p.x,0,map.width)&&finite(p.y,0,map.height),`${map.id}:objective or spawn out of bounds`);check(!map.land.some(l=>pointInPolygon(p,l.points)),`${map.id}:objective or spawn on land`);}
check(map.objectives.some(o=>o.kind==='port'&&o.owner==='blue')&&map.objectives.some(o=>o.kind==='port'&&o.owner==='red'),`${map.id}:missing ports for both sides`);check(map.objectives.some(o=>o.kind==='island'&&o.owner==='neutral'),`${map.id}:missing neutral objective`);check(map.objectives.every(o=>['port','island'].includes(o.kind)&&['blue','red','neutral'].includes(o.owner)),`${map.id}:invalid objective type or owner`);
// Four-neighbor connectivity on a 0.5 km grid: all spawns and objectives must share navigable water.
const step=.5,cols=Math.floor(map.width/step)+1,rows=Math.floor(map.height/step)+1,water=new Uint8Array(cols*rows),seen=new Uint8Array(cols*rows);
for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)water[y*cols+x]=map.land.some(p=>pointInPolygon({x:x*step,y:y*step},p.points))?0:1;
const cell=p=>clamp(Math.round(p.y/step),0,rows-1)*cols+clamp(Math.round(p.x/step),0,cols-1),first=cell(map.spawns.blue),queue=[first];seen[first]=1;
for(let i=0;i<queue.length;i++){const at=queue[i],x=at%cols,y=Math.floor(at/cols);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=ny*cols+nx;if(nx>=0&&nx<cols&&ny>=0&&ny<rows&&water[n]&&!seen[n]){seen[n]=1;queue.push(n);}}}
for(const p of points)check(seen[cell(p)]===1&&water[cell(p)]===1,`${map.id}:objective or spawn water is disconnected`);
}return errors;
}
