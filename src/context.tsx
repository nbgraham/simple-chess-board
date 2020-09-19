import React, {  } from 'react';
import { Cell } from './models/cell';
import { ChessMove } from './models/chess_move';
import { BoardColor } from './utils/board_utils';
import { GameStateDto } from './models/game_state_dto';
import { useReactBoardContext, ReactBoardContextProvider } from './react_context';
import { ReduxBoardContextProvider, useReduxBoardContext } from './redux/redux_context';
import { ApiClientType } from './hooks/use_api_client_of_type';

export type TBoardContext = {
    gameState: GameStateDto;
    moveHistory: ChessMove[]
    resetBoard: () => void;
    undoLastMove: () => void;
    redoMove: () => void;
    playerThatCanRedo?: BoardColor
    selectedCell?: Cell;
    setSelectedCell: (selectedCell?: Cell) => void;
    availablePlacesToMove: ChessMove[];
    makeMove: (action: ChessMove) => void;
    playerColor?: BoardColor,
    setPlayerColor: (color: BoardColor) => void
}
export type BoardContextProviderProps = {
    children: React.ReactNode;
    controlBothSides?: boolean;
    apiClientType: ApiClientType;
}

const contextType: 'react' | 'redux' = 'redux';

export const BoardContextProvider: React.ComponentType<BoardContextProviderProps> = 
    contextType === 'redux' ? ReduxBoardContextProvider : ReactBoardContextProvider;
export const useBoardContext: () => TBoardContext = 
    contextType === 'redux' ? useReduxBoardContext : useReactBoardContext;
