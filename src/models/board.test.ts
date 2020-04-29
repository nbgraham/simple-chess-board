import { Board } from './board';
import { fastestWhiteInCheckMatePosition } from './arrangements';

test('no one is in check at start', () => {
    const boardAtStart = new Board();
    expect(boardAtStart.isInCheck('black')).toBe(false);
    expect(boardAtStart.isInCheck('white')).toBe(false);
});

const getFastestWhiteInCheckMate = () => new Board(
    fastestWhiteInCheckMatePosition,
    'white'
)

test('fastest checkmate', () => {
    const whiteInCheckMate = getFastestWhiteInCheckMate();
    expect(whiteInCheckMate.getColorThatIsInCheckMate()).toBe('white');
});

test('resume: fastest checkmate', () => {
    const whiteInCheckMate = getFastestWhiteInCheckMate();
    const serialized = JSON.stringify(whiteInCheckMate);
    const resumed = Board.fromJSON(serialized);
    expect(resumed.getColorThatIsInCheckMate()).toBe('white');
});