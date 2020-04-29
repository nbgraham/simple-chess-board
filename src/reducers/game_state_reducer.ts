import { ChessMove } from "../models/chess_move";
import { boardReducer } from "./board_reducer";
import { makeInitialState } from "../utils/rewindable_reducer";
import { GameStateDto } from "../models/game_state_dto";
import { AvailableMovesService } from "../services/available_moves";
import { Board } from "../models/board";
import { GameState } from "../models/game_state";

type Reducer<S, A> = (prevState: S, action: A) => S

export const gameStateReducer: Reducer<GameStateDto, ChessMove> = (prevState, action) => {
    const nextStateBoardDto = boardReducer(prevState.board, action)
    if (AvailableMovesService.colorWhoJustMovedIsInCheck(nextStateBoardDto)) {
        console.warn('Last move put the current player in check. Ignoring the move')
        return prevState;
    }
    if (nextStateBoardDto === prevState.board) {
        return prevState;
    }
    return GameState.from(nextStateBoardDto)
}

export const makeStartingRewindableState = () => {
    const initialGameStateDto = GameState.from(new Board())
    const initialRewindableBoardState = makeInitialState<GameStateDto, ChessMove>(initialGameStateDto);
    return initialRewindableBoardState;
}