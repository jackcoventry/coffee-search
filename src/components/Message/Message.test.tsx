import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Message } from '@/components/Message/Message';

vi.mock('@/consts/label', () => ({
  CLOSE: 'Close',
}));

const getMessageTypeMock = vi.fn();

vi.mock('@/utils/getMessageType', () => ({
  getMessageType: (type: any) => getMessageTypeMock(type),
}));

vi.mock('@/components/Button/Button', () => ({
  Button: ({ onClick, children }: any) => (
    <button
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

describe('Message', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getMessageTypeMock.mockReturnValue({
      borderColor: 'border-red-500',
      icon: 'warning',
    });
  });

  it('renders alert with children content', () => {
    render(<Message id="message-id">Error occurred</Message>);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-atomic', 'true');
    expect(alert).toHaveAttribute('id', 'message-id');
    expect(alert).toHaveTextContent('Error occurred');
  });

  it('uses default type "error" when no type prop is provided', () => {
    render(<Message>Oops</Message>);

    expect(getMessageTypeMock).toHaveBeenCalledTimes(1);
    expect(getMessageTypeMock).toHaveBeenCalledWith('error');
  });

  it('passes provided type to getMessageType', () => {
    render(<Message type="success">Saved</Message>);

    expect(getMessageTypeMock).toHaveBeenCalledWith('success');
  });

  it('applies the border color class from getMessageType', () => {
    const { container } = render(<Message>Styled</Message>);

    const alert = container.querySelector('[role="alert"]') as HTMLElement;
    expect(alert.className).toContain('border-red-500');
  });

  it('renders the correct icon from getMessageType', () => {
    const { container } = render(<Message>Icon test</Message>);

    const use = container.querySelector('use');
    expect(use).not.toBeNull();
    expect(use!.getAttribute('xlink:href') ?? use!.getAttribute('xlinkHref')).toBe(
      '/icons/icons.svg#warning'
    );
  });

  it('closes the message when close button is clicked', () => {
    render(<Message>Closable</Message>);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByRole('alert')).toBeNull();
  });
});
