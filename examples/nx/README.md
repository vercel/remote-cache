# Nx Monorepo with Vercel Remote Caching

This is a monorepo example using [Nx](https://nx.dev) with a single [Next.js](https://nextjs.org/) using [`@vercel/remote-nx`](../../packages/remote-nx).

## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [How to Use](#how-to-use)
  - [One-Click Deploy](#one-click-deploy)
  - [Start Locally](#start-locally)
    - [Development server](#development-server)
    - [Build](#build)
- [Further help](#further-help)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## How to Use

You can choose from one of the following methods to use this repository:

### One-Click Deploy

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/remote-cache/tree/main/examples/nx&project-name=nx-monorepo-with-vercel-cache&output-directory=dist%2Fapps%2Fapp%2F.next&build-command=npx%20nx%20build%20app%20--prod&repository-name=nx-monorepo)


### Start Locally

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example https://github.com/vercel/remote-cache/tree/main/examples/nx nx-monorepo
```

```bash
yarn create next-app --example https://github.com/vercel/remote-cache/tree/main/examples/nx nx-monorepo
```

```bash
pnpm create next-app --example https://github.com/vercel/remote-cache/tree/main/examples/nx nx-monorepo
```

#### Development server

```bash
npx nx serve app
```
Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

#### Build

```bash
npx nx build app
```
The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.


## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.
