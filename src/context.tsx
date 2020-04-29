import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SESSION_STORAGE_BOARD_KEY } from './constants';
import { Board } from './models/board';
import { Cell } from './models/cell';
import { ChessMove } from './models/chess_move';
import { boardReducer, BoardReducerAction } from './reducers/board_reducer';
import { AvailableMovesService } from './services/available_moves';
import { useRewindableReducer, SaveOptions } from './hooks/use_rewindable_reducer';

type TBoardContext = {
    board: Board;
    moveHistory: BoardReducerAction[]
    resetBoard: () => void;
    undoLastMove: () => void;
    redoMove: () => void;
    selectedCell?: Cell;
    setSelectedCell: (selectedCell?: Cell) => void;
    availablePlacesToMove: ChessMove[];
    dispatchAction: (action: BoardReducerAction) => void;
}
const BoardContext = React.createContext<TBoardContext>({
    board: new Board(),
    moveHistory: [],
    resetBoard: () => { },
    undoLastMove: () => { },
    redoMove: () => {},
    setSelectedCell: (_) => { },
    availablePlacesToMove: [],
    dispatchAction: (_) => { }
});

const initialBoard = new Board()
const saveOptions: Partial<SaveOptions<Board, BoardReducerAction>> = {
    saveKey: 'chess-board',
    deserializeState: Board.fromJSON
}
export const useBoardContext = () => useContext(BoardContext);
type BoardContextProviderProps = {
    children: React.ReactNode;
}
export const BoardContextProvider = ({ children }: BoardContextProviderProps) => {
    const {
        state: board,
        dispatch: dispatchAction,
        undo: undoLastMove,
        redo: redoMove,
        reset: resetBoard,
        pastActions: moveHistory
    } = useRewindableReducer(boardReducer, initialBoard, saveOptions);
    const [selectedCell, setSelectedCell] = useState<Cell | undefined>();
    const [availablePlacesToMove, setAvailablePlacesToMove] = useState<ChessMove[]>([]);

    useEffect(() => {
        if (board.colorWhoJustMovedIsInCheck()) {
            undoLastMove()
        }
        sessionStorage.setItem(SESSION_STORAGE_BOARD_KEY, JSON.stringify(board));
        setSelectedCell(undefined)
    }, [board, undoLastMove]);

    useEffect(() => {
        if (selectedCell) {
            const service = new AvailableMovesService(board);
            const newAvailablePlacesToMove = service.getAvailablePlacesToMoveFrom(selectedCell);
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
        board, resetBoard, undoLastMove, selectedCell, setSelectedCell: tryToSelectCell, availablePlacesToMove, dispatchAction, moveHistory, redoMove
    }), [board, resetBoard, undoLastMove, selectedCell, tryToSelectCell, availablePlacesToMove, dispatchAction, moveHistory, redoMove]);

    return (
        <BoardContext.Provider value={boardContextValue}>
            {children}
        </BoardContext.Provider>
    );
}