import React, { useCallback, useMemo } from 'react';
import { PieceType, TPiece, Piece } from '../models/piece';
import { useBoardContext } from '../context';
import { Cell } from '../models/cell';
import { BoardColor, Board } from '../models/board';
import { PieceIcon } from './piece_icon';

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
        board, setSelectedCell, selectedCell, availablePlacesToMove, dispatchAction
    } = useBoardContext();

    const cellBoardColor = Board.getCellColor(thisCell);
    const currentPiece = board.getPiece(thisCell);
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
        () => selectedCell && availableMoveForThisCell && dispatchAction({
            ...availableMoveForThisCell,
            type: 'move',
            moveFrom: selectedCell,
            moveTo: thisCell,
        }),
        [selectedCell, availableMoveForThisCell, dispatchAction, thisCell]
    );

    const isPromotablePawn = currentPiece && currentPiece.type === 'pawn' &&
        Board.isCellAlongFarRowForColor(thisCell, currentPiece.color);
    const selectPromotion = useCallback(
        (type: PieceType) => currentPiece && dispatchAction({
            type: 'promote_pawn',
            location: thisCell,
            pieceColor: currentPiece.color,
            promotedTo: type
        }),
        [dispatchAction, thisCell, currentPiece]
    )

    return (
        <div
            className={`cell boardColor${cellBoardColor} ${isSelected ? 'selected' : ''} ${isAvailableToMoveTo ? 'available' : ''}`}
            onClick={isPromotablePawn ? undefined : isAvailableToMoveTo ? moveToCell : toggleSelected}
        >
            {
                isPromotablePawn && currentPiece
                    ? <PromotablePawnOptions color={currentPiece.color} selectPromotion={selectPromotion} />
                    : currentPiece && <PieceIcon style={{ height: '60%' }} piece={currentPiece} />
            }
        </div>
    );
}

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
    piece: TPiece
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