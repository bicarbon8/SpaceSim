const models = ['economy', 'standard', 'sports', 'premium', 'invalid'] as const;
export type EngineModel = typeof models[number];