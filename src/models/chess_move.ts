import { Cell } from './cell';
import { Piece, PieceType } from './piece';
import { BoardColor } from '../utils/board_utils';

export type ChessMove = {
  type: 'move' | 'castle'
  piece: Piece
  moveFrom: Cell
  moveTo: Cell
  capturingPiece?: undefined
} | {
  type: 'capture'
  piece: Piece
  moveFrom: Cell
  moveTo: Cell
  capturingPiece: Piece
} | {
  type: 'promote_pawn',
  location: Cell;
  piece: Piece
  promotedTo: PieceType;
  moveFrom?: undefined
  moveTo?: undefined
  capturingPiece?: undefined
}

export const ChessMove = {

  equals: (moveA: ChessMove, moveB: ChessMove) => {
    return moveA.type === moveB.type &&
      Piece.equals(moveA.capturingPiece, moveB.capturingPiece) &&
      Cell.equals(moveA.moveTo, moveB.moveTo) &&
      Cell.equals(moveA.moveFrom, moveB.moveFrom);
  },

  hash: (move: ChessMove) => {
    return `${move.type}_${Piece.hash(move.capturingPiece)}_${Cell.hash(move.moveTo)}_${Cell.hash(move.moveFrom)}}`
  },

  isCaptureOfKingOfColor: (colorOfKingToBeCaptured: BoardColor) => (move: ChessMove) =>
    move.type === 'capture' && move.capturingPiece.type === 'king' && move.capturingPiece.color === colorOfKingToBeCaptured
  ,

  getDescription: (move: ChessMove) => {
    if (move.type === 'promote_pawn') {
      const promotedPiece = Piece.create(move.promotedTo, move.piece.color);
      return `Pawn at ${Cell.toString(move.location)} promoted to a ${Piece.toString(promotedPiece)}`;
    } else {
      const isCastle = move.type === 'castle';
      const pieceToCapture = isCastle ? undefined : move.capturingPiece;

      const currentTurn = move.piece.color;
      return isCastle
        ? `${currentTurn} castles`
        : `${currentTurn} moves ${move.piece.type} from ${Cell.toString(move.moveFrom)} to ${Cell.toString(move.moveTo)}
              ${pieceToCapture ? ` capturing a ${Piece.toString(pieceToCapture)}` : ''}`;
    }
  }
}