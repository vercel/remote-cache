import { describe, expect, it, afterEach, vi } from 'vitest';
import * as exports from '@vercel/remote';
import { getVercelRemoteCacheClient } from '../src/remote-client';
import type { VercelRemoteCacheOptions } from '../src/remote-client';

describe('remote-client', () => {
  const originalEnv = process.env;

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  it('to creates client', () => {
    const options: VercelRemoteCacheOptions = {
      teamId: 'team_id',
      token: 'token',
      lifeCycle: {},
    };
    const client = getVercelRemoteCacheClient(options);
    expect(client).toBeDefined();
  });

  it('to throw error with missing token', () => {
    const options: VercelRemoteCacheOptions = {
      teamId: 'team_id',
      lifeCycle: {},
    };

    expect(() => getVercelRemoteCacheClient(options)).toThrowError(
      'Missing a Vercel access token',
    );
  });

  it('allows using NX_VERCEL_REMOTE_CACHE_TOKEN var as token', () => {
    const options: VercelRemoteCacheOptions = {
      teamId: 'team_id',
      lifeCycle: {},
    };
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.NX_VERCEL_REMOTE_CACHE_TOKEN = 'token';
    expect(() => getVercelRemoteCacheClient(options)).not.toThrowError();
  });

  it('overrides param token and team with NX_ env vars', () => {
    const options: VercelRemoteCacheOptions = {
      token: 'token_unused',
      teamId: 'team_id_unused',
      lifeCycle: {},
    };
    const spy = vi.spyOn(exports, 'createClient');
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.NX_VERCEL_REMOTE_CACHE_TOKEN = 'token_nv_env';
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.NX_VERCEL_REMOTE_CACHE_TEAM = 'team_nv_env';
    expect(() => getVercelRemoteCacheClient(options)).not.toThrowError();
    expect(spy).toBeCalledWith('token_nv_env', {
      teamId: 'team_nv_env',
      product: 'nx',
    });
  });

  it('VERCEL_ARTIFACTS_* env overrides all', () => {
    const options: VercelRemoteCacheOptions = {
      token: 'token_unused',
      teamId: 'team_id_unused',
      lifeCycle: {},
    };
    const spy = vi.spyOn(exports, 'createClient');
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.NX_VERCEL_REMOTE_CACHE_TOKEN = 'token_nv_env';
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.NX_VERCEL_REMOTE_CACHE_TEAM = 'team_nv_env';
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.VERCEL_ARTIFACTS_TOKEN = 'token_vercel_env';
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.VERCEL_ARTIFACTS_OWNER = 'team_vercel_env';

    expect(() => getVercelRemoteCacheClient(options)).not.toThrowError();
    expect(spy).toBeCalledWith('token_vercel_env', {
      teamId: 'team_vercel_env',
      product: 'nx',
    });
  });
});
