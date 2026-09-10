# PISA: Malaysia & Beyond

Created by Foo Huey Chyun. A static PISA 2025 explorer with Malaysia as the comparison anchor.

## Publish through GitHub and Vercel

1. Unzip this archive.
2. Upload its contents to your existing GitHub repository, replacing the earlier files. Keep `dist` intact. `package.json`, `vercel.json` and `validate.mjs` belong at the repository root.
3. Import the repository into Vercel if it is not connected already.
4. Use Framework Preset **Other**, Build Command `npm run build` and Output Directory `dist`. The supplied Vercel configuration specifies these settings. No API keys or environment variables are needed.
5. Deploy, or let your existing GitHub integration redeploy the changes.

## What's included

- International view for all 91 countries and economies in the OECD science table.
- Southeast Asia view, with eight systems that have science results.
- Shaded country boundaries, hover details, selection outlines and a readable legend.
- Representative dots for small economies and regional results.
- Country search, subject buttons, mean scores or gaps versus Malaysia.
- Selected country, Malaysia and OECD comparison bars.
- Sortable full comparison table, trends and sampling cautions.
- Creator credit only in the footer.
- Search and tables remain usable if external map services fail. Country dots are shown if boundaries fail but Leaflet loads.

## Data coverage

Snapshot checked 10 September 2026. Science covers 91 systems, computational problem-solving 85 and mathematics and reading 87 each. Maths and reading for Uzbekistan, Cyprus, Kenya and Rwanda remain unverified in this snapshot. Missing values are null and never imply zero, nonparticipation or poor performance.

Science and computational problem-solving means come from OECD PISA 2025 Results Volume I, Tables I.2.1 and I.2.4:
https://www.oecd.org/en/publications/pisa-2025-results-volume-i_73451bc5-en/full-report/student-performance-in-pisa-2025_23e075c2.html

Mathematics, reading, low performers and trends come from linked OECD Education GPS profiles. B-S-J-Z mathematics and reading means come from the report. Cambodia's mathematics and reading means were also verified in Education GPS.

This is a manually maintained snapshot, not a live data feed. Each record in `dist/data.js` links the report and its country profile. Gaps use rounded scores and are not significance tests. Subject scales are different. Colour bands are descriptive, not OECD proficiency levels. Trend figures may differ from subtraction of rounded scores. Vietnam's trends are excluded due to assessment-mode comparability concerns. Asterisks preserve the OECD sampling cautions for Canada, New Zealand, United States, Netherlands, Norway and Albania.

B-S-J-Z (China), Ukrainian regions (17 of 27), Kurdistan Region (Iraq) and Dushanbe (Tajikistan) are regional results. They use representative points and never shade all of their parent countries. Dots are navigation aids, not sample locations or coverage boundaries. The low-resolution world map simplifies boundaries and may omit small islands. Search and the table include every one of the 91 records regardless of map geometry. Boundaries do not imply any position on territorial status.

## External map services

Leaflet 1.9.4 is loaded from unpkg with integrity verification. TopoJSON Client 3.1.0 and world-atlas 2.0.2 are loaded from jsDelivr. Visitors need internet access to these providers. Natural Earth country geometry is public domain. No street tiles, accounts, tracking scripts or app database are used.

- Leaflet BSD-2-Clause licence: https://github.com/Leaflet/Leaflet/blob/v1.9.4/LICENSE
- TopoJSON Client ISC licence: https://github.com/topojson/topojson-client/blob/v3.1.0/LICENSE
- world-atlas ISC licence: https://github.com/topojson/world-atlas/blob/master/LICENSE
- Natural Earth terms: https://www.naturalearthdata.com/about/terms-of-use/

Data: OECD. Independent presentation, not affiliated with or endorsed by the OECD.

## Validation and updates

Run `npm run build` with Node.js. Validation checks syntax, assets, all 91 records, per-subject coverage, missing values, regional exclusions, sampling flags and representative Malaysia comparisons. Browser rendering, external map delivery and optional WebMCP runtime behaviour have not been tested in this environment.

To change a score, edit `dist/data.js`, retain its source and missing-value semantics, update coverage checks and visible snapshot notes then run the build before publishing.

To preview on your own computer: `python -m http.server 8000 --directory dist` then visit http://localhost:8000. Opening HTML directly from the filesystem will not load JavaScript modules.
