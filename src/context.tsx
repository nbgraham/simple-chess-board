import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import { Board, BoardReducerAction, useBoardReducer } from './models/board';
import { Cell } from './models/cell';
import { ChessMove } from './models/chess_move';
import { boardReducer, BoardReducerAction } from './reducers/board_reducer';
import { AvailableMovesService } from './services/available_moves';

type TBoardContext = {
    board: Board;
    selectedCell?: Cell;
    setSelectedCell: (selectedCell?: Cell) => void;
    availablePlacesToMove: ChessMove[];
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
export const BoardContextProvider = ({ children }: BoardContextProviderProps) => {
    const [board, dispatchAction] = useReducer(boardReducer, getInitialBoard());
    const [selectedCell, setSelectedCell] = useState<Cell | undefined>();
    const [availablePlacesToMove, setAvailablePlacesToMove] = useState<ChessMove[]>([]);

    useEffect(() => {
        if (board.colorWhoJustMovedIsInCheck()) {
            dispatchAction({ type: 'undo' });
        }
        sessionStorage.setItem(SESSION_STORAGE_BOARD_KEY, JSON.stringify(board));
        setSelectedCell(undefined)
    }, [board]);

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
    const boardContextValue: TBoardContext = useMemo(() => ({
        board, selectedCell, setSelectedCell: tryToSelectCell, availablePlacesToMove, dispatchAction
    }), [board, selectedCell, tryToSelectCell, availablePlacesToMove, dispatchAction]);

    return (
        <BoardContext.Provider value={boardContextValue}>
            {children}
        </BoardContext.Provider>
    );
}