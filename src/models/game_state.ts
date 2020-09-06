import { Board } from "./board";
import { GameStateDto } from "./game_state_dto";
import { AvailableMovesService } from "../services/available_moves";
import { BoardUtils, BoardColor } from "../utils/board_utils";

export class GameState {
    static from(board: Board): GameStateDto {
        return {
            board,
            winner: GameState.computeWinner(board),
            availableMoves: GameState.computeAvailableMoves(board)
        }
    }

    static computeAvailableMoves(board: Board) {
        const availableMovesService = new AvailableMovesService(board, board.currentTurn);

        const availableMoves = availableMovesService.getAllAvailableMoves();
        return availableMoves;
    }

    static computeWinner(board: Board) {
        if (GameState.hasCapturedOpposingKing(board, 'white')) {
            return 'white'
        } else if (GameState.hasCapturedOpposingKing(board, 'black')) {
            return 'black'
        } else {
            const colorThatIsInCheckMate = AvailableMovesService.getColorThatIsInCheckMate(board);

            if (colorThatIsInCheckMate) {
                return BoardUtils.otherColor(colorThatIsInCheckMate)
            }
        }
        return null;
    }

    private static hasCapturedOpposingKing(board: Board, capturingColor: BoardColor) {
        const capturedPieces = capturingColor === 'white' ? board.piecesCapturedByWhite : board.piecesCapturedByBlack;
        return capturedPieces.some(piece => piece.type === 'king' && piece.color === BoardUtils.otherColor(capturingColor));
    }
}