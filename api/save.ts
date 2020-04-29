import fs from 'fs';
import { Board, BoardPieces } from "../src/models/board";
import { ChessMove } from "../src/models/chess_move";
import { RewindableReducerState, SerDeRewindableReducerState, makeInitialState } from '../src/utils/rewindable_reducer';
import { boardAsClass, chessMoveAsClass } from '../src/utils/serde';

const BOARD_STATE_FILE = 'boardState.temp.json';
const ENCODING = 'utf8';

export const getInitialState = (resume: boolean): Promise<RewindableReducerState<Board, ChessMove>> => {
    if (resume) {
        return retrieveBoardState()
            .then(board => {
                console.log('Resuming board');
                return board;
            })
            .catch(err => {
                console.log('Could not find a board to resume. Creating new game');
                return getStartingState()
            })
    } else {
        return getStartingState()
    }
}

const startingPieces: BoardPieces = [[{ "color": "black", "type": "rook", "hasBeenMoved": false }, { "color": "black", "type": "knight", "hasBeenMoved": false }, { "color": "black", "type": "bishop", "hasBeenMoved": false }, { "color": "black", "type": "queen", "hasBeenMoved": false }, { "color": "black", "type": "king", "hasBeenMoved": false }, { "color": "black", "type": "bishop", "hasBeenMoved": false }, { "color": "black", "type": "knight", "hasBeenMoved": false }, { "color": "black", "type": "rook", "hasBeenMoved": false }], [{ "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }, { "color": "black", "type": "pawn", "hasBeenMoved": false }], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [{ "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }, { "color": "white", "type": "pawn", "hasBeenMoved": false }], [{ "color": "white", "type": "rook", "hasBeenMoved": false }, { "color": "white", "type": "knight", "hasBeenMoved": false }, { "color": "white", "type": "bishop", "hasBeenMoved": false }, { "color": "white", "type": "queen", "hasBeenMoved": false }, { "color": "white", "type": "king", "hasBeenMoved": false }, { "color": "white", "type": "bishop", "hasBeenMoved": false }, { "color": "white", "type": "knight", "hasBeenMoved": false }, { "color": "white", "type": "rook", "hasBeenMoved": false }]];
const getStartingState = (): Promise<RewindableReducerState<Board, ChessMove>> => {
    return new Promise((resolve, reject) => {
        const board = new Board(startingPieces).toBuilder().setAvailableMoves().toBoard();
        const initialRewindableBoardState = makeInitialState<Board, ChessMove>(board);
        return resolve(initialRewindableBoardState);
    })
}

export const saveBoardState = (boardState: RewindableReducerState<Board, ChessMove>): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(BOARD_STATE_FILE, JSON.stringify(boardState), ENCODING, (err) => {
            if (err) {
                reject(err)
                return
            }
            console.log('Saved Board!');
            resolve()
        });
    })
}

export const retrieveBoardState = (): Promise<RewindableReducerState<Board, ChessMove>> => {
    return new Promise((resolve, reject) => {
        fs.readFile(BOARD_STATE_FILE, ENCODING, (err, data) => {
            if (err) {
                console.error(err)
                reject(err)
                return
            }
            try {
                const serDeBoardState = JSON.parse(data) as SerDeRewindableReducerState<Board, ChessMove>;
                const boardState: RewindableReducerState<Board, ChessMove> = {
                    ...serDeBoardState,
                    currentState: boardAsClass(serDeBoardState.currentState),
                    pastStates: serDeBoardState.pastStates.map(boardAsClass),
                    futureStates: serDeBoardState.futureStates.map(boardAsClass),
                    pastActions: serDeBoardState.pastActions.map(chessMoveAsClass),
                    futureActions: serDeBoardState.futureActions.map(chessMoveAsClass)
                }
                resolve(boardState)
            } catch (error) {
                reject(error)
            }
        })
    })
}