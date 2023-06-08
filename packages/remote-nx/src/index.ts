import { createCustomRunner } from 'nx-remotecache-custom';
import { setupSDK } from './setup-sdk';
import type { VercelRemoteCacheOptions } from './remote-client';
import type defaultTasksRunner from '@nx/workspace/tasks-runners/default';

declare type DefaultTasksRunner = typeof defaultTasksRunner;

// This type annotation is needed due to https://github.com/microsoft/TypeScript/issues/48212
const runner: DefaultTasksRunner =
  createCustomRunner<VercelRemoteCacheOptions>(setupSDK);

// eslint-disable-next-line import/no-default-export
export default runner;
