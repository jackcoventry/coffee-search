import { CLOSE } from '@/consts/label';
import { PropsWithChildren, useState } from 'react';
import { MessageType, getMessageType } from '@/utils/getMessageType';
import { Button } from '@/components/Button/Button';

type Props = {
  id?: string;
  title?: string;
  type?: MessageType;
};

export function Message({ children, id, title, type = 'error' }: PropsWithChildren<Props>) {
  const status = getMessageType(type);
  const [open, setOpen] = useState<boolean>(true);

  return open ? (
    <div
      className={`fixed flex items-start gap-3 z-20 bottom-5 right-5 p-4 ml-4 font-small border-2 max-w-md bg-white shadow-[6px_6px_0_#000] motion-safe:animate-bounce-in | ${status.borderColor}`}
      id={id}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <svg
        className="icon"
        width="1.25em"
        height="1.25em"
        fill="currentColor"
        aria-hidden
      >
        <use xlinkHref={`/icons/icons.svg#${status.icon}`} />
      </svg>
      <div className="flex-1">
        {title ? <p className="font-bold uppercase">{title}</p> : null}
        <p>{children}</p>
      </div>
      <Button
        size="small"
        onClick={() => setOpen(false)}
        icon="close"
        iconOnly
        aria-label={CLOSE}
      >
        {CLOSE}
      </Button>
    </div>
  ) : null;
}
