import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Cell } from './models/cell';
import { ChessMove } from './models/chess_move';
import { API_CLIENT } from './api_client';
import { Board } from './models/board';
import { useSubscribe } from './hooks/use_subscribe';
import { BoardColor } from './utils/board_utils';
import { chessMoveAsClass } from './utils/serde';
import { GameStateDto, emptyGameState } from './models/game_state_dto';

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
}
export const BoardContextProvider = ({ children }: BoardContextProviderProps) => {
    const [gameState, setGameState] = useState(initialGameState);
    const [moveHistory, setMoveHistory] = useState([] as ChessMove[]);
    const [playerColor, setPlayerColor] = useState<BoardColor | undefined>()
    const [playerThatCanRedo, setPlayerThatCanRedo] = useState<BoardColor | undefined>()

    useSubscribe(() => API_CLIENT.subcribeToBoard(b => {
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

    const tryToSelectCell = useCallback(
        (cellToSelect?: Cell) => {
            if (cellToSelect === undefined) {
                return setSelectedCell(undefined);
            }
            const currentPiece = Board.getPiece(gameState.board, cellToSelect);
            if (!!currentPiece && currentPiece.color === playerColor) {
                return setSelectedCell(cellToSelect);
            }
        },
        [gameState, setSelectedCell, playerColor]
    )

    const dispatchAction = useCallback((move: ChessMove) => {
        if (playerColor && move.piece.color === playerColor) {
            if (move.type === 'promote_pawn' || move.piece.color === gameState.board.currentTurn) {
                API_CLIENT.sendMove(move)
            }
        }
    }, [playerColor, gameState])
    const resetBoard = useCallback(() => API_CLIENT.resetBoard(), [])
    const undoLastMove = useCallback(() => API_CLIENT.undoMove(), [])
    const redoMove = useCallback(() => API_CLIENT.redoMove(), [])

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