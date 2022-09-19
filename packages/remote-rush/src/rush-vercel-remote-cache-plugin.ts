import { VercelRemoteCacheProvider } from './vercel-remote-cache-provider';
import type { VercelRemoteCacheConfiguration } from './vercel-remote-cache-provider';
import type {
  IRushPlugin,
  RushSession,
  RushConfiguration,
} from '@rushstack/rush-sdk';

const PLUGIN_NAME = 'RushVercelRemoteCachePlugin';
const CACHE_PROVIDER_NAME = 'vercel-remote-cache';

export class RushVercelRemoteCachePlugin implements IRushPlugin {
  private _options: VercelRemoteCacheConfiguration;
  constructor(options: VercelRemoteCacheConfiguration) {
    this._options = options;
  }
  public apply(rushSession: RushSession, _rushConfig: RushConfiguration): void {
    rushSession.hooks.initialize.tap(PLUGIN_NAME, () => {
      rushSession.registerCloudBuildCacheProviderFactory(
        CACHE_PROVIDER_NAME,
        (_buildCacheConfig): VercelRemoteCacheProvider => {
          return new VercelRemoteCacheProvider(this._options, rushSession);
        },
      );
    });
  }
}
