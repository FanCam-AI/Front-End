import { registerPlugin } from '@capacitor/core';

import type { VideoToolsPluginPlugin } from './definitions';

const VideoToolsPlugin = registerPlugin<VideoToolsPluginPlugin>('VideoToolsPlugin', {
  web: () => import('./web').then((m) => new m.VideoToolsPluginWeb()),
});

export * from './definitions';
export { VideoToolsPlugin };
