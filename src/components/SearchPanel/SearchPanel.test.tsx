import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchPanel } from '@/components/SearchPanel/SearchPanel';

vi.mock('@/consts/label', () => ({
  BACK_TO_TOP: 'Back to top',
  INTRO_MARQUEE: 'Intro marquee',
  NEW_SEARCH: 'New search',
}));

const replaceMock = vi.fn();

let mockPathname = '/search';
let mockQueryParam: string | null = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => mockPathname,
  useSearchParams: () => ({
    get: (key: string) => (key === 'query' ? mockQueryParam : null),
  }),
}));

const submitMock = vi.fn();
const resetMock = vi.fn();

let recommendState: {
  data: any;
  error: string | null;
  isLoading: boolean;
} = {
  data: null,
  error: null,
  isLoading: false,
};

vi.mock('@/hooks/useRecommend/useRecommend', () => ({
  useRecommend: () => ({
    submit: submitMock,
    reset: resetMock,
    data: recommendState.data,
    error: recommendState.error,
    isLoading: recommendState.isLoading,
  }),
}));

vi.mock('@/components/QueryForm/QueryForm', () => ({
  QueryForm: ({ onSubmit, isLoading }: any) => (
    <div>
      <div
        data-testid="query-form"
        data-loading={String(isLoading)}
      />
      {/* a simple button to trigger the onSubmit callback */}
      <button
        type="button"
        onClick={() => onSubmit({ query: '  hello world  ' })}
      >
        trigger-submit
      </button>
    </div>
  ),
}));

vi.mock('@/components/Results/Results', () => ({
  Results: ({ children }: any) => <div data-testid="results">{children}</div>,
}));

vi.mock('@/components/TextMarquee/TextMarquee', () => ({
  TextMarquee: ({ children }: any) => <div data-testid="marquee">{children}</div>,
}));

vi.mock('@/components/Message/Message', () => ({
  Message: ({ children }: any) => <div role="alert">{children}</div>,
}));

vi.mock('@/components/Button/Button', () => ({
  Button: ({ children, onClick, href }: any) =>
    href ? (
      <a
        href={href}
        onClick={onClick}
      >
        {children}
      </a>
    ) : (
      <button
        type="button"
        onClick={onClick}
      >
        {children}
      </button>
    ),
}));

describe('SearchPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/search';
    mockQueryParam = null;

    recommendState = { data: null, error: null, isLoading: false };

    vi.stubGlobal('scrollTo', vi.fn());
  });

  it('renders QueryForm when there are no results', () => {
    render(<SearchPanel />);

    expect(screen.getByTestId('query-form')).toBeInTheDocument();
    expect(screen.queryByTestId('results')).toBeNull();

    // marquee always shown
    expect(screen.getByTestId('marquee')).toHaveTextContent('Intro marquee');
  });

  it('renders Results (and hides QueryForm) when there are results', () => {
    recommendState.data = {
      query: 'tea',
      introduction: 'intro',
      results: [{ id: 1 }],
    };

    render(<SearchPanel />);

    expect(screen.getByTestId('results')).toBeInTheDocument();
    expect(screen.queryByTestId('query-form')).toBeNull();
  });

  it('calls submit from query param on mount when query exists and results are not showing', async () => {
    mockQueryParam = '  green tea  ';
    recommendState.data = null;

    render(<SearchPanel />);

    await waitFor(() => {
      expect(submitMock).toHaveBeenCalledTimes(1);
      expect(submitMock).toHaveBeenCalledWith({ query: 'green tea' });
    });
  });

  it('does not call submit from query param if query is empty/whitespace', async () => {
    mockQueryParam = '   ';
    render(<SearchPanel />);

    await waitFor(() => {
      expect(submitMock).toHaveBeenCalledTimes(0);
    });
  });

  it('does not auto-submit from query param if results are already showing', async () => {
    mockQueryParam = 'coffee';
    recommendState.data = {
      query: 'coffee',
      introduction: 'intro',
      results: [{ id: 1 }],
    };

    render(<SearchPanel />);

    await waitFor(() => {
      expect(submitMock).toHaveBeenCalledTimes(0);
    });
  });

  it('handleSubmit updates the URL (encoded) and then calls submit', async () => {
    // Make submit async to ensure await path is realistic
    submitMock.mockResolvedValueOnce(undefined);

    render(<SearchPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'trigger-submit' }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/search?query=hello%20world', { scroll: false });
      expect(submitMock).toHaveBeenCalledWith({ query: '  hello world  ' });
    });
  });

  it('clicking "New search" calls reset and router.replace(pathname)', () => {
    recommendState.data = {
      query: 'tea',
      introduction: 'intro',
      results: [{ id: 1 }],
    };

    render(<SearchPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'New search' }));

    expect(resetMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith('/search', { scroll: false });
  });

  it('renders Back to top link when results are showing', () => {
    recommendState.data = {
      query: 'tea',
      introduction: 'intro',
      results: [{ id: 1 }],
    };

    render(<SearchPanel />);

    const link = screen.getByRole('link', { name: 'Back to top' });
    expect(link).toHaveAttribute('href', '#content');
  });

  it('calls window.scrollTo(0,0) when showResults changes', () => {
    // initial render: no results
    const { rerender } = render(<SearchPanel />);
    expect((globalThis as any).scrollTo).toHaveBeenCalledTimes(1);

    recommendState.data = {
      query: 'tea',
      introduction: 'intro',
      results: [{ id: 1 }],
    };

    rerender(<SearchPanel />);
    expect((globalThis as any).scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('renders an error Message when error exists', () => {
    recommendState.error = 'Something went wrong';

    render(<SearchPanel />);

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });
});
