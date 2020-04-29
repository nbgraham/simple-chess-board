import produce from "immer";
import { distinctFilter, flattenArray } from '../utils/array_utils';
import { Cell, Vector } from '../models/cell';
import { Piece } from '../models/piece';
import { ChessMove } from '../models/chess_move';
import { PieceAtCell, BoardUtils, BoardColor } from '../utils/board_utils';
import { cellsOneAndTwoMovesFromAtoB, boardReducer } from '../reducers/board_reducer';
import { BoardDtoMutations, Board } from "../models/board";

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

type AvailableMoveOptions = {
  allowMovesThatPutYouInCheck?: boolean
  onlyCaptureMoves?: boolean
}
export const defaultAvailableMoveOptions: AvailableMoveOptions = {
  allowMovesThatPutYouInCheck: false,
  onlyCaptureMoves: false
}

export class AvailableMovesService {
  constructor(
    readonly board: Board,
    readonly forColor: BoardColor,
    readonly options = defaultAvailableMoveOptions) {
  }

  static isInCheck(board: Board, color: BoardColor) {
    const allOpposingMoves = AvailableMovesService.getAllAvailableMovesForColor(board, BoardUtils.otherColor(color), { allowMovesThatPutYouInCheck: true, onlyCaptureMoves: true });
    return allOpposingMoves.some(ChessMove.isCaptureOfKingOfColor(color));
  }

  private static getAllAvailableMovesForColor(board: Board, color: BoardColor, options = defaultAvailableMoveOptions) {
    const availableMovesService = new AvailableMovesService(board, color, options);
    const allMovesForColor = availableMovesService.getAllAvailableMovesFlat();
    return allMovesForColor;
  }

  static colorWhoJustMovedIsInCheck(board: Board) {
    const colorWhoJustMoved = BoardUtils.otherColor(board.currentTurn);
    return AvailableMovesService.isInCheck(board, colorWhoJustMoved);
  }


  static getColorThatIsInCheckMate(board: Board): BoardColor | undefined {
    const colorToTest = board.currentTurn;
    return AvailableMovesService.isInCheckMate(board, colorToTest);
  }

  private static isInCheckMate(board: Board, colorToTest: BoardColor): BoardColor | undefined {
    const currentTurnPlayerIsInCheck = AvailableMovesService.isInCheck(board, colorToTest);
    if (currentTurnPlayerIsInCheck) {
      const allLegalMovesForColor = AvailableMovesService.getAllAvailableMovesForColor(board, colorToTest, { allowMovesThatPutYouInCheck: false, onlyCaptureMoves: false });
      if (allLegalMovesForColor.length === 0) {
        return colorToTest;
      }
    }
    return undefined;
  }

  getAllAvailableMoves(): (ChessMove[])[][] {
    return this.board.pieces.map((row, rowIndex) =>
      row.map((cell, columnIndex) => this.getAvailablePlacesToMoveFrom({ rowIndex, columnIndex }))
    )
  }

  getAllAvailableMovesFlat(): ChessMove[] {
    return flattenArray(flattenArray(this.getAllAvailableMoves()))
  }

  getAvailablePlacesToMoveFrom(selectedCell: Cell): ChessMove[] {
    const selectedPiece = Board.getPiece(this.board, selectedCell);
    if (!selectedPiece || selectedPiece.color !== this.forColor) {
      return []
    }

    const pieceAtCell = { piece: selectedPiece, cell: selectedCell };
    return this.getAvailableMovesForPiece(pieceAtCell)
      .filter(distinctFilter(ChessMove.equals))
      .filter(move => this.moveIsValid(move))
  }

  private moveIsValid(move: ChessMove) {
    if (this.options.allowMovesThatPutYouInCheck) {
      return true;
    }

    try {
      const boardAfterMove = boardReducer(this.board, move);
      return !AvailableMovesService.isInCheck(boardAfterMove, move.piece.color)
    } catch (error) {
      console.log(error)
      return true
    }
  }

  private getAvailableMovesForPiece(pieceAtCell: PieceAtCell): ChessMove[] {
    switch (pieceAtCell.piece.type) {
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
  }

  private getAvailableMovesForPawn(selectedPieceAtCell: PieceAtCell): ChessMove[] {
    const potentialMoveVectorSet = this.options.onlyCaptureMoves ? [] : this.getPotentialMoveVectorSetForPawn(selectedPieceAtCell);
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
    const castleMoves = this.options.onlyCaptureMoves ? [] : this.getAvailableCastleMoves(selectedPieceAtCell, 'rook');
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
    const castleMoves = this.options.onlyCaptureMoves ? [] : this.getAvailableCastleMoves(selectedPieceAtCell, 'king');
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
        type: 'castle',
        piece: selectedPieceAtCell.piece,
        moveFrom: selectedPieceAtCell.cell,
        moveTo: pieceToCastleWith.cell,
      }));
    return castleMoves;
  }

  private findPieces(piece: Piece) {
    return Board.getAllPieceLocations(this.board)
      .filter(pieceAtCell => Piece.equals(piece, pieceAtCell.piece));
  }

  private getCanCastle(pieces: [PieceAtCell | undefined, PieceAtCell | undefined]) {
    const king = pieces.find(p => p?.piece.type === 'king');
    const rook = pieces.find(p => p?.piece.type === 'rook');

    if (!!king && !!rook) {
      const neitherMoved = () => !rook.piece.hasBeenMoved && !king.piece.hasBeenMoved
      const noPiecesBetween = () => this.noPiecesBetweenExclusive(rook.cell, king.cell);
      const kingIsNotInCheck = () => !AvailableMovesService.isInCheck(this.board, king.piece.color)
      const kingDoesNotMoveCellsThatAreUnderAttack = () => {
        const cellsTheKingWouldMoveThrough = cellsOneAndTwoMovesFromAtoB(king.cell, rook.cell)
        return !this.movingKingToCellWouldPlaceHimUnderAttack(king, cellsTheKingWouldMoveThrough.oneStepToward) &&
          !this.movingKingToCellWouldPlaceHimUnderAttack(king, cellsTheKingWouldMoveThrough.twoStepsToward)
      }

      return neitherMoved() && noPiecesBetween() && kingIsNotInCheck() && kingDoesNotMoveCellsThatAreUnderAttack();
    } else {
      return false;
    }
  }

  private movingKingToCellWouldPlaceHimUnderAttack(king: PieceAtCell, cell: Cell) {
    const boardWithKingMoved = produce(this.board, draftNextBoard => {
      BoardDtoMutations.setPieceOnCell(draftNextBoard, king.cell, undefined)
      BoardDtoMutations.setPieceOnCell(draftNextBoard, cell, king.piece)
      BoardDtoMutations.switchTurns(draftNextBoard)
    })
    const opposingColor = BoardUtils.otherColor(king.piece.color);
    const availableCaptureService = new AvailableMovesService(boardWithKingMoved, opposingColor, { allowMovesThatPutYouInCheck: true, onlyCaptureMoves: true })
    const opposingPieces = Board.getAllPieceLocations(boardWithKingMoved, opposingColor);
    const opposingMoves = flattenArray(opposingPieces.map(opposingPiece =>
      availableCaptureService.getAvailableMovesForPiece(opposingPiece)
    ))
    return opposingMoves.some(ChessMove.isCaptureOfKingOfColor(king.piece.color))
  }

  private noPiecesBetweenExclusive(cellA: Cell, cellB: Cell) {
    const cellsAlongMoveBetween = this.getCellsAlongMove(cellA, cellB)
    return !!cellsAlongMoveBetween && cellsAlongMoveBetween.every(cell => !Board.getPiece(this.board, cell));
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
        if (!BoardUtils.isCellOnBoard(currentCellAlongVector)) {
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
      if (!BoardUtils.isCellOnBoard(currentCell)) {
        break;
      }
      const pieceAtCurrentCell = Board.getPiece(this.board, currentCell);
      if (pieceAtCurrentCell) {
        if (pieceAtCurrentCell.color !== selectedPieceAtCell.piece?.color) {
          result.push({
            type: 'capture',
            piece: selectedPieceAtCell.piece,
            moveFrom: selectedPieceAtCell.cell,
            moveTo: currentCell,
            capturingPiece: pieceAtCurrentCell
          });
        }
        break;
      }
      if (!this.options.onlyCaptureMoves) {
        result.push({
          type: 'move',
          piece: selectedPieceAtCell.piece,
          moveFrom: selectedPieceAtCell.cell,
          moveTo: currentCell,
        });
      }
    }

    return result;
  }

  private getAvailableMovesFromVectorSet(selectedPieceAtCell: PieceAtCell, vectorSet: Vector[], options = DefaultGetAvailableMovesFromVectorSetOptions): ChessMove[] {
    let result: ChessMove[] = [];

    for (const vector of vectorSet) {
      const currentCell = Cell.addVector(selectedPieceAtCell.cell, vector);
      if (BoardUtils.isCellOnBoard(currentCell)) {
        const pieceAtCurrentCell = Board.getPiece(this.board, currentCell);
        if (pieceAtCurrentCell) {
          if (options.canCapture && pieceAtCurrentCell.color !== selectedPieceAtCell.piece.color) {
            result.push({
              type: 'capture',
              piece: selectedPieceAtCell.piece,
              moveFrom: selectedPieceAtCell.cell,
              moveTo: currentCell,
              capturingPiece: pieceAtCurrentCell
            });
          }
        } else if (!options.canOnlyMoveIfCapturing && !this.options.onlyCaptureMoves) {
          result.push({
            type: 'move',
            piece: selectedPieceAtCell.piece,
            moveFrom: selectedPieceAtCell.cell,
            moveTo: currentCell,
          });
        }
      }
    }

    return result;
  }

}