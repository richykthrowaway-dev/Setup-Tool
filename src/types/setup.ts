export type CarClass =
  | 'GT3'
  | 'GT4'
  | 'GTP'
  | 'Formula'
  | 'Oval'
  | 'SportsCar'
  | 'StreetStock'
  | 'LateModel';

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
  categories: Category[];
}

export type SetupValues = Record<string, number | string | boolean>;

export interface Setup {
  id: string;
  name: string;
  carId: string;
  track?: string;
  notes?: string;
  values: SetupValues;
  createdAt: number;
  updatedAt: number;
}
