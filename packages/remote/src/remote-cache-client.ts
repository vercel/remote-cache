import { getUserAgent } from './utils/user-agent';
import {
  ArtifactExistsRequest,
  ArtifactGetRequest,
  ArtifactPutRequest,
} from './artifact-request';
import { REMOTE_CACHE_ENDPOINT } from './constants';
import type { ArtifactOptions } from './artifact-request';

export interface RemoteClientOptions {
  teamId?: string;
  product: string;
}

export interface RemoteClient {
  exists: (hash: string) => ArtifactExistsRequest;
  get: (hash: string) => ArtifactGetRequest;
  put: (hash: string) => ArtifactPutRequest;
}

export class RemoteClientImpl implements RemoteClient {
  private readonly token: string;
  private readonly teamId?: string;
  private readonly userAgent: string;
  constructor(token: string, { teamId, product }: RemoteClientOptions) {
    this.token = token;
    this.teamId = teamId;
    this.userAgent = getUserAgent(product);
  }

  private endpointURL(hash: string): string {
    if (hash.includes('/')) {
      throw new Error("Invalid hash: Cannot contain '/'");
    }
    const params = this.teamId ? `?teamId=${this.teamId}` : '';
    return `${REMOTE_CACHE_ENDPOINT}/${hash}${params}`;
  }

  get(hash: string, options?: ArtifactOptions) {
    return new ArtifactGetRequest(
      this.token,
      this.endpointURL(hash),
      this.userAgent,
      options,
    );
  }

  put(hash: string, options?: ArtifactOptions) {
    return new ArtifactPutRequest(
      this.token,
      this.endpointURL(hash),
      this.userAgent,
      options,
    );
  }

  exists(hash: string, options?: ArtifactOptions) {
    return new ArtifactExistsRequest(
      this.token,
      this.endpointURL(hash),
      this.userAgent,
      options,
    );
  }
}
