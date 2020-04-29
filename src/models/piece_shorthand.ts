import { TPiece, PieceType } from './piece';
import { BoardColor } from './board';

type ColorShorthand = '⚪' | '⚫';
type PieceTypeShorthand = '🏰' | '🐴' | '⛪' | '👸' | '🤴' | '♟';
type RealPieceShorthand = '⚪🏰' | '⚫🏰' | '⚪🐴' | '⚫🐴' | '⚪⛪' | '⚫⛪' | '⚪👸' | '⚫👸' | '⚪🤴' | '⚫🤴' | '⚪♟' | '⚫♟';
type EmptyCellShorthand = '🕳 🕳';
export type PieceShorthand = EmptyCellShorthand | RealPieceShorthand;

export const toPiece = (pieceShorthand: RealPieceShorthand): Omit<TPiece, 'hasBeenMoved'> => {
    const [colorEmoji, typeEmoji] = pieceShorthand as unknown as [ColorShorthand, PieceTypeShorthand];
    return { color: toPieceColor(colorEmoji), type: toPieceType(typeEmoji) };
}
const toPieceColor = (colorEmoji: ColorShorthand): BoardColor => {
    switch (colorEmoji) {
        case '⚪':
            return 'white';
        case '⚫':
            return 'black';
    }
}
const toPieceType = (pieceTypeEmoji: PieceTypeShorthand): PieceType => {
    switch (pieceTypeEmoji) {
        case '♟':
            return 'pawn';
        case '⛪':
            return 'bishop';
        case '🏰':
            return 'rook';
        case '🐴':
            return 'knight';
        case '👸':
            return 'queen';
        case '🤴':
            return 'king'
    }
}

export const e = (_: EmptyCellShorthand) => undefined;
export const u = (pieceShorthand: RealPieceShorthand): TPiece =>
    ({ ...toPiece(pieceShorthand), hasBeenMoved: false })
export const m = (pieceShorthand: RealPieceShorthand): TPiece =>
    ({ ...toPiece(pieceShorthand), hasBeenMoved: true })