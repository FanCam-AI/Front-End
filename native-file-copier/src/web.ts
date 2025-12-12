import { WebPlugin } from '@capacitor/core';

import type { NativeFileCopierPluginPlugin } from './definitions';

export class NativeFileCopierPluginWeb extends WebPlugin implements NativeFileCopierPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
