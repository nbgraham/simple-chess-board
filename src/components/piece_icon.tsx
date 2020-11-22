import React from 'react';
import { Piece, PieceType } from '../models/piece';
import { BoardColor } from '../utils/board_utils';

type PieceIconProps = React.HTMLAttributes<Element> & {
    piece: Piece;
    stopClickEventPropagation?: boolean;
}
export const PieceIcon = (props: PieceIconProps) => {
    const { piece, stopClickEventPropagation, onClick, ...passthroughProps } = props;
    const wrappedOnClick = (onClick && stopClickEventPropagation) ? (e: React.MouseEvent) => { e.stopPropagation(); onClick(e); }
        : onClick;
    return (
        <img
            {...passthroughProps}
            onClick={wrappedOnClick}
            src={getPieceImgUrl(piece)}
            alt={Piece.toString(piece)}
        />
    );
}


const getPieceImgUrl = (piece: Piece) => {
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
    pieceId && color && require(`../assets/chess_pieces/Chess_${pieceId}${color === 'white' ? 'l' : 'd'}t45.svg`);