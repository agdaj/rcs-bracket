# rcs-bracket
Royal City Smash SSBU Bracket Manager in Electron

## TODO:
- Explore Electron doc examples, best practices
- Add more metadata to package.json
  - Install bootstrap + mousetrap through npm
  - Properly connect app to external assets with directory chooser
    - Add preferences/settings in top bar to change afterwards, need to clear entire page when reloading
  - Add linter? Add testing?
- Update interface colours, styles
  - Make components leaner or choose other components/styles/theme
  - Add a clear form button
  - Add a reset form button that also re-checks character list
  - Support other bracket types
  - Copy match info(s) into clipboard or file
  - Add support for entering socials information
  - Add best of/first to X flexibility
- Expand on config data (preferences menu)
  - Save player/character config
  - Make preferences/settings.json
    - First time open file chooser dialog, initially set as '.'
- Connect to start.gg API
  - Fetch stream queue
  - Retrieve bracket and match info
  - Submit match results
- Bugs
  - Inconsistent behaviour with finding settings.json during app initialization
- Update documentation
  - Add standard README looks, describe initial dialog with expected folder structure
  - Move app contents down one level, move js and css to assets*
  - Check on licenses on SVGs
    - https://www.svgrepo.com/collection/pixelarticons-interface-icons/1