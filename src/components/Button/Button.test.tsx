import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/Button/Button';

vi.mock('next/link', () => {
  return {
    default: React.forwardRef<HTMLAnchorElement, any>(function MockLink(
      { href, children, ...props },
      ref
    ) {
      return (
        <a
          href={typeof href === 'string' ? href : (href?.pathname ?? '')}
          ref={ref}
          {...props}
        >
          {children}
        </a>
      );
    }),
  };
});

vi.mock('@/design-tokens/icons.ts', () => ({}));

describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a <button> by default with type="button"', () => {
    render(<Button>Click me</Button>);

    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('respects button type prop', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button', { name: /submit/i })).toHaveAttribute('type', 'submit');
  });

  it('passes disabled through for button variant', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
  });

  it('calls onClick for button variant', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);

    fireEvent.click(screen.getByRole('button', { name: /press/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders a link when href is provided', () => {
    render(<Button href="/hello">Go</Button>);

    const link = screen.getByRole('link', { name: /go/i });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/hello');
  });

  it('adds data attributes (variant/size/icon-position)', () => {
    render(
      <Button
        href="/x"
        variant="secondary"
        size="large"
        iconPosition="left"
      >
        Go
      </Button>
    );

    const link = screen.getByRole('link', { name: /go/i });

    expect(link).toHaveAttribute('data-variant', 'secondary');
    expect(link).toHaveAttribute('data-size', 'large');
    expect(link).toHaveAttribute('data-icon-position', 'left');
  });

  it('auto-adds rel="noopener noreferrer" when target="_blank" and rel not provided', () => {
    render(
      <Button
        href="https://example.com"
        target="_blank"
      >
        External
      </Button>
    );

    const link = screen.getByRole('link', { name: /external/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not override rel when target="_blank" and rel is provided', () => {
    render(
      <Button
        href="https://example.com"
        target="_blank"
        rel="nofollow"
      >
        External
      </Button>
    );

    const link = screen.getByRole('link', { name: /external/i });
    expect(link).toHaveAttribute('rel', 'nofollow');
  });

  it('renders icon when icon prop is provided', () => {
    const { container } = render(<Button icon="search">Search</Button>);
    expect(container.innerHTML).toContain('/icons/icons.svg#search');

    const svg = container.querySelector('svg.icon');
    expect(svg).not.toBeNull();

    const use = svg!.querySelector('use');
    expect(use).not.toBeNull();
  });

  it('iconOnly hides the content span', () => {
    const { container } = render(
      <Button
        icon="search"
        iconOnly
        aria-label="Search"
      >
        Search
      </Button>
    );

    // content span should be absent when iconOnly
    expect(container.querySelector('.button__content')).toBeNull();
    // icon should still render
    expect(container.querySelector('.button__icon')).not.toBeNull();
  });

  it('iconOnly uses the required aria-label as its accessible name', () => {
    render(
      <Button
        icon="search"
        iconOnly
        aria-label="Search"
      >
        <span>Search</span>
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('aria-label', 'Search');
  });

  it('applies size-related classes', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    let el = screen.getByRole('button', { name: /small/i });
    expect(el.className).toContain('py-1');

    rerender(<Button size="large">Large</Button>);
    el = screen.getByRole('button', { name: /large/i });
    expect(el.className).toContain('font-title');
  });

  it('applies iconOnly padding classes', () => {
    const { rerender } = render(
      <Button
        icon="search"
        iconOnly
        aria-label="Search"
        size="default"
      >
        Search
      </Button>
    );

    let el = screen.getByRole('button', { name: /search/i });
    expect(el.className).toContain('px-3');

    rerender(
      <Button
        icon="search"
        iconOnly
        aria-label="Search"
        size="small"
      >
        Search
      </Button>
    );

    el = screen.getByRole('button', { name: /search/i });
    expect(el.className).toContain('px-1');
  });
});
