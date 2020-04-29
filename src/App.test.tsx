import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders app', () => {
  const { getByText } = render(<App />);
  const newGameButton = getByText(/New Game/i);
  const undoMoveButton = getByText(/Undo Move/i);
  expect(newGameButton).toBeInTheDocument();
  expect(undoMoveButton).toBeInTheDocument();
});
