<!-- One concern per PR. Target `rebuild` (or `staging` once it exists), never `main` directly. -->

### Changes

-

### Testing

- **Checks**: `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build`
- **Stories / pages**:
- **Verified at**: 390 and 1440 wide, reduced motion

### Checklist

- [ ] Tokens only: no literal colours, sizes or timings
- [ ] Stories for every state (and a reduced-motion story if it animates)
- [ ] Copy comes from content files; nothing private in the diff
- [ ] `docs/components.md` updated if a component changed status
