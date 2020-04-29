import socketio, { Socket } from 'socket.io';
import { ChessMove } from "../src/models/chess_move";
import { chessServerEvents } from "../src/api_client";
import { boardReducer } from "../src/reducers/board_reducer";
import { makeRewindableReducer, UNDO, REDO, RESET, RewindableReducerAction } from '../src/utils/rewindable_reducer'
import { getInitialState, saveBoardState } from './save';

const PORT = 8000;
const RESUME = true;

const io = socketio();

async function startServer() {
    const startingBoardState = await getInitialState(false)
    const rewindableReducer = makeRewindableReducer(boardReducer, startingBoardState)

    const initialResumedRewindableBoardState = await getInitialState(RESUME)
    let currentRewindableBoardState = initialResumedRewindableBoardState;
    async function updateBoardState(action: RewindableReducerAction<ChessMove>) {
        const prevBoardState = currentRewindableBoardState;
        try {
            console.log('Updating board with action', JSON.stringify(action))
            currentRewindableBoardState = rewindableReducer(currentRewindableBoardState, action)
            if (currentRewindableBoardState.currentState.colorWhoJustMovedIsInCheck()) {
                console.warn('Last move put the current player in check. Undoing the move')
                currentRewindableBoardState = rewindableReducer(currentRewindableBoardState, UNDO.action)
            }
        } catch (error) {
            console.error('Action requested by client caused an error', action, error);
            currentRewindableBoardState = prevBoardState;
        }

        io.emit(chessServerEvents.updateBoardState, currentRewindableBoardState)
        await saveBoardState(currentRewindableBoardState)
    }

    io.on('connection', (client: Socket) => {
        console.log('client connected ', client.id)
        client.on('disconnect', () => {
            console.log('client disconnected ', client.id);
        });

        client.on(chessServerEvents.subscribeToBoard, () => {
            console.log('client subscribes to board ', client.id)
            client.emit(chessServerEvents.updateBoardState, currentRewindableBoardState)
        });

        client.on(chessServerEvents.sendMove, (move: ChessMove) => {
            updateBoardState(move)
        })

        client.on(chessServerEvents.undoMove, () => {
            updateBoardState(UNDO.action)
        })

        client.on(chessServerEvents.redoMove, () => {
            updateBoardState(REDO.action)
        })

        client.on(chessServerEvents.resetBoard, () => {
            updateBoardState(RESET.action)
        })
    });

    io.listen(PORT);
    console.log('listening on port ', PORT);
}

startServer();