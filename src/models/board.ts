import { ChessMoveAction, PromotePawnAction, boardReducer } from '../reducers/board_reducer';
import { AvailableMovesService } from '../services/available_moves';
import { flattenArray, arraysContainSameItems } from '../utils/array_utils';
import { Cell } from './cell';
import { isCaptureOfKingOfColor } from './chess_move';
import { Piece, TPiece, PieceType } from './piece';
import { LETTERS_FOR_COLUMNS, SESSION_STORAGE_BOARD_KEY } from '../constants';
import { betweenInclusive } from '../utils/range_utils';
import { startingPosition } from './arrangements';
import { useReducer } from 'react';

export type BoardColor = 'black' | 'white';
export type BoardPieces = (TPiece | undefined | null)[][];

export type BoardMove = ChessMoveAction | PromotePawnAction;

type PieceAtCell = {
  cell: Cell;
  piece: TPiece
}

export const otherColor = (color: BoardColor): BoardColor => color === 'black' ? 'white' : 'black';
export const getLabelForRow = (rowIndex: number) => Board.N_ROWS - rowIndex
export const getLabelForColumn = (columnIndex: number) => LETTERS_FOR_COLUMNS[columnIndex]

export const getMoveDescription = (move: BoardMove) => {
  if (move.type === 'promote_pawn') {
    const promotedPiece = Piece.create(move.promotedTo, move.pieceColor);
    return `Pawn at ${Cell.toString(move.location)} promoted to a ${Piece.toString(promotedPiece)}`;
  } else if (move.type === 'move') {
    const isCastle = move.chessMoveType === 'castle';
    const pieceToCapture = isCastle ? undefined : move.capturingPiece;

    const currentTurn = move.piece.color;
    return isCastle
      ? `${currentTurn} castles`
      : `${currentTurn} moves ${move.piece.type} from ${Cell.toString(move.moveFrom)} to from ${Cell.toString(move.moveTo)}
          ${pieceToCapture ? ` capturing a ${Piece.toString(pieceToCapture)}` : ''}`;
  }
}

export class Board {
  static N_ROWS = 8;
  static N_COLS = 8;
  static WHITE_PAWN_START_ROW_INDEX = 6;
  static BLACK_PAWN_START_ROW_INDEX = 1;

  pieces: BoardPieces;
  currentTurn: BoardColor;
  winner?: BoardColor;

  completedMoves = [] as BoardMove[];

  whiteScore = 0;
  piecesCapturedByWhite = [] as TPiece[];

  blackScore = 0;
  piecesCapturedByBlack = [] as TPiece[];

  
  static boardReducer(board: Board, move: BoardReducerAction) {
    const nextBoard = Board._boardReducer(board, move);
    sessionStorage.setItem(SESSION_STORAGE_BOARD_KEY, JSON.stringify(nextBoard));
    return nextBoard;
  }

  static _boardReducer(board: Board, move: BoardReducerAction) {
    if (move.type === 'reset') {
      return new Board();
    }

    if (move.type === 'promote_pawn') {
      const description = `Pawn at ${move.location} promoted to a ${Piece.toString(move.promotedPiece)}`;
      return board.toBuilder()
        .modifyPieceAtCell(move.location, move.promotedPiece)
        .recordMove({ ...move, description })
        .toBoard();
    }

    if (move.locationToMoveFrom.equals(move.locationToMoveTo)) {
      throw new Error(`Attempted to move a piece to the place it already is at ${move.locationToMoveFrom}`);
    }
    const currentPieceAtFromLocation = board.pieceAtCell(move.locationToMoveFrom);
    const currentPieceAtToLocation = board.pieceAtCell(move.locationToMoveTo);
    if (!currentPieceAtFromLocation) {
      throw new Error(`Attempted to move a non existent piece at ${move.locationToMoveFrom}`);
    }
    let isCastle = false;
    if (currentPieceAtFromLocation?.color === currentPieceAtToLocation?.color) {
      if (arraysContainSameItems(['rook', 'king'], [currentPieceAtFromLocation.type, currentPieceAtToLocation.type])) {
        isCastle = true;
      } else {
        throw new Error(`Attempted to move a piece at ${move.locationToMoveFrom} onto a piece of the same color at ${move.locationToMoveTo}`)
      }
    }

    const pieceToCapture = isCastle ? undefined : currentPieceAtToLocation;
    const pieceToLeaveBehind = isCastle ? currentPieceAtToLocation : undefined;

    const description = isCastle
      ? `${board.currentTurn} castles`
      : `${board.currentTurn} moves ${currentPieceAtFromLocation.type} from ${move.locationToMoveFrom} to from ${move.locationToMoveTo}
          ${pieceToCapture ? ` capturing a ${Piece.toString(pieceToCapture)}` : ''}`;
    return board.toBuilder()
      .modifyPieceAtCell(move.locationToMoveFrom, pieceToLeaveBehind)
      .capturePiece(pieceToCapture)
      .modifyPieceAtCell(move.locationToMoveTo, currentPieceAtFromLocation)
      .switchTurns()
      .recordMove({ ...move, description })
      .toBoard();
  }
  
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
      throw new Error(`Supplied board pieces did not fit ${Board.N_ROWS}x${Board.N_COLS} board`)
    }
    this.currentTurn = currentTurn;
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
        const boardAfterPotentialMove = boardReducer(this, { type: 'move', ...potentialMove });
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
    return this;
  }

  capturePiece(piece?: TPiece | null) {
    if (piece) {
      if (piece.color === this.currentTurn) {
        throw new Error(`Attempted to capture a piece of your own color`);
      }

      return this
        .addToCapturedPieces(this.currentTurn, piece)
        .addToScore(this.currentTurn, Piece.getRelativeValue(piece));
    }

    return this;
  }

  checkAndSetWinner() {
    this.winner = this.getWinner();
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

  removeMostRecentMove() {
    this.completedMoves = this.completedMoves.slice(0, -1);
    return this;
  }
}

const initialBoardPieces: BoardPieces = [
  (['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'] as PieceType[]).map((type) => Piece.create(type, 'black')),
  (['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'] as PieceType[]).map((type) => Piece.create(type, 'black')),
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
  (['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'] as PieceType[]).map((type) => Piece.create(type, 'white')),
  (['pawn', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'] as PieceType[]).map((type) => Piece.create(type, 'white')),
]

const savedBoardJson = sessionStorage.getItem(SESSION_STORAGE_BOARD_KEY);
const initialBoard: Board = savedBoardJson ? Board.fromJSON(savedBoardJson) : new Board();

export const useBoardReducer = () => useReducer(Board.boardReducer, initialBoard);