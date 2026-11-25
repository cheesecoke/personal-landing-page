import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';

import { Button } from '../Button/Button';
import { cx } from '../cx';
import { Heading } from '../Heading/Heading';
import { Text } from '../Text/Text';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  /** Shown while true. The dialog is controlled: it closes only when the caller sets this false. */
  open: boolean;
  /** A short question ("Step through?"). Names the dialog. */
  title: ReactNode;
  /** One line under the title. Describes the dialog. */
  body: ReactNode;
  /** The primary button. It has focus when the dialog opens. */
  confirmLabel: string;
  /** The quiet button. */
  cancelLabel: string;
  /** The primary button was pressed. */
  onConfirm: () => void;
  /** The quiet button, Escape, or a click on the dimmed page behind. */
  onCancel: () => void;
  /**
   * Where focus goes when it closes. Default: whatever had focus when it opened. Pass the control
   * that opened it when that control may not take focus on click (Safari buttons do not).
   */
  returnFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * A small modal question with two answers: a native `<dialog>` opened with `showModal()`, so the
 * page behind is inert and dimmed. Focus starts on the primary button and goes back where it came
 * from on close. Escape and a click on the backdrop cancel. The page does not scroll while it is
 * open. It fades in and rises a few pixels; under reduced motion it simply appears.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  returnFocusRef,
  className,
}: ConfirmDialogProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const bodyId = `${id}-body`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  // A press that started on the backdrop, so a drag out of the panel does not cancel.
  const pressedBackdrop = useRef(false);

  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const from = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const back = returnFocusRef?.current ?? from;
    if (!dialog.open) dialog.showModal();
    dialog
      .querySelector<HTMLElement>('[data-confirm-dialog-confirm]')
      ?.focus({ preventScroll: true });

    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = 'hidden';

    // The browser's own cancel (Escape, a back gesture) would close the dialog; the caller decides.
    const onCancelEvent = (event: Event) => {
      event.preventDefault();
      onCancelRef.current();
    };
    dialog.addEventListener('cancel', onCancelEvent);
    // Escape is also handled as a key, before it reaches the page: one Escape closes one thing.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      onCancelRef.current();
    };
    dialog.addEventListener('keydown', onKeyDown);

    return () => {
      dialog.removeEventListener('cancel', onCancelEvent);
      dialog.removeEventListener('keydown', onKeyDown);
      root.style.overflow = overflow;
      if (dialog.open) dialog.close();
      back?.focus({ preventScroll: true });
    };
  }, [open, returnFocusRef]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      data-confirm-dialog=""
      className={cx(styles.dialog, className)}
      onPointerDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        // The panel fills the dialog box, so only the backdrop reports the dialog as its target.
        if (event.target === event.currentTarget && pressedBackdrop.current) onCancel();
        pressedBackdrop.current = false;
      }}
    >
      <div className={styles.panel}>
        <Heading level={2} role="h3" id={titleId}>
          {title}
        </Heading>
        <Text id={bodyId} tone="secondary">
          {body}
        </Text>
        <div className={styles.actions}>
          <Button data-confirm-dialog-confirm="" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="quiet" data-confirm-dialog-cancel="" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
