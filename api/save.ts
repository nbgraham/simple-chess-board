import { ChessMove } from "../src/models/chess_move";
import { RewindableReducerState, SerDeRewindableReducerState } from '../src/utils/rewindable_reducer';
import { chessMoveAsClass, gameStateDtoAsClass } from '../src/utils/serde';
import { writeToFile, readFile } from "./files";
import { makeStartingRewindableState } from "../src/reducers/game_state_reducer";
import { GameStateDto } from "../src/models/game_state_dto";

const BOARD_STATE_FILE = 'boardState.temp.json';

export const getInitialState = (resume: boolean): Promise<RewindableReducerState<GameStateDto, ChessMove>> => {
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

export const getStartingState = (): Promise<RewindableReducerState<GameStateDto, ChessMove>> => {
    return new Promise((resolve, reject) => {
        resolve(makeStartingRewindableState())
    })
}

export const saveBoardState = (boardState: RewindableReducerState<GameStateDto, ChessMove>): Promise<void> => {
    return writeToFile(BOARD_STATE_FILE, JSON.stringify(boardState))
        .then(() => console.log('Saved Board'))
}

export const retrieveBoardState = (): Promise<RewindableReducerState<GameStateDto, ChessMove>> => {
    return readFile(BOARD_STATE_FILE)
        .then(fileContent => {
            const serDeBoardState = JSON.parse(fileContent) as SerDeRewindableReducerState<GameStateDto, ChessMove>;
            const boardState: RewindableReducerState<GameStateDto, ChessMove> = {
                ...serDeBoardState,
                currentState: gameStateDtoAsClass(serDeBoardState.currentState),
                pastStates: serDeBoardState.pastStates.map(gameStateDtoAsClass),
                futureStates: serDeBoardState.futureStates.map(gameStateDtoAsClass),
                pastActions: serDeBoardState.pastActions.map(chessMoveAsClass),
                futureActions: serDeBoardState.futureActions.map(chessMoveAsClass)
            }
            return boardState
        })
}