import { immerable } from "immer"
import { Cell } from './cell';
import { Piece } from './piece';
import { boardToShorthand } from './piece_shorthand';
import { BoardPieces, BoardColor, PieceAtCell, BoardUtils } from '../utils/board_utils';
import { flattenArray } from '../utils/array_utils';
import { ChessMove } from "./chess_move";

const startingPieces: BoardPieces = [[{ "color": "black", "type": "rook", "hasBeenMoved": false }, { "color": "black", "type": "knight", "hasBeenMoved": false }, { "color": "black", "type": "bishop", "hasBeenMoved": false }, { "color": "black", "type": "queen", "hasBeenMoved": false }, { "color": "black", "type": "king", "hasBeenMoved": false }, { "color": "black", "type": "bishop", "hasBeenMoved": false }, { "color": "black", "type": "knight", "hasBeenMoved": false }, { "color": "black", "type": "rook", "hasBeenMoved": false }], [{ "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [{ "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }], [{ "color": "white", "type": "rook", "hasBeenMoved": false }, { "color": "white", "type": "knight", "hasBeenMoved": false }, { "color": "white", "type": "bishop", "hasBeenMoved": false }, { "color": "white", "type": "queen", "hasBeenMoved": false }, { "color": "white", "type": "king", "hasBeenMoved": false }, { "color": "white", "type": "bishop", "hasBeenMoved": false }, { "color": "white", "type": "knight", "hasBeenMoved": false }, { "color": "white", "type": "rook", "hasBeenMoved": false }]];

export class Board {
  [immerable] = true

  pieces: BoardPieces = startingPieces;
  currentTurn: BoardColor = 'white';

  lastMovedPiece?: PieceAtCell;
  fullMoveCount = 1
  halfMoveCountSinceLastCaptureOrPawnAdvance = 0
  moveHistory = [] as ChessMove[]

  whiteScore: number = 0;
  piecesCapturedByWhite: Piece[] = [];
  whiteKingLocation: Cell | null;

  blackScore: number = 0;
  piecesCapturedByBlack: Piece[] = [];
  blackKingLocation: Cell | null;

  constructor(pieces = startingPieces, currentTurn: BoardColor = 'white') {
    this.pieces = pieces;
    this.currentTurn = currentTurn;
    this.whiteKingLocation = Board.findKing(this, 'white')
    this.blackKingLocation = Board.findKing(this, 'black')
  }

  static getPiece(boardDto: Board, cell: Cell) {
    try {
      return boardDto.pieces[cell.rowIndex][cell.columnIndex]
    } catch (error) {
      console.warn('Tried to get piece for a cell that does not exist on this board', error)
      return undefined;
    }
  }

  static lastMovedPieceIsOnThisCell(boardDto: Board, cell: Cell) {
    return Cell.equals(boardDto.lastMovedPiece?.cell, cell);
  }

  static getKing(boardDto: Board, color: BoardColor): PieceAtCell | null {
    const location = color === 'white' ? boardDto.whiteKingLocation : boardDto.blackKingLocation;
    const king = location && boardDto.pieces[location.rowIndex][location.columnIndex];

    if (location && king) {
      return {
        piece: king,
        cell: location
      }
    }

    return null;
  }

  private static findKing(boardDto: Board, color: BoardColor): Cell | null {
    for (const rowIndex in boardDto.pieces) {
      for (const columnIndex in boardDto.pieces) {
        const piece = boardDto.pieces[rowIndex][columnIndex];
        if (piece?.type === 'king' && piece.color === color) {
          return {
            rowIndex: +rowIndex,
            columnIndex: +columnIndex,
          }
        }
      }
    }
    return null
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
    if (newPiece?.type === 'king') {
      if (newPiece.color === 'white') {
        board.whiteKingLocation = cell;
      } else {
        board.blackKingLocation = cell;
      }
    }
  },

  movePiece: (board: Board, piece: PieceAtCell, newLocation: Cell) => {
    BoardDtoMutations.setPieceOnCell(board, piece.cell, undefined)
    BoardDtoMutations.setPieceOnCell(board, newLocation, piece.piece)
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
  },

  recordMove: (board: Board, move: ChessMove) => {
    board.moveHistory.push(move)

    if (board.currentTurn === 'black') {
      board.fullMoveCount += 1
    }

    if (move.type === 'capture' || (move.type === 'move' && move.piece.type === 'pawn')) {
      board.halfMoveCountSinceLastCaptureOrPawnAdvance = 0
    } else {
      board.halfMoveCountSinceLastCaptureOrPawnAdvance += 1
    }
  }

}
