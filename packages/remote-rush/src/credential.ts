import { CredentialCache, EnvironmentConfiguration } from '@rushstack/rush-sdk';
import type { ICredentialCacheEntry } from '@rushstack/rush-sdk';

const CREDENTIAL_CACHE_PREFIX = 'vercel-remote-cache';

interface VercelCredential {
  teamId?: string;
  token?: string;
}

function getCacheIds(teamId?: string) {
  return {
    globalCacheId: CREDENTIAL_CACHE_PREFIX,
    ...(teamId && { teamCacheId: `${CREDENTIAL_CACHE_PREFIX}:${teamId}` }),
  };
}

/**
 * These should only be set during Vercel Deployments
 */
function getCredentialFromVercelEnv(): VercelCredential {
  return {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    token: process.env.VERCEL_ARTIFACTS_TOKEN,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    teamId: process.env.VERCEL_ARTIFACTS_OWNER,
  };
}

function parseRushCredential(credential: string): VercelCredential {
  const parsed = credential.split(':');
  if (parsed.length === 1) {
    return {
      token: credential,
    };
  } else if (parsed.length === 2) {
    return {
      teamId: parsed[0],
      token: parsed[1],
    };
  }
  return {};
}

async function getCredentialFromUserStore(
  teamId?: string,
): Promise<VercelCredential> {
  let cacheEntry: ICredentialCacheEntry | undefined;
  const { globalCacheId, teamCacheId } = getCacheIds(teamId);

  if (teamCacheId) {
    await CredentialCache.usingAsync(
      {
        supportEditing: false,
      },
      (credentialsCache: CredentialCache) => {
        cacheEntry = credentialsCache.tryGetCacheEntry(teamCacheId);
      },
    );
  }
  if (!cacheEntry) {
    // Fallback to the global cacheId when available
    await CredentialCache.usingAsync(
      {
        supportEditing: false,
      },
      (credentialsCache: CredentialCache) => {
        cacheEntry = credentialsCache.tryGetCacheEntry(globalCacheId);
      },
    );
  }

  return cacheEntry?.credential ? { token: cacheEntry.credential, teamId } : {};
}

function getCredentialFromRushEnv(): VercelCredential {
  const credential = EnvironmentConfiguration.buildCacheCredential;
  if (credential) {
    return parseRushCredential(credential);
  }
  return {};
}

/**
 * Tries to find credentials for Vercel Artifacts in the following order:
 * 1. The `VERCEL_ARTIFACTS_TOKEN` and `VERCEL_ARTIFACTS_OWNER` environment variables.
 *
 *    The value of `VERCEL_ARTIFACTS_OWNER` will always override the `teamId` argument.
 * 2. The `RUSH_BUILD_CACHE_CREDENTIAL` environment variable which has the format `<token>` or `<teamId>:<token>`.
 *
 *    If the `RUSH_BUILD_CACHE_CREDENTIAL` has the form `<teamId>:<token>`, the provided `<teamId>` will override the
 *    `teamId` argument.
 *
 * 3. The user credential stored in `~/.rush-user/credentials.json` created with `rush update-cloud-credentials --credential <token>`
 *
 *
 * @param teamId - The teamId can be provided to select the credential with the matching `teamId` from the
 * user credential store in `~/.rush-user/credentials.json`.
 *
 * @returns Credentials for Vercel Remote Cache
 */
export function getVercelCredentialTeamTokenPair(
  teamId?: string,
): Promise<VercelCredential> {
  const fromVercelArtifactsEnv = getCredentialFromVercelEnv();
  if (fromVercelArtifactsEnv.token) {
    return Promise.resolve(fromVercelArtifactsEnv);
  }
  const fromRushEnv = getCredentialFromRushEnv();
  if (fromRushEnv.token) {
    if (fromRushEnv.teamId) {
      return Promise.resolve(fromRushEnv);
    }
    return Promise.resolve({ token: fromRushEnv.token, teamId });
  }
  return getCredentialFromUserStore(teamId);
}

/**
 * Set or update the global user credential from the `~/.rush-user/credentials.json` store.
 * If `teamId` is provided, only update the team credential.
 *
 * @param teamId - The teamId of the credential to set or update
 */
export async function updateVercelCredentialForUserStore(
  token: string,
  teamId?: string,
): Promise<void> {
  if (/[^\w]+/.exec(token)) {
    throw new Error(
      'The provided Vercel access token contains invalid characters.',
    );
  }

  const { globalCacheId, teamCacheId } = getCacheIds(teamId);
  if (teamCacheId) {
    await CredentialCache.usingAsync(
      {
        supportEditing: true,
      },
      async (credentialsCache: CredentialCache) => {
        credentialsCache.setCacheEntry(teamCacheId, token);
        await credentialsCache.saveIfModifiedAsync();
      },
    );
  } else {
    await CredentialCache.usingAsync(
      {
        supportEditing: true,
      },
      async (credentialsCache: CredentialCache) => {
        credentialsCache.setCacheEntry(globalCacheId, token);
        await credentialsCache.saveIfModifiedAsync();
      },
    );
  }
}

/**
 * Delete the global user credential from the `~/.rush-user/credentials.json` store
 * If `teamId` is provided, also delete the team credential.
 *
 * @param teamId - The teamId of the credential to remove
 */
export async function deleteVercelCredentialForUserStore(teamId?: string) {
  const { globalCacheId, teamCacheId } = getCacheIds(teamId);
  if (teamCacheId) {
    await CredentialCache.usingAsync(
      {
        supportEditing: true,
      },
      async (credentialsCache: CredentialCache) => {
        credentialsCache.deleteCacheEntry(teamCacheId);
        await credentialsCache.saveIfModifiedAsync();
      },
    );
  }
  await CredentialCache.usingAsync(
    {
      supportEditing: true,
    },
    async (credentialsCache: CredentialCache) => {
      credentialsCache.deleteCacheEntry(globalCacheId);
      await credentialsCache.saveIfModifiedAsync();
    },
  );
}
