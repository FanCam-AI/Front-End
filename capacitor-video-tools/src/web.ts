import { WebPlugin } from '@capacitor/core';

import type { VideoToolsPluginPlugin } from './definitions';

export class VideoToolsPluginWeb extends WebPlugin implements VideoToolsPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
