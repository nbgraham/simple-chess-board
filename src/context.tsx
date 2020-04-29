import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Board } from './models/board';
import { Cell } from './models/cell';
import { ChessMove, fromSerDeClass } from './models/chess_move';
import { API_CLIENT } from './api_client';

type TBoardContext = {
    board: Board;
    moveHistory: ChessMove[]
    resetBoard: () => void;
    undoLastMove: () => void;
    redoMove: () => void;
    selectedCell?: Cell;
    setSelectedCell: (selectedCell?: Cell) => void;
    availablePlacesToMove: ChessMove[];
    dispatchAction: (action: ChessMove) => void;
}
const BoardContext = React.createContext<TBoardContext>({
    board: new Board(),
    moveHistory: [],
    resetBoard: () => { },
    undoLastMove: () => { },
    redoMove: () => { },
    setSelectedCell: (_) => { },
    availablePlacesToMove: [],
    dispatchAction: (_) => { }
});

const initialBoard = new Board()
export const useBoardContext = () => useContext(BoardContext);
type BoardContextProviderProps = {
    children: React.ReactNode;
}
export const BoardContextProvider = ({ children }: BoardContextProviderProps) => {
    const [board, setBoard] = useState(initialBoard);
    const [moveHistory, setMoveHistory] = useState([] as ChessMove[]);

    useEffect(
        () => {
            const subscription = API_CLIENT.subcribeToBoard(b => {
                setBoard(b.currentState)
                setMoveHistory(b.pastActions.map(fromSerDeClass))
            })
            return subscription.unsubscribe;
        },
        []
    )

    const [selectedCell, setSelectedCell] = useState<Cell | undefined>();
    const [availablePlacesToMove, setAvailablePlacesToMove] = useState<ChessMove[]>([]);

    useEffect(() => {
        setSelectedCell(undefined)
    }, [board]);

    useEffect(() => {
        if (selectedCell) {
            const newAvailablePlacesToMove = board.availableMoves[selectedCell.rowIndex][selectedCell.columnIndex];
            setAvailablePlacesToMove(newAvailablePlacesToMove);
        } else {
            setAvailablePlacesToMove([]);
        }
    }, [board, selectedCell]);

    const tryToSelectCell = useCallback(
        (cellToSelect?: Cell) => {
            if (cellToSelect === undefined) {
                return setSelectedCell(undefined);
            }
            const currentPiece = board.getPiece(cellToSelect);
            if (!!currentPiece && currentPiece.color === board.currentTurn) {
                return setSelectedCell(cellToSelect);
            }
        },
        [board, setSelectedCell]
    )
    
    const dispatchAction = useCallback((move: ChessMove) => API_CLIENT.sendMove(move), [])
    const resetBoard = useCallback(() => API_CLIENT.resetBoard(), [])
    const undoLastMove = useCallback(() => API_CLIENT.undoMove(), [])
    const redoMove = useCallback(() => API_CLIENT.redoMove(), [])

    const boardContextValue: TBoardContext = useMemo(() => ({
        board,
        selectedCell,
        availablePlacesToMove,
        moveHistory,
        setSelectedCell: tryToSelectCell,
        resetBoard,
        undoLastMove,
        dispatchAction,
        redoMove,
    }), [board, selectedCell, availablePlacesToMove, moveHistory, tryToSelectCell, resetBoard, undoLastMove, dispatchAction, redoMove]);

    return (
        <BoardContext.Provider value={boardContextValue}>
            {children}
        </BoardContext.Provider>
    );
}