import { ChessMinimax, AlphaBetaChessMinimax } from "./minimax_strategy"
import { Board } from "../../models/board"

test('alpha beta pruning explores fewer nodes', () => {
    const regularNodes = ChessMinimax.minimax(new Board(), 2, true).nodesExplored ?? 0
    const alphaBetaNodes = AlphaBetaChessMinimax.minimax(new Board(), 2, true).nodesExplored ?? 0

    expect(alphaBetaNodes).toBeLessThan(regularNodes);
})