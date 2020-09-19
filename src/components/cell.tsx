import React, { useCallback, useMemo } from 'react';
import { PieceType, Piece } from '../models/piece';
import { useBoardContext } from '../context';
import { Cell } from '../models/cell';
import { PieceIcon } from './piece_icon';
import { BoardUtils, BoardColor } from '../utils/board_utils';
import { Board } from '../models/board';
import { ChessMove } from '../models/chess_move';

const PAWN_PROMOTION_PIECE_TYPES = ['queen', 'knight', 'rook', 'bishop'] as PieceType[];

type CellProps = {
    rowIndex: number;
    columnIndex: number;
}

export const CellComponent: React.FC<CellProps> = ({ rowIndex, columnIndex }) => {
    const thisCell: Cell = useMemo(
        () => ({ rowIndex, columnIndex }),
        [rowIndex, columnIndex]
    );

    const {
        gameState, setSelectedCell, selectedCell, availablePlacesToMove, makeMove
    } = useBoardContext();

    const currentPiece = Board.getPiece(gameState.board, thisCell);
    const isLastMovedPiece = useMemo(() => Cell.equals(gameState.board.lastMovedPiece?.cell, thisCell), [gameState.board, thisCell])

    const isSelected = selectedCell && Cell.equals(selectedCell, thisCell);

    const currentCellIsSelected = Cell.equals(thisCell, selectedCell);
    const toggleSelected = useCallback(
        () => currentCellIsSelected ? setSelectedCell(undefined) : setSelectedCell(thisCell),
        [setSelectedCell, currentCellIsSelected, thisCell]
    );

    const availableMoveForThisCell = useMemo(
        () => availablePlacesToMove.find(availbleMove => Cell.equals(availbleMove.moveTo, thisCell)),
        [availablePlacesToMove, thisCell]
    );

    return <InnerCellComponent
        thisCell={thisCell}
        currentPiece={currentPiece}
        isLastMovedPiece={isLastMovedPiece}
        isSelected={isSelected}
        toggleSelected={toggleSelected}
        availableMoveForThisCell={availableMoveForThisCell}
        makeMove={makeMove}
    />;
}

const pieceStyle: React.CSSProperties = { height: '60%' };
type InnerCellProps = {
    thisCell: Cell;
    currentPiece: Piece | null | undefined;
    isLastMovedPiece: boolean;
    isSelected: boolean | undefined;
    toggleSelected: () => void;
    availableMoveForThisCell: ChessMove | undefined;
    makeMove: (move: ChessMove) => void;
}
const _InnerCellComponent: React.FC<InnerCellProps> = (props) => {
    const { thisCell, currentPiece, isLastMovedPiece, isSelected, toggleSelected, availableMoveForThisCell, makeMove  } = props;
    const cellBoardColor = BoardUtils.getCellColor(thisCell);

    const isAvailableToMoveTo = !!availableMoveForThisCell;

    const moveToCell = useCallback(
        () => availableMoveForThisCell && makeMove(availableMoveForThisCell),
        [availableMoveForThisCell, makeMove]
    );

    const isPromotablePawn = currentPiece && currentPiece.type === 'pawn' &&
        BoardUtils.isCellAlongFarRowForColor(thisCell, currentPiece.color);
    const selectPromotion = useCallback(
        (type: PieceType) => currentPiece && makeMove({
            type: 'promote_pawn',
            location: thisCell,
            piece: currentPiece,
            promotedTo: type
        }),
        [makeMove, thisCell, currentPiece]
    )

    const classNames = optionalClassNames([[isSelected, 'selected'], [isAvailableToMoveTo, 'available'], [isLastMovedPiece, 'lastMoved']])
    return (
        <div
            className={`cell boardColor${cellBoardColor} ${classNames}`}
            onClick={isPromotablePawn ? undefined : isAvailableToMoveTo ? moveToCell : toggleSelected}
            data-testid={Cell.toString(thisCell)}
        >
            {
                isPromotablePawn && currentPiece
                    ? <PromotablePawnOptions color={currentPiece.color} selectPromotion={selectPromotion} />
                    : currentPiece && <PieceIcon style={pieceStyle} piece={currentPiece} />
            }
        </div>
    );
};
const InnerCellComponent = React.memo(_InnerCellComponent)

type OptionalClassName = [boolean | undefined, string]
const optionalClassNames = (options: Array<OptionalClassName>) => options.filter(o => o[0]).map(o => o[1]).join(' ')

type PromotablePawnOptionsProps = {
    color: BoardColor
    selectPromotion: (type: PieceType) => void;
}
const PromotablePawnOptions = ({ color, selectPromotion }: PromotablePawnOptionsProps) => {
    const promotableOptions = useMemo(
        () => PAWN_PROMOTION_PIECE_TYPES.map(type => Piece.create(type, color)),
        [color]
    )
    return (
        <>
            <div style={{ display: 'flex,', flexDirection: 'column' }}>
                <PromotablePiece piece={promotableOptions[0]} selectPromotion={selectPromotion} />
                <PromotablePiece piece={promotableOptions[1]} selectPromotion={selectPromotion} />
            </div>
            <div style={{ display: 'flex,', flexDirection: 'column' }}>
                <PromotablePiece piece={promotableOptions[2]} selectPromotion={selectPromotion} />
                <PromotablePiece piece={promotableOptions[3]} selectPromotion={selectPromotion} />
            </div>
        </>
    )
}

const promotablePieceStyle: React.CSSProperties = { height: '20%' };
type PromotablePieceProps = {
    piece: Piece
    selectPromotion: (type: PieceType) => void;
}
const PromotablePiece = ({ piece, selectPromotion }: PromotablePieceProps) => {
    const select = useCallback(
        () => selectPromotion(piece.type),
        [selectPromotion, piece]
    )
    return (
        <PieceIcon piece={piece} style={promotablePieceStyle} onClick={select} />
    );
}