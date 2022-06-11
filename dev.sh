#! /usr/bin/env -S bash -eux

# Install TypeScript
npm install
# Convert TS to JS using tsconfig.json for options
npx tsc --watch
