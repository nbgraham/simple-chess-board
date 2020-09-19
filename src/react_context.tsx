import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Cell } from './models/cell';
import { ChessMove } from './models/chess_move';
import { useSubscribe } from './hooks/use_subscribe';
import { BoardColor } from './utils/board_utils';
import { chessMoveAsClass } from './utils/serde';
import { emptyGameState, GameStateDto } from './models/game_state_dto';
import { TBoardContext, BoardContextProviderProps } from './context';
import { useApiClient } from './api/use_api_client';
import { useShallowMemo } from './hooks/use_shallow_memo';
import { useConditionalExecution } from './hooks/use_conditional';
import { useAllowed } from './hooks/use_allowed';
import { SerDeRewindableReducerState } from './utils/rewindable_reducer';
import { useApiClientOfType } from './hooks/use_api_client_of_type';

const initialGameState = emptyGameState;

const BoardContext = React.createContext<TBoardContext>({
    gameState: initialGameState,
    moveHistory: [],
    resetBoard: () => { },
    undoLastMove: () => { },
    redoMove: () => { },
    setSelectedCell: (_) => { },
    availablePlacesToMove: [],
    makeMove: (_) => { },
    setPlayerColor: (_) => { }
});

export const ReactBoardContextProvider: React.FC<BoardContextProviderProps> = ({ children, apiClientType, controlBothSides }) => {
    const [gameState, setGameState] = useState(initialGameState);
    const [moveHistory, setMoveHistory] = useState([] as ChessMove[]);
    const [playerColor, setPlayerColor] = useState<BoardColor | undefined>()
    const [playerThatCanRedo, setPlayerThatCanRedo] = useState<BoardColor | undefined>()
    const [selectedCell, setSelectedCell] = useState<Cell | undefined>();
    const [availablePlacesToMove, setAvailablePlacesToMove] = useState<ChessMove[]>([]);

    const apiClient = useApiClientOfType(apiClientType);

    const onBoardChange = useCallback(
        (b: SerDeRewindableReducerState<GameStateDto, ChessMove>) => {
            setGameState(b.currentState)
            setMoveHistory(b.pastActions.map(chessMoveAsClass))
            setPlayerThatCanRedo(b.futureActions.length > 0 ? chessMoveAsClass(b.futureActions[0]).piece.color : undefined)
        },
        [setGameState, setMoveHistory, setPlayerThatCanRedo]
    )
    useSubscribe(() => apiClient.subcribeToBoard(onBoardChange), [apiClient, onBoardChange])

    useEffect(() => {
        setSelectedCell(undefined)
    }, [gameState]);

    useEffect(() => {
        if (selectedCell) {
            const newAvailablePlacesToMove = gameState.availableMoves[selectedCell.rowIndex][selectedCell.columnIndex];
            setAvailablePlacesToMove(newAvailablePlacesToMove);
        } else {
            setAvailablePlacesToMove([]);
        }
    }, [gameState, selectedCell]);

    const { canSelectCell, moveIsValidForCurrentPlayer } = useAllowed({ controlBothSides, playerColor, board: gameState.board})

    const { resetBoard, undoLastMove, redoMove, makeMove } = useApiClient(apiClient);

    const tryToSelectCell = useConditionalExecution(setSelectedCell, canSelectCell);
    const tryToMakeMove = useConditionalExecution(makeMove, moveIsValidForCurrentPlayer);

    const boardContextValue: TBoardContext = useShallowMemo({
        gameState,
        selectedCell,
        availablePlacesToMove,
        moveHistory,
        setSelectedCell: tryToSelectCell,
        resetBoard,
        undoLastMove,
        makeMove: tryToMakeMove,
        redoMove,
        playerColor,
        setPlayerColor,
        playerThatCanRedo
    });

    return (
        <BoardContext.Provider value={boardContextValue}>
            {children}
        </BoardContext.Provider>
    );
}

export const useReactBoardContext = () => useContext(BoardContext);