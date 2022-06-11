#! /usr/bin/env -S bash -eux

# Install TypeScript, but make sure it is from the package-lock.json
npm ci
# Convert TS to JS using tsconfig.json for options
npx tsc
