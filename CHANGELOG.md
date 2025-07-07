# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive acceptance tests for GitHub Action parameters
- Integration tests that run the action from the repository itself
- Parameter validation tests for missing and empty inputs
- Performance tests for large CSV files
- Cross-platform compatibility tests (Ubuntu, Windows, macOS)
- Release workflow triggered by tagged releases
- Automated version tag management (major version tags)
- Release artifact creation and upload
- Post-release validation tests

### Changed
- Enhanced test workflow with multiple test categories
- Improved error handling and validation
- Updated workflow to use latest GitHub Actions versions
- Better test organization with descriptive test names

### Fixed
- Better handling of edge cases in CSV parsing
- Improved error messages for invalid inputs

## [3.0.0] - 2024-01-XX

### Added
- Performance optimizations for large CSV files
- Enhanced error handling with detailed error messages
- Performance monitoring and logging
- Input validation for empty or whitespace-only inputs
- Debug logging for troubleshooting
- Better support for different line endings (CRLF, LF, CR)
- Improved handling of quoted fields with embedded commas and newlines
- Support for escaped quotes within quoted fields

### Changed
- Upgraded to Node.js 20 runtime
- Improved CSV parsing algorithm for better performance
- Enhanced markdown table formatting with proper column alignment
- Better handling of uneven CSV rows (automatic padding)
- Improved test coverage and test organization

### Fixed
- Fixed handling of CSV files with missing fields
- Corrected parsing of quoted fields containing special characters
- Fixed alignment issues in generated markdown tables
- Resolved issues with empty CSV rows

### Security
- Updated dependencies to latest versions
- Added proper input validation to prevent injection attacks

## [2.0.0] - 2023-XX-XX

### Added
- Support for quoted CSV fields
- Better handling of commas within quoted fields
- Improved error handling

### Changed
- Upgraded to use @actions/core v1.10.0
- Improved parsing algorithm

### Fixed
- Fixed issues with malformed CSV input
- Corrected markdown table formatting

## [1.0.0] - 2023-XX-XX

### Added
- Initial release of CSV to Markdown Table Action
- Basic CSV parsing functionality
- Markdown table output generation
- Support for standard CSV format
- GitHub Actions integration
- Basic error handling

### Features
- Convert CSV string input to formatted markdown table
- Automatic column width calculation
- Support for multi-line CSV input
- Compatible with GitHub Actions workflow

---

## Release Types

This project uses [Semantic Versioning](https://semver.org/). Version numbers follow the format `MAJOR.MINOR.PATCH`:

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality in a backwards compatible manner
- **PATCH**: Backwards compatible bug fixes

### Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes

## Support

For questions, issues, or feature requests, please:

1. Check the [Issues](https://github.com/petems/csv-to-md-table-action/issues) page
2. Review the [Documentation](README.md)
3. Create a new issue if your question isn't already addressed

## Contributing

We welcome contributions! Please see our contributing guidelines and:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

All contributions will be reviewed and tested before merging.