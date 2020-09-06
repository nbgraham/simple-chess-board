import produce from "immer";
import { Board, BoardDtoMutations } from '../models/board';
import { Cell, Vector } from '../models/cell';
import { ChessMove } from '../models/chess_move';
import { Piece } from '../models/piece';
import { assert, checkForErrorType, IllegalMoveError } from '../utils/assert';

export const boardReducer = produce((draftBoard: Board, action: ChessMove) => {
  BoardDtoMutations.recordMove(draftBoard, action);

  switch (action.type) {
    case 'promote_pawn':
      const promotedPiece = Piece.create(action.promotedTo, action.piece.color);
      BoardDtoMutations.setPieceOnCell(draftBoard, action.location, promotedPiece)
      break;
    case 'castle':
      const rook = Board.getPiece(draftBoard, action.moveTo);
      const king = Board.getPiece(draftBoard, action.moveFrom);

      const [kingLocation, rookLocation] = action.piece.type === 'king' ? [action.moveFrom, action.moveTo] : [action.moveTo, action.moveFrom]

      const { oneStepToward, twoStepsToward } = cellsOneAndTwoMovesFromAtoB(kingLocation, rookLocation)

      BoardDtoMutations.setPieceOnCell(draftBoard, kingLocation, null)
      BoardDtoMutations.setPieceOnCell(draftBoard, rookLocation, null)
      BoardDtoMutations.setPieceOnCell(draftBoard, twoStepsToward, king)
      BoardDtoMutations.setPieceOnCell(draftBoard, oneStepToward, rook)
      BoardDtoMutations.switchTurns(draftBoard)
      break;
    case 'move':
    case 'capture':
      const pieceToMove = Board.getPiece(draftBoard, action.moveFrom);
      const pieceToCapture = action.type === 'capture' ? Board.getPiece(draftBoard, action.moveTo) : undefined;
      const pieceToLeaveBehind = null;

      BoardDtoMutations.setPieceOnCell(draftBoard, action.moveFrom, pieceToLeaveBehind)
      BoardDtoMutations.capturePiece(draftBoard, pieceToCapture)
      BoardDtoMutations.setPieceOnCell(draftBoard, action.moveTo, pieceToMove)
      BoardDtoMutations.switchTurns(draftBoard)
      break;
    default:
      console.error('Unknown action', JSON.stringify(action));
  }
})

export const cellsOneAndTwoMovesFromAtoB = (cellA: Cell, cellB: Cell) => {
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