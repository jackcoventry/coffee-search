import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TextMarquee } from '@/components/TextMarquee/TextMarquee';

describe('TextMarquee', () => {
  it('renders aria-hidden wrapper', () => {
    const { container } = render(<TextMarquee>HELLO</TextMarquee>);

    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders two animated tracks', () => {
    const { container } = render(<TextMarquee>HELLO</TextMarquee>);

    const trackA = container.querySelector('.animate-marquee-a');
    const trackB = container.querySelector('.animate-marquee-b');

    expect(trackA).not.toBeNull();
    expect(trackB).not.toBeNull();
  });

  it('repeats children 22 times (10 + 10 + 2 invisible buffer)', () => {
    render(<TextMarquee>HELLO</TextMarquee>);

    // This checks rendered DOM repeats (not accessibility tree)
    const all = screen.getAllByText('HELLO');
    expect(all).toHaveLength(22);
  });

  it('supports ReactNode children', () => {
    render(
      <TextMarquee>
        <span data-testid="child">Hi</span>
      </TextMarquee>
    );

    // The data-testid will appear 22 times.
    expect(screen.getAllByTestId('child')).toHaveLength(22);
  });

  it('sets the height style when height prop is provided', () => {
    const { container } = render(<TextMarquee height={120}>HELLO</TextMarquee>);

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveStyle({ height: '120px' });
  });

  it('does not set a height style when height is undefined', () => {
    const { container } = render(<TextMarquee>HELLO</TextMarquee>);

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.height).toBe('');
  });

  it('contains an invisible buffer wrapper', () => {
    const { container } = render(<TextMarquee>HELLO</TextMarquee>);

    const invisible = container.querySelector('span.invisible');
    expect(invisible).not.toBeNull();
    expect(invisible!.querySelectorAll('span')).toHaveLength(2);
  });
});
