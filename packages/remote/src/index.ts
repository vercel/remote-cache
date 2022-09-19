import { RemoteClientImpl } from './remote-cache-client';
import {
  ArtifactGetRequest,
  ArtifactExistsRequest,
  ArtifactPutRequest,
} from './artifact-request';
import type { ArtifactOptions } from './artifact-request';
import type { RemoteClientOptions, RemoteClient } from './remote-cache-client';

export {
  ArtifactExistsRequest,
  ArtifactGetRequest,
  ArtifactPutRequest,
  type ArtifactOptions,
};
export type { RemoteClient };
export function createClient(
  token: string,
  options: RemoteClientOptions,
): RemoteClient {
  return new RemoteClientImpl(token, options);
}
