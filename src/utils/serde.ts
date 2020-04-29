import { Board } from '../models/board'
import { ChessMove } from '../models/chess_move'

export interface SerDeClass<T> extends Object {
}
export function boardAsClass(serDeBoard: SerDeClass<Board>) {
    const boardClass = new Board()
    Object.assign(boardClass, serDeBoard)
    return boardClass
}

export function chessMoveAsClass(serDeChessMove: SerDeClass<ChessMove>) {
    return serDeChessMove as ChessMove;
}