import { describe, expect, it, afterEach } from 'vitest';
import { setupSDK } from '../src/setup-sdk';
import type { VercelRemoteCacheOptions } from '../src/remote-client';

describe('sdk', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('to be defined', async () => {
    const options: VercelRemoteCacheOptions = {
      teamId: 'team_id',
      token: 'token',
      lifeCycle: {},
    };

    const client = await setupSDK(options);
    expect(client).toBeDefined();
  });

  it('to implement interface', async () => {
    const options: VercelRemoteCacheOptions = {
      teamId: 'team_id',
      token: 'token',
      lifeCycle: {},
    };

    const client = await setupSDK(options);
    expect(client.fileExists).toBeInstanceOf(Function);
    expect(client.retrieveFile).toBeInstanceOf(Function);
    expect(client.storeFile).toBeInstanceOf(Function);
    expect(client.name).toMatch('Vercel Remote Cache');
  });

  it('to throw error with missing token', async () => {
    const options: VercelRemoteCacheOptions = {
      teamId: 'team_id',
      lifeCycle: {},
    };

    await expect(setupSDK(options)).rejects.toThrowError(
      'Missing a Vercel access token',
    );
  });

  it('to allow using NX_VERCEL_REMOTE_CACHE_TOKEN var as token', async () => {
    const options: VercelRemoteCacheOptions = {
      teamId: 'team_id',
      lifeCycle: {},
    };
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.NX_VERCEL_REMOTE_CACHE_TOKEN = 'token';
    await expect(setupSDK(options)).resolves.toBeDefined();
  });
});
