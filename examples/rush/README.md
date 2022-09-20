# Rush Monorepo with Vercel Remote Caching

This is a monorepo example using [Rush](https://rushjs.io/) with a single [Next.js](https://nextjs.org/) using [`@vercel/remote-rush`](../../packages/remote-rush).

## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [How to Use](#how-to-use)
  - [One-Click Deploy](#one-click-deploy)
  - [Start Locally](#start-locally)
    - [Building this Repo](#building-this-repo)
- [Further help](#further-help)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## How to Use

You can choose from one of the following methods to use this repository:

### One-Click Deploy

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/remote-cache/tree/main/examples/rush&project-name=rush-monorepo-with-vercel-cache&root-directory=apps%2Fmy-app&build-command=node%20..%2F..%2Fcommon%2Fscripts%2Finstall-run-rush.js%20build&install-command=node%20..%2F..%2Fcommon%2Fscripts%2Finstall-run-rush.js%20update-autoinstaller%20--name%20rush-plugins%20%26%26%20node%20..%2F..%2Fcommon%2Fscripts%2Finstall-run-rush.js%20update%20%26%26%20node%20..%2F..%2Fcommon%2Fscripts%2Finstall-run-rush.js%20install&repository-name=rush-monorepo)


### Start Locally

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example https://github.com/vercel/remote-cache/tree/main/examples/rush rush-monorepo
```

```bash
yarn create next-app --example https://github.com/vercel/remote-cache/tree/main/examples/rush rush-monorepo
```

```bash
pnpm create next-app --example https://github.com/vercel/remote-cache/tree/main/examples/rush rush-monorepo
```

#### Building this Repo
To build the projects in this repo, use the following commands:

```bash
npm install -g @microsoft/rush
```

```bash
rush install
```

```bash
rush build
```

## Further help

Visit the [Rush Documentation](https://rushjs.io/) to learn more.
