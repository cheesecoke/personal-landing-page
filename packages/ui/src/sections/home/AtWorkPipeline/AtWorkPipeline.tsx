import { useId } from 'react';

import { ThreadSection, type LinkComponent } from '../../../layout';
import { cx, Heading, Label, Text, TextLink } from '../../../primitives';
import styles from './AtWorkPipeline.module.css';

export interface AtWorkPipelineProps {
  /** The small label above the title ("At work"). */
  label: string;
  title: string;
  /** The sentence under the title. */
  body: string;
  /** The link under the sentence. */
  link?: { label: string; href: string };
  /** The pipeline's steps, in order. The last one is the lit step. */
  steps: readonly string[];
  /** The diagram read out as one sentence ("Flow: product spec, tickets, ..."). */
  flowLabel: string;
  /** The element or component for the link. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  className?: string;
}

const percent = (value: number) => `${value}%`;

/**
 * Home's "At work" block: a title, a sentence and a link beside a small pipeline diagram. From a
 * 700px slot the two sit side by side and the pipeline runs left to right; below that they stack
 * and the pipeline becomes a vertical rail. It is a section on the Home thread.
 */
export function AtWorkPipeline({
  label,
  title,
  body,
  link,
  steps,
  flowLabel,
  linkAs,
  className,
}: AtWorkPipelineProps) {
  const titleId = useId();
  const count = steps.length;
  const last = count - 1;
  /** Centre of step `index` along the line, in percent. */
  const centre = (index: number) => ((index + 0.5) / count) * 100;
  const columns = { gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` };
  const labelRow = (parity: 0 | 1, align: string) => (
    <div aria-hidden="true" className={cx(styles.labels, align)} style={columns}>
      {steps.map((step, index) =>
        index % 2 === parity ? (
          <span key={step} className={cx(styles.label, index === last && styles.labelLit)}>
            {step}
          </span>
        ) : (
          <span key={step} />
        ),
      )}
    </div>
  );

  return (
    <ThreadSection
      placement="edge"
      nodeTop={36}
      aria-labelledby={titleId}
      className={cx('pb-14', className)}
    >
      <div className="@container">
        <div className="grid grid-cols-1 items-center gap-x-16 gap-y-8 border-t border-hairline pt-9 @md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <Label as="p">{label}</Label>
            <Heading level={2} id={titleId} className="mt-3">
              {title}
            </Heading>
            <Text className="mt-4 max-w-[46ch]">{body}</Text>
            {link ? (
              <TextLink as={linkAs} href={link.href} className="mt-3">
                {link.label}
              </TextLink>
            ) : null}
          </div>
          {count > 0 ? (
            <div>
              <div role="img" aria-label={flowLabel} className={styles.rail}>
                <div
                  aria-hidden="true"
                  className={styles.arc}
                  style={{ left: percent(centre(last)) }}
                />
                {labelRow(0, 'items-end')}
                <div aria-hidden="true" className={styles.track}>
                  <span
                    className={styles.line}
                    style={{ left: percent(centre(0)), right: percent(100 - centre(last)) }}
                  />
                  {steps.slice(1).map((step, index) => (
                    <svg
                      key={step}
                      width="6"
                      height="8"
                      viewBox="0 0 6 8"
                      fill="none"
                      strokeWidth="1"
                      className={styles.chevron}
                      style={{ left: percent(((index + 1) / count) * 100) }}
                    >
                      <path d="M1 1l4 3-4 3" />
                    </svg>
                  ))}
                  {steps.map((step, index) => (
                    <span
                      key={step}
                      className={cx(styles.dot, index === last && styles.dotLit)}
                      style={{ left: percent(centre(index)) }}
                    />
                  ))}
                  <span className={styles.core} style={{ left: percent(centre(last)) }} />
                </div>
                {labelRow(1, 'items-start')}
              </div>
              <div role="img" aria-label={flowLabel} className={styles.railVertical}>
                <span aria-hidden="true" className={styles.lineVertical} />
                <div aria-hidden="true">
                  {steps.map((step, index) => (
                    <div key={step} className={styles.row}>
                      <span className={cx(styles.dot, index === last && styles.dotLit)} />
                      <span className={cx(styles.label, index === last && styles.labelLit)}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ThreadSection>
  );
}
