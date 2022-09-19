import type { Readable } from 'stream';

// Writes the buffer to the stream
export function writeToStream(stream: Readable, buffer: Buffer) {
  stream.push(buffer);
  stream.push(null);
}
