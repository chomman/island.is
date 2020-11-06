# Ísland.is

This [GitHub organization](https://github.com/island-is) is the center of development for digital government services on `island.is`. It is managed by the [Digital Iceland](https://stafraent.island.is/) department inside the [Ministry of Finance and Economic Affairs](https://www.government.is/ministries/ministry-of-finance-and-economic-affairs/).

These solutions are [FOSS](https://en.wikipedia.org/wiki/Free_and_open-source_software) and open to contributions, but most development will be performed by teams that win tenders to develop new functionality for Digital Iceland.

The repository is a [monorepo](../technical-overview/monorepo.md) that has multiple apps (something that can be built and run) and libraries (which other apps and libraries can depend on). All custom-written services is stored in there.

## Reading material

For all the information regarding the project please make sure to read the [technical overview](handbook/technical-overview/README.md).

## How to contribute

We are working on documentation and workflows to help external developers understand and run these solutions locally.

For now, we appreciate assistance with security reviews (more eyes = better), documentation and smaller fixes.

## Setup

Before starting you will need an up-to-date NodeJS (`>= 12`) and [Docker](https://docs.docker.com/desktop/) installed.

Then you can run yarn to install the dependencies

```bash
yarn
```

## Usage

There are many projects that can be built and run. You can find the list [here](https://github.com/island-is/island.is/blob/master/nx.json#L29-L368).

### Development server

For a dev server:

```bash
yarn start <project>
```

The app will automatically reload if you change any of the source files.

### Build

To build the project:

```bash
yarn build <project>
```

The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

To execute the unit tests via [Jest](https://jestjs.io):

```bash
yarn test <project>
```

To execute the unit tests affected by a change:

```bash
yarn affected:test
```

### Running end-to-end tests

To execute end-to-end tests via [Cypress](https://www.cypress.io):

```bash
yarn e2e <project>-e2e
```

To execute the end-to-end tests affected by a change:

```bash
yarn affected:e2e
```

### Understand your workspace

To see a diagram of the dependencies of your projects:

```bash
yarn nx dep-graph
```

### Making dev secrets available locally

Environment variables that should not be tracked but needed locally should be added to the `.env.secret` file.
Additionally if that same variable is also stored in AWS Parameter Store, the secret can be labeled with the `dev` label from `History` -> `Attach labels`.

All secrets labeled with the `dev` label can be fetched using `yarn env-secrets`.

### Fetch development secrets for your project

```bash
yarn env-secrets <project> [options]
```

**Example**:

```bash
yarn env-secrets gjafakort --reset
```
