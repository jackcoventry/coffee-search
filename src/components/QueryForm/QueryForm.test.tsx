import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryForm } from '@/components/QueryForm/QueryForm';

vi.mock('@/consts/label', () => ({
  FORM_QUERY_BUTTON: 'Search',
  FORM_QUERY_ERROR_MAX: 'Too long',
  FORM_QUERY_ERROR_MIN: 'Please enter a search term',
  FORM_QUERY_PLACEHOLDER: 'Search for something...',
  INTRO_TITLE: 'What are you looking for?',
}));

vi.mock('@/components/Button/Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/Message/Message', () => ({
  Message: ({ children, id }: any) => (
    <div
      id={id}
      role="alert"
    >
      {children}
    </div>
  ),
}));

describe('QueryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title, input, and submit button (visible text + accessible name)', () => {
    render(
      <QueryForm
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByRole('heading', { name: 'What are you looking for?' })).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Search for something...')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('submits valid query and calls onSubmit with data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <QueryForm
        onSubmit={onSubmit}
        isLoading={false}
      />
    );

    const input = screen.getByLabelText('What are you looking for?') as HTMLInputElement;

    await user.type(input, 'coffee');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    // IMPORTANT: your component calls onSubmit(data) with ONE argument
    expect(onSubmit).toHaveBeenCalledWith({ query: 'coffee' });
  });

  it('shows min-length error when submitted empty', async () => {
    const user = userEvent.setup();

    render(
      <QueryForm
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a search term');
  });

  it('shows min-length error when query has only one character', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <QueryForm
        onSubmit={onSubmit}
        isLoading={false}
      />
    );

    const input = screen.getByLabelText('What are you looking for?') as HTMLInputElement;

    await user.type(input, 'a');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a search term');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows max-length error when query exceeds 150 chars', async () => {
    const user = userEvent.setup();

    render(
      <QueryForm
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );

    const input = screen.getByLabelText('What are you looking for?') as HTMLInputElement;

    await user.type(input, 'a'.repeat(151));
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Too long');
  });

  it('sets data-valid="false" on input when there is an error', async () => {
    const user = userEvent.setup();

    render(
      <QueryForm
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );

    const input = screen.getByLabelText('What are you looking for?') as HTMLInputElement;

    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(input).toHaveAttribute('data-valid', 'false');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Please enter a search term');
  });

  it('sets data-valid="true" on input when there is no error', async () => {
    const user = userEvent.setup();

    render(
      <QueryForm
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );

    const input = screen.getByLabelText('What are you looking for?') as HTMLInputElement;

    await user.type(input, 'hello');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.queryByRole('alert')).toBeNull();
    expect(input).toHaveAttribute('data-valid', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('when isLoading is true: disables input and submit button, sets data-loading, and blocks submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const { container } = render(
      <QueryForm
        onSubmit={onSubmit}
        isLoading={true}
      />
    );

    const form = container.querySelector('form.query-form') as HTMLFormElement;
    expect(form).toHaveAttribute('data-loading', 'true');

    const input = screen.getByLabelText('What are you looking for?') as HTMLInputElement;
    expect(input).toBeDisabled();

    const btn = screen.getByRole('button', { name: 'Search' }) as HTMLButtonElement;
    expect(btn).toBeDisabled();

    await user.click(btn);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
