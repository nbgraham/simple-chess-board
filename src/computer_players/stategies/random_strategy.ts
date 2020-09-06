import { Strategy } from "./strategy";
import { Board } from "../../models/board";
import { ChessMove } from "../../models/chess_move";
import { getRandomItem } from "../../utils/array_utils";
import { AvailableMovesService } from "../../services/available_moves";

export class RandomStrategy implements Strategy {
    getNextMove(board: Board): ChessMove {
        const availableMoves = AvailableMovesService.getAllAvailableMovesForColor(board, board.currentTurn);
        return getRandomItem(availableMoves);
    }
}