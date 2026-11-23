import type { CSSProperties, ReactNode } from 'react';

import { ThreadNode } from '../../../layout';
import { cx, Readout, TextLink } from '../../../primitives';
import type { LinkComponent, SectionLink } from '../internal/link';
import styles from './BuildWith.module.css';

/** Where a tool is on the way from tried to current. */
export type BuildWithStage = 'tried' | 'also' | 'current';

export interface BuildWithTool {
  name: string;
  stage: BuildWithStage;
}

/** A plain fact under the rail ("Editor": "Neovim with LazyVim"). */
export interface BuildWithFact {
  label: string;
  value: ReactNode;
}

export interface BuildWithProps {
  /** The section's title ("What I build with"). */
  title: ReactNode;
  /** An id for the title. Default `about-tools`. */
  titleId?: string;
  /** The tools in order, tried first and the one in use now last. */
  tools: BuildWithTool[];
  /** The words for the stages ("Tried", "Also", "Current"). */
  stageLabels: Record<BuildWithStage, string>;
  /** The list's accessible name ("Agent tools, from tried to current"). */
  listLabel: string;
  facts?: BuildWithFact[];
  /** The line under it all, a link ("Let me know what else I should try."). */
  link?: SectionLink;
  /** The element or component for the link. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  /** Put a node on the thread beside it. Default `true`. */
  node?: boolean;
  className?: string;
}

/**
 * The agent tools on a rail, from tried to current: the rail turns Signal as it reaches the
 * current ones and the tool in use now is the lit dot. In a narrow slot the rail runs down the
 * side and each tool carries its stage beside its name.
 */
export function BuildWith({
  title,
  titleId = 'about-tools',
  tools,
  stageLabels,
  listLabel,
  facts,
  link,
  linkAs,
  node = true,
  className,
}: BuildWithProps) {
  const count = tools.length;
  const firstCurrent = tools.findIndex((tool) => tool.stage === 'current');
  const turn = firstCurrent === -1 ? count : firstCurrent;
  // The stage names above the rail: one per run of tools in the same stage.
  const runs: { stage: BuildWithStage; start: number; span: number }[] = [];
  tools.forEach((tool, index) => {
    const last = runs[runs.length - 1];
    if (last && last.stage === tool.stage) last.span += 1;
    else runs.push({ stage: tool.stage, start: index, span: 1 });
  });
  // The rail is Tick until just past the last tool before the current ones, Signal just before
  // the first current one (52% and 74% on the board's five tools).
  const step = count > 1 ? 100 / (count - 1) : 100;
  const style = {
    '--tools': count,
    '--rail-from': `${Math.max(0, (turn - 1) * step + 2)}%`,
    '--rail-to': `${Math.min(100, turn * step - 1)}%`,
  } as CSSProperties;

  return (
    <section aria-labelledby={titleId} className={cx(styles.root, className)}>
      <div className={styles.inner} style={style}>
        {node ? <ThreadNode placement="column" top={6} /> : null}
        <h2 id={titleId} className="m-0 type-h3">
          {title}
        </h2>
        <div className={styles.body}>
          <div aria-hidden="true" className={styles.stages}>
            {runs.map((run) => (
              <span
                key={run.start}
                className={styles.stage}
                style={{ gridColumn: `${run.start + 1} / span ${run.span}` }}
              >
                <Readout kind="status" tone={run.stage === 'current' ? 'signal' : 'label'}>
                  {stageLabels[run.stage]}
                </Readout>
                {run.stage === 'current' ? null : <span className={styles.stageRule} />}
              </span>
            ))}
          </div>
          <ol aria-label={listLabel} className={styles.tools}>
            {count > 1 ? <li aria-hidden="true" className={styles.rail} /> : null}
            {tools.map((tool, index) => {
              const current = tool.stage === 'current';
              const now = index === count - 1 && current;
              return (
                <li key={tool.name} className={styles.tool}>
                  {index < count - 1 ? (
                    <span
                      aria-hidden="true"
                      className={cx(
                        styles.seg,
                        index === turn - 1 && styles.segTurn,
                        current && styles.segCurrent,
                      )}
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className={cx(
                      styles.node,
                      current && styles.nodeCurrent,
                      now && styles.nodeNow,
                    )}
                  />
                  <span
                    className={cx(
                      styles.name,
                      current && styles.nameCurrent,
                      now && styles.nameNow,
                    )}
                  >
                    {tool.name}
                    <Readout
                      kind="status"
                      tone={current ? 'signal' : 'label'}
                      className={styles.nameStage}
                    >
                      {' '}
                      {stageLabels[tool.stage]}
                    </Readout>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        {facts?.length ? (
          <dl className={styles.facts}>
            {facts.map((fact) => (
              <div key={fact.label} className={styles.fact}>
                <dt className="type-readout-status text-label">{fact.label}</dt>
                <dd className={styles.factValue}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {link ? (
          <TextLink as={linkAs} href={link.href} size="lead" arrow="md" className={styles.link}>
            {link.label}
          </TextLink>
        ) : null}
      </div>
    </section>
  );
}
