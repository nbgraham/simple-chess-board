import React, { useMemo } from 'react';
import { PieceType } from '../models/piece';
import { useBoardContext } from '../context';
import { Cell } from '../models/cell';
import { PieceIcon } from './piece_icon';
import { BoardUtils } from '../utils/board_utils';
import { Board } from '../models/board';
import { PromotablePawnOptions } from './promotable_piece';
import { conditionalClassNames } from '../utils/conditional_classnames';
import { ChessMove } from '../models/chess_move';

const pieceStyle: React.CSSProperties = { height: '60%' };

type CellProps = {
    rowIndex: number;
    columnIndex: number;
}
export const CellComponent: React.FC<CellProps> = ({ rowIndex, columnIndex }) => {
    const {
        gameState, setSelectedCell, selectedCell, availablePlacesToMove, makeMove
    } = useBoardContext();

    const thisCell: Cell = { rowIndex, columnIndex };
    const currentPiece = Board.getPiece(gameState.board, thisCell);

    const isPromotablePawn = currentPiece && currentPiece.type === 'pawn' &&
        BoardUtils.isCellAlongFarRowForColor(thisCell, currentPiece.color);

    const availableMoveForThisCell = useMemo(
        () => availablePlacesToMove.find(availbleMove => Cell.equals(availbleMove.moveTo, thisCell)),
        [availablePlacesToMove, thisCell]
    );

    const promotePawn =
        (type: PieceType) => currentPiece && makeMove({
            type: 'promote_pawn',
            location: thisCell,
            piece: currentPiece,
            promotedTo: type
        });

    const handleClickCell = () => {
        if (availableMoveForThisCell) {
            makeMove(availableMoveForThisCell);
        } else {
            const currentCellIsSelected = Cell.equals(thisCell, selectedCell);
            setSelectedCell(currentCellIsSelected ? undefined : thisCell);
        }
    }

    const classNames = getCellClassNames(gameState.board, thisCell, selectedCell, availableMoveForThisCell);
    
    return (
        <div
            className={classNames}
            onClick={handleClickCell}
            data-testid={Cell.toString(thisCell)}
        >
            {
                !currentPiece ? null
                    : isPromotablePawn ? <PromotablePawnOptions color={currentPiece.color} promotePawn={promotePawn} />
                        : <PieceIcon style={pieceStyle} piece={currentPiece} />
            }
        </div>
    );
}

function getCellClassNames(board: Board, thisCell: Cell, selectedCell: Cell | undefined, availableMoveForThisCell: ChessMove | undefined) {
    const isSelected = selectedCell && Cell.equals(selectedCell, thisCell);
    const isAvailableToMoveTo = !!availableMoveForThisCell;
    const isLastMovedPiece = Board.lastMovedPieceIsOnThisCell(board, thisCell);
    const stateClassNames = conditionalClassNames([[isSelected, 'selected'], [isAvailableToMoveTo, 'available'], [isLastMovedPiece, 'lastMoved']]);

    const cellBoardColor = BoardUtils.getCellColor(thisCell);

    return `cell boardColor${cellBoardColor} ${stateClassNames}`;
}
