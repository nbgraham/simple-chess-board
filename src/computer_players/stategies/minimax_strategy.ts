import { Board } from "../../models/board"
import { GameState } from "../../models/game_state";
import { AvailableMovesService } from "../../services/available_moves";
import { boardReducer } from "../../reducers/board_reducer";
import { Minimax } from "./minimax";
import { Strategy } from "./strategy";
import { ChessMove } from "../../models/chess_move";
import { RandomStrategy } from "./random_strategy";

function nodeIsTerminal(board: Board) {
    return AvailableMovesService.isStalemate(board) || GameState.computeWinner(board) !== null;
}

function heuristicValue(board: Board): number {
    const winner = GameState.computeWinner(board);
    if (winner !== null) {
        return winner === 'white' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    } else {
        return board.whiteScore - board.blackScore
    }
}

function getChildren(board: Board) {
    return AvailableMovesService.getAllAvailableMovesForColor(board, board.currentTurn).map(move => {
        return {
            edge: move,
            childNode: boardReducer(board, move),
        };
    })
}

export const ChessMinimax = new Minimax(heuristicValue, nodeIsTerminal, getChildren, 'none');
export const AlphaBetaChessMinimax = new Minimax(heuristicValue, nodeIsTerminal, getChildren, 'alpha-beta');

export class MinimaxStrategy implements Strategy {
    randomStrategy = new RandomStrategy()

    getNextMove(board: Board): ChessMove {
        const miniMaxedEdge = AlphaBetaChessMinimax.minimax(board, 2, board.currentTurn === 'white');
        return miniMaxedEdge.edge ?? this.randomStrategy.getNextMove(board);
    }

}
