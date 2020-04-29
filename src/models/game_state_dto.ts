import { Board, startingBoard } from "./board";
import { BoardColor } from "../utils/board_utils";
import { ChessMove } from "./chess_move";

export type GameStateDto = {
    board: Board
    winner: BoardColor | null
    availableMoves: ChessMove[][][]
}

export const emptyGameState: GameStateDto = {
    board: startingBoard,
    winner: null,
    availableMoves: []
}