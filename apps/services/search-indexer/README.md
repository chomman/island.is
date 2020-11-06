# Search indexer

## About

The search indexer takes care of indexing content from Contentful into elasticsearch. You can run a local instance of elasticsearch using the `yarn dev-services services-search-indexer` see documentation under `./dev-services`.

## URLs

- Dev: N/A
- Staging: N/A
- Production: N/A

## Getting started

**You must have access to Contentful for the indexer to work correctly**. To start the indexer server you run `yarn start services-search-indexer`. This starts a server on `localhost:3333`.

The indexer server currently has two endpoints:

- `/re-sync` indexes all supported entries into elasticsearch
- `/sync` indexes all supported entries **since last sync** into elasticsearch

## Code owners and maintainers

- [Stefna](https://github.com/orgs/island-is/teams/stefna/members)
- [Kosmos & Kaos](https://github.com/orgs/island-is/teams/kosmos-kaos/members)
- [Aranja](https://github.com/orgs/island-is/teams/aranja/members)
