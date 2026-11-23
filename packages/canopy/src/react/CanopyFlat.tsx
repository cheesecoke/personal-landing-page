import { useMemo } from 'react';

import { type CanopyColors, canopyColors } from '../core/colors';
import { flatTree } from '../core/flat';
import { rgba } from '../core/math';
import { buildIndex } from '../core/tree';
import type { CanopyData, CanopyVariant } from '../types';
import s from './Canopy.module.css';

/** Stage sizes the flat drawing is composed for: the board's desktop and phone frames. */
const FRAMES = {
  full: {
    wide: { width: 1128, height: 800, top: 82 },
    narrow: { width: 390, height: 590, top: 62 },
  },
  teaser: {
    wide: { width: 760, height: 460, top: 0 },
    narrow: { width: 350, height: 360, top: 0 },
  },
} as const;

export interface CanopyFlatProps {
  data: CanopyData;
  variant: CanopyVariant;
  colors?: Partial<CanopyColors>;
}

/**
 * The tree's home view as an SVG: no three.js, no JavaScript needed. It is decoration (the list
 * and the page carry the links), so it is hidden from assistive technology.
 */
export function CanopyFlat({ data, variant, colors }: CanopyFlatProps) {
  const C = useMemo(() => ({ ...canopyColors, ...colors }), [colors]);
  const trees = useMemo(() => {
    const index = buildIndex(data);
    const teaser = variant === 'teaser';
    return (['wide', 'narrow'] as const).map((size) => ({
      size,
      tree: flatTree(index, data, C, {
        ...FRAMES[variant][size],
        phone: size === 'narrow',
        teaser,
      }),
    }));
  }, [data, variant, C]);

  return (
    <>
      {trees.map(({ size, tree }) => (
        <svg
          key={size}
          className={`${s.flat} ${s[size]}`}
          viewBox={`0 0 ${tree.width} ${tree.height}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
          data-canopy-flat={size}
        >
          {tree.shapes.map((shape, i) => (
            <path
              key={i}
              d={shape.d}
              fill={shape.fill ?? 'none'}
              stroke={shape.stroke}
              strokeWidth={shape.width}
              strokeOpacity={shape.opacity}
              strokeDasharray={shape.dash}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {tree.marks.map((m) => (
            <g key={m.id} fill="none" strokeWidth={1.2}>
              <circle cx={m.x} cy={m.y} r={m.r * 0.95} fill={C.ground} fillOpacity={0.9} />
              {m.lead && (
                <circle cx={m.x} cy={m.y} r={m.r * 0.88} stroke={C.cedar} strokeOpacity={0.65} />
              )}
              <circle
                cx={m.x}
                cy={m.y}
                r={m.r * (m.lead ? 0.54 : 0.72)}
                stroke={C.hinoki}
                strokeOpacity={m.lead ? 0.6 : 0.75}
              />
              {m.lead && (
                <circle
                  cx={m.x}
                  cy={m.y}
                  r={m.r * 0.88}
                  stroke={C.signal}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray="25 100"
                  transform={`rotate(-90 ${m.x} ${m.y})`}
                />
              )}
              <circle cx={m.x} cy={m.y} r={Math.max(1.6, m.r * 0.13)} fill={C.bone} />
            </g>
          ))}
          {tree.labels.map((l) => (
            <g key={l.id}>
              {l.leader && (
                <line
                  x1={l.leader[0]}
                  y1={l.leader[1]}
                  x2={l.leader[2]}
                  y2={l.leader[3]}
                  stroke={C.smoke}
                  strokeOpacity={0.5}
                />
              )}
              <rect
                x={l.x}
                y={l.y}
                width={l.w}
                height={l.h}
                rx={l.start ? 5 : 4}
                fill={rgba(C.ground, 0.8)}
                stroke={l.start ? rgba(C.hinoki, 0.4) : 'none'}
              />
              <text
                className={l.start ? s.lead : undefined}
                x={l.x + l.w / 2}
                y={l.y + l.h / 2 + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {l.text}
              </text>
            </g>
          ))}
        </svg>
      ))}
    </>
  );
}
