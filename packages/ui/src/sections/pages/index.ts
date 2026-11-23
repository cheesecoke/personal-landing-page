// The About, Projects-index, Beyond and Contact sections. One folder per component, story beside it.
export type { LinkComponent as SectionLinkComponent, SectionLink } from './internal/link';

export {
  RingsTimeline,
  type RingGeometry,
  type RingsArt,
  type RingsArtGeometry,
  type RingsChapter,
  type RingsDetail,
  type RingsItem,
  type RingsLatest,
  type RingsNote,
  type RingsTimelineProps,
} from './RingsTimeline/RingsTimeline';
export { stumpRings } from './RingsTimeline/stumpRings';

export {
  Portrait,
  type PortraitClips,
  type PortraitLook,
  type PortraitProps,
  type PortraitStill,
} from './Portrait/Portrait';
export type { PortraitGlanceTiming } from './Portrait/portraitController';

export {
  CurrentRoleBlock,
  type CurrentRole,
  type CurrentRoleBlockProps,
} from './CurrentRoleBlock/CurrentRoleBlock';
export { NowBlock, type NowBlockProps, type NowEntry } from './NowBlock/NowBlock';
export { formatMonth, tenureMonths, type Month } from './internal/month';

export { AboutIntro, type AboutIntroProps } from './AboutIntro/AboutIntro';
export { FieldNotes, type FieldNotesProps } from './FieldNotes/FieldNotes';
export {
  BuildWith,
  type BuildWithFact,
  type BuildWithProps,
  type BuildWithStage,
  type BuildWithTool,
} from './BuildWith/BuildWith';

export {
  ProjectIndex,
  ProjectsMapSlot,
  type ProjectIndexGroup,
  type ProjectIndexProps,
  type ProjectIndexRow,
  type ProjectsMapSlotProps,
} from './ProjectIndex/ProjectIndex';

export {
  BeyondSlots,
  beyondSlotPositions,
  type BeyondSlot,
  type BeyondSlotPosition,
  type BeyondSlotsProps,
} from './BeyondSlots/BeyondSlots';
export type { BeyondIconName } from './BeyondSlots/beyondIcons';

export { ContactDoor, type ContactDoorProps, type ContactLink } from './ContactDoor/ContactDoor';
