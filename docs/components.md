# Component inventory

Status: `not started` → `story` (built, with stories) → `in site` (used by a route, directly or
through another component). Update a component's row in the PR that changes its status.

Each component with live data has stories for every state it can be in (`Growing`, `Live`,
`NoUpdate`, `Empty`, plus extras), each checked at 390, 768 and 1440 wide, and a `Reduced` story
where it animates.

## Tier 1. Primitives (`packages/ui/src/primitives`)

| Component         | Notes                                                           | Status  |
| ----------------- | --------------------------------------------------------------- | ------- |
| Text              | `role` prop: the type roles                                     | in site |
| Heading           |                                                                 | in site |
| Label             |                                                                 | in site |
| Readout           | numeral, status, date, stardate                                 | in site |
| ConfirmMarker     |                                                                 | in site |
| Button            | primary, quiet                                                  | in site |
| ArrowIcon         |                                                                 | in site |
| TextLink          |                                                                 | in site |
| HandoffLink       |                                                                 | in site |
| StatusDot         | dot only                                                        | in site |
| RingMark          | logo; optional `arc` prop                                       | in site |
| Favicon           | the icon files and `faviconLinks`, wired in the root            | in site |
| Hairline          | not used by a page yet                                          | story   |
| LitEdge           |                                                                 | in site |
| TickScale         |                                                                 | in site |
| Grain             | the one film-grain texture                                      | in site |
| RingArcs          | not used by a page yet                                          | story   |
| PortalSpiral      | Contact door portal; fills and stretches to its parent, `speed` | story   |
| Panel             |                                                                 | in site |
| Expander          |                                                                 | in site |
| Breadcrumb        |                                                                 | in site |
| Caption           |                                                                 | in site |
| Figure            |                                                                 | in site |
| Picture           | `<picture>` around an image: modern formats with a fallback     | in site |
| VisuallyHidden    |                                                                 | in site |
| SkipLink          |                                                                 | in site |
| FocusRing         | not used by a page yet (components set their own focus styles)  | story   |
| ProjectStateBadge | StatusDot + status word + optional NewMarker slot               | in site |
| NewMarker         | ring around the status dot that drains with age, plus a label   | in site |

## Tier 2. Layout and structure (`packages/ui/src/layout`)

| Component         | Notes                                                                       | Status  |
| ----------------- | --------------------------------------------------------------------------- | ------- |
| AppShell          | lives in `apps/site/app/shell`: nav, `main`, footer, skip link              | in site |
| SiteNav           | with NavTimeline, the release nav ring and the phone menu (under `md`)      | in site |
| SiteFooter        | with "Last update · date"                                                   | in site |
| Container         |                                                                             | in site |
| Section           |                                                                             | in site |
| Stack             | not used by a page yet                                                      | story   |
| Cluster           | not used by a page yet                                                      | story   |
| Grid              |                                                                             | in site |
| SplitLayout       | not used by a page yet                                                      | story   |
| Thread            | with ThreadScope, ThreadColumn, ThreadNode; follows the reader              | in site |
| ThreadSection     | a section with its node on the thread; stories are in Thread                | in site |
| PageHeader        |                                                                             | in site |
| HandoffFooter     |                                                                             | in site |
| GoDeeper          |                                                                             | in site |
| FreshnessProvider | lives in `packages/content/src/react`: holds "now", ranks, enforces the cap | in site |

## Tier 3. Feature sections (`packages/ui/src/sections`)

| Component         | Notes                                                               | Status  |
| ----------------- | ------------------------------------------------------------------- | ------- |
| StumpHero         | with ArCallout                                                      | in site |
| ProofRow          | counted facts with an "as of" date                                  | in site |
| AtWorkPipeline    |                                                                     | in site |
| ProjectPlates     |                                                                     | in site |
| ProjectTile       | with ProjectStateBadge                                              | in site |
| Canopy            | `teaser` (Home), `full` (Projects); lives in `packages/canopy`      | in site |
| DiveGame          | Portal dive renderer and controls; lives in `packages/dive/react`   | story   |
| ProjectIndex      | rows with ProjectStateBadge + NewMarker                             | in site |
| WhereItsAt        |                                                                     | in site |
| CaptainsLog       | log entries on the thread, newest first                             | in site |
| LogEntry          | kind `update` or `release`                                          | in site |
| ReleasePanel      | live projects only; no project is live yet, so no page shows one    | in site |
| ShootItem         | `open`, `grown`, `answered`; lives in ShootList, with its stories   | in site |
| BranchRings       | one ring per stretch of work or per release                         | in site |
| TitanLog          | CaptainsLog variant; renders nothing while disabled (it is, today)  | in site |
| CurrentRoleBlock  | tenure computed from a date                                         | in site |
| NowBlock          |                                                                     | in site |
| LatestLine        | built, but Home's design has no slot for it                         | story   |
| DetailsStrip      |                                                                     | in site |
| PasFamily         |                                                                     | in site |
| AiSystemEvolution |                                                                     | in site |
| BrainsThatFeedIt  |                                                                     | in site |
| RingsTimeline     |                                                                     | in site |
| Portrait          |                                                                     | in site |
| BuildWith         |                                                                     | in site |
| FieldNotes        |                                                                     | in site |
| TitanFlow         |                                                                     | in site |
| BeyondSlots       |                                                                     | in site |
| ContactDoor       | Contact copy and links beside the portal render, spiral in the ring | in site |
| HomeHandoff       | the "Next: Projects" hand-off closing Home                          | in site |
| ProjectMapTeaser  | the frame around Home's tree teaser                                 | in site |
| ProjectsMapSlot   | the full-width slot for the tree on Projects; lives in ProjectIndex | in site |
| AboutIntro        | portrait beside the intro and the rules                             | in site |
| ProjectOpening    | a project page's title block and hero figure                        | in site |
| ProjectFigure     | a project image with its caption and crop                           | in site |
| PhoneCaptures     | HeroCapture, PhoneFigures, PhoneFrame, GrowSteps (Lifebox)          | in site |
| IdeaCompare       | two drawn cards set against each other (Lifebox)                    | in site |
| Ladder            | personal to core steps (Lifebox)                                    | in site |
| BrainZones        | the open zone and the sealed vault (Personal brain)                 | in site |
| LinkCards         | the cards to child pages (PAS)                                      | in site |
| ArtifactList      | dated artifacts under Go deeper                                     | in site |
| ShootList         | the "Not yet grown" list                                            | in site |
| DrawnMarks        | DuoLensMark, RingsDecor                                             | in site |

## Tier 4. Page templates (`apps/site/app/templates`)

Each takes fixture data in Storybook and has a `NoLiveData` story.

| Template                     | Status            |
| ---------------------------- | ----------------- |
| HomeTemplate                 | in site           |
| ProjectsTemplate             | in site           |
| ProjectTemplate              | in site           |
| JobTemplate                  | in site           |
| AboutTemplate                | in site           |
| BeyondTemplate               | in site           |
| ContactTemplate              | in site           |
| NotFound (`PlaceholderPage`) | in site, no story |
