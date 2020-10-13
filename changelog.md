# Changelog
All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this module adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Breaking: Split formatting role of option `logger` as separated option `messageFormatter`.
- Breaking: `LogTags.LOG_LEVEL` renamed as `LogTags.MESSAGE_LEVEL` to distinct logging level from message level.
- Breaking: Logging level `disabled` renamed to `off` to align with well-known log4j.

### Removed
- Breaking: Method `.setLevel()`, setter `.level` and setter `.prefixes` are removed. Use `.extend()` instead.
- Breaking: Options `levelText` is removed. Use `options.level = 'INFO' as LoggingLevel` instead.
	Invalid level will be ignored.

### Fixed
- Fix prefixes can be altered via `options.prefixes`.

## [0.1.2] - 2020-09-29
### Fixed
- Fix inappropriate `LogFunction` signature.

## [0.1.1] - 2020-08-31
### Fixed
- Fix incorrect information in README.

## [0.1.0] - 2020-08-31
### Added
- First public release.



[Unreleased]: https://github.com/VeryCrazyDog/level-logger/compare/0.1.2...HEAD
[0.1.2]: https://github.com/VeryCrazyDog/level-logger/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/VeryCrazyDog/level-logger/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/VeryCrazyDog/level-logger/releases/tag/0.1.0
