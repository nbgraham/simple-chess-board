import { useCallback } from "react";
import { Piece } from "../models/piece";
import { Cell } from "../models/cell";
import { Board } from "../models/board";
import { ChessMove } from "../models/chess_move";
import { BoardColor } from "../utils/board_utils";

type Params = {
    controlBothSides: boolean | undefined;
    playerColor: BoardColor | undefined;
    board: Board;
}
export const useAllowed = ({ controlBothSides, playerColor, board }: Params) => {

    const playerCanEditPiece = useCallback(
        (piece: Piece) => {
            return !!controlBothSides || (!!playerColor && piece.color === playerColor)
        },
        [controlBothSides, playerColor]
    );

    const canSelectCell = useCallback(
        (cellToSelect?: Cell) => {
            if (cellToSelect === undefined) {
                return true;
            }
            const currentPiece = Board.getPiece(board, cellToSelect);
            if (!!currentPiece && playerCanEditPiece(currentPiece)) {
                return true;
            }
            return false;
        },
        [board, playerCanEditPiece]
    )

    const moveIsValidForCurrentPlayer = useCallback(
        (move: ChessMove) => {
            const pieceIsValidToEditOnThisTurn = move.type === 'promote_pawn' || move.piece.color === board.currentTurn;
            return playerCanEditPiece(move.piece) && pieceIsValidToEditOnThisTurn;
        },
        [board, playerCanEditPiece]
    );

    return { canSelectCell, moveIsValidForCurrentPlayer };
}