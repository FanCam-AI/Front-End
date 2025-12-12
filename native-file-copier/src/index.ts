import { registerPlugin } from '@capacitor/core';

import type { NativeFileCopierPluginPlugin } from './definitions';

const NativeFileCopierPlugin = registerPlugin<NativeFileCopierPluginPlugin>('NativeFileCopierPlugin', {
  web: () => import('./web').then((m) => new m.NativeFileCopierPluginWeb()),
});

export * from './definitions';
export { NativeFileCopierPlugin };
