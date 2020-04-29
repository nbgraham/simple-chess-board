import { ChessMove } from '../models/chess_move'
import { Board } from '../models/board'
import { GameStateDto } from '../models/game_state_dto';

export interface SerDeClass<T> extends Object {
}

export function chessMoveAsClass(serDeChessMove: SerDeClass<ChessMove>) {
    return serDeChessMove as ChessMove;
}

export function boardDtoAsClass(serDeBoardDto: SerDeClass<Board>) {
    return serDeBoardDto as Board
}

export function gameStateDtoAsClass(serDeGameStateDto: SerDeClass<GameStateDto>) {
    return serDeGameStateDto as GameStateDto;
}