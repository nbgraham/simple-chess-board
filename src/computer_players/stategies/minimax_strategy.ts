import { Board } from "../../models/board"
import { GameState } from "../../models/game_state";
import { AvailableMovesService } from "../../services/available_moves";
import { boardReducer } from "../../reducers/board_reducer";
import { Minimax } from "./minimax";
import { Strategy } from "./strategy";
import { ChessMove } from "../../models/chess_move";
import { RandomStrategy } from "./random_strategy";
import { getValueOfPieces, getValueOfPieceLocations } from "./piece_location/piece_location_value";

function nodeIsTerminal(board: Board) {
    return AvailableMovesService.isStalemate(board) || GameState.computeWinner(board) !== null;
}

function simpleHeuristicValue(board: Board): number {
    return heuristicValueOfTerminalStates(board) 
        ?? (board.whiteScore - board.blackScore);
}

function heuristicValueWithLocation(board: Board): number {
    return heuristicValueOfTerminalStates(board) 
        ?? _heuristicValueWithLocation(board);
}

function _heuristicValueWithLocation(board: Board): number {
    const locationValues = getValueOfPieceLocations(board.pieces);
    const blackValue = getValueOfPieces(board.piecesCapturedByBlack) + locationValues.blackValue;
    const whiteValue = getValueOfPieces(board.piecesCapturedByWhite) + locationValues.whiteValue;
    return whiteValue - blackValue;
}

function heuristicValueOfTerminalStates(board: Board): number | null {
    const winner = GameState.computeWinner(board);
    if (winner !== null) {
        return winner === 'white' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    } else if (AvailableMovesService.isStalemate(board)) {
        return 0;
    }
    return null;
}

function getChildren(board: Board) {
    return AvailableMovesService.getAllAvailableMovesForColor(board, board.currentTurn).map(move => {
        return {
            edge: move,
            childNode: boardReducer(board, move),
        };
    })
}

export const ChessMinimax = new Minimax(simpleHeuristicValue, nodeIsTerminal, getChildren, 'none');
export const AlphaBetaChessMinimax = new Minimax(simpleHeuristicValue, nodeIsTerminal, getChildren, 'alpha-beta');

export class MinimaxStrategy implements Strategy {
    randomStrategy = new RandomStrategy()

    getNextMove(board: Board): ChessMove {
        const miniMaxedEdge = AlphaBetaChessMinimax.minimax(board, 2, board.currentTurn === 'white');
        return miniMaxedEdge.edge ?? this.randomStrategy.getNextMove(board);
    }

}

export const ChessMinimaxWithLocation = new Minimax(heuristicValueWithLocation, nodeIsTerminal, getChildren);

export class MinimaxWithLocationStrategy implements Strategy {
    randomStrategy = new RandomStrategy()

    getNextMove(board: Board): ChessMove {
        const miniMaxedEdge = ChessMinimaxWithLocation.minimax(board, 2, board.currentTurn === 'white');
        return miniMaxedEdge.edge ?? this.randomStrategy.getNextMove(board);
    }
}
