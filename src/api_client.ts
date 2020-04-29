import io from 'socket.io-client';
import { ChessMove } from './models/chess_move';
import { RewindableReducerState, SerDeRewindableReducerState } from './utils/rewindable_reducer';
import { SerDeClass, boardDtoAsClass, chessMoveAsClass, gameStateDtoAsClass } from './utils/serde';
import { GameStateDto } from './models/game_state_dto';

const API_URL = 'http://192.168.1.191:8000';

export const chessServerEvents = {
    subscribeToBoard: 'subscribe_to_board',
    updateBoardState: 'update_board_state',
    sendMove: 'send_move',
    undoMove: 'undo_move',
    redoMove: 'redo_move',
    resetBoard: 'reset_board',
}

class ApiClient {
    socket: SocketIOClient.Socket;

    constructor(apiUrl: string) {
        this.socket = io(apiUrl);
    }

    private emit(event: keyof typeof chessServerEvents, ...args: any[]) {
        console.debug('Emit event:', event)
        return this.socket.emit(chessServerEvents[event], ...args)
    }

    private on(event: keyof typeof chessServerEvents, fn: Function) {
        return this.socket.on(chessServerEvents[event], (...args: any[]) => {
            console.debug('Recieved event:', event)
            fn(...args)
        })
    }

    subcribeToBoard(cb: (s: SerDeRewindableReducerState<GameStateDto, ChessMove>) => void) {
        const listener = (boardHistory: RewindableReducerState<SerDeClass<GameStateDto>, ChessMove>) => {
            console.debug('Got new board from server', boardHistory)
            const value = {
                ...boardHistory,
                currentState: gameStateDtoAsClass(boardHistory.currentState),
                pastStates: boardHistory.pastStates.map(boardDtoAsClass),
                futureStates: boardHistory.futureStates.map(boardDtoAsClass),
                pastActions: boardHistory.pastActions.map(chessMoveAsClass),
                futureActions: boardHistory.futureActions.map(chessMoveAsClass)
            }
            cb(value)
        }
        this.on('updateBoardState', listener)
        this.emit('subscribeToBoard')
        return {
            unsubscribe: () => { this.socket.removeListener(chessServerEvents.updateBoardState, listener) }
        }
    }

    sendMove(move: ChessMove) {
        this.emit('sendMove', move)
    }

    undoMove() {
        this.emit('undoMove', '')
    }

    redoMove() {
        this.emit('redoMove', '')
    }

    resetBoard() {
        this.emit('resetBoard', '')
    }
}

export const API_CLIENT = new ApiClient(API_URL)