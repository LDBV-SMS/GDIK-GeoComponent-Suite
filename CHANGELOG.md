# Changelog GDIK GeoComponent Suite
All important changes in this project are stored in this file.

The [Semantic Versioning](https://semver.org/spec/v2.0.0.html) is used.

## Unreleased - in development
### Added
### Changed
### Deprecated
### Removed
### Fixed

## 1.3.5
### Added
- configloaded event to gdik-input and gdik-select
### Changed
### Deprecated
### Removed
### Fixed

## 1.3.4
### Added
- Mechanism to patch dependencies
### Changed
The following packages have been updated:
- geowerkstatt-hamburg/masterportalAPI: 2.30.0 to 2.39.0
### Deprecated
### Removed
### Fixed

## 1.3.3
### Added
### Changed
### Deprecated
### Removed
### Fixed
- image export bug in some browsers by some screen scales

## 1.3.2
### Added
### Changed
- jump to search result when search string attribute is set or changed
### Deprecated
### Removed
### Fixed
- drawType in config file has no effect
- zoom level not changed when search result selected

## 1.3.1
### Added
- Basemap.de Gray layer to default layers
### Changed
- pipeline concept to separate pipelines for feature-, dev and main branches
### Deprecated
### Removed
- TopPlusOpen from default layers
### Fixed
- Using interaction layer options

## 1.3.0
### Added
- public centerToFeature method to gdik-elements
### Changed
The following packages have been updated:
- geowerkstatt-hamburg/masterportalAPI: 2.24.0 to 2.30.0
### Deprecated
### Removed
### Fixed
- stop event propagation for hit enter key on gcs-search input field

## 1.2.0
### Added
- public getImage method to gdik-elements
- test coverage task to package.json
### Changed
### Deprecated
### Removed
### Fixed

## 1.1.1
### Added
### Changed
- Refactored map template generation
### Deprecated
### Removed
### Fixed

## 1.1.0
### Added
- Added <gdik-select> element
### Changed
### Deprecated
### Removed
### Fixed

## 1.0.13
### Added
- Added <gcs-select> element
### Changed
### Deprecated
### Removed
### Fixed

## 1.0.12
### Added
- Added styling for interaction layers (e.g. Draw)
### Changed
### Deprecated
### Removed
### Fixed

## 1.0.11
### Added
- Added styling for vector layers
- Language support. DE (default) and EN.
### Changed
### Deprecated
### Removed
### Fixed

## 1.0.10
### Added
- Added WFS to example config.json in Readme
### Changed
### Deprecated
### Removed
### Fixed

## 1.0.9
### Added
### Changed
The following packages have been updated:
- geowerkstatt-hamburg/masterportalAPI: 2.18.0 to 2.24.0
### Deprecated
### Removed
### Fixed

## 1.0.8
### Added
- Added an option to specify a foregroundLayer in the config.json
### Changed
### Deprecated
### Removed
### Fixed

## 1.0.7
### Added
- Search string attribute to gdik-input and gcs-search
### Changed
The following packages in package-lock.json have been update due to security reasons:
- protobufjs 7.2.3 to 7.2.4
### Deprecated
### Removed
### Fixed

## 1.0.6
### Added
### Changed
### Deprecated
### Removed
### Fixed
- gdik-input attribute documentation
- Replaced webatlas by basemap service in example config

## 1.0.5
### Added
### Changed
The following packages have been updated:
- geowerkstatt-hamburg/masterportalAPI: 2.15.1 to 2.18.0
### Deprecated
### Removed
### Fixed

## 1.0.4
### Added
- Emit "input" and "change" events when gdik-input value changes
### Changed
### Deprecated
### Removed
### Fixed
- CVE-2023-0842

## 1.0.3
### Added
### Changed
- Replace default background layer WebAtlasDE by basemap.de
- Enlarge default bbox to germany
### Deprecated
### Removed
### Fixed

## 1.0.2
### Added
### Changed
### Deprecated
### Removed
### Fixed
gdik-input attribute observing of gcs-draw feature attribute

## 1.0.1
### Added
### Changed
The following packages in package-lock.json have been update due to security reasons:
- json5 2.2.1 to 2.2.3
- terser 5.14.1 to 5.16.6
- tsconfig-path/json5 1.0.1 to 1.0.2
### Deprecated
### Removed
### Fixed

## 1.0.0
- Initial implementation.
