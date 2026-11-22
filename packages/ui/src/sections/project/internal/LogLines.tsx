import { cx } from '../../../primitives';

/** The terse lines of a log entry or a release: each behind a short Cedar dash. */
export function LogLines({ lines, className }: { lines: readonly string[]; className?: string }) {
  return (
    <ul className={cx('m-0 flex list-none flex-col gap-1.5 p-0', className)}>
      {lines.map((line) => (
        <li
          key={line}
          className="grid grid-cols-[10px_minmax(0,1fr)] gap-2.5 text-[15px] leading-[1.45] text-primary"
        >
          <span aria-hidden="true" className="mt-[0.72em] h-px bg-cedar" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}
