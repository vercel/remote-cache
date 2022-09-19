# @vercel/remote-rush

[![@vercel/remote-rush](https://img.shields.io/npm/v/@vercel/remote-rush)](https://npmjs.org/@vercel/remote-rush)

This is a [Rush](https://rushjs.io/) plugin for using Vercel Remote Cache provider during the "build" and "rebuild" command.

## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Setting up a new Rush monorepo with Vercel Remote Cache](#setting-up-a-new-rush-monorepo-with-vercel-remote-cache)
  - [Setup Rush monorepo](#setup-rush-monorepo)
- [Add caching](#add-caching)
- [Add remote caching with Vercel](#add-remote-caching-with-vercel)
  - [Download and install the @vercel/remote-rush plugin](#download-and-install-the-vercelremote-rush-plugin)
  - [Configuring token for the Remote Cache](#configuring-token-for-the-remote-cache)
    - [Using Environment Variables](#using-environment-variables)
    - [Using Rush user store](#using-rush-user-store)
    - [Authenticating during a Vercel Build](#authenticating-during-a-vercel-build)
  - [Finally](#finally)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setting up a new Rush monorepo with Vercel Remote Cache

In this sequence we will configure the [microsoft/rush-example](https://github.com/microsoft/rush-example) repo to use the Vercel Remote Cache.

### Setup Rush monorepo

```sh
npm install -g @microsoft/rush
gh repo clone microsoft/rush-example
cd rush-example
```

Install dependencies and build the project.

```sh
rush install
rush build
```

This will output the build log to the console.

```console
Rush Multi-Project Build Tool 5.76.1 - https://rushjs.io
Node.js version is 16.14.2 (LTS)

Starting "rush build"

Analyzing repo state... DONE (0.08 seconds)

Executing a maximum of 10 simultaneous processes...

==[ my-toolchain ]=================================================[ 1 of 3 ]==
"my-toolchain" completed successfully in 1.39 seconds.

==[ my-controls ]==================================================[ 2 of 3 ]==
"my-controls" completed successfully in 0.89 seconds.

==[ my-app ]=======================================================[ 3 of 3 ]==
"my-app" completed successfully in 0.91 seconds.



==[ SUCCESS: 3 operations ]====================================================

These operations completed successfully:
  my-app          0.91 seconds
  my-controls     0.89 seconds
  my-toolchain    1.39 seconds


rush build (3.30 seconds)
```

There are 3 projects in this repo that are built with `rush build`. They are `my-app`, `my-controls` and `my-toolchain`.

## Add caching

We have a Rush monorepo with 3 built projects. But the artifacts for these built projects are not cached by default.
Rush supports caching build artifacts per project by configuring [rush-project.json](https://rushjs.io/pages/configs/rush-project_json/) on the project.

We will add local caching to the project `my-app`.

Copy the following `rush-project.json` to `apps/my-app/config/rush-project.json`.

```jsonc
{
  "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/rush-project.schema.json",
  "operationSettings": [
    {
      "operationName": "build",
      "outputFolderNames": ["lib"]
    }
  ]
}
```

This is configuration is telling Rush that the outputs for the `build` task of `my-app` project are in the `lib/` folder under the project's root.

Also update `"buildCacheEnabled": true` in [common/config/rush/build-cache.json](https://rushjs.io/pages/configs/build-cache_json/) so that it matches this:

```jsonc
{
  "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/build-cache.schema.json",
  "buildCacheEnabled": true,
  "cacheProvider": "local-only"
}
```

Setting `"buildCacheEnabled": true` is enabling build caching for the Rush monorepo.

Now we can run the build command again.

```sh
rush build
```

```console
Rush Multi-Project Build Tool 5.76.1 - https://rushjs.io
Node.js version is 16.14.2 (LTS)


Starting "rush build"

Analyzing repo state... DONE (0.08 seconds)

Executing a maximum of 10 simultaneous processes...

==[ my-toolchain ]=================================================[ 1 of 3 ]==
"my-toolchain" completed successfully in 1.00 seconds.

==[ my-controls ]==================================================[ 2 of 3 ]==
"my-controls" completed successfully in 0.63 seconds.

==[ my-app ]=======================================================[ 3 of 3 ]==
"my-app" completed successfully in 0.65 seconds.



==[ SUCCESS: 3 operations ]====================================================

These operations completed successfully:
  my-app          0.65 seconds
  my-controls     0.63 seconds
  my-toolchain    1.00 seconds


rush build (2.38 seconds)
```

Rush will rebuild every project since we updated the `build-cache.json` file.
Run build again and notice the that this time, `my-app`'s build artifacts are restored from the local cache.

```sh
rush build
```

```console
Rush Multi-Project Build Tool 5.76.1 - https://rushjs.io
Node.js version is 16.14.2 (LTS)


Starting "rush build"

Analyzing repo state... DONE (0.08 seconds)

Executing a maximum of 10 simultaneous processes...

==[ my-toolchain ]=================================================[ 1 of 3 ]==
"my-toolchain" completed successfully in 0.97 seconds.

==[ my-controls ]==================================================[ 2 of 3 ]==
"my-controls" completed successfully in 0.64 seconds.

==[ my-app ]=======================================================[ 3 of 3 ]==
"my-app" was restored from the build cache.



==[ FROM CACHE: 1 operation ]==================================================

These operations were restored from the build cache:
  my-app    0.01 seconds

==[ SUCCESS: 2 operations ]====================================================

These operations completed successfully:
  my-controls     0.64 seconds
  my-toolchain    0.97 seconds


rush build (1.73 seconds)
```

## Add remote caching with Vercel

Let's assume you already have a Vercel Account. For the rest of the guide you will need a Vercel Access Token and your team ID or team slug. You can create a vercel access token in your [account settings](https://vercel.com/account/tokens). Your team ID can be found under your team settings page.

Have those handy as we'll need them to authorize your monorepo to Vercel's Remote Cache.

### Download and install the @vercel/remote-rush plugin

Vercel's Remote Cache on Rush is enabled using the `@vercel/remote-rush` plugin. Install this plugin using Rush's [autoinstaller](https://rushjs.io/pages/maintainer/using_rush_plugins/).

```sh
rush init-autoinstaller --name rush-plugins
```

This creates a new npm package in `common/autoinstallers/rush-plugins`.
Add `@vercel/remote-rush` as a dependency to this `package.json`.

```jsonc
{
  "name": "rush-plugins",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    // We added this line
    "@vercel/remote-rush": "latest"
  }
}
```

To download the package and generate the shrinkwrap file run

```sh
rush update-autoinstaller --name rush-plugins
```

You will now find that `@vercel/remote-rush` has been downloaded and added to `node_modules` under `common/autoinstallers/rush-plugins/node_modules/@vercel/remote-rush`.

Next, register the plugin under `common/config/rush/rush-plugins.json` so that it's loaded when Rush executes.
Update the `rush-plugins.json` file so it matches the following config.

```jsonc
{
  "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/rush-plugins.schema.json",
  "plugins": [
    // We added this entry
    {
      "packageName": "@vercel/remote-rush",
      "pluginName": "rush-vercel-remote-cache-plugin",
      "autoinstallerName": "rush-plugins"
    }
  ]
}
```

Finally we need to point Rush's build cache configuration to point to Vercel's Remote Cache plugin instead of the local cache. Update `"cacheProvider": "vercel-remote-cache",` in `common/config/rush/build-cache.json` so it matches the following config.

```jsonc
{
  "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/build-cache.schema.json",
  "buildCacheEnabled": true,
  "cacheProvider": "vercel-remote-cache"
}
```

Rush requires setting a config file for this plugin.

Create the folder `common/config/rush-plugins`

```sh
mkdir common/config/rush-plugins
```

In this folder add the configuration file `rush-vercel-remote-cache-plugin.json` that contains an empty JSON object.

```jsonc filename=rush-vercel-remote-cache-plugin.json
{
  // Later we will uncomment this line and replace `<teamId>` with your 
  // Vercel team ID so you can share build artifacts with your team.
  // "teamId": "<teamId>"
}
```

To finish setting up the plugin run `rush update`. This command moves the `rush-plugin-manifest.json` in the plugin to the correct folder in your Rush monorepo.

```sh
rush update
```

### Configuring token for the Remote Cache

If you run `rush rebuild` now, you'll receive an error message indicating you are missing credentials for the Vercel Remote Cache. Add your Vercel access token to your Rush project using the environment variable `RUSH_BUILD_CACHE_CREDENTIAL` or on you local Rush user store.

#### Using Environment Variables

You can set your vercel access token on the `RUSH_BUILD_CACHE_CREDENTIAL` environment variable which has the format `<token>` or `<teamId>:<token>`.

If the `RUSH_BUILD_CACHE_CREDENTIAL` has the form `<teamId>:<token>`, the provided `<teamId>` will override the `teamId` argument in the `rush-vercel-remote-cache-plugin.json` config file.

#### Using Rush user store

```sh
rush update-cloud-credentials --credential <token>
```

This command will store your Vercel access token on your Rush user store in `~/.rush-user/credentials.json`. You can re-run the command to update the token.

#### Authenticating during a Vercel Build

When deploying your project on Vercel, your Rush project is automatically authenticated to the project owner. You do not need to set a `teamId` or `token`.
The Vercel Build sets the `VERCEL_ARTIFACTS_OWNER` and `VERCEL_ARTIFACTS_TOKEN` enviroment variables which supersede this configuration.

### Finally

Force the project to rebuild and upload build artifacts to Vercel's Remote Cache with `rush rebuild`

```sh
rush rebuild
```

You have a working Rush monorepo utilizing Vercel's Remote Cache.

Verify that you are utilizing Vercel's Remote Cache by deleting the local cache and building with `rush build --verbose`

```sh
rm -r common/temp/build-cache
rush build --verbose
```

---

Credit to [Rush plugins examples](https://github.com/microsoft/rushstack/tree/main/rush-plugins)
