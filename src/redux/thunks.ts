import { Cell } from "../models/cell";
import { AppDispatch } from "./react_redux";
import { RootState, gameStateActions } from "./store";
import { Board } from "../models/board";
import { Piece } from "../models/piece";
import { ChessMove } from "../models/chess_move";
import { ApiClientType, getApiClient } from "../hooks/use_api_client_of_type";

function makeThunk(doInThunk: (appDispath: AppDispatch, selector: Selector) => void) {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const selector = new Selector(getState);
        doInThunk(dispatch, selector)
    }
}

type TryToMakeMovePayload = {
    move: ChessMove,
    apiClientType: ApiClientType
}
export const thunks = {
    tryToSelectCell(cellToSelect: Cell | undefined) {
        return makeThunk((appDispatch, selector) => {
            if (selector.canSelectCell(cellToSelect)) {
                appDispatch(gameStateActions.setSelectedCell(cellToSelect));
            }
        })
    },
    tryToMakeMove({ move, apiClientType }: TryToMakeMovePayload) {
        return makeThunk((_, selector) => {
            if (selector.moveIsValidForCurrentPlayer(move)) {
                getApiClient(apiClientType).sendMove(move)
            }
        })
    },
}

class Selector {
    readonly getState: () => RootState

    _state: RootState | undefined
    get state() {
        if (this._state === undefined) {
            this._state = this.getState()
        }
        return this._state
    }

    get board() {
        return this.state.gameState.gameState.board
    }

    constructor(getState: () => RootState) {
        this.getState = getState;
    }

    canSelectCell(cellToSelect: Cell | undefined) {
        if (cellToSelect === undefined) {
            return true;
        }
        const currentPiece = Board.getPiece(this.board, cellToSelect);
        if (!!currentPiece && this.playerCanEditPiece(currentPiece)) {
            return true;
        }
        return false;
    }

    playerCanEditPiece(piece: Piece) {
        const { controlBothSides, selectedColor: playerColor } = this.state.player;
        return !!controlBothSides || (!!playerColor && piece.color === playerColor)
    }

    moveIsValidForCurrentPlayer(move: ChessMove) {
        const pieceIsValidToEditOnThisTurn = move.type === 'promote_pawn' || move.piece.color === this.board.currentTurn;
        return this.playerCanEditPiece(move.piece) && pieceIsValidToEditOnThisTurn;
    }
}
