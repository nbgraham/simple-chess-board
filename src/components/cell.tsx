import React, { useCallback, useMemo } from 'react';
import { PieceType, Piece } from '../models/piece';
import { useBoardContext } from '../context';
import { Cell } from '../models/cell';
import { PieceIcon } from './piece_icon';
import { BoardUtils, BoardColor } from '../utils/board_utils';
import { Board } from '../models/board';

const PAWN_PROMOTION_PIECE_TYPES = ['queen', 'knight', 'rook', 'bishop'] as PieceType[];

type CellProps = {
    rowIndex: number;
    columnIndex: number;
}
export const CellComponent = ({ rowIndex, columnIndex }: CellProps) => {
    const thisCell: Cell = useMemo(
        () => ({ rowIndex, columnIndex }),
        [rowIndex, columnIndex]
    );

    const {
        gameState, setSelectedCell, selectedCell, availablePlacesToMove, dispatchAction
    } = useBoardContext();

    const cellBoardColor = BoardUtils.getCellColor(thisCell);
    const currentPiece = Board.getPiece(gameState.board, thisCell);
    const isSelected = selectedCell && Cell.equals(selectedCell, thisCell);

    const toggleSelected = useCallback(
        () => Cell.equals(thisCell, selectedCell) ? setSelectedCell(undefined) : setSelectedCell(thisCell),
        [setSelectedCell, selectedCell, thisCell]
    );

    const availableMoveForThisCell = useMemo(
        () => availablePlacesToMove.find(availbleMove => Cell.equals(availbleMove.moveTo, thisCell)),
        [availablePlacesToMove, thisCell]
    );
    const isAvailableToMoveTo = !!availableMoveForThisCell;

    const moveToCell = useCallback(
        () => availableMoveForThisCell && dispatchAction(availableMoveForThisCell),
        [availableMoveForThisCell, dispatchAction]
    );

    const isPromotablePawn = currentPiece && currentPiece.type === 'pawn' &&
        BoardUtils.isCellAlongFarRowForColor(thisCell, currentPiece.color);
    const selectPromotion = useCallback(
        (type: PieceType) => currentPiece && dispatchAction({
            type: 'promote_pawn',
            location: thisCell,
            piece: currentPiece,
            promotedTo: type
        }),
        [dispatchAction, thisCell, currentPiece]
    )

    const isLastMovedPiece = useMemo(() => Cell.equals(gameState.board.lastMovedPiece?.cell, thisCell), [gameState.board, thisCell])

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
                    : currentPiece && <PieceIcon style={{ height: '60%' }} piece={currentPiece} />
            }
        </div>
    );
}

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
        <PieceIcon piece={piece} style={{ height: '20%' }} onClick={select} />
    );
}