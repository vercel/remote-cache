import concat from 'concat-stream';
import type { Readable } from 'stream';

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.pipe(concat(resolve));
  });
}
