# @vercel/remote-nx

[![@vercel/remote-nx](https://img.shields.io/npm/v/@vercel/remote-nx)](https://npmjs.org/@vercel/remote-nx)

This project implements a task runner for [@nrwl/nx](https://nx.dev) that caches build artifacts in the Vercel Remote Cache.

## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Setup](#setup)
- [Usage](#usage)
- [Run it 🚀](#run-it-)
- [Advanced Configuration](#advanced-configuration)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setup

Let's assume you already have a Vercel Account. For the rest of the guide you will need a Vercel Access Token and your team ID. You can create a vercel access token in your [account settings](https://vercel.com/account/tokens). Your team ID can be found under your team settings page.

Have those handy as we'll need them to authorize your monorepo to Vercel's remote cache.

## Usage

```sh
npm install --save-dev @vercel/remote-nx
```

In your `nx.json` file you will find a `tasksRunnerOptions` field. Update this field so that it's using the installed `@vercel/remote-nx`

```jsonc filename=nx.json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@vercel/remote-nx",
      "options": {
        "cacheableOperations": ["build", "test", "lint", "e2e"],
        "token": "<token>",
        "teamId": "<teamId>"
      }
    }
  }
}
```

You can specify your `token` and `teamId` in your nx.json or set them as environment variables.

| Parameter                 | Description                                           |  Environment Variable / .env   | `nx.json` |
| ------------------------- | ----------------------------------------------------- | ------------------------------ | --------- |
| Vercel Access Token       | Vercel access token with access to the provided team  | `NX_VERCEL_REMOTE_CACHE_TOKEN` | `token`   |
| Vercel Team ID (optional) | The Vercel Team ID that should share the Remote Cache | `NX_VERCEL_REMOTE_CACHE_TEAM`  | `teamId`  |

## Run it 🚀

Clear your local cache and rebuild your project.

```sh
nx reset
nx build
```

## Advanced Configuration

| Option       | Description                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| `verbose`    | Set to receive full stack traces whenever errors occur. Best used for debugging. **Default:** `false` |
| `silent`     | Set to mute success and info logs. **Default:** `false`                                               |
| `dotenv`     | Set to `false` to disable reading `.env` into `process.env`. **Default:** `true`                      |
| `dotenvPath` | Set to read `.env` files from a different folder.                                                     |

```json
"tasksRunnerOptions": {
  "default": {
    "runner": "@vercel/remote-nx",
    "options": {
      "verbose": true,
      "silent": true
    }
  }
}
```

---

Credit to [`nx-remotecache-custom` examples](https://www.npmjs.com/package/nx-remotecache-custom).

