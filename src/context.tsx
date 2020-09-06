import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Cell } from './models/cell';
import { ChessMove } from './models/chess_move';
import { IApiClient } from './api_client';
import { Board } from './models/board';
import { useSubscribe } from './hooks/use_subscribe';
import { BoardColor } from './utils/board_utils';
import { chessMoveAsClass } from './utils/serde';
import { GameStateDto, emptyGameState } from './models/game_state_dto';
import { Piece } from './models/piece';

const initialGameState = emptyGameState;

type TBoardContext = {
    gameState: GameStateDto;
    moveHistory: ChessMove[]
    resetBoard: () => void;
    undoLastMove: () => void;
    redoMove: () => void;
    playerThatCanRedo?: BoardColor
    selectedCell?: Cell;
    setSelectedCell: (selectedCell?: Cell) => void;
    availablePlacesToMove: ChessMove[];
    dispatchAction: (action: ChessMove) => void;
    playerColor?: BoardColor,
    setPlayerColor: (color: BoardColor) => void
}
const BoardContext = React.createContext<TBoardContext>({
    gameState: initialGameState,
    moveHistory: [],
    resetBoard: () => { },
    undoLastMove: () => { },
    redoMove: () => { },
    setSelectedCell: (_) => { },
    availablePlacesToMove: [],
    dispatchAction: (_) => { },
    setPlayerColor: (_) => { }
});

export const useBoardContext = () => useContext(BoardContext);
type BoardContextProviderProps = {
    children: React.ReactNode;
    controlBothSides?: boolean;
    apiClient: IApiClient;
}
export const BoardContextProvider = ({ children, apiClient, controlBothSides }: BoardContextProviderProps) => {
    const [gameState, setGameState] = useState(initialGameState);
    const [moveHistory, setMoveHistory] = useState([] as ChessMove[]);
    const [playerColor, setPlayerColor] = useState<BoardColor | undefined>()
    const [playerThatCanRedo, setPlayerThatCanRedo] = useState<BoardColor | undefined>()

    useSubscribe(() => apiClient.subcribeToBoard(b => {
        setGameState(b.currentState)
        setMoveHistory(b.pastActions.map(chessMoveAsClass))
        setPlayerThatCanRedo(b.futureActions.length > 0 ? chessMoveAsClass(b.futureActions[0]).piece.color : undefined)
    }), [])

    const [selectedCell, setSelectedCell] = useState<Cell | undefined>();
    const [availablePlacesToMove, setAvailablePlacesToMove] = useState<ChessMove[]>([]);

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

    const pieceIsValidForPlayerToMove = useCallback(
        (piece: Piece) => controlBothSides || (playerColor && piece.color === playerColor),
        [controlBothSides, playerColor]
    );

    const tryToSelectCell = useCallback(
        (cellToSelect?: Cell) => {
            if (cellToSelect === undefined) {
                return setSelectedCell(undefined);
            }
            const currentPiece = Board.getPiece(gameState.board, cellToSelect);
            if (!!currentPiece && pieceIsValidForPlayerToMove(currentPiece)) {
                return setSelectedCell(cellToSelect);
            }
        },
        [gameState, setSelectedCell, pieceIsValidForPlayerToMove]
    )

    const dispatchAction = useCallback((move: ChessMove) => {
        if (pieceIsValidForPlayerToMove(move.piece)) {
            if (move.type === 'promote_pawn' || move.piece.color === gameState.board.currentTurn) {
                apiClient.sendMove(move)
            }
        }
    }, [playerColor, gameState, pieceIsValidForPlayerToMove])
    const resetBoard = useCallback(() => apiClient.resetBoard(), [])
    const undoLastMove = useCallback(() => apiClient.undoMove(), [])
    const redoMove = useCallback(() => apiClient.redoMove(), [])

    const boardContextValue: TBoardContext = useMemo(() => ({
        gameState,
        selectedCell,
        availablePlacesToMove,
        moveHistory,
        setSelectedCell: tryToSelectCell,
        resetBoard,
        undoLastMove,
        dispatchAction,
        redoMove,
        playerColor,
        setPlayerColor,
        playerThatCanRedo
    }), [gameState, selectedCell, availablePlacesToMove, moveHistory, tryToSelectCell, resetBoard, undoLastMove, dispatchAction, redoMove, playerColor, setPlayerColor, playerThatCanRedo]);

    return (
        <BoardContext.Provider value={boardContextValue}>
            {children}
        </BoardContext.Provider>
    );
}