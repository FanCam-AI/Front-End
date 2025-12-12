export interface NativeFileCopierPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
