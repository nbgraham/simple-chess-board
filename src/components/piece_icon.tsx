import React from 'react';
import { TPiece, PieceType } from '../models/piece';
import { BoardColor } from '../models/board';

type PieceIconProps = {
    piece: TPiece;
    style?: React.CSSProperties;
    onClick?: () => void;
}
export const PieceIcon = (props: PieceIconProps) => {
    const { piece, ...passthroughProps } = props;
    return (
        <img
            {...passthroughProps}
            src={getPieceImgUrl(piece)}
            alt={piece.toString()}
        />
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