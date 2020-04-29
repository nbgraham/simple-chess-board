import { Cell } from './cell';
import { TPiece } from './piece';
import { BoardColor } from './board';

export type ChessMove = {
  piece: TPiece
  moveFrom: Cell
  moveTo: Cell
  chessMoveType: 'move' | 'castle'
  capturingPiece?: undefined
} | {
  piece: TPiece
  moveFrom: Cell
  moveTo: Cell
  chessMoveType: 'capture'
  capturingPiece: TPiece
}
export const chessMoveEqual = (moveA: ChessMove, moveB: ChessMove) => {
  return Cell.equals(moveA.moveTo, moveB.moveTo) && moveA.chessMoveType === moveB.chessMoveType;
}

export const isCaptureOfKingOfColor = (colorOfKingToBeCaptured: BoardColor) => (move: ChessMove) => 
  move.chessMoveType === 'capture' && move.capturingPiece.type === 'king' && move.capturingPiece.color === colorOfKingToBeCaptured
