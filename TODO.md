
# TODO

## Development
- [ ] Explore Electron doc examples, best practices
  - [ ] Move `app/` files up one level
- [ ] Add more metadata to package.json
  - [ ] Install bootstrap (5.2.1), bootstrap-icons (1.10.5) + mousetrap (1.6.5) through npm
- [ ] Add linter and testing
- [ ] Modularize IPC handlers if possible

## Settings
- [ ] Integrate usage of multiple character asset folders to support multiple games easily

## Interface
- [ ] Update interface colours, styles
  - [ ] Make components leaner or choose other components/styles/theme
  - [ ] Add dark mode, other colour modes
- [ ] Multi-character select (only up to doubles)
- [ ] Support input of social media information
- [ ] Integrate start.gg API to scrape tournament information
  - [ ] Show more available set statuses (check-in, started, etc.)
  - [ ] Fetch stream queue

## Bugs
- [ ] Resolve inconsistent behaviour with finding settings.json during app initialization
  - [ ] Explore scope of issue when manipulating settings.json after app initialization
