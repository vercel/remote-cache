import { describe, expect, it } from 'vitest';
import {
  ArtifactExistsRequest,
  ArtifactGetRequest,
  ArtifactPutRequest,
  createClient,
} from '../src/index';

describe('remote cache sdk', () => {
  it('can create remote cache client', () => {
    const client = createClient('secret-token', {
      teamId: 'team_12345',
      product: 'unknown',
    });
    expect(client).not.toBeNull();
  });

  it('implements exists', () => {
    const hash = 'hash';
    const client = createClient('secret-token', {
      teamId: 'team_12345',
      product: 'unknown',
    });
    const exists = client.exists(hash);
    expect(exists).toBeInstanceOf(ArtifactExistsRequest);
    expect(exists.response).toBeUndefined();
  });

  it('implements get', () => {
    const hash = 'hash';
    const client = createClient('secret-token', {
      teamId: 'team_12345',
      product: 'unknown',
    });
    const get = client.get(hash);
    expect(get).toBeInstanceOf(ArtifactGetRequest);
    expect(get.response).toBeUndefined();
  });

  it('implements put', () => {
    const hash = 'hash';
    const client = createClient('secret-token', {
      teamId: 'team_12345',
      product: 'unknown',
    });
    const put = client.put(hash);
    expect(put).toBeInstanceOf(ArtifactPutRequest);
    expect(put.response).toBeUndefined();
  });
});
