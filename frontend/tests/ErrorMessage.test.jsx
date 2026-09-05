import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from '../src/components/ErrorMessage';

describe('ErrorMessage', () => {
  test('renders nothing when there is no message', () => {
    const { container } = render(<ErrorMessage message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders the message text', () => {
    render(<ErrorMessage message="Something failed" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something failed');
  });

  test('calls onRetry when the retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Failed" onRetry={onRetry} />);
    fireEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });
});
