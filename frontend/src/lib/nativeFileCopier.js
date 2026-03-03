import { registerPlugin } from "@capacitor/core";
const NativeFileCopier = registerPlugin("NativeFileCopier");

export async function copyBinaryFileToNative(
  file,
  chunkSize = 1024 * 1024 * 3,
  onProgress,
) {
  const buffer = await file.arrayBuffer();
  const u8 = new Uint8Array(buffer);
  const fileName = file.name;
  let isFirstChunk = true;
  let path = "";

  let processed = 0;

  for (let offset = 0; offset < u8.length; offset += chunkSize) {
    const chunk = u8.slice(offset, offset + chunkSize);
    const byteArray = Array.from(chunk);

    const result = await NativeFileCopier.appendToFile({
      fileName,
      bytes: byteArray,
      isFirstChunk,
    });

    isFirstChunk = false;
    path = result.path;

    processed += chunk.length;
    const progress = Math.round((processed / u8.length) * 100);
    if (onProgress) onProgress(progress);
  }

  return path; // 저장된 파일 경로 반환
}
