import { Cell } from "./cell";
import { BoardUtils } from "../utils/board_utils";

export const c = (cellName: string): Cell => ({ 
    rowIndex: BoardUtils.N_ROWS - Number(cellName[1]), 
    columnIndex: BoardUtils.LETTERS_FOR_COLUMNS.indexOf(cellName[0])
})