import { GameStateDto, emptyGameState } from "../models/game_state_dto"
import { ChessMove } from "../models/chess_move"
import { BoardColor } from "../utils/board_utils"
import { configureStore, createSlice, combineReducers, PayloadAction } from '@reduxjs/toolkit'
import { Cell } from "../models/cell"

type GameState = {
    gameState: GameStateDto,
    selectedCell?: Cell;
    availablePlacesToMove: ChessMove[];
}

const { actions: gameStateActions, reducer: gameStateReducer } = createSlice({
    name: 'gameState',
    initialState: { gameState: emptyGameState, availablePlacesToMove: [] } as GameState,
    reducers: {
        setGameState(state, action: PayloadAction<GameStateDto>){
            state.gameState = action.payload
            state.selectedCell = undefined
            state.availablePlacesToMove = getAvailablePlacesToMove(state.gameState, state.selectedCell)
        },
        setSelectedCell(state, action: PayloadAction<Cell | undefined>) {
            state.selectedCell = action.payload
            state.availablePlacesToMove = getAvailablePlacesToMove(state.gameState, state.selectedCell)
        },
    }
})

function getAvailablePlacesToMove(gameState: GameStateDto, selectedCell?: Cell): ChessMove[] {
    if (selectedCell) {
        return gameState.availableMoves[selectedCell.rowIndex][selectedCell.columnIndex];
    } else {
        return [];
    }
}

const { actions: moveHistoryActions, reducer: moveHistoryReducer } = createSlice({
    name: 'moveHistory',
    initialState: [] as ChessMove[],
    reducers: {
        replace: (state, action: PayloadAction<ChessMove[]>) => action.payload,
    }
})

type PlayerState = {
    selectedColor?: BoardColor;
    canRedo: boolean;
    controlBothSides?: boolean;
}
const { actions: playerActions, reducer: playerReducer } = createSlice({
    name: 'player',
    initialState: { canRedo: false } as PlayerState,
    reducers: {
        setCanRedo(state, action: PayloadAction<boolean>) {
            state.canRedo = action.payload
        },
        setSelectedColor(state, action: PayloadAction<BoardColor>) {
            state.selectedColor = action.payload
        },
        setControlBothSides(state, action: PayloadAction<boolean>) {
            state.controlBothSides = action.payload
        }
    }
})

const rootReducer = combineReducers({
    gameState: gameStateReducer,
    moveHistory: moveHistoryReducer,
    player: playerReducer,
})
const store = configureStore({ reducer: rootReducer })
export type RootState = ReturnType<typeof rootReducer>

export { store, gameStateActions, moveHistoryActions, playerActions };