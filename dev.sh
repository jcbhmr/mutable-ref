#! /usr/bin/env -S bash -eux

# Install TypeScript
npm install
# Convert TS to JS using tsconfig.json for options. Keep
# doing this whenever the file changes!
npx tsc --watch
