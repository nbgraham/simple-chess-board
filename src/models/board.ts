import { immerable } from "immer"
import { Cell } from './cell';
import { Piece } from './piece';
import { boardToShorthand } from './piece_shorthand';
import { BoardPieces, BoardColor, PieceAtCell, BoardUtils } from '../utils/board_utils';
import { flattenArray } from '../utils/array_utils';

const startingPieces: BoardPieces = [[{ "color": "black", "type": "rook", "hasBeenMoved": false }, { "color": "black", "type": "knight", "hasBeenMoved": false }, { "color": "black", "type": "bishop", "hasBeenMoved": false }, { "color": "black", "type": "queen", "hasBeenMoved": false }, { "color": "black", "type": "king", "hasBeenMoved": false }, { "color": "black", "type": "bishop", "hasBeenMoved": false }, { "color": "black", "type": "knight", "hasBeenMoved": false }, { "color": "black", "type": "rook", "hasBeenMoved": false }], [{ "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [{ "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }], [{ "color": "white", "type": "rook", "hasBeenMoved": false }, { "color": "white", "type": "knight", "hasBeenMoved": false }, { "color": "white", "type": "bishop", "hasBeenMoved": false }, { "color": "white", "type": "queen", "hasBeenMoved": false }, { "color": "white", "type": "king", "hasBeenMoved": false }, { "color": "white", "type": "bishop", "hasBeenMoved": false }, { "color": "white", "type": "knight", "hasBeenMoved": false }, { "color": "white", "type": "rook", "hasBeenMoved": false }]];

export class Board {
  [immerable] = true

  pieces: BoardPieces = startingPieces;
  currentTurn: BoardColor = 'white';

  lastMovedPiece?: PieceAtCell;

  whiteScore: number = 0;
  piecesCapturedByWhite: Piece[] = [];

  blackScore: number = 0;
  piecesCapturedByBlack: Piece[] = [];

  constructor(pieces = startingPieces, currentTurn: BoardColor = 'white') {
    this.pieces = pieces;
    this.currentTurn = currentTurn;
  }

  static getPiece(boardDto: Board, cell: Cell) {
    try {
      return boardDto.pieces[cell.rowIndex][cell.columnIndex]
    } catch (error) {
      console.warn('Tried to get piece for a cell that does not exist on this board', error)
      return undefined;
    }
  }

  static asShorthand(boardDto: Board) {
    return boardToShorthand(boardDto.pieces);
  }

  static getAllPieceLocations(board: Board, color?: BoardColor): PieceAtCell[] {
    const allPiecesWithLocations = board.pieces.map(
      (row, rowIndex) => row.map(
        (piece, columnIndex) => ({ piece, cell: { rowIndex, columnIndex } } as PieceAtCell)
      )
    );
    const allPlacesThatHavePieces = flattenArray(allPiecesWithLocations)
      .filter(pieceAtCell => !!pieceAtCell.piece && (color === undefined || pieceAtCell.piece.color === color));
    return allPlacesThatHavePieces;
  }

  asShorthand() {
    return boardToShorthand(this.pieces);
  }

}

export const startingBoard = new Board()

export const BoardDtoMutations = {

  setPieceOnCell: (board: Board, cell: Cell, newPiece?: Piece | null) => {
    const newPieceForCell = newPiece ? {
      ...newPiece,
      hasBeenMoved: true,
    } : null
    board.pieces[cell.rowIndex][cell.columnIndex] = newPieceForCell
    if (newPiece) {
      board.lastMovedPiece = { piece: newPiece, cell }
    }
  },

  capturePiece: (board: Board, piece?: Piece | null) => {
    if (piece) {
      if (piece.color === board.currentTurn) {
        throw new Error(`Cannot capture a piece of the same color: ${board.currentTurn} attempted to capture a ${piece.color} piece`);
      }

      if (board.currentTurn === 'black') {
        board.blackScore += Piece.getRelativeValue(piece);
        board.piecesCapturedByBlack.push(piece)
      } else if (board.currentTurn === 'white') {
        board.whiteScore += Piece.getRelativeValue(piece);
        board.piecesCapturedByWhite.push(piece)
      }

    }
  },

  switchTurns: (board: Board) => {
    board.currentTurn = BoardUtils.otherColor(board.currentTurn);
  }

}
