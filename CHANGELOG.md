# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial release of SFSanity event aggregator
- Events display with tile and list view modes
- Search functionality with fuzzy matching
- Supabase integration for event data
- Real-time event loading with pagination
- Responsive design with Tailwind CSS
- Error handling and connection status monitoring
- Added changelog following Keep a Changelog format
- Added JSDoc comments for better code documentation
- Added event ordering configuration in app config
- Added link utility functions for domain extraction and URL validation
- Added configurable GitHub button to top navigation
- Added GITHUB_URL configuration option in app config for easy URL management
- Added GITHUB_TOOLTIP configuration option for customizable button tooltip text

### Enhanced

- Enhanced search functionality to include locations, links, dates, and times in addition to event titles
- Updated search highlighting to work across all searchable fields (title, location, time, link)
- Improved search placeholder text to reflect expanded search capabilities including dates
- Added conditional highlighting in Home page components for better search result visibility

### Changed

- Renamed AI_INSIGHTS_DEFAULT_EXPANDED to INSIGHTS_DEFAULT_EXPANDED for consistency
- Improved connection status component tooltip positioning and hover behavior
- Enhanced visual feedback for connection error states with better tooltip styling
- Updated connection status component to only display when there's a connection error
- Hidden connection status indicator when successfully connected to reduce UI clutter
- Refactored database schema to use `supabase/create_events_dev.sql` for table creation
- Updated application configuration to use `events_dev` table consistently
- Improved database connection testing to use configured table name
- Enhanced SQL file with proper documentation and security policies
- Updated event link display to show domain name instead of generic "Visit" text
- Links now display shortened domain (e.g., "lu.ma", "eventbrite.com") for better context
- Updated events card layout to display time after date in top right corner
- Removed "Time:" label prefix from time display in events cards
- Changed events loading order to ascending ID (oldest events first)
- Hidden GitHub button in top navigation when search is active to reduce UI clutter during search

### Fixed
- Fixed load more events functionality to only load new events instead of reloading existing ones
- Improved pagination offset tracking to prevent duplicate event loading
- Added separate loading state for "load more" operations to distinguish from initial loading
