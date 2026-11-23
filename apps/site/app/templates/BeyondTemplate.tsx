import type { BeyondContent } from '@cwc/content/hand';
import {
  BeyondSlots,
  Container,
  HandoffFooter,
  PageHeader,
  Text,
  Thread,
  ThreadColumn,
  ThreadNode,
  ThreadScope,
  type BeyondIconName,
  type BeyondSlot,
} from '@cwc/ui';

import { RouterLink } from '../shell/RouterLink';

/** The board's four drawings, one for each place on the scene, from the stump outwards. */
const icons: BeyondIconName[] = ['sessions', 'clips', 'references', 'reps'];

/** "[CONFIRM: what it holds]" as the words inside it. The marker adds the frame back. */
const confirmText = (marker: string) => marker.replace(/^\[CONFIRM:\s*/, '').replace(/\]$/, '');

/** The slots as the `BeyondSlots` section takes them. */
export function toSlots(slots: BeyondContent['scene']['slots']): BeyondSlot[] {
  return slots.map((slot, index) => ({
    id: slot.id,
    title: slot.title,
    text: slot.text,
    icon: icons[index % icons.length]!,
    size: slot.size === 'small' ? 'sm' : 'md',
    // Shown as the board shows it. A production build fails while one is left in the content.
    confirm: slot.confirm?.map(confirmText).join('; '),
  }));
}

export interface BeyondTemplateProps {
  /** The page's hand content (`beyond.json`). */
  content: BeyondContent;
}

/** Beyond: a page that is not open yet, and the placeholders for what it will hold. */
export function BeyondTemplate({ content }: BeyondTemplateProps) {
  const { header, scene, next } = content;
  return (
    <ThreadScope>
      <Container className="relative z-1">
        <ThreadColumn placement="column">
          <Thread placement="column" fadeIn={2}>
            <ThreadNode placement="rail" top={52} />
          </Thread>
          <PageHeader className="pt-10" title={header.title} lead={header.lead} measure={36}>
            <p className="m-0 mt-1.5 inline-flex items-center gap-2.5 type-readout-status text-secondary">
              <span
                aria-hidden="true"
                className="box-border size-[7px] flex-none rounded-full border border-status-private"
              />
              {header.status}
            </p>
            <Text className="max-w-[40ch]">{header.note}</Text>
          </PageHeader>
        </ThreadColumn>
      </Container>

      <BeyondSlots
        aria-label={scene.label}
        art={{
          src: scene.image.src,
          width: scene.image.width,
          height: scene.image.height,
          sources: scene.image.sources,
        }}
        slots={toSlots(scene.slots)}
      />

      <Container>
        <ThreadColumn placement="column">
          <Thread placement="column" fadeIn={30} bottom={113}>
            <ThreadNode placement="rail" bottom={0} />
          </Thread>
          <HandoffFooter
            space="beyond"
            aria-label={next.label}
            label={next.eyebrow}
            title={next.link.label}
            href={next.link.href}
            linkAs={RouterLink}
          />
        </ThreadColumn>
      </Container>
    </ThreadScope>
  );
}
