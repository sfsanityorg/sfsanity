# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.3] - 2025-07-18

### Added

- Month separators for event lists in Home, Events, and Search Results pages.
- Clickable search tags below the search bar for quick search

### Changed

- Month separators now display only the month, without the year
- Moved the "Recent Events" heading to APP_CONFIG for better configurability
- Moved the search bar placeholder text and search tags to APP_CONFIG

## [0.0.2] - 2025-07-10

### Added

- Comprehensive responsive web design (RWD) functionality across all pages and components
- Mobile-first navigation with hamburger menu and mobile-optimized controls
- Responsive typography scaling and spacing adjustments
- Touch-friendly button sizes and interaction areas
- Mobile-optimized modal and overlay layouts
- Responsive grid layouts that adapt from mobile to desktop
- Improved mobile search experience with optimized input sizing
- Added configurable GitHub button to top navigation
- Added GITHUB_URL configuration option in app config for easy URL management
- Added GITHUB_TOOLTIP configuration option for customizable button tooltip text
- Added changelog following Keep a Changelog format
- Added JSDoc comments for better code documentation
- Added event ordering configuration in app config
- Added link utility functions for domain extraction and URL validation

### Changed

- TopNav component with mobile menu overlay and responsive control visibility
- All page layouts now fully responsive with proper breakpoints (sm, lg, xl)
- Card components with responsive padding and typography
- Button and icon sizing that scales appropriately across devices
- Modal dialogs optimized for mobile viewing with proper spacing
- Search functionality with mobile-optimized input and clear button positioning
- Event cards and lists with responsive layouts and improved mobile readability
- Updated all icon sizes to be responsive (smaller on mobile, larger on desktop)
- Adjusted spacing and padding throughout the application for better mobile experience
- Modified navigation controls to hide non-essential items on mobile
- Improved text sizing hierarchy for better readability on small screens
- Enhanced touch targets for better mobile usability
- Hidden GitHub button in top navigation when search is active to reduce UI clutter during search
- Enhanced search functionality to include locations, links, dates, and times in addition to event titles
- Updated search highlighting to work across all searchable fields (title, location, time, link)
- Improved search placeholder text to reflect expanded search capabilities including dates
- Added conditional highlighting in Home page components for better search result visibility
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

### Fixed

- Fixed load more events functionality to only load new events instead of reloading existing ones
- Improved pagination offset tracking to prevent duplicate event loading
- Added separate loading state for "load more" operations to distinguish from initial loading

## [0.0.1] - 2025-07-07

### Added

- Initial release of SFSanity event aggregator
- Events display with tile and list view modes
- Search functionality with fuzzy matching
- Supabase integration for event data
- Real-time event loading with pagination
- Responsive design with Tailwind CSS
- Error handling and connection status monitoring
