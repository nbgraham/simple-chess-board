import { BoardColor } from "../utils/board_utils";

export type PieceType = 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn';
export type Piece = {
  type: PieceType
  color: BoardColor
  hasBeenMoved: boolean;
}

export const Piece = {
  create: (type: PieceType, color: BoardColor) => ({
    type,
    color,
    hasBeenMoved: false
  } as Piece),

  equals: (pieceA?: Piece | null, pieceB?: Piece | null) =>
    (!pieceA && !pieceB) ||
    (!!pieceA && !!pieceB && pieceA.type === pieceB.type && pieceA.color === pieceB.color),

  toString: (piece?: Piece | null) => piece ? `${piece.color} ${piece.type}` : '',

  getRelativeValue: (piece: Piece) => {
    switch (piece.type) {
      case 'pawn':
        return 1;
      case 'knight':
        return 3;
      case 'bishop':
        return 3;
      case 'rook':
        return 5;
      case 'queen':
        return 9;
      default:
        return 0;
    }
  }
}
