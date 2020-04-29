import { boardReducer } from '../reducers/board_reducer';
import { AvailableMovesService } from '../services/available_moves';
import { flattenArray } from '../utils/array_utils';
import { Cell } from './cell';
import { isCaptureOfKingOfColor, ChessMove } from './chess_move';
import { Piece, TPiece } from './piece';
import { LETTERS_FOR_COLUMNS } from '../constants';
import { betweenInclusive } from '../utils/range_utils';
import { startingPosition } from './arrangements';
import { boardToShorthand } from './piece_shorthand';

export type BoardColor = 'black' | 'white';
export type BoardPieces = (TPiece | undefined | null)[][];
export type BoardAvailableMoves = (ChessMove[])[][]

export type PieceAtCell = {
  cell: Cell;
  piece: TPiece
}

export const otherColor = (color: BoardColor): BoardColor => color === 'black' ? 'white' : 'black';
export const getLabelForRow = (rowIndex: number) => Board.N_ROWS - rowIndex
export const getLabelForColumn = (columnIndex: number) => LETTERS_FOR_COLUMNS[columnIndex]

export class Board {
  static N_ROWS = 8;
  static N_COLS = 8;
  static WHITE_PAWN_START_ROW_INDEX = 6;
  static BLACK_PAWN_START_ROW_INDEX = 1;

  pieces: BoardPieces;
  currentTurn: BoardColor;
  winner?: BoardColor;
  lastMovedPiece?: PieceAtCell;
  availableMoves: BoardAvailableMoves = []

  whiteScore = 0;
  piecesCapturedByWhite = [] as TPiece[];

  blackScore = 0;
  piecesCapturedByBlack = [] as TPiece[];

  static fromJSON(jsonBoard: string) {
    const boardFromJson = JSON.parse(jsonBoard);
    const newBoard = new Board();
    Object.assign(newBoard, boardFromJson);
    return newBoard;
  }

  static isCellOnBoard(cell: Cell) {
    return betweenInclusive(0, cell.rowIndex, Board.N_ROWS - 1) &&
      betweenInclusive(0, cell.columnIndex, Board.N_COLS - 1);
  }

  static isCellAlongFarRowForColor(cell: Cell, color: BoardColor) {
    if (color === 'black') {
      return cell.rowIndex === Board.N_ROWS - 1;
    } else if (color === 'white') {
      return cell.rowIndex === 0;
    } else {
      return false;
    }
  }

  static getCellColor(cell: Cell): BoardColor {
    return ((cell.columnIndex + cell.rowIndex) % 2 === 0) ? 'black' : 'white';
  }

  constructor(pieces: BoardPieces = startingPosition, currentTurn: BoardColor = 'white') {
    this.pieces = pieces;
    const hasAllRowsOfPieces = this.pieces.length === Board.N_ROWS;
    const hasAllColumnsOfPieces = this.pieces.every(row => row.length === Board.N_COLS)
    if (!(hasAllRowsOfPieces && hasAllColumnsOfPieces)) {
      throw new Error(`Supplied board pieces did not fit ${Board.N_ROWS}x${Board.N_COLS} board. Columns: ${this.pieces.map(row => row.length)}`)
    }
    this.currentTurn = currentTurn;

    const whitePieces = this.getAllPieceLocations('white');
    const blackPieces = this.getAllPieceLocations('black');
    if (whitePieces.length > 16) {
      throw new Error('Cannot create a board with more than 16 white pieces')
    }
    if (blackPieces.length > 16) {
      throw new Error('Cannot create a board with more than 16 black pieces')
    }
  }

  toBuilder() {
    return new BoardBuilder(this);
  }

  getPiece(cell: Cell) {
    return Board.isCellOnBoard(cell) ? this.pieces[cell.rowIndex][cell.columnIndex] : undefined;
  }

  getAllPieceLocations(color?: BoardColor): PieceAtCell[] {
    const allPiecesWithLocations = this.pieces.map(
      (row, rowIndex) => row.map(
        (piece, columnIndex) => ({ piece, cell: { rowIndex, columnIndex } } as PieceAtCell)
      )
    );
    const allPlacesThatHavePieces = flattenArray(allPiecesWithLocations)
      .filter(pieceAtCell => !!pieceAtCell.piece && (color === undefined || pieceAtCell.piece.color === color));
    return allPlacesThatHavePieces;
  }

  colorWhoJustMovedIsInCheck() {
    const colorWhoJustMoved = otherColor(this.currentTurn);
    return this.isInCheck(colorWhoJustMoved);
  }

  isInCheck(color: BoardColor) {
    const allOpposingMoves = this.getAllAvailableMovesForColor(otherColor(color));
    return allOpposingMoves.some(isCaptureOfKingOfColor(color));
  }

  getColorThatIsInCheckMate(): BoardColor | undefined {
    const colorToTest = this.currentTurn;
    if (this.isInCheck(colorToTest)) {
      const allMovesForColor = this.getAllAvailableMovesForColor(colorToTest);
      const allMovesResultInCheck = allMovesForColor.every(potentialMove => {
        const boardAfterPotentialMove = boardReducer(this, { ...potentialMove, skipWinnerComputation: true });
        return boardAfterPotentialMove.isInCheck(colorToTest)
      })
      if (allMovesResultInCheck) {
        return colorToTest;
      }
    }
    return undefined;
  }

  private getAllAvailableMovesForColor(color: BoardColor) {
    const piecesForColor = this.getAllPieceLocations(color);
    const availableMovesService = new AvailableMovesService(this);
    const allMovesForColor = flattenArray(piecesForColor.map(piece => availableMovesService.getAvailablePlacesToMoveFrom(piece.cell)));
    return allMovesForColor;
  }

  asShorthand() {
    return boardToShorthand(this.pieces);
  }

}


class BoardBuilder extends Board {
  constructor(board: Board) {
    super();
    Object.assign(this, board);
  }

  toBoard() {
    const board = new Board();
    Object.assign(board, this);
    return board;
  }

  setPieceOnCell(cell: Cell, newPiece?: TPiece | null) {
    this.pieces = this.pieces.map((row, rowI) => rowI !== cell.rowIndex ? row :
      row.map((col, colI) => colI !== cell.columnIndex ? col :
        newPiece && {
          ...newPiece,
          hasBeenMoved: true,
        }
      )
    );
    if (newPiece) {
      this.lastMovedPiece = { piece: newPiece, cell}
    }
    return this;
  }

  capturePiece(piece?: TPiece | null) {
    if (piece) {
      if (piece.color === this.currentTurn) {
        throw new Error(`Cannot capture a piece of the same color: ${this.currentTurn} attempted to capture a ${piece.color} piece`);
      }

      return this
        .addToCapturedPieces(this.currentTurn, piece)
        .addToScore(this.currentTurn, Piece.getRelativeValue(piece));
    }

    return this;
  }

  checkAndSetWinner({skip}: Partial<{skip: boolean}>) {
    if (!skip) {
      this.winner = this.getWinner();
    }
    return this;
  }

  setAvailableMoves() {
    const availableMovesService = new AvailableMovesService(this);
    this.availableMoves = availableMovesService.getAllAvailableMoves()
    return this;
  }

  private getWinner() {
    if (this.hasCapturedOpposingKing('white')) {
      return 'white'
    } else if (this.hasCapturedOpposingKing('black')) {
      return 'black'
    } else {
      const colorThatIsInCheckMate = this.getColorThatIsInCheckMate();
      if (colorThatIsInCheckMate) {
        return otherColor(colorThatIsInCheckMate)
      }
    }
  }

  private hasCapturedOpposingKing(capturingColor: BoardColor) {
    const capturedPieces = capturingColor === 'white' ? this.piecesCapturedByWhite : this.piecesCapturedByBlack;
    return capturedPieces.some(piece => piece.type === 'king' && piece.color === otherColor(capturingColor));
  }

  uncapturePiece(piece?: TPiece) {
    if (piece) {
      if (piece.color === this.currentTurn) {
        throw new Error(`Cannot capture a piece of the same color: ${this.currentTurn} attempted to capture a ${piece.color} piece`);
      }

      this.addToScore(this.currentTurn, -1 * Piece.getRelativeValue(piece));
      this.removeFromCapturedPieces(this.currentTurn, piece);

      if (piece.type === 'king') {
        this.winner = undefined;
      }
    }

    return this;
  }

  addToScore(scoreToChange: BoardColor, amountToChangeScoreBy: number) {
    if (scoreToChange === 'black') {
      this.blackScore += amountToChangeScoreBy;
    } else if (scoreToChange === 'white') {
      this.whiteScore += amountToChangeScoreBy;
    }
    return this;
  }

  addToCapturedPieces(capturer: BoardColor, capturedPiece: TPiece) {
    if (capturer === 'black') {
      this.piecesCapturedByBlack = [...this.piecesCapturedByBlack, capturedPiece];
    } else if (capturer === 'white') {
      this.piecesCapturedByWhite = [...this.piecesCapturedByWhite, capturedPiece];
    }
    return this;
  }

  removeFromCapturedPieces(capturer: BoardColor, uncapturedPiece: TPiece) {
    if (capturer === 'black') {
      this.piecesCapturedByBlack = this.piecesCapturedByBlack.filter(p => !Piece.equals(p, uncapturedPiece));
    } else if (capturer === 'white') {
      this.piecesCapturedByWhite = this.piecesCapturedByWhite.filter(p => !Piece.equals(p, uncapturedPiece));
    }
    return this;
  }

  switchTurns() {
    this.currentTurn = otherColor(this.currentTurn);
    return this;
  }
}
