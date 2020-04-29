import { Board } from '../models/board';
import { Piece } from '../models/piece';
import { Cell, Vector } from '../models/cell';
import { ChessMove, chessMoveEqual } from '../models/chess_move';
import { assert, checkForErrorType, IllegalMoveError } from '../utils/assert';
import { AvailableMovesService } from '../services/available_moves';

export function boardReducer(previousBoard: Board, action: ChessMove) {
  checkForErrorType(IllegalMoveError.fromAssertionError, () => assertMoveIsAvailable(previousBoard, action))

  switch (action.type) {
    case 'promote_pawn':
      const promotedPiece = Piece.create(action.promotedTo, action.piece.color);
      return previousBoard.toBuilder()
        .setPieceOnCell(action.location, promotedPiece)
        .setAvailableMoves()
        .toBoard();
    case 'castle':
      const rook = previousBoard.getPiece(action.moveTo);
      const king = previousBoard.getPiece(action.moveFrom);

      const [kingLocation, rookLocation] = action.piece.type === 'king' ? [action.moveFrom, action.moveTo] : [action.moveTo, action.moveFrom]

      const { oneStepToward, twoStepsToward } = cellsOneAndTwoMovesFromAtoB(kingLocation, rookLocation)
      return previousBoard.toBuilder()
        .setPieceOnCell(kingLocation, undefined)
        .setPieceOnCell(rookLocation, undefined)
        .setPieceOnCell(twoStepsToward, king)
        .setPieceOnCell(oneStepToward, rook)
        .switchTurns()
        .checkAndSetWinner({skip: action.skipWinnerComputation})
        .setAvailableMoves()
        .toBoard();
    case 'move':
    case 'capture':
      const pieceToMove = previousBoard.getPiece(action.moveFrom);
      const pieceToCapture = action.type === 'capture' ? previousBoard.getPiece(action.moveTo) : undefined;
      const pieceToLeaveBehind = undefined;

      return previousBoard.toBuilder()
        .setPieceOnCell(action.moveFrom, pieceToLeaveBehind)
        .capturePiece(pieceToCapture)
        .setPieceOnCell(action.moveTo, pieceToMove)
        .switchTurns()
        .checkAndSetWinner({skip: action.skipWinnerComputation})
        .setAvailableMoves()
        .toBoard();
    default:
      console.error('Unknown action', JSON.stringify(action));
      return previousBoard;
  }
}

function assertMoveIsAvailable(previousBoard: Board, action: ChessMove) {
  if (action.type === 'promote_pawn') {
    assert(action.location.rowIndex === 0 || action.location.rowIndex === 7, 'Can only promote when at the end of the board', action);
    const pieceActuallyAtBoardLocation = previousBoard.getPiece(action.location)
    assert(Piece.equals(action.piece, pieceActuallyAtBoardLocation), `Piece must match piece on board: ${Piece.toString(pieceActuallyAtBoardLocation)}`, action)
    assert(action.piece.type === 'pawn', 'Can only promote pawns', action);
  } else {
    const availableMovesService = new AvailableMovesService(previousBoard);
    const availableMoves = availableMovesService.getAvailablePlacesToMoveFrom(action.moveFrom);
    assert(availableMoves.some(move => chessMoveEqual(move, action)), 'Action must be available', action)
  }
}

const cellsOneAndTwoMovesFromAtoB = (cellA: Cell, cellB: Cell) => {
  const vectorFromAtoB = Cell.difference(cellB, cellA);
  const normalizedVectorFromAtoB = Vector.normalize(vectorFromAtoB);
  checkForErrorType(IllegalMoveError.fromAssertionError, () =>
    assert(Vector.isDiagonal(normalizedVectorFromAtoB) || Vector.isPerpendicular(normalizedVectorFromAtoB),
      'Cannot move between cells that are not diagonal or perpendicular to each other',
      cellA, cellB, normalizedVectorFromAtoB
    )
  )
  const oneStepToward = Cell.addVector(cellA, normalizedVectorFromAtoB);
  const twoStepsToward = Cell.addVector(oneStepToward, normalizedVectorFromAtoB);
  return { oneStepToward, twoStepsToward }
}