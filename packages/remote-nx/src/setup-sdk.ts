import { initEnv } from 'nx-remotecache-custom';
import { getVercelRemoteCacheClient } from './remote-client';
import type { Readable } from 'stream';
import type { VercelRemoteCacheOptions } from './remote-client';

// eslint-disable-next-line @typescript-eslint/require-await
const setupSDK = async (options: VercelRemoteCacheOptions) => {
  initEnv(options);
  const remote = getVercelRemoteCacheClient(options);
  return {
    name: 'Vercel Remote Cache',
    fileExists: (filename: string) => remote.exists(filename).send(),
    retrieveFile: (filename: string) => remote.get(filename).stream(),
    storeFile: (filename: string, stream: Readable) =>
      remote.put(filename).stream(stream),
  };
};

export { setupSDK };
