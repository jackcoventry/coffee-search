import type { IconName } from '@/design-tokens/icons';
import clsx from 'clsx';
import Link from 'next/link';
import React, { JSX } from 'react';
import './Button.css';

type CommonProps = {
  className?: string;
  children: React.ReactNode;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  size?: 'default' | 'large' | 'small';
  variant?: 'primary' | 'secondary';
};

type AccessibleNameProps =
  | {
      iconOnly: true;
      'aria-label': string;
    }
  | {
      iconOnly?: false;
      'aria-label'?: string;
    };

type BaseProps = CommonProps & AccessibleNameProps;

type PropsToOmit = 'children' | 'className' | 'aria-label';

type ButtonOnlyProps = {
  href?: never;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  PropsToOmit | 'type' | 'onClick' | 'disabled'
>;

type LinkOnlyProps = {
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  type?: never;
  disabled?: never;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, PropsToOmit | 'href' | 'onClick'>;

type Props = BaseProps & (ButtonOnlyProps | LinkOnlyProps);

type ButtonComponent = {
  (
    props: Readonly<BaseProps & ButtonOnlyProps> & { ref?: React.Ref<HTMLButtonElement> }
  ): JSX.Element;
  (
    props: Readonly<BaseProps & LinkOnlyProps> & { ref?: React.Ref<HTMLAnchorElement> }
  ): JSX.Element;
};

function BaseButton(
  props: Readonly<Props>,
  ref: React.ForwardedRef<HTMLButtonElement | HTMLAnchorElement>
) {
  const {
    className = '',
    children,
    icon,
    iconOnly = false,
    iconPosition = 'right',
    variant = 'primary',
    size = 'default',
    ...rest
  } = props;

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const classes = clsx(
    'button cursor-pointer inline-flex outline-0 border-2 gap-4 no-underline whitespace-nowrap focusable',
    className,
    isLarge ? 'font-title' : 'font-body',
    isSmall ? 'py-1' : 'py-3',
    isSmall ? null : 'min-h-12.5',
    iconOnly ? (isSmall ? 'px-1' : 'px-3') : isSmall ? 'px-3' : 'px-5'
  );

  // Accessible name handling
  let ariaLabel = props['aria-label'];
  if (!ariaLabel && iconOnly && typeof children === 'string') {
    ariaLabel = children;
  }

  const content = (
    <>
      {children && !iconOnly && <span className="button__content">{children}</span>}
      {icon && (
        <span className="button__icon | items-center inline-flex">
          <svg
            className="icon"
            width="1.25em"
            height="1.25em"
            fill="currentColor"
            aria-hidden
          >
            <use xlinkHref={`/icons/icons.svg#${icon}`} />
          </svg>
        </span>
      )}
    </>
  );

  if ('href' in props) {
    const { href, target, rel, onClick, ...anchorRest } = rest as LinkOnlyProps;
    const relSafe = target === '_blank' ? rel || 'noopener noreferrer' : rel;

    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={classes}
        data-icon-position={iconPosition}
        data-size={size}
        data-variant={variant}
        target={target}
        rel={relSafe}
        onClick={onClick}
        ref={ref as React.Ref<HTMLAnchorElement>}
        {...anchorRest}
      >
        {content}
      </Link>
    );
  }

  const { type = 'button', disabled = false, onClick, ...buttonRest } = rest as ButtonOnlyProps;

  return (
    <button
      aria-label={ariaLabel}
      className={classes}
      data-icon-position={iconPosition}
      data-size={size}
      data-variant={variant}
      disabled={disabled}
      onClick={onClick}
      type={type}
      ref={ref as React.Ref<HTMLButtonElement>}
      {...buttonRest}
    >
      {content}
    </button>
  );
}

export const Button = React.forwardRef(BaseButton) as unknown as ButtonComponent;
