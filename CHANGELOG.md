# Changelog

## [Unreleased][unreleased]

- Improved `AbortSignal` support in `locks.request`
- Cancel queued waiters on abort; reject already-aborted signals
- Reject unsupported lock modes with `TypeError`
- Avoid overwriting existing locks on duplicate create messages
- Added AbortSignal tests and migrated handler-throw tests to `node:test`
- Added TypeScript typings (`web-locks.d.ts`) and `tsc` type checking
- Updated README with API and AbortSignal usage
- Updated LICENSE copyright year to 2026
- Removed Node.js 20 from CI, added Node.js 26
- Updated dependencies
- Fixed `LockManagerSnapshot` constructor call

## [0.0.9][]

[unreleased]: https://github.com/metarhia/web-locks/compare/v0.0.9...HEAD
[0.0.9]: https://github.com/metarhia/web-locks/releases/tag/v0.0.9
