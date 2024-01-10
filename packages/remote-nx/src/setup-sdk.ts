import type { Task } from 'nx/src/config/task-graph';
import { initEnv } from 'nx-remotecache-custom';
import { getVercelRemoteCacheClient } from './remote-client';
import type { Readable } from 'stream';
import type { VercelRemoteCacheOptions } from './remote-client';

// eslint-disable-next-line @typescript-eslint/require-await
const setupSDK = async (options: VercelRemoteCacheOptions, tasks: Task[]) => {
  initEnv(options);
  const remote = getVercelRemoteCacheClient(options);

  return {
    name: 'Vercel Remote Cache',
    fileExists: (filename: string) => remote.exists(filename).send(),
    retrieveFile: (filename: string) => remote.get(filename).stream(),
    storeFile: (filename: string, stream: Readable) =>
      remote
        .put(filename, {
          duration: totalDuration(tasks),
        })
        .stream(stream),
  };
};

function totalDuration(tasks: Pick<Task, 'endTime' | 'startTime'>[]) {
  let total = 0;
  for (const task of tasks) {
    if (task.startTime && task.endTime) {
      total += task.endTime - task.startTime;
    }
  }

  return total;
}

export { setupSDK };
