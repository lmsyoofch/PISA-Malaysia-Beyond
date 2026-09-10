# PISA: Malaysia & Beyond

Created by Foo Huey Chyun. An interactive, mobile-friendly geographical map and comparison table for a curated PISA 2025 snapshot.

## Publish through GitHub and Vercel

1. Unzip this archive on your computer.
2. Create a GitHub repository, for example `pisa-malaysia-beyond`.
3. Upload the CONTENTS of the extracted folder. `package.json`, `vercel.json`, `validate.mjs` and `dist` must sit at the repository root. Keep the `dist` folder intact.
4. In Vercel, choose Add New → Project then import the repository.
5. Choose Framework Preset **Other**. Leave Root Directory at the repository root. Build Command is `npm run build`. Output Directory is `dist`. The supplied `vercel.json` specifies these settings.
6. Deploy. No environment variables or API keys are needed.
7. Open the resulting URL. Check the map loads and select Singapore, change subject then return to Malaysia. Check a phone viewport too.

Do not choose Next.js. This is a complete static website with no npm dependencies. The small file count is intentional. There is no node_modules folder to upload.

## Included interactions

- Panning and zooming on a geographical OpenStreetMap basemap.
- Keyboard-accessible country markers and country table buttons.
- Science, mathematics, reading and computational problem-solving.
- Mean scores or gaps versus Malaysia.
- Southeast Asia view and selected international benchmarks (Japan and Estonia).
- Country details, changes since 2022, significance notes and OECD source links.
- Clearly marked missing values. Tables work if the mapping CDN or tiles cannot load.

## Data and interpretation

`dist/data.js` contains manually curated data from the OECD pages referenced in each record, verified in the preparation conversation on 10 September 2026. Release: 8 September 2026. This is not an automated or comprehensive dataset. The 2025 values have not been independently audited against downloaded OECD statistical tables. Confirm the primary records before using this site for formal reporting.

Core mean scores (math / reading / science): Malaysia 397/393/419; Singapore 563/535/560; Vietnam 443/392/457; Brunei 435/426/439; Thailand 407/392/432; Indonesia 364/365/389; Philippines 371/367/373; Japan 525/503/538. Estonia includes science 527 only. All missing values are null and must remain null until verified. Cambodia's science low-performer percentage is approximately 67%, calculated as 100 minus the rounded 33% meeting baseline. Laos, Myanmar and Timor-Leste have no verified scores in this snapshot.

Vietnam's transition from paper-based testing makes trend comparisons uncertain. No Vietnam trend values are shown. NS annotations are retained in the `ns` array. Gaps use rounded scores, not statistical significance tests. Different domains have distinct scales. Map colour bands are site-defined, not PISA proficiency levels. Pins indicate representative national locations, not sampling locations. Malaysia includes both Peninsular and East Malaysia in its national figure.

To update data, edit `dist/data.js`, update visible dates in `dist/index.html`, run `npm run build` then commit to GitHub. Vercel will redeploy when connected to that repository.

## Sources and external services

Data: OECD Education GPS and PISA 2025 country notes, linked in the interface and data file. Primary release:
https://www.oecd.org/en/about/news/press-releases/2026/09/pisa-2025-students-reading-and-mathematics-performance-declined-sharply-across-the-oecd.html

Independent presentation; not affiliated with or endorsed by OECD. Attribution does not imply endorsement.

Leaflet 1.9.4 is loaded from unpkg with integrity verification. Leaflet is BSD-2-Clause licensed: https://github.com/Leaflet/Leaflet/blob/v1.9.4/LICENSE

Map data © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright
Tiles: https://tile.openstreetmap.org. Comply with https://operations.osmfoundation.org/policies/tiles/ . The site retains visible attribution, sends normal browser referrers and does not prefetch or bulk-download tiles. For substantial traffic, use an appropriate hosted tile provider and update its attribution and URL in `dist/app.js`.

Visitors need internet access to unpkg.com and tile.openstreetmap.org for the basemap. Their browsers contact these third parties. There is no analytics tracker, account system or app database.

## Validation

Run `npm run build` (requires Node.js). This checks local assets, JavaScript syntax, data types, missing values and representative calculations. Browser rendering and external tile delivery were not tested in the build environment. An optional WebMCP selection action is feature-detected; unsupported browsers use the normal interface. WebMCP runtime validation was unavailable.

Local preview, if Python is installed: `python -m http.server 8000 --directory dist` then open http://localhost:8000. Opening HTML directly via file:// will not load JavaScript modules; use a server or Vercel.
