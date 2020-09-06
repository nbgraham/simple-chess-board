import { ChessMove } from "../../models/chess_move";
import { Board } from "../../models/board";

export interface Strategy {
    getNextMove(board: Board): ChessMove;
}