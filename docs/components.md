# Component inventory

Status: `not started` → `story` (built, with stories) → `in site` (used by a route).
Update a component's row in the PR that changes its status.

Each component with live data has stories for every state it can be in (`Growing`, `Live`,
`NoUpdate`, `Empty`, plus extras), each checked at 390, 768 and 1440 wide, and a `Reduced` story
where it animates.

## Tier 1. Primitives (`packages/ui/src/primitives`)

| Component         | Notes                                                         | Status      |
| ----------------- | ------------------------------------------------------------- | ----------- |
| Text              | `role` prop: the type roles                                   | not started |
| Heading           |                                                               | not started |
| Label             |                                                               | not started |
| Readout           | numeral, status, date, stardate                               | not started |
| ConfirmMarker     |                                                               | not started |
| Button            | primary, quiet                                                | not started |
| ArrowIcon         |                                                               | not started |
| TextLink          |                                                               | not started |
| HandoffLink       |                                                               | not started |
| StatusDot         | dot only                                                      | not started |
| RingMark          | logo; optional `arc` prop                                     | not started |
| Favicon           |                                                               | not started |
| Hairline          |                                                               | not started |
| LitEdge           |                                                               | not started |
| TickScale         |                                                               | not started |
| Grain             | the one film-grain texture                                    | not started |
| RingArcs          |                                                               | not started |
| Panel             |                                                               | not started |
| Expander          |                                                               | not started |
| Breadcrumb        |                                                               | not started |
| Caption           |                                                               | not started |
| Figure            |                                                               | not started |
| Picture           | `<picture>` around an image: modern formats with a fallback   | story       |
| VisuallyHidden    |                                                               | not started |
| SkipLink          |                                                               | not started |
| FocusRing         |                                                               | not started |
| ProjectStateBadge | StatusDot + status word + optional NewMarker slot             | not started |
| NewMarker         | ring around the status dot that drains with age, plus a label | not started |

## Tier 2. Layout and structure (`packages/ui/src/layout`)

| Component         | Notes                                                          | Status      |
| ----------------- | -------------------------------------------------------------- | ----------- |
| AppShell          | lives in `apps/site/app/shell`: nav, `main`, footer, skip link | in site     |
| SiteNav           | with NavTimeline and the release nav ring                      | in site     |
| SiteFooter        | with "Last update · date"                                      | in site     |
| Container         |                                                                | in site     |
| Section           |                                                                | story       |
| Stack             |                                                                | story       |
| Cluster           |                                                                | story       |
| Grid              |                                                                | story       |
| SplitLayout       |                                                                | story       |
| Thread            | with ThreadScope, ThreadColumn, ThreadNode; follows the reader | in site     |
| ThreadSection     | a section with its node on the thread                          | story       |
| PageHeader        |                                                                | in site     |
| HandoffFooter     |                                                                | in site     |
| GoDeeper          |                                                                | story       |
| FreshnessProvider | non-visual: holds "now", ranks, enforces the per-page cap      | not started |

## Tier 3. Feature sections (`packages/ui/src/sections`)

| Component         | Notes                                               | Status      |
| ----------------- | --------------------------------------------------- | ----------- |
| StumpHero         | with ArCallout                                      | not started |
| ProofRow          | counted facts with an "as of" date                  | not started |
| AtWorkPipeline    |                                                     | not started |
| ProjectPlates     |                                                     | not started |
| ProjectTile       | with ProjectStateBadge                              | not started |
| CanopyMap         | `teaser`, `full`; wraps `packages/canopy`           | not started |
| ProjectIndex      | rows with ProjectStateBadge + NewMarker             | in site     |
| WhereItsAt        |                                                     | not started |
| CaptainsLog       | log entries on the thread, newest first             | not started |
| LogEntry          | kind `update` or `release`                          | not started |
| ReleasePanel      | live projects only                                  | not started |
| ShootItem         | `open`, `grown`, `answered`; plus ShootList         | not started |
| BranchRings       | one ring per stretch of work or per release         | not started |
| TitanLog          | CaptainsLog variant; renders nothing while disabled | not started |
| CurrentRoleBlock  | tenure computed from a date                         | in site     |
| NowBlock          |                                                     | in site     |
| LatestLine        |                                                     | not started |
| DetailsStrip      |                                                     | not started |
| PasFamily         |                                                     | not started |
| AiSystemEvolution |                                                     | not started |
| BrainsThatFeedIt  |                                                     | not started |
| RingsTimeline     |                                                     | in site     |
| Portrait          |                                                     | in site     |
| BuildWith         |                                                     | in site     |
| FieldNotes        |                                                     | in site     |
| TitanFlow         |                                                     | not started |
| BeyondSlots       |                                                     | in site     |
| ContactDoor       |                                                     | in site     |

## Tier 4. Page templates (`apps/site/app/templates`)

Each takes fixture data in Storybook and has a `NoLiveData` story.

| Template         | Status      |
| ---------------- | ----------- |
| HomeTemplate     | not started |
| ProjectsTemplate | in site     |
| ProjectTemplate  | story       |
| JobTemplate      | not started |
| AboutTemplate    | in site     |
| BeyondTemplate   | in site     |
| ContactTemplate  | in site     |
| NotFound         | not started |
