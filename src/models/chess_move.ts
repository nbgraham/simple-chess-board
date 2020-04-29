import { Cell } from './cell';
import { TPiece, PieceType, Piece } from './piece';
import { BoardColor } from './board';

export type ChessMove = {
  type: 'move' | 'castle'
  piece: TPiece
  moveFrom: Cell
  moveTo: Cell
  capturingPiece?: undefined
} | {
  type: 'capture'
  piece: TPiece
  moveFrom: Cell
  moveTo: Cell
  capturingPiece: TPiece
} | {
  type: 'promote_pawn',
  location: Cell;
  piece: TPiece
  promotedTo: PieceType;
  moveFrom?: undefined
  moveTo?: undefined
  capturingPiece?: undefined
}

export const chessMoveEqual = (moveA: ChessMove, moveB: ChessMove) => {
  return moveA.type === moveB.type &&
    Piece.equals(moveA.capturingPiece, moveB.capturingPiece) &&
    Cell.equals(moveA.moveTo, moveB.moveTo) &&
    Cell.equals(moveA.moveFrom, moveB.moveFrom);
}

export const isCaptureOfKingOfColor = (colorOfKingToBeCaptured: BoardColor) => (move: ChessMove) =>
  move.type === 'capture' && move.capturingPiece.type === 'king' && move.capturingPiece.color === colorOfKingToBeCaptured

export const getMoveDescription = (move: ChessMove) => {
  if (move.type === 'promote_pawn') {
    const promotedPiece = Piece.create(move.promotedTo, move.piece.color);
    return `Pawn at ${Cell.toString(move.location)} promoted to a ${Piece.toString(promotedPiece)}`;
  } else {
    const isCastle = move.type === 'castle';
    const pieceToCapture = isCastle ? undefined : move.capturingPiece;

    const currentTurn = move.piece.color;
    return isCastle
      ? `${currentTurn} castles`
      : `${currentTurn} moves ${move.piece.type} from ${Cell.toString(move.moveFrom)} to from ${Cell.toString(move.moveTo)}
            ${pieceToCapture ? ` capturing a ${Piece.toString(pieceToCapture)}` : ''}`;
  }
}
