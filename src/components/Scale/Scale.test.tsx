import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Scale } from '@/components/Scale/Scale';

function getFillWidths(container: HTMLElement): string[] {
  const fills = container.querySelectorAll<HTMLDivElement>('.h-full.bg-black');
  return Array.from(fills).map((el) => el.style.width);
}

describe('<Scale />', () => {
  it('renders 5 circles and 5 fill elements', () => {
    const { container } = render(<Scale value={0} />);

    // Outer circles
    const circles = container.querySelectorAll('.rounded-full');
    expect(circles).toHaveLength(5);

    // Inner fills
    const fills = container.querySelectorAll('.h-full.bg-black');
    expect(fills).toHaveLength(5);
  });

  it('exposes an accessible text equivalent', () => {
    render(
      <Scale
        label="Body"
        value={3.5}
      />
    );

    expect(screen.getByRole('img', { name: 'Body: 3.5 out of 5' })).toBeInTheDocument();
  });

  it('fills none when value is 0', () => {
    const { container } = render(<Scale value={0} />);
    expect(getFillWidths(container)).toEqual(['0%', '0%', '0%', '0%', '0%']);
  });

  it('fills all when value is 5', () => {
    const { container } = render(<Scale value={5} />);
    expect(getFillWidths(container)).toEqual(['100%', '100%', '100%', '100%', '100%']);
  });

  it('supports half values (e.g. 3.5)', () => {
    const { container } = render(<Scale value={3.5} />);

    expect(getFillWidths(container)).toEqual(['100%', '100%', '100%', '50%', '0%']);
  });

  it('clamps values below 0 to 0% and above 5 to 100%', () => {
    const { container: low } = render(<Scale value={-10} />);
    expect(getFillWidths(low)).toEqual(['0%', '0%', '0%', '0%', '0%']);

    const { container: high } = render(<Scale value={10} />);
    expect(getFillWidths(high)).toEqual(['100%', '100%', '100%', '100%', '100%']);
  });
});
