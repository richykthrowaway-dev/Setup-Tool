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
  /**
   * quick  = high-leverage, fast to diagnose, should be tried before springs/dampers
   * advanced = powerful but interacts with other parameters; change after the basics
   */
  priority?: 'quick' | 'advanced';
}

// ─── Tuning Priority Ladder ──────────────────────────────────────────────────
// Sourced from: iRacing official setup guide, Ferrari/BMW GT3 manuals,
// VRS setup articles, Coach Dave Academy, and iRacer community guides.

export interface TuningPriorityStep {
  rank: number;
  label: string;
  phase: string;
  detail: string;
  stepNote: string;
}

export interface ConditionNote {
  label: string;
  detail: string;
}

export const TUNING_PRIORITY: TuningPriorityStep[] = [
  {
    rank: 1,
    label: 'Tyre Pressures',
    phase: 'Whole lap',
    detail:
      'The most powerful single setup change. Cold pressure affects carcass stiffness, grip level, heat build, and stint-long balance. Always adjust first and check hot pressures after a proper run before touching anything else.',
    stepNote: 'One small increment at a time; confirm hot pressures stabilise in the target window.',
  },
  {
    rank: 2,
    label: 'Brake Bias',
    phase: 'Entry / Braking',
    detail:
      'Fastest way to fix braking confidence and entry rotation without destabilising the rest of the car. Adjustable mid-session via the iRacing Black Box — no garage stop needed.',
    stepNote: '~0.2–0.5% per adjustment, or one Black Box click.',
  },
  {
    rank: 3,
    label: 'Anti-Roll Bars',
    phase: 'Entry → Exit',
    detail:
      'Cleanest balance tool without touching ride heights. Softer front ARB adds front grip; stiffer rear ARB adds rotation and mid-corner stability. Change one end at a time and retest.',
    stepNote: 'One position / one blade step per test.',
  },
  {
    rank: 4,
    label: 'Wing & Ride Height',
    phase: 'Mid-corner + Straights',
    detail:
      'Biggest performance lever on aero cars (GT3, GTP, Formula). Always move wing and ride height together — adding rear wing needs more rake to preserve front/rear aero balance. Use telemetry to confirm dynamic ride heights.',
    stepNote: 'One wing click; rebalance front/rear ride heights to match. Never change wing without checking rake.',
  },
  {
    rank: 5,
    label: 'Differential',
    phase: 'Entry + Exit',
    detail:
      'Shapes corner entry stability (coast ramp / preload), lift-off rotation, and slow-corner drive traction (power ramp). High-impact in technical and slow-speed sections. Less important on fast sweepers.',
    stepNote: 'One garage step per test.',
  },
  {
    rank: 6,
    label: 'Springs & Dampers',
    phase: 'Transitions + Bumps',
    detail:
      'Powerful but easy to mis-diagnose — springs interact with ride heights, and dampers interact with each other. After any spring change, re-check ride height, camber, and toe. Dampers are best used to solve specific transition or bump problems, not general balance.',
    stepNote: 'One step on springs (then re-check heights); one click on dampers.',
  },
];

export const CONDITION_NOTES: ConditionNote[] = [
  {
    label: 'Wet / Rain',
    detail:
      'Fit wet tyres first. Move brake bias 1–2% rearward (less front lock risk on low-grip surfaces). Add rear wing for stability. Soften suspension slightly for compliance on standing water. Use wet ABS/TC maps if the car provides them. Wet tyres overheat and wear extremely fast on a drying surface — pit as soon as dry tyres are viable.',
  },
  {
    label: 'Qualifying',
    detail:
      'Low fuel load means the car runs higher and lighter. You may be able to reduce drag (less rear wing) while maintaining the same aero balance at lower ride heights. Push tyre pressures toward the upper edge of the window for sharper response. Aggressive brake bias and diff preload are acceptable when you only need one lap.',
  },
  {
    label: 'Race / Endurance',
    detail:
      'Full fuel load lowers the car and can push it out of the optimal aero window — raise ride heights slightly from your quali baseline and recheck. Favour calmer rear behaviour, conservative diff settings, and lower camber extremes to manage tyre life. Build in brake temperature margin. If a sprint setup feels edgy at race fuel, soften ARBs one step.',
  },
  {
    label: 'GT3 vs Formula',
    detail:
      'GT3: fix balance with pressures, brake bias, ARBs, rear wing, and diff first — mechanical grip dominates most of the lap. Formula / GTP: ride height and wing control matter more because losing the aero platform is catastrophic; heave / third springs stabilise the floor at speed. On formula cars, fix pressures, brake bias, ARBs, and ride height/rake before reaching for heave springs or diff angles.',
  },
];

// ─── Candidate parameter id groups ───────────────────────────────────────────
// Multiple ids per group because naming varies across car classes.

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
  // ─── Entry ───────────────────────────────────────────────────────────────

  {
    id: 'entry_understeer',
    label: 'Tight / understeer on entry',
    phase: 'Entry',
    priority: 'quick',
    description:
      "The car won't turn in — the nose pushes wide as you brake into the corner. Most common symptom in GT3 cars; often cured before touching springs or dampers.",
    fixes: [
      { ids: FRONT_LS_BUMP,    direction: 'decrease', detail: 'Softer front low-speed bump lets the nose dive faster under braking, loading the front tyres and sharpening turn-in.' },
      { ids: FRONT_ROLL,       direction: 'decrease', detail: 'Softer front ARB frees up front mechanical grip on turn-in — one of the fastest fixes.' },
      { ids: ['brake_bias'],   direction: 'decrease', detail: 'Less front brake bias lets the fronts roll into the corner while trail-braking without locking. Adjust in the Black Box first.' },
      { ids: FRONT_CAMBER,     direction: 'decrease', detail: 'More negative front camber increases the loaded front tyre contact patch on entry.' },
      { ids: ['front_wing'],   direction: 'increase', detail: 'More front downforce sharpens turn-in at speed (aero cars only).' },
      { ids: FRONT_SPRINGS,    direction: 'decrease', detail: 'Softer front springs allow more front mechanical grip on entry — re-check ride height after changing.' },
      { ids: FRONT_PRESSURE,   direction: 'decrease', detail: 'Lower front tyre pressures grow the contact patch for more bite on turn-in.' },
      { ids: ['cross_weight'], direction: 'decrease', detail: 'Less wedge/cross-weight reduces entry tightness (oval-specific).' },
    ],
  },

  {
    id: 'entry_oversteer',
    label: 'Loose / oversteer on entry',
    phase: 'Entry',
    priority: 'quick',
    description:
      'The rear steps out as you turn in or trail-brake — the car feels nervous on the way into the corner.',
    fixes: [
      { ids: ['brake_bias'],      direction: 'increase', detail: 'More front brake bias settles the rear under trail-braking. Standard first move in the iRacing Black Box.' },
      { ids: REAR_TOE,            direction: 'increase', detail: 'More rear toe-in adds straight-line and entry stability.' },
      { ids: FRONT_LS_BUMP,       direction: 'increase', detail: 'Firmer front bump slows nose dive, keeping weight distribution more balanced on entry.' },
      { ids: REAR_LS_REBOUND,     direction: 'increase', detail: 'Slower rear rebound keeps the rear planted as it tries to extend/unload under trail-braking.' },
      { ids: ['brake_migration'],  direction: 'increase', detail: 'GTP: more front brake migration shifts regen braking forward, reducing rear lightness on entry. Note: after the 2025 bug fix, lower overall migration values are recommended alongside adding ~1% front bias.' },
      { ids: REAR_ROLL,           direction: 'decrease', detail: 'Softer rear ARB adds rear mechanical grip on entry.' },
      { ids: REAR_LS_BUMP,        direction: 'increase', detail: 'Firmer rear bump resists rear squat on turn-in, keeping the rear planted.' },
      { ids: ['rear_wing'],       direction: 'increase', detail: 'More rear downforce keeps the rear planted at cornering speed.' },
    ],
  },

  {
    id: 'front_lock',
    label: 'Front tyres locking under braking',
    phase: 'Braking',
    priority: 'quick',
    description:
      'The front wheels lock and the car goes straight on under heavy braking — too much brake force at the front. This is the direct opposite of braking instability and the fastest fix is brake bias.',
    fixes: [
      { ids: ['brake_bias'],      direction: 'decrease', detail: 'Less front brake bias is the immediate fix — reduce until locking stops. Adjust in the iRacing Black Box.' },
      { ids: ['brake_migration'], direction: 'decrease', detail: 'GTP: less front brake migration reduces front regen braking contribution, easing front lock risk.' },
      { ids: FRONT_PRESSURE,      direction: 'increase', detail: 'Slightly higher front pressures reduce front tyre flex and can reduce lock tendency, though check for temperature effects.' },
      { ids: ['diff_coast'],      direction: 'increase', detail: 'Less coast ramp locking reduces engine-braking contribution at the rear, letting brake bias do more work at the front without locking.' },
    ],
  },

  // ─── Mid-corner ──────────────────────────────────────────────────────────

  {
    id: 'mid_understeer',
    label: 'Tight / understeer mid-corner',
    phase: 'Mid-corner',
    priority: 'quick',
    description: 'The car washes wide at the apex — runs out of front grip at constant throttle.',
    fixes: [
      { ids: FRONT_ROLL,       direction: 'decrease', detail: 'Softer front ARB shifts grip balance toward the front mid-corner.' },
      { ids: REAR_ROLL,        direction: 'increase', detail: 'Stiffer rear ARB encourages rotation through the apex.' },
      { ids: FRONT_CAMBER,     direction: 'decrease', detail: 'More negative front camber increases grip on the loaded front tyre.' },
      { ids: ['front_wing'],   direction: 'increase', detail: 'More front downforce balances the aero toward the front mid-corner.' },
      { ids: FRONT_RIDE,       direction: 'decrease', detail: 'Lower front ride height increases front downforce — check tech minimums first.' },
      { ids: FRONT_PRESSURE,   direction: 'decrease', detail: 'Lower front pressures increase the contact patch for more mid-corner grip.' },
      { ids: ['cross_weight'], direction: 'decrease', detail: 'Less wedge reduces mid-corner push on ovals.' },
    ],
  },

  {
    id: 'mid_oversteer',
    label: 'Loose / oversteer mid-corner',
    phase: 'Mid-corner',
    priority: 'quick',
    description: 'The rear is loose through the apex — the car wants to rotate too much at constant throttle.',
    fixes: [
      { ids: FRONT_ROLL,       direction: 'increase', detail: 'Stiffer front ARB moves the balance toward understeer mid-corner.' },
      { ids: REAR_ROLL,        direction: 'decrease', detail: 'Softer rear ARB adds rear mechanical grip at the apex.' },
      { ids: REAR_CAMBER,      direction: 'decrease', detail: 'More negative rear camber increases rear cornering load.' },
      { ids: ['rear_wing'],    direction: 'increase', detail: 'More rear downforce settles the rear at cornering speed.' },
      { ids: REAR_RIDE,        direction: 'decrease', detail: 'Lower rear ride height increases diffuser/rear downforce.' },
      { ids: ['cross_weight'], direction: 'increase', detail: 'More wedge tightens the car on ovals.' },
    ],
  },

  {
    id: 'slow_corner_understeer',
    label: 'Understeer in slow / tight corners',
    phase: 'Mid-corner',
    priority: 'quick',
    description: 'The car plows straight in hairpins and slow technical sections where mechanical grip matters far more than aero downforce.',
    fixes: [
      { ids: ['diff_preload'],  direction: 'decrease', detail: 'Less diff preload frees rotation in slow corners — a locked diff creates major understeer at low speed.' },
      { ids: FRONT_ROLL,        direction: 'decrease', detail: 'Softer front ARB improves front mechanical grip in slow-speed corners where aero is minimal.' },
      { ids: REAR_ROLL,         direction: 'increase', detail: 'Stiffer rear ARB loads the outside rear tyre, helping the car pivot in tight corners.' },
      { ids: FRONT_PRESSURE,    direction: 'decrease', detail: 'Lower front tyre pressures grow the contact patch for more slow-corner bite.' },
      { ids: FRONT_CAMBER,      direction: 'decrease', detail: 'More negative front camber maximises the contact patch on the loaded outside front tyre.' },
      { ids: FRONT_SPRINGS,     direction: 'decrease', detail: 'Softer front springs allow more front load transfer in slow corners — re-check ride height after.' },
    ],
  },

  // ─── Exit ─────────────────────────────────────────────────────────────────

  {
    id: 'exit_understeer',
    label: "Tight on exit — won't rotate under power",
    phase: 'Exit',
    priority: 'quick',
    description: 'The car pushes wide when you get back on the throttle out of the corner.',
    fixes: [
      { ids: REAR_LS_BUMP,     direction: 'decrease', detail: 'Softer rear bump allows more rear squat under power, loading the rear tyres and helping rotation.' },
      { ids: ['diff_power'],   direction: 'increase', detail: 'Larger power-ramp angle reduces diff locking under throttle so the car can pivot on exit.' },
      { ids: ['diff_preload'], direction: 'decrease', detail: 'Less preload frees rotation as you pick up the throttle in slow corners.' },
      { ids: FRONT_ROLL,       direction: 'decrease', detail: 'Softer front ARB keeps front grip on exit so the nose follows the steering.' },
      { ids: ['front_wing'],   direction: 'increase', detail: 'More front downforce helps the nose follow the steering under throttle.' },
    ],
  },

  {
    id: 'exit_oversteer',
    label: 'Power-on oversteer / wheelspin',
    phase: 'Exit',
    priority: 'quick',
    description: 'The rear lights up or snaps as you apply power — poor traction on corner exit.',
    fixes: [
      { ids: ['diff_power'],              direction: 'decrease', detail: 'Smaller power-ramp angle locks the diff more under throttle, distributing traction evenly.' },
      { ids: FRONT_LS_REBOUND,            direction: 'increase', detail: 'Slower front rebound retains front load longer on exit, preventing balance from snapping to the rear.' },
      { ids: REAR_LS_BUMP,                direction: 'increase', detail: 'Firmer rear bump resists squat on throttle, reducing rear rotation.' },
      { ids: REAR_ROLL,                   direction: 'decrease', detail: 'Softer rear ARB adds rear traction on exit.' },
      { ids: REAR_SPRINGS,                direction: 'decrease', detail: 'Softer rear springs let the rear squat and hook up under power — re-check ride height after.' },
      { ids: REAR_PRESSURE,               direction: 'decrease', detail: 'Lower rear tyre pressures enlarge the contact patch for traction.' },
      { ids: ['rear_wing'],               direction: 'increase', detail: 'More rear downforce adds grip for putting power down on exit.' },
      { ids: ['motor_map', 'engine_map'], direction: 'decrease', detail: 'GTP: lower motor/engine map softens power delivery and reduces wheelspin threshold.' },
    ],
  },

  // ─── Braking ──────────────────────────────────────────────────────────────

  {
    id: 'braking_instability',
    label: 'Unstable / rear locks under braking',
    phase: 'Braking',
    priority: 'quick',
    description: 'The rear gets light or locks, or the car wanders under heavy braking. First port of call is always brake bias in the Black Box — no garage stop needed.',
    fixes: [
      { ids: ['brake_bias'],         direction: 'increase', detail: 'More front brake bias is the fastest in-session fix — standard iRacing Black Box adjustment.' },
      { ids: FRONT_LS_BUMP,          direction: 'increase', detail: 'Firmer front bump controls nose dive, keeping weight distribution stable under heavy braking.' },
      { ids: ['diff_coast'],         direction: 'decrease', detail: 'More coast ramp locking stabilises the rear under engine braking.' },
      { ids: ['brake_migration'],    direction: 'increase', detail: 'GTP: more front brake migration shifts regen braking forward, preventing rear lock. After the 2025 fix, pair with ~1–1.25% extra front bias and halve previous migration values.' },
      { ids: ['regen_level'],        direction: 'decrease', detail: 'GTP: lower regen softens lift-off deceleration, reducing rear step-out on corner entry.' },
      { ids: REAR_TOE,               direction: 'increase', detail: 'More rear toe-in adds stability under braking.' },
      { ids: ['rear_wing'],          direction: 'increase', detail: 'More rear downforce keeps the rear planted while braking at speed.' },
    ],
  },

  // ─── Straights ────────────────────────────────────────────────────────────

  {
    id: 'high_speed_instability',
    label: 'Nervous / twitchy at high speed',
    phase: 'Straights',
    priority: 'quick',
    description: 'The car feels darty or unstable on fast straights and high-speed corners. Usually an aero or rear downforce issue.',
    fixes: [
      { ids: ['rear_wing'],    direction: 'increase', detail: 'More rear downforce is the primary fix for high-speed instability (costs top speed).' },
      { ids: REAR_RIDE,        direction: 'decrease', detail: 'Lower rear ride height increases diffuser/rear downforce; improves high-speed stability.' },
      { ids: FRONT_RIDE,       direction: 'increase', detail: 'Raising the front shifts the aero balance rearward for stability.' },
      { ids: ['diff_preload'], direction: 'increase', detail: 'More preload gives a more locked, planted straight-line feel.' },
      { ids: REAR_TOE,         direction: 'increase', detail: 'More rear toe-in improves straight-line stability.' },
      { ids: REAR_LS_REBOUND,  direction: 'increase', detail: 'Slower rear rebound reduces aero platform oscillation at speed.' },
    ],
  },

  // ─── Advanced / bump/kerb ─────────────────────────────────────────────────

  {
    id: 'kerb_instability',
    label: 'Loses grip over kerbs / bumps',
    phase: 'Entry',
    priority: 'advanced',
    description: 'The car bounces, loses downforce, or becomes nervous when riding kerbs or crossing bumps at speed. High-speed (HS) dampers control this; low-speed dampers have little effect on kerb impacts.',
    fixes: [
      { ids: FRONT_HS_BUMP,    direction: 'decrease', detail: 'Softer front high-speed bump absorbs kerb impacts without bouncing the chassis — preserves front downforce.' },
      { ids: REAR_HS_BUMP,     direction: 'decrease', detail: 'Softer rear high-speed bump reduces rear hop over kerbs and keeps the rear planted.' },
      { ids: FRONT_HS_REBOUND, direction: 'increase', detail: 'Slower front high-speed rebound damps oscillation after a kerb hit, settling the nose faster.' },
      { ids: REAR_HS_REBOUND,  direction: 'increase', detail: 'Slower rear HS rebound reduces rear chatter and wheel hop after a kerb impact.' },
      { ids: REAR_LS_BUMP,     direction: 'decrease', detail: 'Softer rear low-speed bump increases compliance over general road irregularities.' },
    ],
  },

  {
    id: 'bottoming_out',
    label: 'Car bottoming / scraping on bumps',
    phase: 'Straights',
    priority: 'advanced',
    description: 'The car is hitting the ground under braking, over bumps, or at speed. Bottoming destroys both balance and downforce — it must be fixed before tuning anything else.',
    fixes: [
      { ids: FRONT_RIDE,    direction: 'increase', detail: 'Raising front ride height provides more clearance under braking and through compression zones.' },
      { ids: REAR_RIDE,     direction: 'increase', detail: 'Raising rear ride height prevents diffuser strikes that kill rear downforce and stability.' },
      { ids: FRONT_SPRINGS, direction: 'increase', detail: 'Stiffer front springs reduce compression under braking — re-check ride height and camber after.' },
      { ids: REAR_SPRINGS,  direction: 'increase', detail: 'Stiffer rear springs reduce compression at speed — re-check ride height after.' },
      { ids: FRONT_LS_BUMP, direction: 'increase', detail: 'Firmer front bump slows compression under braking, reducing the depth of dive before the car bottoms.' },
    ],
  },
];
