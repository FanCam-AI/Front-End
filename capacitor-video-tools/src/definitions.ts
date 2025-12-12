export interface VideoToolsPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
