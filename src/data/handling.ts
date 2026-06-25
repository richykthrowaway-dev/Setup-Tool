/**
 * Symptom-driven tuning guide. Each symptom describes how the car *feels* and
 * lists concrete fixes. A fix names candidate parameter ids (variants differ by
 * car class — e.g. `front_arb` on road cars, `front_sway_bar` on ovals; single
 * `front_spring_rate` on formula vs `lf_/rf_spring_rate` on GT cars). Every id
 * present in the loaded schema is used, so advice adapts to the car.
 *
 * `direction` is the recommended way to move the value to cure the symptom.
 */

export type Direction = 'increase' | 'decrease';

export interface HandlingFix {
  /** Candidate parameter ids; all present in the schema are applied. */
  ids: string[];
  direction: Direction;
  /** Why this helps. */
  detail: string;
}

export interface HandlingSymptom {
  id: string;
  /** Short, plain-language label of the feeling. */
  label: string;
  /** Corner phase / context. */
  phase: 'Entry' | 'Mid-corner' | 'Exit' | 'Braking' | 'Straights';
  /** Longer description of what the driver feels. */
  description: string;
  fixes: HandlingFix[];
}

// Candidate id groups — multiple ids because naming varies across car classes.
const FRONT_ROLL      = ['front_arb', 'front_sway_bar'];
const REAR_ROLL       = ['rear_arb', 'rear_sway_bar'];
const FRONT_SPRINGS   = ['front_spring_rate', 'lf_spring_rate', 'rf_spring_rate'];
const REAR_SPRINGS    = ['rear_spring_rate', 'lr_spring_rate', 'rr_spring_rate'];
const FRONT_CAMBER    = ['front_camber', 'lf_camber', 'rf_camber'];
const REAR_CAMBER     = ['rear_camber', 'lr_camber', 'rr_camber'];
const REAR_TOE        = ['rear_toe', 'lr_toe', 'rr_toe'];
const FRONT_PRESSURE  = ['lf_cold_pressure', 'rf_cold_pressure'];
const REAR_PRESSURE   = ['lr_cold_pressure', 'rr_cold_pressure'];
const FRONT_RIDE      = ['front_ride_height', 'lf_ride_height', 'rf_ride_height'];
const REAR_RIDE       = ['rear_ride_height', 'lr_ride_height', 'rr_ride_height'];

// Damper groups — LS = low-speed (weight transfer), HS = high-speed (kerbs/bumps)
const FRONT_LS_BUMP    = ['front_bump', 'lf_ls_bump', 'rf_ls_bump'];
const REAR_LS_BUMP     = ['rear_bump', 'lr_ls_bump', 'rr_ls_bump'];
const FRONT_LS_REBOUND = ['front_rebound', 'lf_ls_rebound', 'rf_ls_rebound'];
const REAR_LS_REBOUND  = ['rear_rebound', 'lr_ls_rebound', 'rr_ls_rebound'];
const FRONT_HS_BUMP    = ['lf_hs_bump', 'rf_hs_bump'];
const REAR_HS_BUMP     = ['lr_hs_bump', 'rr_hs_bump'];
const FRONT_HS_REBOUND = ['lf_hs_rebound', 'rf_hs_rebound'];
const REAR_HS_REBOUND  = ['lr_hs_rebound', 'rr_hs_rebound'];

export const handlingSymptoms: HandlingSymptom[] = [
  {
    id: 'entry_understeer',
    label: 'Tight / understeer on entry',
    phase: 'Entry',
    description:
      "The car won't turn in — the nose pushes wide as you brake into the corner.",
    fixes: [
      { ids: FRONT_LS_BUMP,    direction: 'decrease', detail: 'Softer front low-speed bump lets the nose dive faster under braking, loading the front tyres and sharpening turn-in.' },
      { ids: FRONT_ROLL,       direction: 'decrease', detail: 'Softer front roll stiffness frees up front mechanical grip on turn-in.' },
      { ids: ['brake_bias'],   direction: 'decrease', detail: 'Less front brake bias lets the fronts roll into the corner while trail-braking without locking.' },
      { ids: FRONT_CAMBER,     direction: 'decrease', detail: 'More negative front camber increases the loaded front tyre contact patch on entry.' },
      { ids: ['front_wing'],   direction: 'increase', detail: 'More front downforce sharpens turn-in at speed.' },
      { ids: FRONT_SPRINGS,    direction: 'decrease', detail: 'Softer front springs allow more front mechanical grip on entry.' },
      { ids: FRONT_PRESSURE,   direction: 'decrease', detail: 'Lower front tyre pressures grow the contact patch for more bite on turn-in.' },
      { ids: ['cross_weight'], direction: 'decrease', detail: 'Less wedge/cross-weight reduces entry tightness (oval-specific).' },
    ],
  },

  {
    id: 'entry_oversteer',
    label: 'Loose / oversteer on entry',
    phase: 'Entry',
    description:
      'The rear steps out as you turn in or trail-brake — the car feels nervous on the way into the corner.',
    fixes: [
      { ids: FRONT_LS_BUMP,      direction: 'increase', detail: 'Firmer front bump slows nose dive, keeping weight distribution more balanced and the rear from going light.' },
      { ids: REAR_LS_REBOUND,    direction: 'increase', detail: 'Slower rear rebound keeps the rear planted as it tries to extend/unload under trail-braking.' },
      { ids: ['brake_bias'],     direction: 'increase', detail: 'More front brake bias settles the rear under trail-braking — standard go-to fix in iRacing black box.' },
      { ids: ['diff_coast'],     direction: 'decrease', detail: 'More coast ramp locking keeps the rear together on engine braking into the corner.' },
      { ids: ['brake_migration'],direction: 'increase', detail: 'GTP: more front brake migration shifts regen braking forward, reducing rear light-ness on entry.' },
      { ids: REAR_ROLL,          direction: 'decrease', detail: 'Softer rear roll stiffness adds rear mechanical grip on entry.' },
      { ids: REAR_LS_BUMP,       direction: 'increase', detail: 'Firmer rear bump resists rear squat on turn-in, keeping the rear level and planted.' },
      { ids: REAR_TOE,           direction: 'increase', detail: 'More rear toe-in adds straight-line and entry stability.' },
      { ids: ['rear_wing'],      direction: 'increase', detail: 'More rear downforce keeps the rear planted at speed.' },
    ],
  },

  {
    id: 'mid_understeer',
    label: 'Tight / understeer mid-corner',
    phase: 'Mid-corner',
    description: 'The car washes wide at the apex — runs out of front grip at constant throttle.',
    fixes: [
      { ids: FRONT_ROLL,       direction: 'decrease', detail: 'Softer front ARB shifts grip balance toward the front mid-corner.' },
      { ids: REAR_ROLL,        direction: 'increase', detail: 'Stiffer rear ARB encourages rotation through the apex.' },
      { ids: FRONT_CAMBER,     direction: 'decrease', detail: 'More negative front camber increases grip on the loaded front tyre.' },
      { ids: ['front_wing'],   direction: 'increase', detail: 'More front downforce balances the aero toward the front mid-corner.' },
      { ids: FRONT_RIDE,       direction: 'decrease', detail: 'Lower front ride height increases front ground-effect/downforce — check tech minimums first.' },
      { ids: FRONT_PRESSURE,   direction: 'decrease', detail: 'Lower front pressures increase the contact patch for more mid-corner grip.' },
      { ids: ['cross_weight'], direction: 'decrease', detail: 'Less wedge reduces mid-corner push on ovals.' },
    ],
  },

  {
    id: 'mid_oversteer',
    label: 'Loose / oversteer mid-corner',
    phase: 'Mid-corner',
    description: 'The rear is loose through the apex — the car wants to rotate too much at constant throttle.',
    fixes: [
      { ids: FRONT_ROLL,       direction: 'increase', detail: 'Stiffer front ARB moves the balance toward understeer mid-corner.' },
      { ids: REAR_ROLL,        direction: 'decrease', detail: 'Softer rear ARB adds rear mechanical grip at the apex.' },
      { ids: REAR_CAMBER,      direction: 'decrease', detail: 'More negative rear camber increases rear cornering load.' },
      { ids: ['rear_wing'],    direction: 'increase', detail: 'More rear downforce settles the rear at cornering speed.' },
      { ids: REAR_RIDE,        direction: 'decrease', detail: 'Lower rear ride height increases rear downforce and rear grip mid-corner.' },
      { ids: ['cross_weight'], direction: 'increase', detail: 'More wedge tightens the car on ovals.' },
    ],
  },

  {
    id: 'exit_understeer',
    label: "Tight on exit — won't rotate under power",
    phase: 'Exit',
    description: 'The car pushes wide when you get back on the throttle out of the corner.',
    fixes: [
      { ids: REAR_LS_BUMP,     direction: 'decrease', detail: 'Softer rear bump allows more rear squat under power, loading the rear tyres and helping the car rotate.' },
      { ids: ['diff_power'],   direction: 'increase', detail: 'Larger power-ramp angle reduces diff locking under throttle so the car can pivot out of the corner.' },
      { ids: ['diff_preload'], direction: 'decrease', detail: 'Less preload frees rotation as you pick up the throttle in slow corners.' },
      { ids: FRONT_ROLL,       direction: 'decrease', detail: 'Softer front ARB keeps front grip on exit so the nose follows the steering.' },
      { ids: ['front_wing'],   direction: 'increase', detail: 'More front downforce helps the nose follow the steering under throttle.' },
    ],
  },

  {
    id: 'exit_oversteer',
    label: 'Power-on oversteer / wheelspin',
    phase: 'Exit',
    description: 'The rear lights up or snaps as you apply power — poor traction on corner exit.',
    fixes: [
      { ids: ['diff_power'],              direction: 'decrease', detail: 'Smaller power-ramp angle locks the diff more under throttle, putting power down evenly.' },
      { ids: FRONT_LS_REBOUND,            direction: 'increase', detail: 'Slower front rebound retains front load longer on exit, preventing the balance from snapping to the rear.' },
      { ids: REAR_LS_BUMP,                direction: 'increase', detail: 'Firmer rear bump resists squat on throttle application, reducing rear rotation.' },
      { ids: REAR_ROLL,                   direction: 'decrease', detail: 'Softer rear ARB adds rear traction on exit.' },
      { ids: REAR_SPRINGS,                direction: 'decrease', detail: 'Softer rear springs let the rear squat and hook up under power.' },
      { ids: REAR_PRESSURE,               direction: 'decrease', detail: 'Lower rear tyre pressures enlarge the contact patch for traction.' },
      { ids: ['rear_wing'],               direction: 'increase', detail: 'More rear downforce adds grip for putting power down on exit.' },
      { ids: ['motor_map', 'engine_map'], direction: 'decrease', detail: 'GTP: lower motor/engine map softens power delivery and reduces wheelspin.' },
    ],
  },

  {
    id: 'braking_instability',
    label: 'Unstable / locks under braking',
    phase: 'Braking',
    description: 'The rear gets light or locks, or the car wanders under heavy braking.',
    fixes: [
      { ids: ['brake_bias'],      direction: 'increase', detail: 'More front brake bias is the fastest in-session fix — standard iRacing black box adjustment.' },
      { ids: FRONT_LS_BUMP,       direction: 'increase', detail: 'Firmer front bump controls nose dive under heavy braking, keeping weight distribution stable.' },
      { ids: ['diff_coast'],      direction: 'decrease', detail: 'More coast ramp locking stabilises the rear under engine braking.' },
      { ids: ['brake_migration'], direction: 'increase', detail: 'GTP: more front brake migration shifts regen braking forward, preventing rear lock.' },
      { ids: ['regen_level'],     direction: 'decrease', detail: 'GTP: reducing regen softens engine-braking effect, reducing rear step-out on lift-off.' },
      { ids: REAR_TOE,            direction: 'increase', detail: 'More rear toe-in adds straight-line stability under braking.' },
      { ids: ['rear_wing'],       direction: 'increase', detail: 'More rear downforce keeps the rear planted while braking at speed.' },
    ],
  },

  {
    id: 'kerb_instability',
    label: 'Loses grip over kerbs / bumps',
    phase: 'Entry',
    description: 'The car bounces, loses downforce, or becomes nervous when riding kerbs or crossing bumps at speed. More common in GTP/prototype cars with stiff aero setups.',
    fixes: [
      { ids: FRONT_HS_BUMP,    direction: 'decrease', detail: 'Softer front high-speed bump absorbs kerb impacts without bouncing the chassis — preserves front downforce.' },
      { ids: REAR_HS_BUMP,     direction: 'decrease', detail: 'Softer rear high-speed bump reduces rear hop over kerbs and keeps the rear planted.' },
      { ids: FRONT_HS_REBOUND, direction: 'increase', detail: 'Slower front high-speed rebound damps oscillation after a kerb hit, settling the nose faster.' },
      { ids: REAR_HS_REBOUND,  direction: 'increase', detail: 'Slower rear HS rebound reduces rear chatter and wheel hop after a kerb impact.' },
      { ids: REAR_LS_BUMP,     direction: 'decrease', detail: 'Softer rear low-speed bump increases compliance over road irregularities; helps rear grip through bumpy sections.' },
    ],
  },

  {
    id: 'slow_corner_understeer',
    label: 'Understeer in slow / tight corners',
    phase: 'Mid-corner',
    description: 'The car plows straight in hairpins and slow technical sections where mechanical grip matters far more than aero downforce.',
    fixes: [
      { ids: ['diff_preload'], direction: 'decrease', detail: 'Less diff preload frees rotation in slow corners — a locked diff creates major understeer at low speed.' },
      { ids: FRONT_ROLL,       direction: 'decrease', detail: 'Softer front ARB improves front mechanical grip in slow-speed corners where aero is minimal.' },
      { ids: REAR_ROLL,        direction: 'increase', detail: 'Stiffer rear ARB loads the outside rear tyre, helping the car pivot in tight corners.' },
      { ids: FRONT_PRESSURE,   direction: 'decrease', detail: 'Lower front tyre pressures grow the contact patch for more slow-corner bite.' },
      { ids: FRONT_CAMBER,     direction: 'decrease', detail: 'More negative front camber maximises the contact patch on the loaded inside front tyre.' },
      { ids: FRONT_SPRINGS,    direction: 'decrease', detail: 'Softer front springs allow the front to load up more in slow corners.' },
    ],
  },

  {
    id: 'high_speed_instability',
    label: 'Nervous / twitchy at high speed',
    phase: 'Straights',
    description: 'The car feels darty or unstable on fast straights and high-speed corners.',
    fixes: [
      { ids: ['rear_wing'],   direction: 'increase', detail: 'More rear downforce is the primary fix for high-speed instability (costs top speed).' },
      { ids: REAR_RIDE,       direction: 'decrease', detail: 'Lower rear ride height increases diffuser/rear downforce; improves high-speed stability.' },
      { ids: FRONT_RIDE,      direction: 'increase', detail: 'Raising the front shifts the aero balance rearward for stability.' },
      { ids: ['diff_preload'],direction: 'increase', detail: 'More preload gives a more locked, planted straight-line feel.' },
      { ids: REAR_TOE,        direction: 'increase', detail: 'More rear toe-in improves straight-line stability.' },
      { ids: REAR_LS_REBOUND, direction: 'increase', detail: 'Slower rear rebound reduces aero platform oscillation at speed.' },
    ],
  },
];
