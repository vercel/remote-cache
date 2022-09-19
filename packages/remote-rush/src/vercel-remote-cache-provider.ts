import { createClient } from '@vercel/remote';
import { EnvironmentVariableNames, RushConstants } from '@rushstack/rush-sdk';
import {
  deleteVercelCredentialForUserStore,
  getVercelCredentialTeamTokenPair,
  updateVercelCredentialForUserStore,
} from './credential';
import type {
  ICloudBuildCacheProvider,
  RushSession,
} from '@rushstack/rush-sdk';
import type { ITerminal } from '@rushstack/node-core-library';

export interface VercelRemoteCacheConfiguration {
  teamId?: string;
}
export class VercelRemoteCacheProvider implements ICloudBuildCacheProvider {
  // For logging to terminal
  private _rushSession: RushSession;
  private _options: VercelRemoteCacheConfiguration;

  // TODO: make this dynamic when rush supports passing this along
  // in the build-cache.json
  public isCacheWriteAllowed = true;

  public constructor(
    options: VercelRemoteCacheConfiguration,
    rushSession: RushSession,
  ) {
    this._options = options;
    this._rushSession = rushSession;
  }

  private async _getVercelRemoteCacheClient() {
    const credentials = await getVercelCredentialTeamTokenPair(
      this._options.teamId,
    );
    if (!credentials.token) {
      throw new Error(
        'Missing credentials for Vercel Remote Cache. ' +
          `Update the credentials by running "rush ${RushConstants.updateCloudCredentialsCommandName} --credential <token>", ` +
          `or provide the <token> in the ` +
          `${EnvironmentVariableNames.RUSH_BUILD_CACHE_CREDENTIAL} environment variable`,
      );
    }
    const { teamId, token } = credentials;
    return createClient(token, { teamId, product: 'rush' });
  }

  public async tryGetCacheEntryBufferByIdAsync(
    terminal: ITerminal,
    hash: string,
  ): Promise<Buffer | undefined> {
    try {
      const remote = await this._getVercelRemoteCacheClient();
      const exists = await remote.exists(hash).send();
      if (!exists) {
        terminal.writeVerboseLine('Artifact not found: ', hash);
        return undefined;
      }

      terminal.writeVerboseLine('Downloading artifact hash: ', hash);
      return await remote.get(hash).buffer();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      terminal.writeWarningLine(`Error downloading artifact: ${e}`);
      return undefined;
    }
  }

  public async trySetCacheEntryBufferAsync(
    terminal: ITerminal,
    hash: string,
    objectBuffer: Buffer,
  ): Promise<boolean> {
    terminal.writeVerboseLine('Uploading artifact hash: ', hash);
    try {
      const remote = await this._getVercelRemoteCacheClient();
      await remote.put(hash).buffer(objectBuffer);
      return true;
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      terminal.writeWarningLine(`Error uploading cache entry to Vercel: ${e}`);
      return false;
    }
  }

  public async updateCachedCredentialAsync(
    terminal: ITerminal,
    credential: string,
  ): Promise<void> {
    await updateVercelCredentialForUserStore(credential, this._options.teamId);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async updateCachedCredentialInteractiveAsync(
    _terminal: ITerminal,
  ): Promise<void> {
    throw new Error(
      'The interactive cloud credentials flow is not supported for Vercel Remote Cache.\n' +
        'Provide your credentials to rush using the --credential flag instead. Credentials must be ' +
        'in the form <teamId>:<token> or <token>. If no teamId is provided, ' +
        'build outputs will be uploaded to your personal account scope.',
    );
  }

  public async deleteCachedCredentialsAsync(
    _terminal: ITerminal,
  ): Promise<void> {
    await deleteVercelCredentialForUserStore(this._options.teamId);
  }
}
