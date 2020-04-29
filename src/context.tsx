import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import { Board, BoardReducerAction, useBoardReducer } from './models/board';
import { Cell } from './models/cell';

type TBoardContext = {
    board: Board;
    selectedCell?: Cell;
    setSelectedCell: (selectedCell?: Cell) => void;
    availablePlacesToMove: Cell[];
    dispatchAction: (action: BoardReducerAction) => void;
}
const BoardContext = React.createContext<TBoardContext>({
    board: new Board(),
    setSelectedCell: (_) => { },
    availablePlacesToMove: [],
    dispatchAction: (_) => { }
});

export const useBoardContext = () => useContext(BoardContext);
type BoardContextProviderProps = {
    children: React.ReactNode;
}
export const BoardContextProvider = ({children}: BoardContextProviderProps) => {
    const [board, dispatchAction] = useBoardReducer();
    const [selectedCell, setSelectedCell] = useState<Cell | undefined>();
    const [availablePlacesToMove, setAvailablePlacesToMove] = useState<Cell[]>([]);

    useEffect(() => setSelectedCell(undefined), [board]);
    useEffect(() => {
        if (selectedCell) {
            const newAvailablePlacesToMove = board.getAvailablePlacesToMoveFrom(selectedCell);
            setAvailablePlacesToMove(newAvailablePlacesToMove);
        } else {
            setAvailablePlacesToMove([]);
        }
    }, [board, selectedCell]);

    const tryToSelectCell = useCallback(
        (cellToSelect?: Cell) => {
            if (cellToSelect) {
                const currentPiece = board.pieceAtCell(cellToSelect);
                if (!!currentPiece && currentPiece.color === board.currentTurn) {
                    setSelectedCell(cellToSelect);
                }
            } else {
                setSelectedCell(cellToSelect);
            }
        },
        [board, setSelectedCell]
    )
    const boardContextValue: TBoardContext = useMemo(() => ({
        board, selectedCell, setSelectedCell: tryToSelectCell, availablePlacesToMove, dispatchAction
    }), [board, selectedCell, tryToSelectCell, availablePlacesToMove, dispatchAction]);

    return (
        <BoardContext.Provider value={boardContextValue}>
            {children}
        </BoardContext.Provider>
    );
}