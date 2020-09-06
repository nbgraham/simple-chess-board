import produce from "immer";
import { Cell, Vector } from '../models/cell';
import { Piece, PieceType } from '../models/piece';
import { ChessMove } from '../models/chess_move';
import { PieceAtCell, BoardUtils, BoardColor } from '../utils/board_utils';
import { cellsOneAndTwoMovesFromAtoB, boardReducer } from '../reducers/board_reducer';
import { BoardDtoMutations, Board } from "../models/board";
import { makeEmptyGenerator, onlyYieldUniqueHashes, willGenerateAtLeastOne, toArray, every } from "../utils/generator_utils";

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

  static deprecated_isInCheck(board: Board, color: BoardColor) {
    const allOpposingMoves = AvailableMovesService.getAllAvailableMovesForColor(board, BoardUtils.otherColor(color), { allowMovesThatPutYouInCheck: true, onlyCaptureMoves: true });
    return allOpposingMoves.some(ChessMove.isCaptureOfKingOfColor(color))
  }

  static isInCheck(board: Board, color: BoardColor) {
    const kingAtCell = Board.getKing(board, color);

    if (kingAtCell) {
      const movesThatCouldCaptureKing = AvailableMovesService.generateMovesThatCouldCaptureKing(board, color, kingAtCell);
      return willGenerateAtLeastOne(movesThatCouldCaptureKing);
    }

    return false;
  }

  static * generateMovesThatCouldCaptureKing(board: Board, color: BoardColor, kingAtCell: PieceAtCell) {
    const opposingColor = BoardUtils.otherColor(color);
    const availableMovesService = new AvailableMovesService(board, color, { onlyCaptureMoves: true })

    const isCaptureOfOpposingColorOfType = (move: ChessMove, ...types: PieceType[]) =>
      move.type === 'capture' && move.capturingPiece.color === opposingColor
      && types.includes(move.capturingPiece.type);

    for (const move of availableMovesService.generateAvailableMovesAlongVectors(kingAtCell, DIAGONAL_VECTORS)) {
      if (isCaptureOfOpposingColorOfType(move, 'bishop', 'queen')) {
        yield move;
      }
    }
    for (const move of availableMovesService.generateAvailableMovesAlongVectors(kingAtCell, PERPENDICULAR_VECTORS)) {
      if (isCaptureOfOpposingColorOfType(move, 'rook', 'queen')) {
        yield move;
      }
    }
    for (const move of availableMovesService.generateAvailableMovesFromVectorSet(kingAtCell, KNIGHTS_VECTOR_SET)) {
      if (isCaptureOfOpposingColorOfType(move, 'knight')) {
        yield move;
      }
    }
    for (const move of availableMovesService.generateAvailableMovesFromVectorSet(kingAtCell, DIAGONAL_VECTORS)) {
      if (isCaptureOfOpposingColorOfType(move, 'pawn')) {
        yield move;
      }
    }
  }

  static isStalemate(board: Board) {
    if (!this.isInCheck(board, 'white') && !this.isInCheck(board, 'black')) {
      const allAvailableMoves = AvailableMovesService.generateAllAvailableMovesForColor(board, board.currentTurn, { allowMovesThatPutYouInCheck: false, onlyCaptureMoves: false });
      return !willGenerateAtLeastOne(allAvailableMoves);
    }
    return false;
  }

  static getAllAvailableMovesForColor(board: Board, color: BoardColor, options = defaultAvailableMoveOptions) {
    return toArray(AvailableMovesService.generateAllAvailableMovesForColor(board, color, options));
  }

  static generateAllAvailableMovesForColor(board: Board, color: BoardColor, options = defaultAvailableMoveOptions) {
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
      const allLegalMovesForColor = AvailableMovesService.generateAllAvailableMovesForColor(board, colorToTest, { allowMovesThatPutYouInCheck: false, onlyCaptureMoves: false });
      if (!willGenerateAtLeastOne(allLegalMovesForColor)) {
        return colorToTest;
      }
    }
    return undefined;
  }

  getAllAvailableMoves(): (ChessMove[])[][] {
    return this.board.pieces.map((row, rowIndex) =>
      row.map((cell, columnIndex) =>
        toArray(this.getAvailablePlacesToMoveFrom({ rowIndex, columnIndex })))
    )
  }

  * getAllAvailableMovesFlat(): Generator<ChessMove> {
    for (const rowIndex in this.board.pieces) {
      for (const columnIndex in this.board.pieces) {
        yield* this.getAvailablePlacesToMoveFrom({ rowIndex: +rowIndex, columnIndex: +columnIndex, });
      }
    }
  }

  * getAvailablePlacesToMoveFrom(selectedCell: Cell): Generator<ChessMove> {
    const selectedPiece = Board.getPiece(this.board, selectedCell);
    if (!selectedPiece || selectedPiece.color !== this.forColor) {
      return []
    }

    const pieceAtCell = { piece: selectedPiece, cell: selectedCell };
    const baseGenerator = this.getAvailableMovesForPiece(pieceAtCell);
    const uniqueGenerator = onlyYieldUniqueHashes(baseGenerator, ChessMove.hash);
    for (const move of uniqueGenerator) {
      if (this.moveIsValid(move)) {
        yield move;
      }
    }
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

  private getAvailableMovesForPiece(pieceAtCell: PieceAtCell): Generator<ChessMove> {
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
        return makeEmptyGenerator();
    }
  }

  private * getAvailableMovesForPawn(selectedPieceAtCell: PieceAtCell): Generator<ChessMove> {
    const potentialMoveVectorSet = this.options.onlyCaptureMoves ? [] : this.getPotentialMoveVectorSetForPawn(selectedPieceAtCell);
    const potentialCaptureVectorSet = this.getPotentialCaptureVectorsForPawn(selectedPieceAtCell);
    yield* this.generateAvailableMovesFromVectorSet(
      selectedPieceAtCell, potentialMoveVectorSet, { canCapture: false }
    );

    yield* this.generateAvailableMovesFromVectorSet(
      selectedPieceAtCell, potentialCaptureVectorSet, { canCapture: true, canOnlyMoveIfCapturing: true }
    )
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

  private * getAvailableMovesForRook(selectedPieceAtCell: PieceAtCell): Generator<ChessMove> {
    if (!this.options.onlyCaptureMoves) {
      yield* this.getAvailableCastleMoves(selectedPieceAtCell, 'rook');
    }
    yield* this.generateAvailableMovesAlongVectors(selectedPieceAtCell, PERPENDICULAR_VECTORS);
  }

  private getAvailableMovesForBishop(selectedPieceAtCell: PieceAtCell): Generator<ChessMove> {
    return this.generateAvailableMovesAlongVectors(selectedPieceAtCell, DIAGONAL_VECTORS);
  }

  private getAvailableMovesForQueen(selectedPieceAtCell: PieceAtCell): Generator<ChessMove> {
    return this.generateAvailableMovesAlongVectors(selectedPieceAtCell, [...PERPENDICULAR_VECTORS, ...DIAGONAL_VECTORS]);
  }

  private getAvailableMovesForKnight(selectedPieceAtCell: PieceAtCell): Generator<ChessMove> {
    return this.generateAvailableMovesFromVectorSet(selectedPieceAtCell, KNIGHTS_VECTOR_SET);
  }

  private * getAvailableMovesForKing(selectedPieceAtCell: PieceAtCell): Generator<ChessMove> {
    if (!this.options.onlyCaptureMoves) {
      yield* this.getAvailableCastleMoves(selectedPieceAtCell, 'king');
    }
    yield* this.generateAvailableMovesFromVectorSet(selectedPieceAtCell, [...PERPENDICULAR_VECTORS, ...DIAGONAL_VECTORS])
  }

  private * getAvailableCastleMoves(selectedPieceAtCell: PieceAtCell, forType: 'king' | 'rook'): Generator<ChessMove> {
    const searchPieceToCastleWith = Piece.create(forType === 'king' ? 'rook' : 'king', selectedPieceAtCell.piece.color);
    const piecesToCastleWith = this.findPieces(searchPieceToCastleWith);

    for (const pieceToCastleWith of piecesToCastleWith) {
      if (this.getCanCastle([selectedPieceAtCell, pieceToCastleWith])) {
        yield {
          type: 'castle',
          piece: selectedPieceAtCell.piece,
          moveFrom: selectedPieceAtCell.cell,
          moveTo: pieceToCastleWith.cell,
        }
      }
    }

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
      BoardDtoMutations.movePiece(draftNextBoard, king, cell)
      BoardDtoMutations.switchTurns(draftNextBoard)
    })

    return AvailableMovesService.isInCheck(boardWithKingMoved, king.piece.color);
  }

  private noPiecesBetweenExclusive(cellA: Cell, cellB: Cell) {
    const cellsAlongMoveBetween = this.generateCellsAlongMove(cellA, cellB)
    return every(cellsAlongMoveBetween, cell => !Board.getPiece(this.board, cell));
  }

    /**
   * Returns the cells that a piece would travel through when moving from cellA to cellB.
   * Not including cellA nor cellB.
   * If such a move is not possible (i.e. cells are not directly diagnoal or perpendicular to each other), will return undefined.
   * @param cellA 
   * @param cellB 
   */
  private * generateCellsAlongMove(cellA: Cell, cellB: Cell) {
    const vectorFromAtoB = Cell.difference(cellB, cellA);
    const normalizedVectorFromAtoB = Vector.normalize(vectorFromAtoB);
    if (Vector.isDiagonal(normalizedVectorFromAtoB) || Vector.isPerpendicular(normalizedVectorFromAtoB)) {
      let currentCellAlongVector = Cell.addVector(cellA, normalizedVectorFromAtoB);
      while (!Cell.equals(cellB, currentCellAlongVector)) {
        if (!BoardUtils.isCellOnBoard(currentCellAlongVector)) {
          throw new Error(`Cell between two ${cellA} and ${cellB} was not on board`);
        }
        yield currentCellAlongVector
        currentCellAlongVector = Cell.addVector(currentCellAlongVector, normalizedVectorFromAtoB);
      }
    } else {
      throw new Error(`No diagonal or perpendicular path between ${cellA} and ${cellB}`);
    }
  }

  private * generateAvailableMovesAlongVectors(selectedPieceAtCell: PieceAtCell, vectors: Vector[]): Generator<ChessMove> {
    for (const currentVector of vectors) {
      yield* this.generateAvailableMovesAlongVector(selectedPieceAtCell, currentVector);
    }
  }

  private * generateAvailableMovesAlongVector(selectedPieceAtCell: PieceAtCell, vector: Vector): Generator<ChessMove> {

    let currentCell = selectedPieceAtCell.cell;
    while (true) {
      currentCell = Cell.addVector(currentCell, vector);
      if (!BoardUtils.isCellOnBoard(currentCell)) {
        break;
      }
      const pieceAtCurrentCell = Board.getPiece(this.board, currentCell);
      if (pieceAtCurrentCell) {
        if (pieceAtCurrentCell.color !== selectedPieceAtCell.piece?.color) {
          yield {
            type: 'capture',
            piece: selectedPieceAtCell.piece,
            moveFrom: selectedPieceAtCell.cell,
            moveTo: currentCell,
            capturingPiece: pieceAtCurrentCell
          };
        }
        break;
      }
      if (!this.options.onlyCaptureMoves) {
        yield {
          type: 'move',
          piece: selectedPieceAtCell.piece,
          moveFrom: selectedPieceAtCell.cell,
          moveTo: currentCell,
        };
      }
    }
  }

  private * generateAvailableMovesFromVectorSet(selectedPieceAtCell: PieceAtCell, vectorSet: Vector[], options = DefaultGetAvailableMovesFromVectorSetOptions): Generator<ChessMove> {
    for (const vector of vectorSet) {
      const currentCell = Cell.addVector(selectedPieceAtCell.cell, vector);
      if (BoardUtils.isCellOnBoard(currentCell)) {
        const pieceAtCurrentCell = Board.getPiece(this.board, currentCell);
        if (pieceAtCurrentCell) {
          if (options.canCapture && pieceAtCurrentCell.color !== selectedPieceAtCell.piece.color) {
            yield {
              type: 'capture',
              piece: selectedPieceAtCell.piece,
              moveFrom: selectedPieceAtCell.cell,
              moveTo: currentCell,
              capturingPiece: pieceAtCurrentCell
            };
          }
        } else if (!options.canOnlyMoveIfCapturing && !this.options.onlyCaptureMoves) {
          yield {
            type: 'move',
            piece: selectedPieceAtCell.piece,
            moveFrom: selectedPieceAtCell.cell,
            moveTo: currentCell,
          };
        }
      }
    }
  }

}