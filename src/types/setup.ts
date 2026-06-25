export type CarClass =
  | 'GT3'
  | 'GT4'
  | 'GTP'
  | 'Formula'
  | 'Oval'
  | 'SportsCar'
  | 'StreetStock'
  | 'LateModel'
  | 'Hypercar'
  | 'LMP2'
  | 'LMGT3'
  | 'GT2'
  | 'Road';

export type ParameterType = 'number' | 'select' | 'boolean';

export interface ParameterOption {
  label: string;
  value: string | number;
}

export interface Parameter {
  id: string;
  label: string;
  type: ParameterType;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | string | boolean;
  options?: ParameterOption[];
  description: string;
  /** What increasing this value does to the car */
  increaseEffect: string;
  /** Tech inspection floor — value must be >= this to pass scrutineering */
  techMin?: number;
  /** Tech inspection ceiling — value must be <= this to pass scrutineering */
  techMax?: number;
}

export interface Category {
  id: string;
  label: string;
  parameters: Parameter[];
}

export interface CarSchema {
  id: string;
  name: string;
  class: CarClass;
  /** The sim this schema belongs to, e.g. "iRacing" or "Le Mans Ultimate". */
  game: string;
  categories: Category[];
}

export type SetupValues = Record<string, number | string | boolean>;

export interface LapTime {
  id: string;
  /** Lap duration in milliseconds */
  lapTimeMs: number;
  note?: string;
  recordedAt: number;
}

export interface Setup {
  id: string;
  name: string;
  carId: string;
  track?: string;
  notes?: string;
  values: SetupValues;
  lapTimes?: LapTime[];
  createdAt: number;
  updatedAt: number;
}
