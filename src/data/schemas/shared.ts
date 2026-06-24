import { Category } from '@/types/setup';

export const tireCategory = (
  pressureMin: number,
  pressureMax: number,
  hasCompound = false
): Category => ({
  id: 'tires',
  label: 'Tires',
  parameters: [
    {
      id: 'lf_cold_pressure',
      label: 'LF Cold Pressure',
      type: 'number',
      unit: 'psi',
      min: pressureMin,
      max: pressureMax,
      step: 0.1,
      defaultValue: 24.0,
      description: 'Left front tire cold inflation pressure.',
      increaseEffect: 'Higher pressure reduces contact patch and grip; increases tire response and heat dissipation.',
    },
    {
      id: 'rf_cold_pressure',
      label: 'RF Cold Pressure',
      type: 'number',
      unit: 'psi',
      min: pressureMin,
      max: pressureMax,
      step: 0.1,
      defaultValue: 24.0,
      description: 'Right front tire cold inflation pressure.',
      increaseEffect: 'Higher pressure reduces contact patch and grip; increases tire response and heat dissipation.',
    },
    {
      id: 'lr_cold_pressure',
      label: 'LR Cold Pressure',
      type: 'number',
      unit: 'psi',
      min: pressureMin,
      max: pressureMax,
      step: 0.1,
      defaultValue: 22.0,
      description: 'Left rear tire cold inflation pressure.',
      increaseEffect: 'Higher pressure reduces rear grip; can improve traction with driven rear wheels.',
    },
    {
      id: 'rr_cold_pressure',
      label: 'RR Cold Pressure',
      type: 'number',
      unit: 'psi',
      min: pressureMin,
      max: pressureMax,
      step: 0.1,
      defaultValue: 22.0,
      description: 'Right rear tire cold inflation pressure.',
      increaseEffect: 'Higher pressure reduces rear grip; can improve traction with driven rear wheels.',
    },
    ...(hasCompound
      ? [
          {
            id: 'tire_compound',
            label: 'Tire Compound',
            type: 'select' as const,
            defaultValue: 'dry',
            options: [
              { label: 'Dry', value: 'dry' },
              { label: 'Wet', value: 'wet' },
            ],
            description: 'Tire compound selection.',
            increaseEffect: 'N/A',
          },
        ]
      : []),
  ],
});

export const fuelCategory = (maxFuel: number, unit: 'L' | 'gal' = 'L'): Category => ({
  id: 'fuel',
  label: 'Fuel',
  parameters: [
    {
      id: 'fuel_amount',
      label: 'Fuel Amount',
      type: 'number',
      unit,
      min: 1,
      max: maxFuel,
      step: 1,
      defaultValue: unit === 'L' ? 40 : 10,
      description: `Fuel load at race start. ${unit === 'L' ? '1 liter ≈ 0.73 kg' : '1 gallon ≈ 6 lbs'}`,
      increaseEffect: 'More fuel adds weight, increasing lap time and tire wear, but enables longer stints without pitting.',
    },
  ],
});
