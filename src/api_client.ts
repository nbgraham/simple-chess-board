import io from 'socket.io-client';
import { Board } from './models/board';
import { ChessMove } from './models/chess_move';
import { RewindableReducerState, SerDeRewindableReducerState } from './utils/rewindable_reducer';
import { SerDeClass, boardAsClass } from './utils/serde';

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

    subcribeToBoard(cb: (s: SerDeRewindableReducerState<Board, ChessMove>) => void) {
        const listener = (boardHistory: RewindableReducerState<SerDeClass<Board>, ChessMove>) => {
            console.debug('Got new board from server', boardHistory)
            const value = {
                ...boardHistory,
                currentState: boardAsClass(boardHistory.currentState)
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