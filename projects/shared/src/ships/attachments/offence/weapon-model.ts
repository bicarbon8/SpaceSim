const models = ['machinegun', 'cannon', 'plasma', 'invalid'] as const;
export type WeaponModel = typeof models[number];