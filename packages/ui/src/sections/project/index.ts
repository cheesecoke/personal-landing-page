// Project and job page sections. One folder per component, story beside it.
export {
  AiSystemEvolution,
  type AiSystemEvolutionProps,
  type EvolutionStop,
} from './AiSystemEvolution/AiSystemEvolution';
export {
  ArtifactCard,
  ArtifactList,
  ProjectVideo,
  stampToIso,
  type ArtifactCardProps,
  type ArtifactData,
  type ArtifactListProps,
  type ArtifactMedia,
  type ProjectVideoData,
} from './ArtifactList/ArtifactList';
export {
  BrainsThatFeedIt,
  type BrainsThatFeedItProps,
  type FeedItem,
} from './BrainsThatFeedIt/BrainsThatFeedIt';
export { BrainZones, type BrainZonesProps } from './BrainZones/BrainZones';
export { BranchRings, type BranchRingsProps, type RingData } from './BranchRings/BranchRings';
export {
  RING_THICKNESS,
  ringGeometry,
  type BranchRingGeometry,
  type RingWeight,
} from './BranchRings/ringGeometry';
export { CaptainsLog, type CaptainsLogProps } from './CaptainsLog/CaptainsLog';
export {
  DetailsStrip,
  type DetailsFigure,
  type DetailsStripProps,
} from './DetailsStrip/DetailsStrip';
export { LinkCards, type LinkCardData, type LinkCardsProps } from './LinkCards/LinkCards';
export {
  LogEntry,
  type LogEntryData,
  type LogEntryFresh,
  type LogEntryProps,
} from './LogEntry/LogEntry';
export { formatLogDate, formatLogMonth, monthEnd } from './LogEntry/logDate';
export {
  ShootItem,
  type ShootData,
  type ShootItemProps,
  type ShootKind,
  type ShootLabels,
  type ShootState,
} from './ShootList/ShootItem';
export { ShootList, type ShootListProps } from './ShootList/ShootList';
export { PasFamily, type FamilyMember, type PasFamilyProps } from './PasFamily/PasFamily';
export { GrowSteps, type GrowStep, type GrowStepsProps } from './PhoneCaptures/GrowSteps';
export { HeroCapture, type HeroCaptureProps } from './PhoneCaptures/HeroCapture';
export { PhoneFigures, type PhoneFiguresProps } from './PhoneCaptures/PhoneFigures';
export { PhoneFrame, type PhoneFrameProps } from './PhoneCaptures/PhoneFrame';
export {
  cropMargins,
  ProjectFigure,
  type FigureCrop,
  type ProjectFigureProps,
  type ProjectImage,
} from './ProjectFigure/ProjectFigure';
export {
  ReleasePanel,
  type ReleaseChannel,
  type ReleaseData,
  type ReleasePanelProps,
} from './ReleasePanel/ReleasePanel';
export { FactList, type FactData, type FactListProps } from './WhereItsAt/FactList';
export { WhereItsAt, type WhereItsAtProps } from './WhereItsAt/WhereItsAt';
export {
  HeroDrawn,
  HeroFigure,
  ProjectOpening,
  type HeroDrawnProps,
  type HeroFigureProps,
  type ProjectOpeningProps,
} from './ProjectOpening/ProjectOpening';
