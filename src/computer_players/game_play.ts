import { Strategy } from "./stategies/strategy";
import { Board } from "../models/board";
import { GameState } from "../models/game_state";
import { boardReducer } from "../reducers/board_reducer";
import { BoardColor } from "../utils/board_utils";
import { boardToShorthand } from "../models/piece_shorthand";
import { AvailableMovesService } from "../services/available_moves";

type GameResult = {
    board: Board,
    moves: number,
    winner: BoardColor | null,
    blackScore: number,
    whiteScore: number
}
export function playGame(whiteStrategy: Strategy, blackStrategy: Strategy, maxMoves = 60, winBonus = 50): GameResult {
    let board = new Board();

    let winner = null as BoardColor | null;
    let moves = 0;
    while (winner === null && moves < maxMoves) {
        const nextMove = board.currentTurn === 'white' ? whiteStrategy.getNextMove(board)
            : blackStrategy.getNextMove(board);
        if (!nextMove) {
            console.error(`No next move for ${board.currentTurn} at move ${moves};`, boardToShorthand(board.pieces));
        }
        board = boardReducer(board, nextMove);
        
        if (AvailableMovesService.isStalemate(board)) {
            break;
        }
        winner = GameState.computeWinner(board);
        moves++
    }

    return {
        board,
        moves,
        winner,
        whiteScore: board.whiteScore + winBonus * (winner === null ? 0 : winner === 'white' ? 1 : -1),
        blackScore: board.blackScore + winBonus * (winner === null ? 0 : winner === 'black' ? 1 : -1),
    };
}