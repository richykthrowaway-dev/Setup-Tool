/**
 * Structured knowledge base extracted from the iRacing Road-Course Setup Manual.
 * Content covers fundamentals, troubleshooting, parameters, differentials,
 * tires, strategy, car classes, and advanced concepts.
 */

export type KnowledgeCategory =
  | 'fundamentals'
  | 'troubleshooting'
  | 'parameters'
  | 'differential'
  | 'tires'
  | 'strategy'
  | 'car-classes'
  | 'advanced';

export const CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  fundamentals: 'Fundamentals',
  troubleshooting: 'Troubleshooting',
  parameters: 'Parameters',
  differential: 'Differential',
  tires: 'Tires',
  strategy: 'Strategy',
  'car-classes': 'Car Classes',
  advanced: 'Advanced',
};

export const CATEGORY_COLORS: Record<KnowledgeCategory, string> = {
  fundamentals: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  troubleshooting: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  parameters: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  differential: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  tires: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  strategy: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'car-classes': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  advanced: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
};

export interface KnowledgeTable {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface KnowledgeList {
  type: 'list';
  items: Array<{ label: string; detail?: string }>;
}

export interface KnowledgeText {
  type: 'text';
  body: string;
}

export type KnowledgeBlock = KnowledgeTable | KnowledgeList | KnowledgeText;

export interface KnowledgeEntry {
  id: string;
  category: KnowledgeCategory;
  title: string;
  subtitle?: string;
  tags: string[];
  blocks: KnowledgeBlock[];
}

export const knowledgeEntries: KnowledgeEntry[] = [

  // ─── FUNDAMENTALS ─────────────────────────────────────────────────────────

  {
    id: 'core-definitions',
    category: 'fundamentals',
    title: 'Core Definitions',
    subtitle: 'Tight, loose, phases, and grip types explained.',
    tags: ['tight', 'loose', 'understeer', 'oversteer', 'push', 'entry', 'mid-corner', 'exit', 'mechanical', 'aero', 'rake', 'phase'],
    blocks: [
      {
        type: 'table',
        headers: ['Term', 'Practical Meaning', 'Primary Tools'],
        rows: [
          ['Tight / Understeer / Push', 'Front tires give up grip first', 'More front grip, less rear grip, less front overload'],
          ['Loose / Oversteer', 'Rear tires give up grip first', 'More rear grip, more rear stability, less rotation'],
          ['Entry', 'Brake, trail brake, first steering input', 'Brake bias, toe, front damping, coast diff'],
          ['Mid-corner', 'Steady steering near apex', 'Camber, ARBs, springs, aero balance'],
          ['Exit', 'Throttle on while unwinding steering', 'Diff power side, rear ARB, TC, rear spring'],
          ['Mechanical grip', 'Grip from tire and suspension following the road', 'Dominant at low speed and over bumps'],
          ['Aero grip', 'Grip from downforce', 'Dominant at higher speed'],
          ['Rake', 'Rear ride height relative to front', 'Changes aero balance and total downforce'],
          ['Bump / compression', 'Damper resistance as shock shortens', 'Controls how quickly load arrives on that corner'],
          ['Rebound', 'Damper resistance as shock extends', 'Controls how quickly load leaves that corner'],
          ['Heave / third spring', 'Spring working in vertical travel, not roll', 'Controls aero platform without stiffening corner springs'],
        ],
      },
    ],
  },

  {
    id: 'mental-model',
    category: 'fundamentals',
    title: 'The Setup Mental Model',
    subtitle: 'What each layer of the car is responsible for.',
    tags: ['mental model', 'springs', 'bars', 'dampers', 'aero', 'grip', 'overview'],
    blocks: [
      {
        type: 'text',
        body: 'Springs and ARBs decide where the steady-state grip lives. Dampers decide how quickly load gets there. Aero decides how much the car changes character as speed rises.',
      },
      {
        type: 'list',
        items: [
          { label: 'Tires', detail: 'Create all grip — everything else distributes it.' },
          { label: 'Alignment (camber, toe)', detail: 'Points the tires correctly for each phase.' },
          { label: 'Springs & ARBs', detail: 'Decide how load is shared across the four tires.' },
          { label: 'Dampers', detail: 'Control how fast load moves — not how much.' },
          { label: 'Aero & ride height', detail: 'Decide high-speed grip and platform stability.' },
          { label: 'Differential', detail: 'Controls how the driven tires share torque.' },
          { label: 'Electronics (TC, ABS)', detail: 'Help manage the tire when the driver asks too much.' },
          { label: 'Telemetry', detail: 'Confirms whether the change actually helped.' },
        ],
      },
    ],
  },

  {
    id: 'setup-order',
    category: 'fundamentals',
    title: 'Recommended Setup Order',
    subtitle: 'Change in this order — earlier items give cleaner feedback.',
    tags: ['order', 'priority', 'workflow', 'where to start', 'first move', 'baseline'],
    blocks: [
      {
        type: 'table',
        headers: ['Priority', 'Parameter', 'Why This Order'],
        rows: [
          ['1', 'Tire pressures', 'Most powerful single change; affects everything else'],
          ['2', 'Brake bias', 'Fastest entry fix with zero side-effects on the rest of the car'],
          ['3', 'TC / ABS / Electronics', 'In-car adjustable; sort these before mechanical changes'],
          ['4', 'Anti-roll bars (ARBs)', 'Cleanest balance tool; change one end at a time'],
          ['5', 'Wing & ride height / rake', 'Aero balance — always move wing and rake together'],
          ['6', 'Differential', 'Shapes entry rotation and exit traction'],
          ['7', 'Toe & camber', 'Fine-tune contact patch and stability'],
          ['8', 'Springs', 'Affect ride heights; re-check heights after every change'],
          ['9', 'Dampers', 'Refine transitions only after basic balance is correct'],
          ['10', 'Heave / third spring / bump stops', 'Advanced platform tools for aero cars'],
        ],
      },
    ],
  },

  {
    id: 'first-move-increments',
    category: 'fundamentals',
    title: 'First-Move Increments',
    subtitle: 'Starting step sizes for each parameter type.',
    tags: ['increment', 'step size', 'how much', 'click', 'first move'],
    blocks: [
      {
        type: 'table',
        headers: ['Parameter', 'First Move'],
        rows: [
          ['Brake bias', '1–2 clicks or ~0.2–0.5%'],
          ['Tire pressure', '~0.1 bar or 1–2 psi'],
          ['Camber', '±0.1°'],
          ['Toe', '1 click or ~0.5–1.0 mm total'],
          ['ARB', '1 blade / position / click'],
          ['Springs / torsion bars', '1 rate step'],
          ['Low-speed dampers', '1 click'],
          ['High-speed dampers', '1 click'],
          ['GT diff preload', '1 small step'],
          ['Formula drive/coast angle', '2–5°'],
          ['Wing', '1 click / 1 degree'],
          ['Ride height', '1–2 mm'],
          ['Heave / third spring gap', '0.5–1.0 mm or one step'],
          ['TC / ABS', '1 step'],
        ],
      },
    ],
  },

  // ─── TROUBLESHOOTING ───────────────────────────────────────────────────────

  {
    id: 'master-decision-table',
    category: 'troubleshooting',
    title: 'Master Decision Table',
    subtitle: 'Symptom → phase → what to change first, second, third.',
    tags: ['symptom', 'fix', 'tight', 'loose', 'push', 'oversteer', 'understeer', 'locks', 'snaps', 'braking', 'entry', 'mid', 'exit', 'high speed', 'kerb', 'wet', 'long run'],
    blocks: [
      {
        type: 'table',
        headers: ['Symptom', 'Phase', 'First Move', 'Second Move', 'Third Move'],
        rows: [
          ['Front locks early', 'Braking', 'Brake bias rearward', 'Reduce excess front camber', 'Increase ABS'],
          ['Rear wiggles or locks', 'Braking', 'Brake bias forward', 'Rear toe-in', 'More coast locking or rear ARB'],
          ['Won\'t rotate on trail brake', 'Entry', 'Brake bias rearward', 'Soften front ARB', 'Reduce coast locking'],
          ['Rotates too much on brake release', 'Entry', 'Brake bias forward', 'Rear toe-in', 'Soften rear ARB or more coast locking'],
          ['Tight at apex', 'Mid-corner', 'Soften front ARB', 'Stiffen rear ARB', 'Add front camber'],
          ['Loose at apex', 'Mid-corner', 'Soften rear ARB', 'Add rear wing', 'Soften rear spring or reduce rake'],
          ['Pushes on throttle', 'Exit', 'Reduce power locking', 'Stiffen rear ARB slightly', 'Reduce rear LS compression'],
          ['Spins or snaps on throttle', 'Exit', 'Soften rear ARB', 'Rear toe-in / more TC', 'Correct diff for car type'],
          ['High-speed understeer', 'High speed', 'More front aero / less rear wing', 'More rake (if window allows)', 'Lower front / raise rear'],
          ['High-speed oversteer', 'High speed', 'Add rear wing', 'Reduce rake', 'More heave/third-spring support'],
          ['Harsh over kerbs', 'Kerbs', 'Reduce high-speed compression', 'Soften ARB', 'Raise ride height slightly'],
          ['Bounces after kerb strike', 'Kerbs', 'Adjust high-speed rebound', 'Reduce HS compression', 'Recheck pressure and spring'],
          ['Bottoms on straight / compression', 'Platform', 'Raise ride height', 'More heave/third spring', 'Stiffen springs'],
          ['Gets looser over a stint', 'Long run', 'Smoother exit or more TC', 'Equalize rear hot-pressure build', 'Add rear stability margin'],
          ['Gets tighter over a stint', 'Long run', 'Reduce front sliding', 'Rebalance hot pressure build', 'Add rotation with ARB/bias'],
          ['Front locks in rain', 'Wet', 'Wet tires first', 'Brake bias rearward', 'Wet ABS/TC maps'],
        ],
      },
    ],
  },

  {
    id: 'wet-weather',
    category: 'troubleshooting',
    title: 'Wet-Weather Setup',
    subtitle: 'Priority order and common wet fixes.',
    tags: ['wet', 'rain', 'aquaplaning', 'slippery', 'low grip', 'ABS', 'TC'],
    blocks: [
      {
        type: 'list',
        items: [
          { label: '1. Fit wet tires', detail: 'Nothing else matters until tires match the conditions.' },
          { label: '2. Move brake bias rearward', detail: 'Fronts lock more readily in the wet — typically 2–5 clicks rearward.' },
          { label: '3. Use wet TC/ABS maps', detail: 'If the car provides them, these are calibrated for low grip.' },
          { label: '4. Soften throttle', detail: 'Rear is the weakest link in the wet — avoid power spikes.' },
          { label: '5. Check ride height / aero', detail: 'Wet tires change diameter and can shift the aero platform.' },
          { label: '6. Drive off the rubbered dry line', detail: 'Standing water collects exactly where rubber is laid down.' },
        ],
      },
      {
        type: 'table',
        headers: ['Wet Symptom', 'Fix'],
        rows: [
          ['Front locks too easily', 'Move brake bias rearward'],
          ['Rear steps out on throttle', 'More TC / smoother throttle / taller gear'],
          ['ABS feels wrong', 'Use wet ABS map if available'],
          ['Car hydroplanes', 'Fit wet tires; reduce speed'],
          ['Normal racing line has no grip', 'Drive off the rubbered-in line'],
          ['Wet tires changing balance', 'Recheck ride height and aero balance'],
          ['Track drying', 'Watch wet tire overheating — plan crossover timing'],
          ['Mixed conditions', 'Prioritize stability over peak dry speed'],
        ],
      },
    ],
  },

  {
    id: 'driver-vs-setup',
    category: 'troubleshooting',
    title: 'Driver Error vs Setup Problem',
    subtitle: 'The 3-lap rule: if it happens in the same phase 3 laps in a row, it\'s setup.',
    tags: ['driver error', 'consistency', 'technique', 'diagnosis', 'repeatability'],
    blocks: [
      {
        type: 'table',
        headers: ['Symptom', 'Could Be Setup', 'Could Be Driver'],
        rows: [
          ['Entry understeer', 'Front bias too high, front ARB too stiff, coast diff too locked', 'Releasing brake too early, turning too late, entering too fast'],
          ['Entry oversteer', 'Bias too rearward, rear toe too low, coast too free', 'Trail braking too deep, downshifting too aggressively'],
          ['Mid-corner understeer', 'Front camber/ARB/aero problem', 'Too much entry speed, too much steering lock'],
          ['Exit oversteer', 'Rear ARB too stiff, diff too aggressive, TC too low', 'Throttle too early, too much steering angle on throttle'],
          ['Kerb snap', 'Damping/platform issue', 'Attacking a kerb the car cannot take'],
          ['Long-run tire falloff', 'Pressures/camber/toe/sliding', 'Overdriving, excessive steering scrub'],
        ],
      },
    ],
  },

  // ─── PARAMETERS ───────────────────────────────────────────────────────────

  {
    id: 'arb-springs',
    category: 'parameters',
    title: 'ARBs & Springs',
    subtitle: 'How stiffness changes the balance and platform.',
    tags: ['ARB', 'anti-roll bar', 'sway bar', 'spring', 'spring rate', 'roll', 'stiffness', 'platform'],
    blocks: [
      {
        type: 'table',
        headers: ['Parameter', 'What It Changes', 'Main Gains', 'Main Risks'],
        rows: [
          ['Front ARB stiffer', 'More front roll stiffness', 'Sharper response, less roll', 'More understeer, worse kerb compliance'],
          ['Front ARB softer', 'Less front roll stiffness', 'More front mechanical grip, rotation', 'More body roll, can feel vague'],
          ['Rear ARB stiffer', 'More rear roll stiffness', 'More rotation / direction change', 'Snap oversteer, poor kerb compliance'],
          ['Rear ARB softer', 'Less rear roll stiffness', 'More rear grip, more stability', 'Slower roll, can feel lazy'],
          ['Front spring stiffer', 'Front dive resistance, platform support', 'Better aero platform, less nosedive', 'Understeer if too stiff, poor bumps'],
          ['Front spring softer', 'More front compliance', 'More mechanical grip on bumps', 'More nosedive, aero inconsistency'],
          ['Rear spring stiffer', 'Rear squat resistance, rear platform', 'Sharper rotation, better aero', 'Oversteer if too stiff, poor traction'],
          ['Rear spring softer', 'More rear compliance', 'Better exit traction', 'More squat, drag/platform issues'],
        ],
      },
      {
        type: 'text',
        body: 'A stiffer end of the car reduces grip at that end (more load transfer across that axle = less total grip from that axle). Do not blindly soften the rear ARB — too soft causes slow roll oversteer and lazy rear movement instead of snap.',
      },
    ],
  },

  {
    id: 'dampers',
    category: 'parameters',
    title: 'Dampers',
    subtitle: 'Dampers control timing, not total grip. Use after basic balance is correct.',
    tags: ['damper', 'shock', 'bump', 'rebound', 'low speed', 'high speed', 'transition', 'kerb', 'compression'],
    blocks: [
      {
        type: 'text',
        body: 'Dampers do not change the total amount of load transfer — they change HOW QUICKLY load transfers. Use them last, after pressures, bias, ARBs, and springs are sorted.',
      },
      {
        type: 'table',
        headers: ['Symptom', 'Damper Direction'],
        rows: [
          ['Front dives too quickly under braking', 'More front LS compression'],
          ['Entry understeer when braking', 'Less front LS compression'],
          ['Rear squats too quickly on throttle', 'More rear LS compression'],
          ['Exit understeer on throttle', 'Less rear LS compression'],
          ['Car floats after braking', 'More rebound slightly'],
          ['Car feels stuck and slow to transfer', 'Less low-speed rebound'],
          ['Rear unstable on brake release', 'More rear LS rebound carefully'],
          ['Harsh over kerbs', 'Reduce high-speed compression'],
          ['Bounces after kerb strike', 'Adjust high-speed rebound'],
          ['Tire loses contact after bump', 'Less high-speed rebound'],
        ],
      },
      {
        type: 'table',
        headers: ['Corner Event', 'Relevant Damper'],
        rows: [
          ['Brake application', 'Front compression, rear rebound'],
          ['Brake release / turn-in', 'Front rebound, rear compression/rebound'],
          ['Throttle application', 'Rear compression, front rebound'],
          ['Kerb strike', 'High-speed compression'],
          ['Recovery after kerb', 'High-speed rebound'],
          ['Chassis float after input', 'Low-speed rebound'],
          ['Harshness in transitions', 'Low-speed compression'],
        ],
      },
    ],
  },

  {
    id: 'ride-height-aero',
    category: 'parameters',
    title: 'Ride Height, Rake & Wing',
    subtitle: 'On aero cars, wing and ride height must be tuned together.',
    tags: ['ride height', 'rake', 'wing', 'front wing', 'rear wing', 'aero', 'downforce', 'platform', 'floor'],
    blocks: [
      {
        type: 'table',
        headers: ['Parameter', 'What It Changes', 'Main Gains', 'Main Risks'],
        rows: [
          ['More front wing / flap', 'Front downforce and drag', 'High-speed front grip', 'More drag, possible rear nervousness'],
          ['More rear wing', 'Rear downforce and drag', 'High-speed stability', 'More drag, slower straights'],
          ['More rake (raise rear, lower front)', 'Floor angle and body aero', 'Can increase total downforce; shifts aero rearward', 'Nonlinear outside ride-height window'],
          ['Lower front ride height', 'Front aero increase', 'More front downforce', 'Bottoming risk, tech limit'],
          ['Lower rear ride height', 'Rear aero increase', 'More rear/diffuser downforce', 'Bottoming risk, tech limit'],
          ['Heave spring', 'Vertical support without roll effect', 'Holds aero platform at speed', 'Harshness, reduced mechanical grip'],
          ['Third spring (rear)', 'Rear vertical platform support', 'Supports rear under aero and banking load', 'Poor low-speed grip if overdone'],
          ['Bump stops', 'Progressive support near travel limit', 'Bottoming control, platform support', 'Sudden balance change if engaged abruptly'],
        ],
      },
      {
        type: 'text',
        body: 'Aero rule: think of wing and ride height together. A wing change that adds rear grip may need ride-height/rake compensation to preserve balance. Always check dynamic ride heights — the garage number is only a static reference.',
      },
    ],
  },

  {
    id: 'alignment',
    category: 'parameters',
    title: 'Camber & Toe',
    subtitle: 'Alignment changes have global effects — make small steps.',
    tags: ['camber', 'toe', 'alignment', 'toe-in', 'toe-out', 'negative camber', 'scrub', 'stability', 'response'],
    blocks: [
      {
        type: 'table',
        headers: ['Setting', 'Problem It Fixes', 'Risk'],
        rows: [
          ['More front negative camber', 'Front mid-corner understeer', 'Hurts braking, traction loss'],
          ['Less front negative camber', 'Front locks too easily', 'Less lateral grip'],
          ['More rear negative camber', 'Rear lateral grip in high-speed', 'Hurts traction and rear braking stability'],
          ['Less rear negative camber', 'Rear unstable under braking, poor traction', 'Less high-speed cornering grip'],
          ['More front toe-out', 'Lazy turn-in', 'Nervousness, scrub, heat'],
          ['Less front toe-out', 'Nervous braking / twitchy', 'Duller turn-in'],
          ['More rear toe-in', 'Loose entry or exit', 'Heat, drag, reduced rotation'],
          ['Less rear toe-in', 'Car won\'t rotate', 'Less stability'],
          ['Rear toe-out', 'Extreme understeer only', 'Snap oversteer — avoid in almost all cases'],
        ],
      },
    ],
  },

  // ─── DIFFERENTIAL ──────────────────────────────────────────────────────────

  {
    id: 'gt-diff',
    category: 'differential',
    title: 'GT-Style Differential Logic',
    subtitle: 'GT3, GT4, Porsche Cup, and most sports cars use preload and friction faces.',
    tags: ['differential', 'diff', 'preload', 'friction faces', 'GT3', 'GT4', 'sports car', 'locking', 'rotation'],
    blocks: [
      {
        type: 'table',
        headers: ['Symptom', 'GT-Style Diff Fix'],
        rows: [
          ['Lift-off oversteer', 'More preload can help'],
          ['Car too tight off throttle', 'Less preload'],
          ['Snap oversteer when throttle applied aggressively', 'Less preload or fewer friction faces'],
          ['Poor slow-corner drive / inside wheelspin', 'More preload or more locking'],
          ['Car rotates too much during brake-to-throttle transition', 'More preload can help'],
          ['Car refuses to rotate on entry', 'Less preload / less coast locking if available'],
          ['Rough kerbs causing inside wheelspin', 'More friction faces can help'],
          ['Smooth track, car too locked', 'Fewer friction faces'],
        ],
      },
      {
        type: 'text',
        body: 'Warning: More preload is NOT automatically more traction. It can also cause off-throttle understeer, on-throttle snap oversteer, and refusal to rotate in slow corners. Move in one direction at a time and test carefully.',
      },
    ],
  },

  {
    id: 'formula-diff',
    category: 'differential',
    title: 'Formula-Style Differential Logic',
    subtitle: 'Formula cars with clutch plates, preload, drive angle, and coast angle.',
    tags: ['differential', 'diff', 'drive angle', 'coast angle', 'preload', 'formula', 'clutch plates', 'locking', 'power side', 'coast side'],
    blocks: [
      {
        type: 'table',
        headers: ['Symptom', 'Formula-Style Diff Fix'],
        rows: [
          ['Too loose under braking', 'Lower coast angle / more coast locking'],
          ['Too tight under braking', 'Higher coast angle / less coast locking'],
          ['Too loose on initial throttle (inside wheelspin)', 'Lower drive angle / more power locking'],
          ['Too tight on throttle', 'Higher drive angle / less power locking'],
          ['Too much entry understeer', 'Less preload or less coast locking'],
          ['Too much throttle oversteer from preload', 'Reduce preload'],
          ['Inside wheelspin on exit', 'More drive locking (lower drive angle)'],
          ['Car will not rotate on exit', 'Less drive locking (higher drive angle)'],
        ],
      },
      {
        type: 'text',
        body: 'Important: reducing power locking is not always the answer to exit oversteer. If the car is snapping because the diff is too locked → reduce locking. If one rear tire is unloaded causing instability → more locking may help.',
      },
    ],
  },

  // ─── TIRES ────────────────────────────────────────────────────────────────

  {
    id: 'tire-pressure-temp',
    category: 'tires',
    title: 'Tire Pressure & Temperature',
    subtitle: 'The single most powerful setup control — tune to hot pressure, not cold.',
    tags: ['tire', 'tyre', 'pressure', 'temperature', 'temp', 'camber', 'hot pressure', 'cold pressure', 'overheating', 'inner', 'middle', 'outer'],
    blocks: [
      {
        type: 'table',
        headers: ['Symptom', 'Likely Issue', 'Fix'],
        rows: [
          ['Car feels lazy / sluggish', 'Pressure too low', 'Raise pressure slightly'],
          ['Car feels nervous / skippy', 'Pressure too high', 'Lower pressure slightly'],
          ['Front tires overheating', 'Too much front sliding', 'Add rotation / reduce understeer'],
          ['Rear tires overheating', 'Too much rear sliding', 'Add stability / reduce oversteer'],
          ['Center hotter than edges', 'Pressure likely too high', 'Lower pressure'],
          ['Edges hotter than center', 'Pressure likely too low', 'Raise pressure'],
          ['Inner edge much hotter', 'Too much negative camber', 'Reduce camber (less negative)'],
          ['Outer edge much hotter', 'Not enough camber or too much roll', 'Add camber / stiffen platform'],
          ['Balance changes after 5–10 laps', 'Pressure build imbalance', 'Adjust cold pressures'],
        ],
      },
      {
        type: 'text',
        body: 'Do not chase one magic PSI. Use hot pressure build, lap time, driver feel, tire wear, temperature spread, and whether the car is sliding — all together. Always confirm hot pressures after a stabilization run before making pressure adjustments.',
      },
    ],
  },

  // ─── STRATEGY ─────────────────────────────────────────────────────────────

  {
    id: 'session-types',
    category: 'strategy',
    title: 'Qualifying vs Race vs Endurance',
    subtitle: 'Each session type has different setup priorities.',
    tags: ['qualifying', 'race', 'endurance', 'stint', 'fuel', 'tire life', 'pace', 'multiclass'],
    blocks: [
      {
        type: 'table',
        headers: ['Setup Type', 'Priority', 'Common Traits'],
        rows: [
          ['Qualifying', 'Peak lap time', 'Lower fuel, sharper rotation, aggressive pressures, more risk'],
          ['Sprint race', 'Fast average pace', 'Slightly safer, tire-conscious, traffic-capable'],
          ['Endurance', 'Consistency and tire life', 'Stable rear, predictable braking, less tire abuse'],
          ['Wet', 'Survival and confidence', 'Wet tires, wet maps, softer inputs, stable platform'],
          ['Multiclass', 'Traffic and braking confidence', 'Stable under dirty air, predictable exits'],
        ],
      },
      {
        type: 'text',
        body: 'Endurance philosophy: a setup that is 0.2 s slower but prevents one spin, one off-track, or one extra tire stop is usually faster over the full race. Always build a separate race setup at race fuel — do not assume your low-fuel qualifying setup behaves well over a stint. Full fuel load lowers the car and can push it out of the optimal aero window.',
      },
    ],
  },

  {
    id: 'track-types',
    category: 'strategy',
    title: 'Track-Type Setup Strategies',
    subtitle: 'Different track types demand different setup priorities.',
    tags: ['track', 'Monza', 'Spa', 'Sebring', 'endurance', 'stop-start', 'high speed', 'bumpy', 'flowing'],
    blocks: [
      {
        type: 'table',
        headers: ['Track Type', 'Examples', 'Setup Priorities'],
        rows: [
          ['Long-straight, heavy braking', 'Monza, Le Mans, Road America', 'Low drag, braking stability, traction, gearing'],
          ['High-speed aero', 'Suzuka, Spa, Silverstone, Watkins Glen', 'Aero balance, platform, high-speed stability'],
          ['Stop-start technical', 'Long Beach, Detroit, Montreal-style', 'Traction, brake release, kerb compliance'],
          ['Bumpy / kerby', 'Sebring, street circuits', 'Ride height, damping, softer platform, rear stability'],
          ['Flowing medium-speed', 'Barcelona, Road Atlanta', 'ARB balance, camber, aero compromise'],
          ['Endurance circuit', 'Daytona, Le Mans, Nürburgring', 'Stability, tire life, fuel economy, traffic'],
          ['Rain / mixed', 'Any wet event', 'Wet tires, rearward brake bias, wet maps, softer response'],
        ],
      },
    ],
  },

  {
    id: 'setup-myths',
    category: 'strategy',
    title: 'Common Setup Myths',
    subtitle: 'Things that sound right but need more nuance.',
    tags: ['myth', 'misconception', 'lower', 'wing', 'stiff', 'loose', 'dampers', 'tire temps', 'setup shop'],
    blocks: [
      {
        type: 'table',
        headers: ['Myth', 'Better Truth'],
        rows: [
          ['Lower is always faster', 'Lower is faster until the car bottoms, stalls aero, or loses compliance'],
          ['More wing is always slower', 'More wing can be faster if it lets you brake later, carry speed, or save tires'],
          ['Stiffer is more responsive, so stiffer is faster', 'Stiffer can improve response but reduce grip and kerb compliance'],
          ['Looser is faster', 'Looser is only faster if you can repeat it without tire abuse or mistakes'],
          ['Dampers fix everything', 'Dampers refine transitions; they rarely fix a bad platform or wrong balance'],
          ['Tire temps tell the whole story', 'Lap time, feel, pressure, wear, and telemetry matter too'],
          ['Setup shops are magic', 'A setup built for another driver may not match your inputs or style'],
          ['One perfect setup works everywhere', 'Track type, weather, fuel, tire age, and style change the ideal setup'],
        ],
      },
    ],
  },

  {
    id: 'phase-tool-map',
    category: 'strategy',
    title: 'Phase → Tool Reference',
    subtitle: 'Which tools matter most for each part of the lap.',
    tags: ['phase', 'tool', 'braking', 'entry', 'mid-corner', 'exit', 'high speed', 'kerbs', 'wet', 'long run'],
    blocks: [
      {
        type: 'table',
        headers: ['Phase', 'Primary Tools'],
        rows: [
          ['Braking', 'Brake bias, rear toe, coast diff, front compression'],
          ['Entry', 'Brake bias, front toe, front ARB, rear stability, preload/coast'],
          ['Mid-corner', 'ARBs, camber, springs, aero balance'],
          ['Exit', 'Rear ARB, TC, power diff, rear toe, rear spring'],
          ['High-speed', 'Wing, rake, ride height, heave/third spring'],
          ['Kerbs / bumps', 'High-speed damping, ARBs, springs, ride height'],
          ['Long run', 'Pressures, camber, toe, tire wear, setup stability'],
          ['Wet', 'Wet tires, rearward brake bias, wet TC/ABS, ride-height awareness'],
        ],
      },
    ],
  },

  // ─── CAR CLASSES ──────────────────────────────────────────────────────────

  {
    id: 'gt3-notes',
    category: 'car-classes',
    title: 'GT3 Setup Notes',
    subtitle: 'GT3s are fastest when they let you brake confidently and apply throttle early.',
    tags: ['GT3', 'gt3', 'brake bias', 'ARB', 'diff', 'preload', 'wing', 'tire', 'rear tire life'],
    blocks: [
      {
        type: 'list',
        items: [
          { label: 'Fix order', detail: 'Tire pressures → Brake bias → TC/ABS → ARBs → Wing/ride height/rake → Diff preload/friction faces → Toe → Camber → Springs → Dampers' },
          { label: 'Brake bias / ABS', detail: 'Essential for entry balance — most time is found here.' },
          { label: 'TC', detail: 'Use it as a race tool, not a shame tool. Rear tire life often wins races.' },
          { label: 'ARBs', detail: 'Cleanest mechanical balance tool — change one end at a time.' },
          { label: 'Wing & rake', detail: 'Strong high-speed balance tool — always adjust together.' },
          { label: 'Diff preload / friction faces', detail: 'Important but easy to overdo. More preload ≠ more traction in all corners.' },
          { label: 'Key baseline', detail: 'Brake bias ~50.5–52.5% front, TC mid-range, ARBs middle, pressures lower half of allowed range.' },
        ],
      },
    ],
  },

  {
    id: 'gt4-notes',
    category: 'car-classes',
    title: 'GT4 Setup Notes',
    subtitle: 'GT4 rewards momentum and smooth driving more than aggressive aero tuning.',
    tags: ['GT4', 'gt4', 'mechanical grip', 'kerb', 'rotation', 'momentum'],
    blocks: [
      {
        type: 'list',
        items: [
          { label: 'Fix order', detail: 'Tire pressures → Brake bias → TC/ABS → ARBs → Diff (if available) → Camber → Springs → Dampers' },
          { label: 'Mechanical grip dominant', detail: 'Less aero than GT3 — ARBs, springs, pressure, and alignment dominate.' },
          { label: 'Kerb compliance', detail: 'Often critical — softer platform may be needed.' },
          { label: 'Rotation', detail: 'Needs careful ARB and brake-bias tuning — avoid over-loosening.' },
          { label: 'Momentum', detail: 'Avoid setup choices that kill minimum speed in slow corners.' },
        ],
      },
    ],
  },

  {
    id: 'gtp-prototype-notes',
    category: 'car-classes',
    title: 'GTP / LMDh / Prototype Setup Notes',
    subtitle: 'Prototype setups are about protecting the aero platform while staying usable in traffic.',
    tags: ['GTP', 'LMDh', 'LMP', 'prototype', 'aero platform', 'ride height', 'rake', 'brake migration', 'heave', 'third spring', 'multiclass'],
    blocks: [
      {
        type: 'list',
        items: [
          { label: 'Fix order', detail: 'Brake bias → Aero balance → Ride heights → Platform control → Differential → ARBs → Heave/third spring/bump stops → Dampers → Alignment' },
          { label: 'Aero platform is critical', detail: 'Ride height and rake stability matter enormously — losing the floor at speed is catastrophic.' },
          { label: 'Brake migration / maps', detail: 'Heavy braking zones and hybrid systems make braking balance complex — use migration/maps if available.' },
          { label: 'Traffic behavior', detail: 'Needs stability off-line and in dirty air — avoid ultra-low-drag/high-rake setups for race traffic.' },
          { label: 'Heave / third spring', detail: 'Critical for platform support under aero load.' },
          { label: 'Kerb selection', detail: 'Some kerbs cost more than they gain — high aero cars can stall the floor on aggressive kerbs.' },
        ],
      },
    ],
  },

  {
    id: 'formula-notes',
    category: 'car-classes',
    title: 'Formula Car Setup Notes',
    subtitle: 'Formula cars punish aero-platform mistakes. A car that collapses at speed is unsafe and slow.',
    tags: ['formula', 'wings', 'ride height', 'rake', 'heave', 'third spring', 'diff', 'drive angle', 'coast angle', 'torsion bar'],
    blocks: [
      {
        type: 'list',
        items: [
          { label: 'Fix order', detail: 'Brake bias → Wings → Ride height and rake → ARBs → Drive/coast/preload diff → Heave/third spring/bump stops → Springs/torsion bars → Dampers → Alignment' },
          { label: 'Wings are primary balance', detail: 'Primary high-speed balance — adjust before mechanical tools.' },
          { label: 'Ride height / rake must stay in aero window', detail: 'Static setup may look correct but run wrong dynamically — use aero calculator if available.' },
          { label: 'Heave / third spring', detail: 'Critical for platform support at speed. Without proper support, the floor stalls.' },
          { label: 'Differential (drive/coast/preload)', detail: 'Different logic from GT cars — see Formula Differential entry.' },
          { label: 'Braking confidence', detail: 'A stable car is usually faster over a stint — do not chase the loosest setup.' },
          { label: 'Formula baseline', detail: 'Medium-high downforce as a starter; heave spring positive gap; mid clutch plates, moderate preload, mid drive/coast angle.' },
        ],
      },
    ],
  },

  {
    id: 'porsche-cup-notes',
    category: 'car-classes',
    title: 'Porsche Cup-Style Car Notes',
    subtitle: 'These cars punish sloppy brake release and throttle.',
    tags: ['Porsche', 'cup car', 'brake release', 'rear toe', 'rotation', 'traction'],
    blocks: [
      {
        type: 'list',
        items: [
          { label: 'Fix order', detail: 'Brake bias → Rear toe → ARBs → Diff/preload (if available) → Camber → Springs → Dampers' },
          { label: 'Brake release is critical', detail: 'The key to fast lap times — must be controlled and smooth.' },
          { label: 'Rear toe', detail: 'Big stability tool in these cars — more rear toe-in calms entry and exit.' },
          { label: 'Rotation from technique', detail: 'Should come from technique and careful setup, not instability.' },
          { label: 'Do not over-loosen', detail: 'More rotation than the car naturally wants causes inconsistency and tire abuse.' },
        ],
      },
    ],
  },

  // ─── ADVANCED ─────────────────────────────────────────────────────────────

  {
    id: 'mechanical-vs-aero',
    category: 'advanced',
    title: 'Mechanical Grip vs Aero Grip',
    subtitle: 'Use the right tool for the right speed range.',
    tags: ['mechanical grip', 'aero grip', 'speed', 'slow corner', 'high speed', 'downforce'],
    blocks: [
      {
        type: 'table',
        headers: ['Speed Range', 'Dominant Grip Type', 'Main Setup Tools'],
        rows: [
          ['Slow corners', 'Mechanical grip', 'ARBs, springs, diff, brake bias, toe, camber'],
          ['Medium-speed corners', 'Mixed mechanical/aero', 'ARBs, camber, wing, rake, platform'],
          ['High-speed corners', 'Aero / platform', 'Wing, ride height, rake, heave/third spring, dampers'],
        ],
      },
      {
        type: 'text',
        body: 'Key mistake: do not fix a high-speed aero problem with only low-speed mechanical tools. If the car is loose through a fast sweeper, adding rear wing or stabilizing the platform is more logical than only softening the rear ARB. If the car is loose out of a 55 km/h hairpin, rear wing may do almost nothing — use rear mechanical grip, TC, diff, and throttle control.',
      },
    ],
  },

  {
    id: 'tire-budget',
    category: 'advanced',
    title: 'The Four-Tire Budget',
    subtitle: 'Every tire has a grip budget: braking + turning + acceleration. Exceed it and the tire slides.',
    tags: ['tire budget', 'grip budget', 'trail braking', 'wheelspin', 'overheating', 'sliding'],
    blocks: [
      {
        type: 'table',
        headers: ['Situation', 'Tire Budget Problem'],
        rows: [
          ['Trail braking too deep — front pushes', 'Front tires are braking and turning beyond their budget'],
          ['Throttle with too much steering lock — rear spins', 'Rear tires are accelerating and cornering beyond their budget'],
          ['Hit a kerb and snap sideways', 'Tire loses vertical load or contact-patch consistency'],
          ['Fronts overheat over a stint', 'Front tires are being asked too much turning work'],
        ],
      },
      {
        type: 'text',
        body: 'Setup cannot create infinite grip. It only redistributes how and when the four tires are loaded. A stiffer end of the car usually increases load transfer across that axle, which can reduce the total grip available from that axle — this is why softening a setup element often improves mechanical grip even if it seems counterintuitive.',
      },
    ],
  },

  {
    id: 'static-vs-dynamic-ride-height',
    category: 'advanced',
    title: 'Static vs Dynamic Ride Height',
    subtitle: 'The garage number is only the starting point. The car must be evaluated at speed.',
    tags: ['ride height', 'static', 'dynamic', 'fuel', 'aero', 'bottoming', 'floor', 'snap', 'sprint'],
    blocks: [
      {
        type: 'text',
        body: 'Static ride height is what the garage shows. Dynamic ride height is what the car actually runs on track under fuel load, braking pitch, throttle squat, aero load, kerbs, bumps, tire pressure changes, and tire wear.',
      },
      {
        type: 'table',
        headers: ['Symptom', 'Likely Dynamic Ride Height Issue'],
        rows: [
          ['Sudden high-speed snap', 'Aero platform hitting an unstable ride-height window'],
          ['Sparks or plank contact', 'Car too low or too softly supported'],
          ['Good slow-speed grip but poor fast-corner stability', 'Platform too soft for aero load'],
          ['Fast in qualifying, unstable in race', 'Fuel load changed ride heights out of the window'],
          ['Balance changes late in stint', 'Fuel burn and tire pressure build shifted the platform'],
        ],
      },
      {
        type: 'list',
        items: [
          { label: 'Check bottoming first', detail: 'No other setup work is valid if the car is hitting the ground.' },
          { label: 'Raise ride height', detail: 'Primary fix for dynamic bottoming.' },
          { label: 'Add heave/third spring support', detail: 'Prevents aero load from collapsing the platform.' },
          { label: 'Use bump stops', detail: 'Prevent excessive travel without stiffening corner springs.' },
          { label: 'Recheck camber and toe', detail: 'Ride-height changes affect camber and toe — always verify after.' },
        ],
      },
    ],
  },

  {
    id: 'ab-test',
    category: 'advanced',
    title: 'A/B/A Setup Validation Method',
    subtitle: 'The only reliable way to confirm a setup change works.',
    tags: ['A/B', 'validation', 'test', 'baseline', 'compare', 'telemetry', 'repeatability'],
    blocks: [
      {
        type: 'list',
        items: [
          { label: 'A — drive the baseline', detail: 'Get a clean, representative run on the current setup.' },
          { label: 'B — make ONE change and test', detail: 'Retest same fuel level, same tires, same line, same brake markers.' },
          { label: 'A — revert and retest', detail: 'If B was truly better, the reverted A will feel noticeably worse again.' },
        ],
      },
      {
        type: 'table',
        headers: ['Result', 'Meaning'],
        rows: [
          ['B faster and A worse when reverted', 'Keep B — the change helped'],
          ['B feels different but not faster', 'Comfort change, not performance — maybe keep if confidence matters'],
          ['B faster only for one lap', 'Check tire temp, fuel, or driving variation — not conclusive'],
          ['B improves one corner and hurts many', 'Revert or reduce step size'],
          ['No clear result', 'Problem may be driver consistency or wrong diagnosis'],
        ],
      },
      {
        type: 'text',
        body: 'A change is "better" only if it improves: average lap time (not just best), repeatability, tire behavior, confidence under pressure, and raceability around other cars.',
      },
    ],
  },

  {
    id: 'fuel-load-effects',
    category: 'advanced',
    title: 'Fuel Load Effects',
    subtitle: 'Fuel changes more than just weight.',
    tags: ['fuel', 'fuel load', 'ride height', 'balance', 'stint', 'qualifying', 'race', 'aero'],
    blocks: [
      {
        type: 'text',
        body: 'Fuel affects ride height, pitch sensitivity, braking distance, tire energy, aero platform, and balance as the stint progresses.',
      },
      {
        type: 'table',
        headers: ['Symptom', 'Possible Fuel-Related Cause'],
        rows: [
          ['Car tight at start, better later', 'Heavy fuel lowered the car or increased front workload'],
          ['Car loose late in stint', 'Fuel burn changed ride heights or rear tire condition'],
          ['Race setup fails tech after adding fuel', 'Ride height too low under fuel load'],
          ['Qualifying setup unstable in race', 'Setup was only valid at low fuel'],
        ],
      },
    ],
  },

];
