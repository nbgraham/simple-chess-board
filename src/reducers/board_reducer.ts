import { Board, BoardColor } from '../models/board';
import { Piece, PieceType } from '../models/piece';
import { Cell } from '../models/cell';
import { ChessMove } from '../models/chess_move';

export type BaseMoveAction = {
  type: 'move'
}
export type ChessMoveAction = BaseMoveAction & ChessMove;
export type PromotePawnAction = {
  type: 'promote_pawn',
  location: Cell;
  pieceColor: BoardColor;
  promotedTo: PieceType;
};
export type BoardReducerAction =  ChessMoveAction | PromotePawnAction;

export function boardReducer(previousBoard: Board, action: BoardReducerAction) {
  switch (action.type) {
    case 'promote_pawn':
      const promotedPiece = Piece.create(action.promotedTo, action.pieceColor);
      return previousBoard.toBuilder()
        .setPieceOnCell(action.location, promotedPiece)
        .toBoard();
    case 'move':
      return moveActionReducer(previousBoard, action);
    default:
      console.error('Unknown action', JSON.stringify(action));
      return previousBoard;
  }
}

function moveActionReducer(previousBoard: Board, action: ChessMoveAction) {
  if (Cell.equals(action.moveFrom, action.moveTo)) {
    throw new Error(`Attempted to move a piece to the place it already is at ${Cell.toString(action.moveFrom)}`);
  }
  const currentPieceAtFromLocation = previousBoard.getPiece(action.moveFrom);
  const currentPieceAtToLocation = previousBoard.getPiece(action.moveTo);
  if (!currentPieceAtFromLocation) {
    throw new Error(`Attempted to move a non existent piece at ${Cell.toString(action.moveFrom)}`);
  }
  if (!Piece.equals(action.piece, currentPieceAtFromLocation)) {
    throw new Error('todo')
  }
  if (!Piece.equals(action.capturingPiece, currentPieceAtToLocation)) {
    throw new Error(`Action piece ${Piece.toString(action.capturingPiece)} does not match current piece at move destination ${Piece.toString(currentPieceAtToLocation)}. ${JSON.stringify(action)}`)
  }
  const isCastle = action.chessMoveType === 'castle';
  if (!isCastle && currentPieceAtFromLocation?.color === currentPieceAtToLocation?.color) {
    throw new Error(`Attempted to move a piece at ${Cell.toString(action.moveFrom)} onto a piece of the same color at ${Cell.toString(action.moveTo)}`)
  }

  const pieceToCapture = isCastle ? undefined : currentPieceAtToLocation;
  const pieceToLeaveBehind = isCastle ? currentPieceAtToLocation : undefined;

  return previousBoard.toBuilder()
    .setPieceOnCell(action.moveFrom, pieceToLeaveBehind)
    .capturePiece(pieceToCapture)
    .setPieceOnCell(action.moveTo, currentPieceAtFromLocation)
    .switchTurns()
    .checkAndSetWinner()
    .toBoard();
}

function boardUnreducer(nextBoard: Board, actionTakenToGetToNextBoard: BoardMove) {
  switch (actionTakenToGetToNextBoard.type) {
    case 'promote_pawn':
      return nextBoard.toBuilder()
        .removeMostRecentMove()
        .setPieceOnCell(actionTakenToGetToNextBoard.location, Piece.create('pawn', actionTakenToGetToNextBoard.pieceColor))
        .toBoard();
    case 'move':
      const pieceLeftAtFromLocation = nextBoard.getPiece(actionTakenToGetToNextBoard.moveFrom);
      const pieceLeftAtToLocation = nextBoard.getPiece(actionTakenToGetToNextBoard.moveTo);
      const pieceToReplaceAtLocationMovedTo =
        actionTakenToGetToNextBoard.chessMoveType === 'castle' ? pieceLeftAtFromLocation :
          actionTakenToGetToNextBoard.chessMoveType === 'capture' ? actionTakenToGetToNextBoard.capturingPiece :
            undefined;
      const pieceToUncapture = actionTakenToGetToNextBoard.chessMoveType === 'capture' ? actionTakenToGetToNextBoard.capturingPiece :
        undefined;

      return nextBoard.toBuilder()
        .removeMostRecentMove()
        .switchTurns()
        .setPieceOnCell(actionTakenToGetToNextBoard.moveTo, pieceToReplaceAtLocationMovedTo)
        .uncapturePiece(pieceToUncapture)
        .setPieceOnCell(actionTakenToGetToNextBoard.moveFrom, pieceLeftAtToLocation)
        .checkAndSetWinner()
        .toBoard();
    default:
      console.error('Could not undo last move', JSON.stringify(actionTakenToGetToNextBoard));
      return nextBoard;
  }
}