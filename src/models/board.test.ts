import { Board } from './board';
import { fastestWhiteInCheckMatePosition } from './arrangements';
import { SerDeClass, boardDtoAsClass as boardAsClass } from '../utils/serde';

test('no one is in check at start', () => {
    const boardAtStart = new Board();
    expect(Board.isInCheck(boardAtStart, 'black')).toBe(false);
    expect(Board.isInCheck(boardAtStart, 'white')).toBe(false);
});

const getFastestWhiteInCheckMate = () => new Board(
    fastestWhiteInCheckMatePosition,
    'white'
)

test('fastest checkmate', () => {
    const whiteInCheckMate = getFastestWhiteInCheckMate();
    expect(Board.getColorThatIsInCheckMate(whiteInCheckMate)).toBe('white');
});

test('resume: fastest checkmate', () => {
    const whiteInCheckMate = getFastestWhiteInCheckMate();
    const serDeBoard: SerDeClass<Board> = JSON.parse(JSON.stringify(whiteInCheckMate));
    const resumed = boardAsClass(serDeBoard);
    expect(Board.getColorThatIsInCheckMate(resumed)).toBe('white');
});