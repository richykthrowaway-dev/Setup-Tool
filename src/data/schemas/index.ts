import gt3Schema from './gt3';
import gt4Schema from './gt4';
import ovalSchema from './oval';
import formulaSchema from './formula';
import gtpSchema from './gtp';
import sportsCarSchema from './sportscar';
import streetStockSchema from './streetstock';
import lateModelSchema from './latemodel';
import { CarSchema } from '@/types/setup';

export const schemas: CarSchema[] = [
  gt3Schema,
  gt4Schema,
  gtpSchema,
  formulaSchema,
  sportsCarSchema,
  ovalSchema,
  lateModelSchema,
  streetStockSchema,
];

export function getSchema(id: string): CarSchema | undefined {
  return schemas.find((s) => s.id === id);
}

export {
  gt3Schema,
  gt4Schema,
  ovalSchema,
  formulaSchema,
  gtpSchema,
  sportsCarSchema,
  streetStockSchema,
  lateModelSchema,
};
