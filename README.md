# PELAGIC - Browser Edition

A single-player naval command game. All simulation runs in the browser.
No server runtime, package installation or build step is required on GitHub Pages.
Desktop keyboard and mouse controls are recommended.

## Publish

Upload the contents of this directory to the root of a public GitHub repository,
keeping src/ and data/ intact. Do not upload the enclosing web-release directory
or a ZIP as the website. In Settings > Pages, choose Deploy from a branch,
main, / (root), and Save. For account YhZtdli and repository pelagic the default
address is https://yhztdli.github.io/pelagic/ .

## Play and saves

Deploy fleet starts paused. Space starts/pauses; choose 1x through 60x manually.
Drag to select, right-click to command, scroll to zoom, and Home to fit the chart.
Select one ship for full manual offense AND defense control.
Save in browser stores one campaign in IndexedDB for this site's URL path.
Load browser save restores it after reload or a normal browser restart.
Download save exports a JSON backup; Import save file accepts compatible desktop
and browser saves. Import does not overwrite the browser save until Save in
browser is chosen. There is no account or automatic cloud synchronization.
Clearing browser site data or using private browsing can remove saved progress.
If storage is unavailable, JSON download/import remains available.

The entire interface is English. To preview locally, serve this directory over
HTTP rather than opening index.html as a file.
