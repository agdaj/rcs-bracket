
# TODO

## Development
- [ ] Explore Electron doc examples, best practices
  - [ ] Move `app/` files up one level
- [ ] Add more metadata to package.json
  - [ ] Install bootstrap (5.2.1), bootstrap-icons (1.10.5) + mousetrap (1.6.5) through npm
- [ ] Add linter and testing

## Settings
- [ ] Add preferences/settings nav bar to allow updating of settings
  - [ ] Refresh page on settings change
- [ ] Allow editing and deletion of player-character associations
- [ ] Integrate usage of multiple character asset folders to support multiple games easily

## Interface
- [ ] Update interface colours, styles
  - [ ] Make components leaner or choose other components/styles/theme
- [ ] Support saving player information to clipboard
- [ ] Add refresh page button, re-checking character list and assets
- [ ] Support input of social media information
- [ ] Integrate start.gg API to scrape tournament information
  - [ ] Allow entering API key
  - [ ] Retrieve tournament, event and set information
  - [ ] Fetch stream queue

## Bugs
- [ ] Resolve inconsistent behaviour with finding settings.json during app initialization
  - [ ] Explore scope of issue when manipulating settings.json after app initialization
