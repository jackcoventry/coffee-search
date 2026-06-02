import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Results } from '@/components/Results/Results';

vi.mock('@/consts/label', () => ({
  RECOMMENDATIONS_TITLE: 'Our recommendations',
  SHOW_QUERY: 'Show query',
}));

vi.mock('@/components/Results/ResultTile', () => ({
  ResultTile: ({ result }: any) => <div data-testid="result-tile">{result.name}</div>,
}));

describe('<Results />', () => {
  const mockResults = [
    { sku: '1', name: 'Coffee One' },
    { sku: '2', name: 'Coffee Two' },
    { sku: '3', name: 'Coffee Three' },
  ] as any[];

  it('renders heading and introduction', () => {
    const { container } = render(
      <Results
        results={mockResults}
        introduction="We picked these for you"
        query="Find me coffee"
      >
        <div>Element</div>
      </Results>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /our recommendations/i })
    ).toBeInTheDocument();

    expect(screen.getByText('We picked these for you')).toBeInTheDocument();

    expect(container.querySelector('#results')).toHaveAttribute('tabindex', '-1');
  });

  it('renders the query details when query is provided', () => {
    render(
      <Results
        results={mockResults}
        introduction="Intro"
        query="Find me coffee"
      >
        <div />
      </Results>
    );

    expect(screen.getByText('Show query')).toBeInTheDocument();
    expect(screen.getByText('Find me coffee')).toBeInTheDocument();
    expect(document.querySelector('details')).not.toBeNull();
  });

  it('does not render the query details when query is empty', () => {
    render(
      <Results
        results={mockResults}
        introduction="Intro"
        query=""
      >
        <div />
      </Results>
    );

    expect(document.querySelector('details')).toBeNull();
    expect(screen.queryByText('Show query')).toBeNull();
  });

  it('renders one ResultTile per result', () => {
    render(
      <Results
        results={mockResults}
        introduction="Intro"
        query="Find me coffee"
      >
        <div />
      </Results>
    );

    const tiles = screen.getAllByTestId('result-tile');
    expect(tiles).toHaveLength(3);

    expect(screen.getByText('Coffee One')).toBeInTheDocument();
    expect(screen.getByText('Coffee Two')).toBeInTheDocument();
    expect(screen.getByText('Coffee Three')).toBeInTheDocument();
  });

  it('renders children below the list', () => {
    render(
      <Results
        results={mockResults}
        introduction="Intro"
        query="Find me coffee"
      >
        <button type="button">Load more</button>
      </Results>
    );

    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
  });

  it('renders empty list when results is empty', () => {
    const { container } = render(
      <Results
        results={[]}
        introduction="Intro"
        query="Find me coffee"
      >
        <div />
      </Results>
    );

    expect(container.querySelectorAll('ul > li')).toHaveLength(0);
  });
});
