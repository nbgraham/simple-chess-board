import { Cell } from "../models/cell";
import { betweenInclusive } from "./range_utils";
import { Piece } from "../models/piece";
import { ChessMove } from "../models/chess_move";

export type BoardColor = 'black' | 'white';
export type BoardPieces = (Piece | null)[][];
export type BoardAvailableMoves = (ChessMove[])[][]

export type PieceAtCell = {
  cell: Cell;
  piece: Piece
}

export class BoardUtils {
    static N_ROWS = 8;
    static N_COLS = 8;
    static WHITE_PAWN_START_ROW_INDEX = 6;
    static BLACK_PAWN_START_ROW_INDEX = 1;
    static LETTERS_FOR_COLUMNS = 'abcdefgh';

    static isCellAlongFarRowForColor(cell: Cell, color: BoardColor) {
        if (color === 'black') {
            return cell.rowIndex === BoardUtils.N_ROWS - 1;
        } else if (color === 'white') {
            return cell.rowIndex === 0;
        } else {
            return false;
        }
    }

    static getCellColor(cell: Cell): BoardColor {
        return ((cell.columnIndex + cell.rowIndex) % 2 === 0) ? 'black' : 'white';
    }

    static isCellOnBoard(cell: Cell) {
        return betweenInclusive(0, cell.rowIndex, BoardUtils.N_ROWS - 1) &&
            betweenInclusive(0, cell.columnIndex, BoardUtils.N_COLS - 1);
    }

    static otherColor = (color: BoardColor): BoardColor => color === 'black' ? 'white' : 'black';
    static getLabelForRow = (rowIndex: number) => BoardUtils.N_ROWS - rowIndex
    static getLabelForColumn = (columnIndex: number) => BoardUtils.LETTERS_FOR_COLUMNS[columnIndex]
}