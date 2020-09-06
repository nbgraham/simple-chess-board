import { playGame } from "./game_play"
import { RandomStrategy } from "./stategies/random_strategy"
import { average } from "../utils/array_utils";
import { CaptureHighestPieceStrategy, DoubleCaptureHighestPieceStrategy } from "./stategies/capture_strategy";
import { MinimaxStrategy } from "./stategies/minimax_strategy";

const GAME_SAMPLE_SIZE = 5;

let random = 0.245;
const mockRandom = () => {
    random = ((random * 1.7) + 0.37) % 1;
    return random;
};

beforeAll(() => {
    jest.spyOn(global.Math, 'random').mockImplementation(mockRandom);
});

afterAll(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
})

describe.skip('simple strategies', () => {

    test('random strategy equals random strategy', () => {
        const blackAdvantages = []
        for (let i = 0; i < GAME_SAMPLE_SIZE; i++) {
            const gameResult = playGame(new RandomStrategy(), new RandomStrategy())
            blackAdvantages.push(gameResult.blackScore - gameResult.whiteScore);
        }
    
        const averageAdvantage = Math.abs(average(blackAdvantages));
        expect(averageAdvantage).toBeLessThan(2)
    })
    
    test('capture strategy beats random', () => {
        const blackAdvantages = []
        for (let i = 0; i < GAME_SAMPLE_SIZE; i++) {
            const gameResult = playGame(new RandomStrategy(), new CaptureHighestPieceStrategy(false))
            blackAdvantages.push(gameResult.blackScore - gameResult.whiteScore);
        }
    
        const averageBlackAdvantage = average(blackAdvantages);
        expect(averageBlackAdvantage).toBeGreaterThan(10)
    })
    
    test('capture with check beats capture', () => {
        const blackAdvantages = []
        for (let i = 0; i < GAME_SAMPLE_SIZE; i++) {
            const gameResult = playGame(new CaptureHighestPieceStrategy(false), new CaptureHighestPieceStrategy(true))
            blackAdvantages.push(gameResult.blackScore - gameResult.whiteScore);
        }
    
        const averageBlackAdvantage = average(blackAdvantages);
        expect(averageBlackAdvantage).toBeGreaterThan(10)
    })
    
    test('capture with check ends sooner than random', () => {
        const captureLength = []
        for (let i = 0; i < GAME_SAMPLE_SIZE; i++) {
            const gameResult = playGame(new CaptureHighestPieceStrategy(true), new CaptureHighestPieceStrategy(true))
            captureLength.push(gameResult.moves);
        }
    
        const randomLength = []
        for (let i = 0; i < GAME_SAMPLE_SIZE; i++) {
            const gameResult = playGame(new RandomStrategy(), new RandomStrategy())
            randomLength.push(gameResult.moves);
        }
    
        const captureAverageLength = average(captureLength);
        const randomAverageLength = average(randomLength);
    
        expect(captureAverageLength).toBeLessThan(randomAverageLength)
    })
    
    test('double capture strategy beats random strategy', () => {
        const blackAdvantages = []
        for (let i = 0; i < GAME_SAMPLE_SIZE; i++) {
            const gameResult = playGame(new RandomStrategy(), new DoubleCaptureHighestPieceStrategy(true))
            blackAdvantages.push(gameResult.blackScore - gameResult.whiteScore);
        }
    
        const averageBlackAdvantage = average(blackAdvantages);
        expect(averageBlackAdvantage).toBeGreaterThan(10)
    })
})

describe.skip('minimax strategy', () => {

    test('minimax strategy beats random strategy', () => {
        const blackAdvantages = []
        for (let i = 0; i < GAME_SAMPLE_SIZE; i++) {
            const gameResult = playGame(new RandomStrategy(), new MinimaxStrategy())
            blackAdvantages.push(gameResult.blackScore - gameResult.whiteScore);
        }
    
        const averageBlackAdvantage = average(blackAdvantages);
        expect(averageBlackAdvantage).toBeGreaterThan(10)
    })
    
    test('minimax strategy beats capture strategy', () => {
        const blackAdvantages = []
        for (let i = 0; i < GAME_SAMPLE_SIZE; i++) {
            const gameResult = playGame(new CaptureHighestPieceStrategy(false), new MinimaxStrategy())
            blackAdvantages.push(gameResult.blackScore - gameResult.whiteScore);
        }
    
        const averageBlackAdvantage = average(blackAdvantages);
        expect(averageBlackAdvantage).toBeGreaterThan(10)
    })
})