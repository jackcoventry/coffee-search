import { CLOSE } from '@/consts/label';
import { PropsWithChildren, useState } from 'react';
import { MessageType, getMessageType } from '@/utils/getMessageType';
import { Button } from '@/components/Button/Button';

type Props = {
  id?: string;
  type?: MessageType;
};

export function Message({ children, id, type = 'error' }: PropsWithChildren<Props>) {
  const status = getMessageType(type);
  const [open, setOpen] = useState<boolean>(true);

  return open ? (
    <p
      className={`fixed flex items-center gap-3 z-20 bottom-5 right-5 p-4 ml-4 font-small border-2 max-w-2xl bg-white motion-safe:animate-bounce-in | ${status.borderColor}`}
      id={id}
      role="alert"
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
      {children}
      <Button
        size="small"
        onClick={() => setOpen(false)}
        icon="close"
        iconOnly
      >
        {CLOSE}
      </Button>
    </p>
  ) : null;
}
