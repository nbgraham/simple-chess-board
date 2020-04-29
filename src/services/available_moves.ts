import { distinctFilter, flattenArray } from '../utils/array_utils';
import { Board, PieceAtCell } from '../models/board';
import { Cell, Vector } from '../models/cell';
import { TPiece, Piece } from '../models/piece';
import { ChessMove, chessMoveEqual } from '../models/chess_move';

const PERPENDICULAR_VECTORS = [[0, 1], [0, -1], [1, 0], [-1, 0]] as Vector[];
const DIAGONAL_VECTORS = [[1, 1], [1, -1], [-1, 1], [-1, -1]] as Vector[];
const KNIGHTS_VECTOR_SET = [[2, 1], [-2, 1], [2, -1], [-2, -1], [1, 2], [-1, 2], [1, -2], [-1, -2]] as Vector[];

type GetAvailableMovesFromVectorSetOptions = {
  canCapture: true
  canOnlyMoveIfCapturing: boolean
} | {
  canCapture: false
  canOnlyMoveIfCapturing?: false
}
const DefaultGetAvailableMovesFromVectorSetOptions: GetAvailableMovesFromVectorSetOptions = {
  canCapture: true,
  canOnlyMoveIfCapturing: false
}

export class AvailableMovesService {
  board: Board;
  constructor(board: Board) {
    this.board = board;
  }

  getAvailablePlacesToMoveFrom(selectedCell: Cell): ChessMove[] {
    return this._getAvailablePlacesToMoveFrom(selectedCell)
      .filter(distinctFilter(chessMoveEqual));
  }

  private _getAvailablePlacesToMoveFrom(selectedCell: Cell): ChessMove[] {
    const selectedPiece = this.board.getPiece(selectedCell);
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

  private getAvailableMovesForPawn(selectedPieceAtCell: PieceAtCell): ChessMove[] {
    const potentialMoveVectorSet = this.getPotentialMoveVectorSetForPawn(selectedPieceAtCell);
    const potentialCaptureVectorSet = this.getPotentialCaptureVectorsForPawn(selectedPieceAtCell);
    return [
      ...this.getAvailableMovesFromVectorSet(
        selectedPieceAtCell, potentialMoveVectorSet, { canCapture: false }
      ),
      ...this.getAvailableMovesFromVectorSet(
        selectedPieceAtCell, potentialCaptureVectorSet, { canCapture: true, canOnlyMoveIfCapturing: true }
      )
    ]
  }

  private getPotentialCaptureVectorsForPawn(selectedPieceAtCell: PieceAtCell): Vector[] {
    const directionOfMovement = selectedPieceAtCell.piece.color === 'white' ? -1 : 1;
    return [[directionOfMovement, 1], [directionOfMovement, -1]];
  }

  private getPotentialMoveVectorSetForPawn(selectedPieceAtCell: PieceAtCell): Vector[] {
    const directionOfMovement = selectedPieceAtCell.piece.color === 'white' ? -1 : 1;
    const extraJumpIfHasNotBeenMoved: Vector[] = selectedPieceAtCell.piece.hasBeenMoved ? [] : [[2 * directionOfMovement, 0]];
    return [[directionOfMovement, 0], ...extraJumpIfHasNotBeenMoved];
  }

  private getAvailableMovesForRook(selectedPieceAtCell: PieceAtCell): ChessMove[] {
    const castleMoves = this.getAvailableCastleMoves(selectedPieceAtCell, 'rook');
    return [
      ...castleMoves,
      ...this.getAvailableMovesAlongVectors(selectedPieceAtCell, PERPENDICULAR_VECTORS)
    ];
  }

  private getAvailableMovesForBishop(selectedPieceAtCell: PieceAtCell): ChessMove[] {
    return this.getAvailableMovesAlongVectors(selectedPieceAtCell, DIAGONAL_VECTORS);
  }

  private getAvailableMovesForQueen(selectedPieceAtCell: PieceAtCell): ChessMove[] {
    return this.getAvailableMovesAlongVectors(selectedPieceAtCell, [...PERPENDICULAR_VECTORS, ...DIAGONAL_VECTORS]);
  }

  private getAvailableMovesForKnight(selectedPieceAtCell: PieceAtCell): ChessMove[] {
    return this.getAvailableMovesFromVectorSet(selectedPieceAtCell, KNIGHTS_VECTOR_SET);
  }

  private getAvailableMovesForKing(selectedPieceAtCell: PieceAtCell): ChessMove[] {
    const castleMoves = this.getAvailableCastleMoves(selectedPieceAtCell, 'king');
    return [
      ...castleMoves,
      ...this.getAvailableMovesFromVectorSet(selectedPieceAtCell, [...PERPENDICULAR_VECTORS, ...DIAGONAL_VECTORS])
    ];
  }

  private getAvailableCastleMoves(selectedPieceAtCell: PieceAtCell, forType: 'king' | 'rook'): ChessMove[] {
    const searchPieceToCastleWith = Piece.create(forType === 'king' ? 'rook' : 'king', selectedPieceAtCell.piece.color);
    const piecesToCastleWith = this.findPieces(searchPieceToCastleWith);
    const castleMoves: ChessMove[] = piecesToCastleWith
      .filter(pieceToCastleWith => this.getCanCastle([selectedPieceAtCell, pieceToCastleWith]))
      .map(pieceToCastleWith => ({
        piece: selectedPieceAtCell.piece,
        moveFrom: selectedPieceAtCell.cell,
        moveTo: pieceToCastleWith.cell,
        chessMoveType: 'castle'
      }));
    return castleMoves;
  }

  private findPieces(piece: TPiece) {
    return this.board.getAllPieceLocations()
      .filter(pieceAtCell => Piece.equals(piece, pieceAtCell.piece));
  }

  private getCanCastle(pieces: [PieceAtCell | undefined, PieceAtCell | undefined]) {
    const king = pieces.find(p => p?.piece.type === 'king');
    const rook = pieces.find(p => p?.piece.type === 'rook');

    const neitherMoved = !!king && !!rook
      && !rook.piece.hasBeenMoved && !king.piece.hasBeenMoved
    const noPiecesBetween = !!king && !!rook
      && this.noPiecesBetweenExclusive(rook.cell, king.cell);

    return neitherMoved && noPiecesBetween;
  }

  private noPiecesBetweenExclusive(cellA: Cell, cellB: Cell) {
    const cellsAlongMoveBetween = this.getCellsAlongMove(cellA, cellB)
    return !!cellsAlongMoveBetween && cellsAlongMoveBetween.every(cell => !this.board.getPiece(cell));
  }

  /**
   * Returns the cells that a piece would travel through when moving from cellA to cellB.
   * Not including cellA nor cellB.
   * If such a move is not possible (i.e. cells are not directly diagnoal or perpendicular to each other), will return undefined.
   * @param cellA 
   * @param cellB 
   */
  private getCellsAlongMove(cellA: Cell, cellB: Cell) {
    let result: Cell[] = [];
    const vectorFromAtoB = Cell.difference(cellB, cellA);
    const normalizedVectorFromAtoB = Vector.normalize(vectorFromAtoB);
    if (Vector.isDiagonal(normalizedVectorFromAtoB) || Vector.isPerpendicular(normalizedVectorFromAtoB)) {
      let currentCellAlongVector = Cell.addVector(cellA, normalizedVectorFromAtoB);
      while (!Cell.equals(cellB, currentCellAlongVector)) {
        if (!Board.isCellOnBoard(currentCellAlongVector)) {
          throw new Error(`Cell between two ${cellA} and ${cellB} was not on board`);
        }
        result.push(currentCellAlongVector);
        currentCellAlongVector = Cell.addVector(currentCellAlongVector, normalizedVectorFromAtoB);
      }
    } else {
      return undefined;
    }
    return result;
  }

  private getAvailableMovesAlongVectors(selectedPieceAtCell: PieceAtCell, vectors: Vector[]): ChessMove[] {
    const availableMovesByVector = vectors.map(currentVector =>
      this.getAvailableMovesAlongVector(selectedPieceAtCell, currentVector)
    );
    return flattenArray(availableMovesByVector);
  }

  private getAvailableMovesAlongVector(selectedPieceAtCell: PieceAtCell, vector: Vector): ChessMove[] {
    let result: ChessMove[] = [];

    let currentCell = selectedPieceAtCell.cell;
    while (true) {
      currentCell = Cell.addVector(currentCell, vector);
      if (!Board.isCellOnBoard(currentCell)) {
        break;
      }
      const pieceAtCurrentCell = this.board.getPiece(currentCell);
      if (pieceAtCurrentCell) {
        if (pieceAtCurrentCell.color !== selectedPieceAtCell.piece?.color) {
          result.push({
            piece: selectedPieceAtCell.piece,
            moveFrom: selectedPieceAtCell.cell,
            moveTo: currentCell,
            chessMoveType: 'capture',
            capturingPiece: pieceAtCurrentCell
          });
        }
        break;
      }
      result.push({
        piece: selectedPieceAtCell.piece,
        moveFrom: selectedPieceAtCell.cell,
        moveTo: currentCell,
        chessMoveType: 'move'
      });
    }

    return result;
  }

  private getAvailableMovesFromVectorSet(selectedPieceAtCell: PieceAtCell, vectorSet: Vector[], options = DefaultGetAvailableMovesFromVectorSetOptions): ChessMove[] {
    let result: ChessMove[] = [];

    for (const vector of vectorSet) {
      const currentCell = Cell.addVector(selectedPieceAtCell.cell, vector);
      if (Board.isCellOnBoard(currentCell)) {
        const pieceAtCurrentCell = this.board.getPiece(currentCell);
        if (pieceAtCurrentCell) {
          if (options.canCapture && pieceAtCurrentCell.color !== selectedPieceAtCell.piece.color) {
            result.push({
              piece: selectedPieceAtCell.piece,
              moveFrom: selectedPieceAtCell.cell,
              moveTo: currentCell,
              chessMoveType: 'capture',
              capturingPiece: pieceAtCurrentCell
            });
          }
        } else if (!options.canOnlyMoveIfCapturing) {
          result.push({
            piece: selectedPieceAtCell.piece,
            moveFrom: selectedPieceAtCell.cell,
            moveTo: currentCell,
            chessMoveType: 'move'
          });
        }
      }
    }

    return result;
  }

}