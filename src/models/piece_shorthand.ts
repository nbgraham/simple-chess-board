import { TPiece, PieceType } from './piece';
import { BoardColor, BoardPieces } from './board';

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

export const boardToShorthand = (boardPieces: BoardPieces): string => 
    `[\n${boardPieces.map(row => `\t[${row.map(toShorthandFunction).join(', ')}]`).join(',\n')}\n]`

const toShorthandFunction = (piece?: TPiece | null) => piece ? `${piece.hasBeenMoved ? 'm' : 'u'}('${toShorthand(piece)}')` : "e('🕳 🕳')"
export const toShorthand = (piece: TPiece) => `${toShorthandColor(piece.color)}${toShorthandType(piece.type)}` as PieceShorthand

const toShorthandColor = (color: BoardColor): ColorShorthand => {
    switch(color) {
        case 'white':
            return '⚪'
        case 'black':
            return '⚫'
    }
}

const toShorthandType = (type: PieceType): PieceTypeShorthand => {
    switch (type) {
        case 'pawn':
            return '♟';
        case 'bishop':
            return '⛪';
        case 'rook':
            return '🏰';
        case 'knight':
            return '🐴';
        case 'queen':
            return '👸';
        case 'king':
            return '🤴'
    }
}

export const e = (_: EmptyCellShorthand) => undefined;
export const u = (pieceShorthand: RealPieceShorthand): TPiece =>
    ({ ...toPiece(pieceShorthand), hasBeenMoved: false })
export const m = (pieceShorthand: RealPieceShorthand): TPiece =>
    ({ ...toPiece(pieceShorthand), hasBeenMoved: true })