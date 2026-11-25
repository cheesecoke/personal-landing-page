// Tier 1: primitives (Text, Button, StatusDot, ...). One folder per component, story beside it.
export { cx, type ClassValue } from './cx';
export type { PolymorphicProps } from './polymorphic';
export type { TextTone } from './tone';

export { Text, typeClass, type TextProps, type TextRole } from './Text/Text';
export { Heading, type HeadingLevel, type HeadingProps, type HeadingRole } from './Heading/Heading';
export { Label, type LabelProps, type LabelTone } from './Label/Label';
export { Readout, type ReadoutKind, type ReadoutProps } from './Readout/Readout';
export { toStardate } from './Readout/stardate';
export { ConfirmMarker, type ConfirmMarkerProps } from './ConfirmMarker/ConfirmMarker';

export { ArrowIcon, type ArrowIconProps, type ArrowSize } from './ArrowIcon/ArrowIcon';
export { Button, type ButtonProps, type ButtonVariant } from './Button/Button';
export {
  TextLink,
  type TextLinkProps,
  type TextLinkSize,
  type TextLinkTone,
} from './TextLink/TextLink';
export { HandoffLink, type HandoffLinkProps, type HandoffVariant } from './HandoffLink/HandoffLink';

export { StatusDot, type Status, type StatusDotProps } from './StatusDot/StatusDot';
export { Hairline, type HairlineProps, type HairlineTone } from './Hairline/Hairline';
export { LitEdge, type LitEdgeProps } from './LitEdge/LitEdge';
export { TickScale, type TickScaleProps } from './TickScale/TickScale';
export { Grain, type GrainProps } from './Grain/Grain';
export {
  RingArcs,
  defaultRingArcs,
  type RingArc,
  type RingArcsProps,
  type RingArcTone,
} from './RingArcs/RingArcs';

export { RingMark, type RingMarkDetail, type RingMarkProps } from './RingMark/RingMark';
export {
  PortalSpiral,
  PORTAL_ACTIVE_RATE,
  type PortalSpiralProps,
  type PortalSpiralSpeed,
} from './PortalSpiral/PortalSpiral';
export { Favicon, faviconLinks, type FaviconProps, type FaviconSize } from './Favicon/Favicon';

export { Panel, type PanelProps } from './Panel/Panel';
export { Caption, type CaptionProps } from './Caption/Caption';
export { Figure, type FigureProps } from './Figure/Figure';
export { Picture, type PictureProps, type PictureSource } from './Picture/Picture';
export { Breadcrumb, type BreadcrumbItem, type BreadcrumbProps } from './Breadcrumb/Breadcrumb';
export { Expander, ExpanderGroup, type ExpanderProps } from './Expander/Expander';

export { VisuallyHidden, type VisuallyHiddenProps } from './VisuallyHidden/VisuallyHidden';
export { SkipLink, type SkipLinkProps } from './SkipLink/SkipLink';
export { FocusRing, focusRing, focusRingInset, type FocusRingProps } from './FocusRing/FocusRing';

export {
  NewMarker,
  NewMarkerLabel,
  NewMarkerRing,
  useHydrated,
  type NewMarkerLabelProps,
  type NewMarkerProps,
  type NewMarkerRingProps,
} from './NewMarker/NewMarker';
export { newMark, type NewMark, type NewMarkInput } from './NewMarker/newMark';
export {
  ProjectStateBadge,
  type ProjectStateBadgeProps,
  type ProjectStateFresh,
  type ProjectStateTone,
} from './ProjectStateBadge/ProjectStateBadge';
