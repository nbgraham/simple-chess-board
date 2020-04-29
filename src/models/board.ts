import { PieceType, TPiece, Piece } from './piece';
import { Cell, Vector } from './cell';
import { betweenInclusive, rangeInclusive, rangeAscendingExclusive, arraysContainSameItems } from '../utils';
import { useReducer } from 'react';

const SESSION_STORAGE_BOARD_KEY = 'chess-board';

export type BoardColor = 'black' | 'white';
export type BoardPieces = (TPiece | undefined)[][];
type BoardMove = {
  type: 'move'
  locationToMoveFrom: Cell;
  locationToMoveTo: Cell;
  description?: string;
}| {
  type: 'promote_pawn',
  location: Cell;
  promotedPiece: TPiece;
  description?: string;
};

export type BoardReducerAction = BoardMove | {
  type: 'reset'
};

type PieceAtCell = {
  cell: Cell;
  piece: TPiece
}

function otherColor(color: BoardColor) {
  return color === 'black' ? 'white' : 'black';
}

export class Board {
  private static WHITE_PAWN_START_ROW_INDEX = 6;
  private static BLACK_PAWN_START_ROW_INDEX = 1;
  private static N_ROWS = 8;
  private static N_COLS = 8;

  pieces: BoardPieces;
  currentTurn: BoardColor;
  winner?: BoardColor;

  completedMoves = [] as BoardMove[];

  whiteScore = 0;
  piecesCapturedByWhite = [] as TPiece[];

  blackScore = 0;
  piecesCapturedByBlack = [] as TPiece[];

  constructor(pieces: BoardPieces = initialBoardPieces, currentTurn: BoardColor = 'white') {
    this.pieces = pieces;
    this.currentTurn = currentTurn;
  }

  toBuilder() {
    return new BoardBuilder(this);
  }

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

  pieceAtCell(cell: Cell) {
    return this.pieces[cell.rowIndex][cell.columnIndex];
  }

  isCellOnBoard(cell: Cell) {
    return betweenInclusive(0, cell.rowIndex, Board.N_ROWS - 1) && betweenInclusive(0, cell.columnIndex, Board.N_COLS - 1);
  }

  getCellColor(cell: Cell) {
    return ((cell.columnIndex + cell.rowIndex) % 2 === 0) ? 'black' : 'white';
  }

  getAvailablePlacesToMoveFrom(selectedCell: Cell): Cell[] {
    return this._getAvailablePlacesToMoveFrom(selectedCell)
      .filter(Board.distinctCell);
  }

  private static distinctCell(currentCell: Cell, index: number, list: Cell[]) {
    return list.findIndex(cell => cell.equals(currentCell)) === index;
  }

  private _getAvailablePlacesToMoveFrom(selectedCell: Cell): Cell[] {
    const selectedPiece = this.pieceAtCell(selectedCell);
    if (selectedPiece) {
      const pieceAtCell = { piece: selectedPiece, cell: selectedCell };
      switch (selectedPiece.type) {
        case 'pawn':
          return this.getAvailableMovesForPawn(pieceAtCell);
        case 'rook':
          return this.getAvailableMovesForRook(pieceAtCell);
        case 'bishop':
          return this.getAvailableMovesForBishop(pieceAtCell);
        case 'knight':
          return this.getAvailableMovesForKnight(pieceAtCell);
        case 'queen':
          return this.getAvailableMovesForQueen(pieceAtCell);
        case 'king':
          return this.getAvailableMovesForKing(pieceAtCell);
        default:
          return [];
      }
    } else {
      return [];
    }
  }

  private getAvailableMovesForPawn(selectedPieceAtCell: PieceAtCell) {
    const vectorSet = this.getAvailableVectorSetForPawn(selectedPieceAtCell);
    return [
      ...this.getAvailableMovesFromVectorSet(selectedPieceAtCell, vectorSet),
      ...this.getCaptureMovesForPawn(selectedPieceAtCell)
    ]
  }

  private getCaptureMovesForPawn(selectedPieceAtCell: PieceAtCell) {
    if (!selectedPieceAtCell.piece) {
      return [];
    }

    const directionOfMovement = selectedPieceAtCell.piece.color === 'white' ? -1 : 1;

    let result: Cell[] = [];
    for (const vector of [[directionOfMovement, 1], [directionOfMovement, -1]] as Vector[]) {
      const potentialCell = selectedPieceAtCell.cell.addVector(vector);
      const pieceAtPotentialCell = this.pieceAtCell(potentialCell);
      if (pieceAtPotentialCell && pieceAtPotentialCell.color !== selectedPieceAtCell.piece.color) {
        result.push(potentialCell);
      }
    }

    return result;
  }

  private getAvailableVectorSetForPawn(selectedPieceAtCell: PieceAtCell): Vector[] {
    switch (selectedPieceAtCell.piece?.color) {
      case 'white':
        return selectedPieceAtCell.cell.rowIndex === Board.WHITE_PAWN_START_ROW_INDEX ? [[-2, 0], [-1, 0]] : [[-1, 0]];
      case 'black':
        return selectedPieceAtCell.cell.rowIndex === Board.BLACK_PAWN_START_ROW_INDEX ? [[2, 0], [1, 0]] : [[1, 0]];
      default:
        return [];
    }
  }

  private getAvailableMovesForRook(selectedPieceAtCell: PieceAtCell) {
    const rooksKing = this.findPiece(Piece.create('king', selectedPieceAtCell.piece.color))
    const canCastle = rooksKing
      && !selectedPieceAtCell.piece.hasBeenMoved && !rooksKing.piece.hasBeenMoved
      && this.noPiecesBetweenExclusive(selectedPieceAtCell.cell, rooksKing.cell);
    const castleMoves = (rooksKing && canCastle) ? [rooksKing.cell] : []

    return [...castleMoves, ...this.getAvailableMovesAlongVectors(selectedPieceAtCell, [[0, 1], [0, -1], [1, 0], [-1, 0]])];
  }

  private noPiecesBetweenExclusive(cellA: Cell, cellB: Cell) {
    try {
      return this.getCellsBetweenExclusive(cellA, cellB)
        .every(cell => !this.pieceAtCell(cell));
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private getCellsBetweenExclusive(cellA: Cell, cellB: Cell) {
    if (cellA.rowIndex === cellB.rowIndex) {
      const rowIndex = cellA.rowIndex;
      return rangeAscendingExclusive(cellA.columnIndex, cellB.columnIndex)
        .map(columnIndex => new Cell(rowIndex, columnIndex));
    } else if (cellA.columnIndex === cellB.columnIndex) {
      const columnIndex = cellA.columnIndex;
      return rangeAscendingExclusive(cellA.rowIndex, cellB.rowIndex)
        .map(rowIndex => new Cell(rowIndex, columnIndex));
    } else {
      throw new Error('Can only compute cells between for cells that are a straight grid line away from each other');
    }

  }

  private findPiece(piece: TPiece): PieceAtCell | undefined {
    for (const rowIndex of rangeInclusive(0, this.pieces.length)) {
      for (const columnIndex of rangeInclusive(0, this.pieces[rowIndex].length)) {
        const curPiece = this.pieces[rowIndex][columnIndex];
        if (curPiece && Piece.equals(piece, curPiece)) {
          return {
            piece: curPiece,
            cell: new Cell(rowIndex, columnIndex)
          }
        }
      }
    }
  }

  private getAvailableMovesForBishop(selectedPieceAtCell: PieceAtCell) {
    return this.getAvailableMovesAlongVectors(selectedPieceAtCell, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
  }

  private getAvailableMovesForQueen(selectedPieceAtCell: PieceAtCell) {
    return this.getAvailableMovesAlongVectors(selectedPieceAtCell, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
  }

  private getAvailableMovesForKnight(selectedPieceAtCell: PieceAtCell) {
    return this.getAvailableMovesFromVectorSet(selectedPieceAtCell, [[2, 1], [-2, 1], [2, -1], [-2, -1], [1, 2], [-1, 2], [1, -2], [-1, -2]]);
  }

  private getAvailableMovesForKing(selectedPieceAtCell: PieceAtCell) {
    const castleMoves = this.getAvailableCastleMovesForKing(selectedPieceAtCell);

    return [...castleMoves, ...this.getAvailableMovesFromVectorSet(selectedPieceAtCell, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]])];
  }

  private getAvailableCastleMovesForKing(selectedPieceAtCell: PieceAtCell) {
    try {
      const kingsRook = this.findPiece(Piece.create('rook', selectedPieceAtCell.piece.color))
      const canCastle = kingsRook
        && !selectedPieceAtCell.piece.hasBeenMoved && !kingsRook.piece.hasBeenMoved
        && this.noPiecesBetweenExclusive(selectedPieceAtCell.cell, kingsRook.cell);
      const castleMoves = (kingsRook && canCastle) ? [kingsRook.cell] : [];
      return castleMoves;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  private getAvailableMovesAlongVectors(selectedPieceAtCell: PieceAtCell, vectors: Vector[]) {
    return vectors.reduce(
      (accumulatedMoves, currentVector) => [...accumulatedMoves, ...this.getAvailableMovesAlongVector(selectedPieceAtCell, currentVector)],
      [] as Cell[]
    );
  }

  private getAvailableMovesAlongVector(selectedPieceAtCell: PieceAtCell, vector: Vector) {
    let result: Cell[] = [];

    let currentCell = selectedPieceAtCell.cell;
    while (true) {
      currentCell = currentCell.addVector(vector);
      if (!this.isCellOnBoard(currentCell)) {
        break;
      }
      const pieceAtCurrentCell = this.pieceAtCell(currentCell);
      if (pieceAtCurrentCell) {
        if (pieceAtCurrentCell.color !== selectedPieceAtCell.piece?.color) {
          result.push(currentCell);
        }
        break;
      }
      result.push(currentCell);
    }

    return result;
  }

  private getAvailableMovesFromVectorSet(selectedPieceAtCell: PieceAtCell, vectorSet: Vector[]) {
    let result: Cell[] = [];

    for (const vector of vectorSet) {
      const currentCell = selectedPieceAtCell.cell.addVector(vector);
      if (this.isCellOnBoard(currentCell) && this.pieceAtCell(currentCell)?.color !== selectedPieceAtCell.piece?.color) {
        result.push(currentCell);
      }
    }

    return result;
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

  modifyPieceAtCell(cell: Cell, piece?: TPiece) {
    this.pieces = this.pieces.map((row, rowI) => rowI !== cell.rowIndex ? row :
      row.map((col, colI) => colI !== cell.columnIndex ? col :
        piece && {
          ...piece,
          hasBeenMoved: true,
        }
      )
    );
    return this;
  }

  capturePiece(piece?: TPiece) {
    if (piece) {
      if (piece.color === this.currentTurn) {
        throw new Error(`Attempted to capture a piece of your own color`);
      }
      if (this.currentTurn === 'black') {
        this.blackScore += Piece.getRelativeValue(piece);
        this.piecesCapturedByBlack = [...this.piecesCapturedByBlack, piece];
        if (piece.type === 'king') {
          this.winner = 'black'
        }
      } else if (this.currentTurn === 'white') {
        this.whiteScore += Piece.getRelativeValue(piece);
        this.piecesCapturedByWhite = [...this.piecesCapturedByWhite, piece];
        if (piece.type === 'king') {
          this.winner = 'white'
        }
      }
    }

    return this;
  }

  switchTurns() {
    this.currentTurn = otherColor(this.currentTurn);
    return this;
  }

  recordMove(move: BoardMove) {
    this.completedMoves = [...this.completedMoves, move];
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