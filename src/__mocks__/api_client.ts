import { ChessMove } from '../models/chess_move';
import { RewindableReducerState, SerDeRewindableReducerState, UNDO, RESET, REDO } from '../utils/rewindable_reducer';
import { makeRewindableReducer } from '../utils/rewindable_reducer';
import { makeStartingRewindableState, gameStateReducer } from '../reducers/game_state_reducer';
import { GameStateDto } from '../models/game_state_dto';
import { IApiClient } from '../api_client';

const initialRewindableBoardState = makeStartingRewindableState();
const rewindableReducer = makeRewindableReducer(gameStateReducer, initialRewindableBoardState)

type BoardListener = (s: SerDeRewindableReducerState<GameStateDto, ChessMove>) => void;
type BoardListenersReducerAction = {
    type: 'add',
    listener: BoardListener
} | {
    type: 'remove'
    listener: BoardListener
}
class MockApiClient implements IApiClient {
    gameState: RewindableReducerState<GameStateDto, ChessMove> = initialRewindableBoardState
    boardListeners: Array<BoardListener> = []

    static boardListenerReducer(prevListeners: Array<BoardListener>, action: BoardListenersReducerAction) {
        if (action.type === 'add') {
            return [...prevListeners, action.listener]
        } else if (action.type === 'remove') {
            return prevListeners.filter(l => l !== action.listener)
        } else {
            return prevListeners
        }
    }

    private dispatch(action: BoardListenersReducerAction) {
        this.boardListeners = MockApiClient.boardListenerReducer(this.boardListeners, action)
    }

    private emitBoardUpdate() {
        this.boardListeners.forEach(listener => listener(this.gameState))
    }

    subcribeToBoard(listener: BoardListener) {
        this.dispatch({ type: 'add', listener })
        this.emitBoardUpdate()
        return {
            unsubscribe: () => { this.dispatch({ type: 'remove', listener }) }
        }
    }

    sendMove(move: ChessMove) {
        this.gameState = rewindableReducer(this.gameState, move)
        this.emitBoardUpdate()
    }

    undoMove() {
        this.gameState = rewindableReducer(this.gameState, UNDO.action)
        this.emitBoardUpdate()
    }

    redoMove() {
        this.gameState = rewindableReducer(this.gameState, REDO.action)
        this.emitBoardUpdate()
    }

    resetBoard() {
        this.gameState = rewindableReducer(this.gameState, RESET.action)
        this.emitBoardUpdate()
    }
}

export const API_CLIENT = new MockApiClient()