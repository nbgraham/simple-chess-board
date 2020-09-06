import { Strategy } from "./strategy";
import { ChessMove } from "../../models/chess_move";
import { Board } from "../../models/board";
import { Piece } from "../../models/piece";
import { RandomStrategy } from "./random_strategy";
import { boardReducer } from "../../reducers/board_reducer";
import { AvailableMovesService } from "../../services/available_moves";
import { BoardColor, BoardUtils } from "../../utils/board_utils";
import produce from "immer";


function baseCaptureGetNextMove(board: Board, color: BoardColor, priortizeCheck: boolean, opponentHasNextMove = false): ChessMove | undefined {
    const opponent = BoardUtils.otherColor(board.currentTurn);
    const availableMoves = AvailableMovesService.getAllAvailableMovesForColor(board, color ?? board.currentTurn)

    let bestMove = undefined as ChessMove | undefined
    let currentValueOfBestMove = 0

    for (const move of availableMoves) {
        if (priortizeCheck && move.type === 'move') {
            const nextBoard = boardReducer(board, move);
            if (AvailableMovesService.isInCheck(nextBoard, opponent)) {
                bestMove = move;
                currentValueOfBestMove = Number.POSITIVE_INFINITY;
                if (AvailableMovesService.getColorThatIsInCheckMate(board) === opponent) {
                    break;
                }
            }
        } else if (move.type === 'capture') {
            let opponentCanCaptureFirst = false;
            if (opponentHasNextMove) {
                const availableMovesService = new AvailableMovesService(board, BoardUtils.otherColor(board.currentTurn), { allowMovesThatPutYouInCheck: true });
                const movesTheOtherPieceCanMake = availableMovesService.getAvailablePlacesToMoveFrom(move.moveTo);
                opponentCanCaptureFirst = movesTheOtherPieceCanMake.some(responseMove => responseMove?.moveTo === move.moveFrom)
            }

            if (!opponentCanCaptureFirst) {
                const valueOfPieceToCapture = Piece.getRelativeValue(move.capturingPiece);
                if (valueOfPieceToCapture > currentValueOfBestMove) {
                    bestMove = move;
                    currentValueOfBestMove = valueOfPieceToCapture;
                }
            }
        }
    }

    return bestMove;
}

export class CaptureHighestPieceStrategy implements Strategy {
    readonly randomStrategy = new RandomStrategy();
    readonly prioritizeCheck: boolean

    constructor(prioritizeCheck: boolean) {
        this.prioritizeCheck  = prioritizeCheck
    }
    getNextMove(board: Board): ChessMove {
        return baseCaptureGetNextMove(board, board.currentTurn, this.prioritizeCheck)
            ?? this.randomStrategy.getNextMove(board);
    }
}

export class DoubleCaptureHighestPieceStrategy implements Strategy {
    readonly randomStrategy = new RandomStrategy();
    readonly prioritizeCheck: boolean

    constructor(prioritizeCheck: boolean) {
        this.prioritizeCheck  = prioritizeCheck
    }

    getNextMove(board: Board): ChessMove {
        return baseCaptureGetNextMove(board, board.currentTurn, this.prioritizeCheck)
            ?? this.getMoveThatSetsUpForBestMove(board)
            ?? this.randomStrategy.getNextMove(board);
    }

    getMoveThatSetsUpForBestMove(board: Board): ChessMove | undefined {
        const availableMoves = AvailableMovesService.getAllAvailableMovesForColor(board, board.currentTurn);

        let bestMove = undefined as ChessMove | undefined
        let currentValueOfBestMove = 0
        availableMoves.forEach(move => {
            const nextBoard = produce(boardReducer(board, move), draftBoard => { draftBoard.currentTurn = board.currentTurn });
            const bestNextMove = baseCaptureGetNextMove(nextBoard, board.currentTurn, this.prioritizeCheck, true);

            if (bestNextMove?.type === 'capture') {
                const valueOfPieceToCapture = Piece.getRelativeValue(bestNextMove.capturingPiece);
                if (valueOfPieceToCapture > currentValueOfBestMove) {
                    bestMove = move;
                    currentValueOfBestMove = valueOfPieceToCapture;
                }
            }
        })

        return bestMove;
    }
}