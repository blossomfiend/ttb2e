# ttb2e – Foundry System for Through the Breach

***This system is still in active development! Use it at your own risk!***

This system implements the rules laid out in the second edition Through the Breach: Core
Rules ([check out Wyrd Miniatures' store!](https://www.wyrd-games.net/ttb-products)) in
the [Foundry Virtual Tabletop](https://foundryvtt.com/). Through the Breach itself is a weird west tabletop RPG, based
one the Malifaux universe, which distinctly uses cards as
a primary driver instead of dice. Foundry is a modern extensible virtual tabletop.

Currently, this system features:

- An implementation of card flipping mechanics
- Character sheets with abilities and actions

## For interested developers

This project is formatted using prettier. A few npm scripts are included for development:

- `serve`: Runs the local development server that is exposed on port `30001`. It expects a local Foundry instance to be
  running on the default port `30000` and will proxy all requests that are not relevant to this system to it.
- `watch`: This one continually builds and outputs a full build into the /dist folder. It is recommended to create a
  symlink from the Foundry data directory to this output folder, so the local Foundry installation can easily pick up
  changes with a single restart.
- `build`: Outputs a minified build to dist, which can directly be shipped as a system for production use.

## Fine print

This project is not directly affiliated with Wyrd Miniatures or Foundry Gaming, but rather a fan developed system to
allow playing Through the Breach on FoundryVTT.
