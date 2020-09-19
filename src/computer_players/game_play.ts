import { Strategy } from "./stategies/strategy";
import { Board } from "../models/board";
import { GameState } from "../models/game_state";
import { boardReducer } from "../reducers/board_reducer";
import { BoardColor } from "../utils/board_utils";
import { boardToShorthand } from "../models/piece_shorthand";
import { AvailableMovesService } from "../services/available_moves";
import { v4 } from "uuid";

type Competitor = {
    strategy: Strategy,
    label: string,
}
type CompetitorWithId = Competitor & {
    id: string;
}
export function playOff(...competitors: Competitor[]) {
    const withId = competitors.map(competitor => ({ ...competitor, id: v4() }))
    
    console.log(`Playoff started`);

    const playoffStartTime = performance.now()
    roundRobinPlayOff(withId, 10);
    const playoffEndTime = performance.now()

    console.log(`Playoff finshed after ${Math.floor(playoffEndTime - playoffStartTime)}ms`);
}

type Matchup = {
    player1: CompetitorWithId,
    player2: CompetitorWithId
}
type MatchRecord = {
    wins: number,
    losses: number,
    draws: number,
    scoreDifference: number
}

const defaultRecord: MatchRecord = {
    wins: 0,
    losses: 0,
    draws: 0,
    scoreDifference: 0
}

export function roundRobinPlayOff(competitors: CompetitorWithId[], seriesLength: number) {
    const everyMatchup = competitors.reduce((matchups, competitor, index) =>
        matchups.concat(competitors.slice(index + 1).map(opponent => ({ player1: competitor, player2: opponent }))),
        [] as Matchup[]
    )

    const records: Record<string, MatchRecord> = {}

    let player1IsWhite = false;
    for (let seriesIndex = 0; seriesIndex < seriesLength; seriesIndex++) {
        player1IsWhite = !player1IsWhite

        let gameCount = 0;
        for (const { player1, player2 } of everyMatchup) {
            gameCount++

            const white = player1IsWhite ? player1 : player2;
            const black = !player1IsWhite ? player1 : player2;

            const gameStartTime = performance.now()
            const result = playGame(black.strategy, black.strategy);
            const gameEndTime = performance.now()
            console.log(
                `Series ${seriesIndex + 1} Game ${gameCount}: \n\
                Game time: ${Math.floor(gameEndTime - gameStartTime)}ms ${result.moves} moves \n\
                White: ${white.label} Score: ${result.board.whiteScore} \n\
                Black: ${black.label} Score: ${result.board.blackScore} \n\
                Winner: ${result.winner}`
            );

            updateRecords(records, white, black, result);
        }

        const sortedRecords = getSortedRecords(records);
        const standings = sortedRecords.reduce((_standings, record, index) =>
            `${_standings}\n${index + 1}. ${competitors.find(c => c.id === record.id)?.label} ${record.wins}-${record.draws}-${record.losses} ${record.scoreDifference}`,
            'Standings:'
        );
        console.log(standings);
    }
}

function updateRecords(records: Record<string, MatchRecord>, white: CompetitorWithId, black: CompetitorWithId, result: GameResult) {
    records[white.id] = records[white.id] ?? { ...defaultRecord };
    records[black.id] = records[black.id] ?? { ...defaultRecord };

    if (result.winner === 'white') {
        records[white.id].wins++;
        records[black.id].losses++;
    }
    else if (result.winner === 'black') {
        records[black.id].wins++;
        records[white.id].losses++;
    }
    else {
        records[white.id].draws++;
        records[black.id].draws++;
    }

    records[white.id].scoreDifference += result.whiteScore - result.blackScore;
    records[black.id].scoreDifference += result.blackScore - result.whiteScore;
}

function getSortedRecords(records: Record<string, MatchRecord>) {
    return Object.keys(records)
        .map(key => ({ ...records[key], id: key }))
        .sort((recordA, recordB) => {
            if (recordA.wins > recordB.wins) {
                return -1;
            }
            else if (recordA.wins < recordB.wins) {
                return 1;
            }
            else {
                if (recordA.scoreDifference > recordB.scoreDifference) {
                    return -1;
                }
                else if (recordA.scoreDifference < recordB.scoreDifference) {
                    return 1;
                }
                return 0;
            }
        });
}

type GameResult = {
    board: Board,
    moves: number,
    winner: BoardColor | null,
    blackScore: number,
    whiteScore: number
}
export function playGame(whiteStrategy: Strategy, blackStrategy: Strategy, maxMoves = 60, winBonus = 50): GameResult {
    let board = new Board();

    let winner = null as BoardColor | null;
    let moves = 0;
    while (winner === null && moves < maxMoves) {
        const nextMove = board.currentTurn === 'white' ? whiteStrategy.getNextMove(board)
            : blackStrategy.getNextMove(board);
        if (!nextMove) {
            console.error(`No next move for ${board.currentTurn} at move ${moves};`, boardToShorthand(board.pieces));
        }
        board = boardReducer(board, nextMove);

        if (AvailableMovesService.isStalemate(board)) {
            break;
        }
        winner = GameState.computeWinner(board);
        moves++
    }

    return {
        board,
        moves,
        winner,
        whiteScore: board.whiteScore + winBonus * (winner === null ? 0 : winner === 'white' ? 1 : -1),
        blackScore: board.blackScore + winBonus * (winner === null ? 0 : winner === 'black' ? 1 : -1),
    };
}