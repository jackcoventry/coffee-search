import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Footer } from '@/components/Footer/Footer';

vi.mock('@/consts/label', () => ({
  FOOTER_LINK_LABEL: 'View on GitHub',
  FOOTER_NOTE: 'Made with coffee.',
  GITHUB_URL: 'https://github.com/example/repo',
}));

function getXlinkHref(el: Element) {
  return el.getAttribute('xlink:href') ?? el.getAttribute('xlinkHref');
}

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the footer note', () => {
    render(<Footer />);
    expect(screen.getByText('Made with coffee.')).toBeInTheDocument();
  });

  it('renders the GitHub link with correct attributes and accessible name', () => {
    render(<Footer />);

    const link = screen.getByRole('link', { name: 'View on GitHub' });

    expect(link).toHaveAttribute('href', 'https://github.com/example/repo');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('View on GitHub')).toBeInTheDocument();
  });

  it('renders a decorative svg icon using the sprite', () => {
    const { container } = render(<Footer />);

    const svg = container.querySelector('svg.icon');
    expect(svg).not.toBeNull();

    const ariaHidden = svg!.getAttribute('aria-hidden');
    expect(ariaHidden === '' || ariaHidden === 'true').toBe(true);

    const use = svg!.querySelector('use');
    expect(use).not.toBeNull();
    expect(getXlinkHref(use!)).toBe('/icons/icons.svg#backpack');
  });
});
