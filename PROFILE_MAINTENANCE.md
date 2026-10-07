# Profile maintenance

The root README renders on the GitHub profile because this existing public repository matches the username. The older README is preserved in `archive/README-before-profile-refresh.md`, and the existing history and license are retained.

## Content

- `README.md`: professional overview, CV-based research highlights, public code examples, tools, and professional links.
- `assets/header.svg`: original static banner; no third-party image hosts, animation, or tracking.
- `assets/github-snapshot.svg` and `assets/public-github-snapshot.json`: generated public statistics/language card and its readable data.
- `scripts/update-stats.mjs`: public API reads and SVG generation; Node 24, no package dependencies.
- `.github/workflows/refresh-profile-stats.yml`: weekly refresh and manual trigger; writes only the two generated snapshot files in this repository.

## Statistics scope

The card uses the public user-repository list and each public repository's languages endpoint. Forks are included and labeled. Language values count repositories containing that language, not lines of code or skill level. The profile repository is excluded from language aggregation so the automation does not count itself. Private repositories, private contribution counts, source contents, and credentials never enter the graphics or JSON.

The workflow uses only the automatically supplied, repository-scoped GitHub Actions token. No personal access token, new secret, or private repository access is required. It refreshes weekly and when the renderer/workflow changes; it can also be run from Actions → Refresh public profile statistics → Run workflow. A failed API read leaves the last good graphic intact.

To refresh locally without credentials:

```sh
node scripts/update-stats.mjs
```

## Research

Descriptions follow the latest CV. Project titles and READMEs were used only to identify corresponding work. Private repository contents are not copied into this public profile. Recent projects stay private; accessible papers and institutional pages provide public references. TouchWorld remains explicitly submitted to ICRA 2027. Spacecraft papers are coauthored; the SAGES video is labeled a team demo.

The private portfolio URL, CV/resume files, and repository inventory are absent. No existing repository is renamed, archived, deleted, or made public as part of this update.

## Profile visibility and pins

The account's existing activity privacy setting remains enabled. Four public repositories are configured as native pins: CS238, CS6700_Jan_May_2024_Team_Pioneers, Langton-Ant, and Stellar_Clusters_Horizon. GitHub's visitor preview currently hides the native pin panel with this privacy setting, so the README also provides the same four public project links and descriptions. The README and bio are visible to visitors. Changing account activity privacy is a separate decision; this refresh does not change it.
