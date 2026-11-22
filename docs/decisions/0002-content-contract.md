# 0002. Content contract: generated JSON checked by zod

Status: accepted · 2026-11-22

## Decision

Everything on the site that updates itself arrives as committed JSON in one folder, and
`packages/content` is the contract for that folder: zod schemas, the loader, the freshness rules
and the fixtures. Nothing is fetched at runtime.

```
live/
  meta.json               schemaVersion, publishedAt, publishId
  projects/<slug>.json    one file per project
  about.json              now, currentRole
  titan-log.json          enabled flag + monthly entries
```

- **Two kinds of content.** Hand content is written by a person and changes by pull request. Live
  content is generated, written only by the publish job, and never edited by hand. Until that job
  exists the site runs on hand-written seed files in the same schema
  (`packages/content/fixtures/seed/`).
- **Every object is strict.** An unknown key is an error, so a field cannot appear on the site
  without a schema change.
- **`schemaVersion` is in every file.** A bump is a coordinated change in the site and in the job.
  The package exports the contract as JSON Schema (`content.schema.json`) so the job can validate
  its output before it commits.
- **A project is a discriminated union on `visibility`.** `public` carries state, status, the log,
  release, shoots, rings, facts and the freshness date. `name-only` carries a name, a parent and a
  status, and nothing else is allowed.
- **Shared types carry the rules.** `IsoDate` is a real calendar date that is never in the future.
  `Month` is `YYYY-MM`. `Line` is 1 to 140 characters on one line with no URL and no `#123` ticket
  reference.
- **Rules across fields are in the schema**, not in components: a release only on a live project,
  a version on every release entry and only there, the log newest first, the freshness date equal
  to the newest item it points to, unique ids.
- **"No update" is derived, never stored.** A project is `growing` or `live`; whether it has a
  recent update comes from its dates.
- **Missing is fine, invalid is fatal.** A missing file means defaults (no log, no Now line, no
  Titan log). An invalid file fails the build with the file and the path, and the host keeps the
  last good deployment.
- **Freshness is computed in the browser.** Files carry dates only. The "new" marker is drawn from
  the date after hydration, so it drains on its own and no edit is needed to turn it off.
- **The job log has its own, tighter schema.** Month-only dates, at most three lines a month, no
  digits in a line, one entry per month, and it is off unless `enabled` is true.

## Why

- A bad publish cannot reach the site: the build fails before anything is deployed.
- The site stays valid if the job never runs. Seed data and published data are the same shape, so
  nothing in the site changes when the job takes over.
- Components take plain props inferred from the schemas and never import JSON, so every state is a
  story fed by a fixture.
- One exported JSON Schema keeps the two repos in step without sharing code.

## Choices made while building

- **Dates are compared as UTC calendar days.** "Today" is the UTC date when the content is read.
- **`status.since` is a day or a month, and optional.** Some statuses are only known to the month,
  and a typed day would be invented precision.
- **Facts are the counted number, its label and the day it was counted.** The sentence under a fact
  is hand content.
- **A log entry may carry `from`** when it covers a span of days; `date` is the last day.
- **A shoot may carry a one-line `note`.**
- **Rings are stored oldest first**, the order they are drawn from the centre out. Weight is one of
  four steps, never a raw count.
- **No "other project names in log lines" rule yet.** The design calls for one, but real log lines
  name related projects ("Planned as Atti's phone app."). It stays a check in the publish gate
  until there is a rule that fits the data.
- **The loader does not know the app.** It reads the folder it is given, then `CONTENT_LIVE_DIR`,
  then the seed fixtures.

## Consequences

- A new field is a schema change with fixtures (one valid, one invalid) in the same pull request.
- Fixtures live in `packages/content/fixtures/`: `valid/` and `invalid/` for the schema tests,
  `seed/` for the data the site ships on until the job exists.
- Rules that need more than one file (a file name matching its slug, a parent that exists) are
  checked by the loader.
