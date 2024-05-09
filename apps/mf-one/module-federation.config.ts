import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'mf-one',
  exposes: {
    './Routes': 'apps/mf-one/src/app/remote-entry/entry.routes.ts',
  },
  additionalShared: ['snapsvg', 'snapsvg-cjs'],
};

export default config;
