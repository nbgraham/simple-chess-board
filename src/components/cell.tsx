import React, { useCallback, useMemo } from 'react';
import { PieceType, TPiece, Piece } from '../models/piece';
import { useBoardContext } from '../context';
import { Cell } from '../models/cell';
import { BoardColor } from '../models/board';

const PAWN_PROMOTION_PIECE_TYPES = ['queen', 'knight', 'rook', 'bishop'] as PieceType[];

type CellProps = {
    rowIndex: number;
    columnIndex: number;
}
export const CellComponent = ({ rowIndex, columnIndex }: CellProps) => {
    const thisCell = useMemo(
        () => new Cell(rowIndex, columnIndex),
        [rowIndex, columnIndex]
    );

    const { board, setSelectedCell, selectedCell, availablePlacesToMove, dispatchAction } = useBoardContext();
    const color = board.getCellColor(thisCell);
    const currentPiece = board.pieceAtCell(thisCell);
    const isSelected = selectedCell && selectedCell.equals(thisCell);
    const toggleSelected = useCallback(
        () => thisCell.equals(selectedCell) ? setSelectedCell(undefined) : setSelectedCell(thisCell),
        [setSelectedCell, selectedCell, thisCell]
    );

    const isAvailableToMoveTo = availablePlacesToMove.some((availableCell) => availableCell.equals(thisCell));
    const moveToCell = useCallback(
        () => selectedCell && dispatchAction({ type: 'move', locationToMoveFrom: selectedCell, locationToMoveTo: thisCell }),
        [selectedCell, dispatchAction, thisCell]
    );

    const isPromotablePawn = currentPiece?.type === 'pawn' && (rowIndex === 0 || rowIndex === 7);
    const selectPromotion = useCallback(
        (type: PieceType) => dispatchAction({ type: 'promote_pawn', location: thisCell, promotedPiece: Piece.create(type, color) }),
        [dispatchAction, thisCell, color]
    )
    return (
        <div
            className={`cell boardColor${color} ${isSelected ? 'selected' : ''} ${isAvailableToMoveTo ? 'available' : ''}`}
            onClick={isPromotablePawn ? undefined : isAvailableToMoveTo ? moveToCell : toggleSelected}
        >   {
                isPromotablePawn && currentPiece
                    ? <PromotablePawnOptions color={currentPiece.color} selectPromotion={selectPromotion} />
                    : currentPiece && <img style={{ height: '60%' }} src={getPieceImgUrl(currentPiece)} alt={currentPiece.toString()} />
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
        <img style={{ height: '20%' }} src={getPieceImgUrl(piece)} alt={piece.toString()} onClick={select} />
    );
}

const getPieceImgUrl = (piece: TPiece) => {
    return getPieceImgUrlFromAssets(getPieceKey(piece.type), piece.color);
}

const getPieceKey = (type: PieceType) => {
    switch (type) {
        case 'king':
            return 'k';
        case 'queen':
            return 'q';
        case 'rook':
            return 'r';
        case 'bishop':
            return 'b'
        case 'knight':
            return 'n';
        case 'pawn':
            return 'p'
    }
}

const getPieceImgUrlFromAssets = (pieceId: string, color: BoardColor) =>
    require(`../assets/chess_pieces/Chess_${pieceId}${color === 'white' ? 'l' : 'd'}t45.svg`);