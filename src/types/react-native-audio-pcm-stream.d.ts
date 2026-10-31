// the package's own index.d.ts declares the module under its old name, so it cannot be imported
declare module '@fugood/react-native-audio-pcm-stream' {
  type Options = { sampleRate: number; channels: number; bitsPerSample: number; audioSource?: number; wavFile: string; bufferSize?: number };
  const AudioRecord: {
    init(options: Options): Promise<void>;
    start(): void;
    stop(): Promise<string>;
    /** 16-bit PCM chunks, base64 */
    on(event: 'data', callback: (data: string) => void): { remove(): void };
  };
  export default AudioRecord;
}
