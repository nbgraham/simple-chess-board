import { Board, BoardPieces } from '../models/board';
import { ChessMove } from '../models/chess_move';
import { RewindableReducerState, SerDeRewindableReducerState, makeInitialState, UNDO, RESET, REDO } from '../utils/rewindable_reducer';
import { makeRewindableReducer } from '../utils/rewindable_reducer';
import { boardReducer } from '../reducers/board_reducer';

const startingPieces: BoardPieces = [[{ "color": "black", "type": "rook", "hasBeenMoved": false }, { "color": "black", "type": "knight", "hasBeenMoved": false }, { "color": "black", "type": "bishop", "hasBeenMoved": false }, { "color": "black", "type": "queen", "hasBeenMoved": false }, { "color": "black", "type": "king", "hasBeenMoved": false }, { "color": "black", "type": "bishop", "hasBeenMoved": false }, { "color": "black", "type": "knight", "hasBeenMoved": false }, { "color": "black", "type": "rook", "hasBeenMoved": false }], [{ "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [{ "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }], [{ "color": "white", "type": "rook", "hasBeenMoved": false }, { "color": "white", "type": "knight", "hasBeenMoved": false }, { "color": "white", "type": "bishop", "hasBeenMoved": false }, { "color": "white", "type": "queen", "hasBeenMoved": false }, { "color": "white", "type": "king", "hasBeenMoved": false }, { "color": "white", "type": "bishop", "hasBeenMoved": false }, { "color": "white", "type": "knight", "hasBeenMoved": false }, { "color": "white", "type": "rook", "hasBeenMoved": false }]];
const startingBoard = new Board(startingPieces).toBuilder().setAvailableMoves().toBuilder()
const initialRewindableBoardState = makeInitialState<Board, ChessMove>(startingBoard);
const rewindableReducer = makeRewindableReducer(boardReducer, initialRewindableBoardState)

class MockApiClient {
    boardState: RewindableReducerState<Board, ChessMove> = initialRewindableBoardState
    boardListeners: Array<(s: SerDeRewindableReducerState<Board, ChessMove>) => void> = []

    constructor() {
    }

    private emitBoardUpdate() {
        this.boardListeners.forEach(listener => listener(this.boardState))
    }

    subcribeToBoard(cb: (s: SerDeRewindableReducerState<Board, ChessMove>) => void) {
        this.boardListeners.push(cb)
        this.emitBoardUpdate()
        return {
            unsubscribe: () => { this.boardListeners = this.boardListeners.filter(c => c !== cb) }
        }
    }

    sendMove(move: ChessMove) {
        this.boardState = rewindableReducer(this.boardState, move)
        this.emitBoardUpdate()
    }

    undoMove() {
        this.boardState = rewindableReducer(this.boardState, UNDO.action)
        this.emitBoardUpdate()
    }

    redoMove() {
        this.boardState = rewindableReducer(this.boardState, REDO.action)
        this.emitBoardUpdate()    
    }

    resetBoard() {
        this.boardState = rewindableReducer(this.boardState, RESET.action)
        this.emitBoardUpdate()    
    }
}

export const API_CLIENT = new MockApiClient()