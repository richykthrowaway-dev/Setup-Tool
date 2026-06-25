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

export interface GameConfig {
  id: string;
  name: string;
  shortName: string;
  /** One-line description shown in the selector. */
  description: string;
}

export const GAMES: GameConfig[] = [
  {
    id: 'iRacing',
    name: 'iRacing',
    shortName: 'iRacing',
    description: 'Official iRacing simulation — road & oval',
  },
  {
    id: 'Le Mans Ultimate',
    name: 'Le Mans Ultimate',
    shortName: 'LMU',
    description: 'Studio 397 FIA WEC & Le Mans championship sim',
  },
  {
    id: 'Assetto Corsa Competizione',
    name: 'Assetto Corsa Competizione',
    shortName: 'ACC',
    description: 'Kunos Simulazioni GT World Challenge sim',
  },
  {
    id: 'Assetto Corsa',
    name: 'Assetto Corsa',
    shortName: 'AC',
    description: 'Kunos Simulazioni open-platform sim',
  },
];

/** Schemas available for a given game id. */
export function schemasByGame(gameId: string): CarSchema[] {
  return schemas.filter((s) => s.game === gameId);
}

/** All distinct game ids that have at least one schema. */
export function gamesWithSchemas(): string[] {
  const ids = new Set(schemas.map((s) => s.game));
  return GAMES.filter((g) => ids.has(g.id)).map((g) => g.id);
}

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
