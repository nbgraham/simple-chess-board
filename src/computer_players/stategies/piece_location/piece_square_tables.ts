
type PieceSquareTableRow = [number, number, number, number, number, number, number, number]
export type PieceSquareTable = [PieceSquareTableRow, PieceSquareTableRow, PieceSquareTableRow, PieceSquareTableRow, PieceSquareTableRow, PieceSquareTableRow, PieceSquareTableRow, PieceSquareTableRow]

export function fromBlacksPerspective(pieceSquareTable: PieceSquareTable) {
    return pieceSquareTable.reverse().map(row => row.reverse()) as PieceSquareTable;
}

export const whitePawn: PieceSquareTable = [
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [50, 50, 50, 50, 50, 50, 50, 50,],
    [10, 10, 20, 30, 30, 20, 10, 10,],
    [5, 5, 10, 25, 25, 10, 5, 5,],
    [0, 0, 0, 20, 20, 0, 0, 0,],
    [5, -5, -10, 0, 0, -10, -5, 5,],
    [5, 10, 10, -20, -20, 10, 10, 5,],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

export const whiteKnight: PieceSquareTable = [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
]

export const whiteBishop: PieceSquareTable = [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
]

export const whiteRook: PieceSquareTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0]
]

export const whiteQueen: PieceSquareTable = [
    [-20, -10, -10, -5, -5, -10, -10, -20,],
    [-10, 0, 0, 0, 0, 0, 0, -10,],
    [-10, 0, 5, 5, 5, 5, 0, -10,],
    [-5, 0, 5, 5, 5, 5, 0, -5,],
    [0, 0, 5, 5, 5, 5, 0, -5,],
    [-10, 5, 5, 5, 5, 5, 0, -10,],
    [-10, 0, 5, 0, 0, 0, 0, -10,],
    [-20, -10, -10, -5, -5, -10, -10, -20],
]

export const whiteKingMiddleGame: PieceSquareTable = [
    [-30, -40, -40, -50, -50, -40, -40, -30,],
    [-30, -40, -40, -50, -50, -40, -40, -30,],
    [-30, -40, -40, -50, -50, -40, -40, -30,],
    [-30, -40, -40, -50, -50, -40, -40, -30,],
    [-20, -30, -30, -40, -40, -30, -30, -20,],
    [-10, -20, -20, -20, -20, -20, -20, -10,],
    [20, 20, 0, 0, 0, 0, 20, 20,],
    [20, 30, 10, 0, 0, 10, 30, 20],
]

export const whiteKingEndGame: PieceSquareTable = [
    [-50, -40, -30, -20, -20, -30, -40, -50,],
    [-30, -20, -10, 0, 0, -10, -20, -30,],
    [-30, -10, 20, 30, 30, 20, -10, -30,],
    [-30, -10, 30, 40, 40, 30, -10, -30,],
    [-30, -10, 30, 40, 40, 30, -10, -30,],
    [-30, -10, 20, 30, 30, 20, -10, -30,],
    [-30, -30, 0, 0, 0, 0, -30, -30,],
    [-50, -30, -30, -30, -30, -30, -30, -50],
]