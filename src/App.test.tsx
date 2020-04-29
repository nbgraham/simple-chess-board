import React from 'react';
import { render, fireEvent, Matcher, act } from '@testing-library/react';
import App from './App';
import { API_CLIENT } from './api_client';
import { u } from './models/piece_shorthand';
import { c } from './models/cell_shorthand';
jest.mock('./api_client')

beforeEach(() => API_CLIENT.resetBoard())

test('renders app', () => {
  const { getByText, getByTestId } = render(<App />);

  expect(getByText(/New Game/i)).toBeInTheDocument();

  expect(getByText(/turn: white/i)).toBeInTheDocument()

  fireEvent.click(getByTestId("Choose White"))
  expectToHavePiece(getByTestId('a1'), 'white rook')
  expectToHaveNoPiece(getByTestId('e5'))
});

test('fastest checkmate from whites perspective', () => {
  const { queryByText, getByText, getByTestId } = render(<App />);
  const movePiece = createMovePiece(getByTestId)

  fireEvent.click(getByTestId("Choose White"))

  expect(queryByText(/turn: white/i)).toBeInTheDocument()
  movePiece('f2', 'white pawn', 'f4')
  expect(queryByText(/undo/i)).toBeInTheDocument()

  expect(queryByText(/turn: black/i)).toBeInTheDocument()
  act(() => {
    API_CLIENT.sendMove({
      type: 'move',
      piece: u('⚫♟'),
      moveFrom: c('e7'),
      moveTo: c('e5')
    })
  })
  expect(queryByText(/undo/i)).not.toBeInTheDocument()

  expect(queryByText(/turn: white/i)).toBeInTheDocument()
  movePiece('g2', 'white pawn', 'g4')
  expect(queryByText(/undo/i)).toBeInTheDocument()

  expect(queryByText(/turn: black/i)).toBeInTheDocument()
  act(() => {
    API_CLIENT.sendMove({
      type: 'move',
      piece: u('⚫👸'),
      moveFrom: c('d8'),
      moveTo: c('h4')
    })
  })
  expect(queryByText(/undo/i)).not.toBeInTheDocument()

  expect(getByText(/wins!/i)).toHaveTextContent(/black/i)
});


test('fastest checkmate from black perspective', () => {
  const { queryByText, getByText, getByTestId } = render(<App />);
  const movePiece = createMovePiece(getByTestId)

  fireEvent.click(getByTestId("Choose Black"))

  expect(queryByText(/turn: white/i)).toBeInTheDocument()
  act(() => {
    API_CLIENT.sendMove({
      type: 'move',
      piece: u('⚪♟'),
      moveFrom: c('f2'),
      moveTo: c('f4')
    })
  })
  expect(queryByText(/undo/i)).not.toBeInTheDocument()

  expect(queryByText(/turn: black/i)).toBeInTheDocument()
  movePiece('e7', 'black pawn', 'e5')
  expect(queryByText(/undo/i)).toBeInTheDocument()

  expect(queryByText(/turn: white/i)).toBeInTheDocument()
  act(() => {
    API_CLIENT.sendMove({
      type: 'move',
      piece: u('⚪♟'),
      moveFrom: c('g2'),
      moveTo: c('g4')
    })
  })
  expect(queryByText(/undo/i)).not.toBeInTheDocument()

  expect(queryByText(/turn: black/i)).toBeInTheDocument()
  movePiece('d8', 'black queen', 'h4')
  expect(queryByText(/undo/i)).toBeInTheDocument()

  expect(getByText(/wins!/i)).toHaveTextContent(/black/i)

  expectToHavePiece(getByTestId('h4'), 'black queen')
  expectToHaveNoPiece(getByTestId('d8'))

  fireEvent.click(getByText(/undo/i))

  expectToHaveNoPiece(getByTestId('h4'))
  expectToHavePiece(getByTestId('d8'), 'black queen')

  expect(queryByText(/turn: black/i)).toBeInTheDocument()
});


test('resume from API', () => {
  const { getByText, getByTestId, unmount } = render(<App />);
  fireEvent.click(getByTestId("Choose White"))

  const movePiece = createMovePiece(getByTestId)

  expect(getByText(/turn: white/i)).toBeInTheDocument()
  movePiece('f2', 'white pawn', 'f4')

  expect(getByText(/turn: black/i)).toBeInTheDocument()
  act(() => {
    API_CLIENT.sendMove({
      type: 'move',
      piece: u('⚫♟'),
      moveFrom: c('e7'),
      moveTo: c('e5')
    })
  })

  unmount()

  const { getByTestId: getByTestId1, unmount: unmount1 } = render(<App />);
  fireEvent.click(getByTestId("Choose White"))

  expectToHavePiece(getByTestId1('f4'), 'white pawn')
  expectToHavePiece(getByTestId1('e5'), 'black pawn')
  unmount1()

  act(() => {
    API_CLIENT.resetBoard()
  })

  const { getByTestId: getByTestId2 } = render(<App />);
  fireEvent.click(getByTestId("Choose White"))

  expectToHaveNoPiece(getByTestId2('f4'))
  expectToHaveNoPiece(getByTestId2('e5'))
});

test('redo', () => {
  const { queryByText, getByText, getByTestId, asFragment } = render(<App />);
  fireEvent.click(getByTestId("Choose Black"))

  const movePiece = createMovePiece(getByTestId)

  expect(getByText(/turn: white/i)).toBeInTheDocument()
  act(() => {
    API_CLIENT.sendMove({
      type: 'move',
      piece: u('⚪♟'),
      moveFrom: c('f2'),
      moveTo: c('f4')
    })
  })

  expect(getByText(/turn: black/i)).toBeInTheDocument()
  movePiece('e7', 'black pawn', 'e5')

  expect(queryByText(/redo/i)).not.toBeInTheDocument()

  fireEvent.click(getByText(/undo/i))
  expectToHaveNoPiece(getByTestId('e5'))

  fireEvent.click(getByText(/redo/i))
  expectToHavePiece(getByTestId('e5'), 'black pawn')
})

test('undo after resume', () => {
  const { getByText, getByTestId, unmount } = render(<App />);
  const movePiece = createMovePiece(getByTestId)

  fireEvent.click(getByTestId("Choose White"))

  expect(getByText(/turn: white/i)).toBeInTheDocument()
  movePiece('f2', 'white pawn', 'f4')

  expect(getByText(/turn: black/i)).toBeInTheDocument()
  act(() => {
    API_CLIENT.sendMove({
      type: 'move',
      piece: u('⚫♟'),
      moveFrom: c('e7'),
      moveTo: c('e5')
    })
  })
  
  unmount()

  const { getByText: getByText1, getByTestId: getByTestId1 } = render(<App />);
  fireEvent.click(getByTestId("Choose Black"))

  expectToHavePiece(getByTestId1('f4'), 'white pawn')
  expectToHavePiece(getByTestId1('e5'), 'black pawn')

  fireEvent.click(getByText1(/undo/i))

  expectToHavePiece(getByTestId1('f4'), 'white pawn')
  expectToHaveNoPiece(getByTestId1('e5'))
})

test('new game resets', () => {
  const { getByText, getByTestId, asFragment } = render(<App />);
  const initialRender = asFragment()

  const movePiece = createMovePiece(getByTestId)

  fireEvent.click(getByTestId("Choose White"))

  expect(getByText(/turn: white/i)).toBeInTheDocument()
  movePiece('f2', 'white pawn', 'f4')

  expect(getByText(/turn: black/i)).toBeInTheDocument()
  act(() => {
    API_CLIENT.sendMove({
      type: 'move',
      piece: u('⚫♟'),
      moveFrom: c('e7'),
      moveTo: c('e5')
    })
  })

  expectToHavePiece(getByTestId('f4'), 'white pawn')
  expectToHavePiece(getByTestId('e5'), 'black pawn')

  fireEvent.click(getByText(/new game/i))

  expect(initialRender).toMatchSnapshot(asFragment())
  expectToHaveNoPiece(getByTestId('f4'))
  expectToHaveNoPiece(getByTestId('e5'))
})

test('new game resets when initial mount resumed game', () => {
  const { getByText, getByTestId, unmount } = render(<App />);
  const movePiece = createMovePiece(getByTestId)

  fireEvent.click(getByTestId("Choose White"))

  expect(getByText(/turn: white/i)).toBeInTheDocument()
  movePiece('f2', 'white pawn', 'f4')

  expect(getByText(/turn: black/i)).toBeInTheDocument()
  act(() => {
    API_CLIENT.sendMove({
      type: 'move',
      piece: u('⚫♟'),
      moveFrom: c('e7'),
      moveTo: c('e5')
    })
  })

  expectToHavePiece(getByTestId('f4'), 'white pawn')
  expectToHavePiece(getByTestId('e5'), 'black pawn')

  unmount()

  const { getByText: getByText1, getByTestId: getByTestId1 } = render(<App />);

  fireEvent.click(getByTestId("Choose White"))

  expectToHavePiece(getByTestId1('f4'), 'white pawn')
  expectToHavePiece(getByTestId1('e5'), 'black pawn')

  fireEvent.click(getByText1(/new game/i))

  expectToHaveNoPiece(getByTestId1('f4'))
  expectToHaveNoPiece(getByTestId1('e5'))
})

const createMovePiece = (getByTestId: (text: Matcher) => HTMLElement) => (from: string, piece: string, to: string) => {
  expectToHavePiece(getByTestId(from), piece)

  fireEvent.click(getByTestId(from))
  fireEvent.click(getByTestId(to))

  expectToHaveNoPiece(getByTestId(from))
  expectToHavePiece(getByTestId(to), piece)
}

const expectToHaveNoPiece = (cell: HTMLElement) => expect(cell.childElementCount).toBe(0)
const expectToHavePiece = (cell: HTMLElement, piece: string) =>
  expect(cell.firstChild).toHaveAttribute('alt', piece)