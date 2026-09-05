import React from 'react';
import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../src/context/CartContext';

function TestConsumer() {
  const { items, addItem, updateQuantity, totalCents, totalItems } = useCart();
  return (
    <div>
      <span data-testid="total-items">{totalItems}</span>
      <span data-testid="total-cents">{totalCents}</span>
      <button onClick={() => addItem({ id: 'p1', name: 'Widget', priceCents: 1000 }, 2)}>Add</button>
      <button onClick={() => updateQuantity('p1', 5)}>SetQty5</button>
      <ul>
        {items.map((item) => (
          <li key={item.productId}>
            {item.name} x{item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('adds items and computes totals', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    fireEvent.click(screen.getByText('Add'));

    expect(screen.getByTestId('total-items')).toHaveTextContent('2');
    expect(screen.getByTestId('total-cents')).toHaveTextContent('2000');
    expect(screen.getByText('Widget x2')).toBeInTheDocument();
  });

  test('updateQuantity changes the stored quantity', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('SetQty5'));

    expect(screen.getByText('Widget x5')).toBeInTheDocument();
  });

  test('persists cart contents to localStorage', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    fireEvent.click(screen.getByText('Add'));

    const stored = JSON.parse(localStorage.getItem('cart'));
    expect(stored).toHaveLength(1);
    expect(stored[0].productId).toBe('p1');
  });
});
