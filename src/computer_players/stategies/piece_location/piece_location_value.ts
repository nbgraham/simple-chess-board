import { BoardPieces, BoardColor } from "../../../utils/board_utils";
import { Piece, PieceType } from "../../../models/piece";
import { PieceSquareTable, whitePawn, whiteRook, whiteBishop, whiteKnight, whiteQueen, whiteKingMiddleGame, fromBlacksPerspective } from "./piece_square_tables";

const valueOfPiece: Record<PieceType, number> = {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000
}
export function getValueOfPieces(pieces: Piece[]) {
    return pieces.reduce((sum, piece) => sum + valueOfPiece[piece.type], 0);
}

export function getValueOfPieceLocations(pieces: BoardPieces) {
    let whiteValue = 0;
    let blackValue = 0;

    pieces.forEach((row, rowIndex) => {
        row.forEach((piece, columnIndex) => {
            if (piece) {
                const pieceSquareTable = getPieceSquareTable(piece);
                if (piece?.color === 'white') {
                    whiteValue += pieceSquareTable[rowIndex][columnIndex];
                } else if (piece?.color === 'black') {
                    blackValue += pieceSquareTable[rowIndex][columnIndex];
                }
            }
        })
    })

    return { whiteValue, blackValue };
}

const pieceSquareTables: Record<BoardColor, Record<PieceType, PieceSquareTable>> = {
    white: {
        pawn: whitePawn,
        rook: whiteRook,
        bishop: whiteBishop,
        knight: whiteKnight,
        queen: whiteQueen,
        king: whiteKingMiddleGame
    },
    black: {
        pawn: fromBlacksPerspective(whitePawn),
        rook: fromBlacksPerspective(whiteRook),
        bishop: fromBlacksPerspective(whiteBishop),
        knight: fromBlacksPerspective(whiteKnight),
        queen: fromBlacksPerspective(whiteQueen),
        king: fromBlacksPerspective(whiteKingMiddleGame)
    }
}
function getPieceSquareTable(piece: Piece) {
    return pieceSquareTables[piece.color][piece.type];
}