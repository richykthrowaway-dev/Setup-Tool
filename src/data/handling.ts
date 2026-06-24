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

// Candidate id groups reused across symptoms.
const FRONT_ROLL = ['front_arb', 'front_sway_bar'];
const REAR_ROLL = ['rear_arb', 'rear_sway_bar'];
const FRONT_SPRINGS = ['front_spring_rate', 'lf_spring_rate', 'rf_spring_rate'];
const REAR_SPRINGS = ['rear_spring_rate', 'lr_spring_rate', 'rr_spring_rate'];
const FRONT_CAMBER = ['front_camber', 'lf_camber', 'rf_camber'];
const REAR_CAMBER = ['rear_camber', 'lr_camber', 'rr_camber'];
const REAR_TOE = ['rear_toe', 'lr_toe', 'rr_toe'];
const FRONT_PRESSURE = ['lf_cold_pressure', 'rf_cold_pressure'];
const REAR_PRESSURE = ['lr_cold_pressure', 'rr_cold_pressure'];
const FRONT_RIDE = ['front_ride_height', 'lf_ride_height', 'rf_ride_height'];

export const handlingSymptoms: HandlingSymptom[] = [
  {
    id: 'entry_understeer',
    label: 'Tight / understeer on entry',
    phase: 'Entry',
    description:
      "The car won't turn in — the nose pushes wide as you brake into the corner.",
    fixes: [
      { ids: FRONT_ROLL, direction: 'decrease', detail: 'Softer front roll stiffness frees up front grip on turn-in.' },
      { ids: ['brake_bias'], direction: 'decrease', detail: 'Less front brake bias lets the fronts roll into the corner while trail-braking.' },
      { ids: ['front_wing'], direction: 'increase', detail: 'More front downforce sharpens turn-in at speed.' },
      { ids: FRONT_SPRINGS, direction: 'decrease', detail: 'Softer front springs add front mechanical grip.' },
      { ids: FRONT_PRESSURE, direction: 'decrease', detail: 'Lower front pressures grow the contact patch for more bite.' },
      { ids: ['cross_weight'], direction: 'decrease', detail: 'Less wedge/cross-weight reduces entry tightness (push).' },
    ],
  },
  {
    id: 'entry_oversteer',
    label: 'Loose / oversteer on entry',
    phase: 'Entry',
    description:
      'The rear steps out as you turn in or trail-brake — the car feels nervous on the way into the corner.',
    fixes: [
      { ids: ['brake_bias'], direction: 'increase', detail: 'More front brake bias settles the rear under trail-braking.' },
      { ids: ['diff_coast'], direction: 'decrease', detail: 'More coast (engine-braking) lock keeps the rear planted on entry.' },
      { ids: REAR_ROLL, direction: 'decrease', detail: 'Softer rear roll stiffness adds rear grip on entry.' },
      { ids: REAR_TOE, direction: 'increase', detail: 'More rear toe-in adds straight-line and entry stability.' },
      { ids: ['rear_wing'], direction: 'increase', detail: 'More rear downforce stabilises the rear at speed.' },
    ],
  },
  {
    id: 'mid_understeer',
    label: 'Tight / understeer mid-corner',
    phase: 'Mid-corner',
    description: 'The car washes wide at the apex and runs out of front grip.',
    fixes: [
      { ids: FRONT_ROLL, direction: 'decrease', detail: 'Softer front roll stiffness shifts grip balance to the front.' },
      { ids: REAR_ROLL, direction: 'increase', detail: 'Stiffer rear roll stiffness encourages rotation through the apex.' },
      { ids: FRONT_CAMBER, direction: 'decrease', detail: 'More negative front camber increases grip on the loaded front tyre.' },
      { ids: ['front_wing'], direction: 'increase', detail: 'More front downforce balances the car toward the front.' },
      { ids: ['cross_weight'], direction: 'decrease', detail: 'Less wedge reduces mid-corner push on ovals.' },
    ],
  },
  {
    id: 'mid_oversteer',
    label: 'Loose / oversteer mid-corner',
    phase: 'Mid-corner',
    description: 'The rear is loose through the apex and the car wants to rotate too much.',
    fixes: [
      { ids: FRONT_ROLL, direction: 'increase', detail: 'Stiffer front roll stiffness moves balance toward understeer.' },
      { ids: REAR_ROLL, direction: 'decrease', detail: 'Softer rear roll stiffness adds rear grip mid-corner.' },
      { ids: REAR_CAMBER, direction: 'decrease', detail: 'More negative rear camber increases rear cornering grip.' },
      { ids: ['rear_wing'], direction: 'increase', detail: 'More rear downforce settles the rear at speed.' },
      { ids: ['cross_weight'], direction: 'increase', detail: 'More wedge tightens the car on ovals.' },
    ],
  },
  {
    id: 'exit_understeer',
    label: "Tight on exit — won't rotate under power",
    phase: 'Exit',
    description: 'The car pushes wide when you get back on the throttle out of the corner.',
    fixes: [
      { ids: ['diff_power'], direction: 'increase', detail: 'A larger power-ramp angle reduces diff locking under throttle so the car rotates on exit.' },
      { ids: ['diff_preload'], direction: 'decrease', detail: 'Less preload frees rotation as you pick up the throttle.' },
      { ids: FRONT_ROLL, direction: 'decrease', detail: 'Softer front roll stiffness keeps front grip on corner exit.' },
      { ids: ['front_wing'], direction: 'increase', detail: 'More front downforce helps the nose follow the throttle.' },
    ],
  },
  {
    id: 'exit_oversteer',
    label: 'Power-on oversteer / wheelspin',
    phase: 'Exit',
    description: 'The rear lights up or snaps as you apply power on exit — poor traction.',
    fixes: [
      { ids: ['diff_power'], direction: 'decrease', detail: 'A smaller power-ramp angle locks the diff more under throttle, putting power down evenly.' },
      { ids: REAR_ROLL, direction: 'decrease', detail: 'Softer rear roll stiffness increases rear traction on exit.' },
      { ids: REAR_SPRINGS, direction: 'decrease', detail: 'Softer rear springs let the rear squat and hook up under power.' },
      { ids: REAR_PRESSURE, direction: 'decrease', detail: 'Lower rear pressures enlarge the contact patch for traction.' },
      { ids: ['rear_wing'], direction: 'increase', detail: 'More rear downforce adds grip for putting power down.' },
    ],
  },
  {
    id: 'braking_instability',
    label: 'Unstable / locks under braking',
    phase: 'Braking',
    description: 'The rear gets light or locks, or the car wanders under heavy braking.',
    fixes: [
      { ids: ['brake_bias'], direction: 'increase', detail: 'More front brake bias stops the rears locking and stepping out.' },
      { ids: ['diff_coast'], direction: 'decrease', detail: 'More coast lock stabilises the rear under engine braking.' },
      { ids: REAR_TOE, direction: 'increase', detail: 'More rear toe-in adds stability in a straight line.' },
      { ids: ['rear_wing'], direction: 'increase', detail: 'More rear downforce keeps the rear planted while braking at speed.' },
    ],
  },
  {
    id: 'high_speed_instability',
    label: 'Nervous / twitchy at high speed',
    phase: 'Straights',
    description: 'The car feels darty or unstable on fast straights and high-speed corners.',
    fixes: [
      { ids: ['rear_wing'], direction: 'increase', detail: 'More rear downforce adds high-speed stability (costs some top speed).' },
      { ids: FRONT_RIDE, direction: 'increase', detail: 'Raising the front shifts aero balance rearward for stability.' },
      { ids: ['diff_preload'], direction: 'increase', detail: 'More preload gives a more locked, planted straight-line feel.' },
      { ids: REAR_TOE, direction: 'increase', detail: 'More rear toe-in improves straight-line stability.' },
    ],
  },
];
