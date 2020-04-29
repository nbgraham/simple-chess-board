import { boardReducer } from './board_reducer';
import { u, e, m } from '../models/piece_shorthand';
import { Board } from '../models/board';
import { fastestWhiteInCheckMatePosition, startingPosition } from '../models/arrangements';
import { flattenArray } from '../utils/array_utils';

test('first move works', () => {
    const boardAtStart = new Board();
    const boardAfterMove = boardReducer(boardAtStart, {
        type: 'move',
        piece: u('⚪♟'),
        moveFrom: { rowIndex: 6, columnIndex: 0 },
        moveTo: { rowIndex: 5, columnIndex: 0 },
        chessMoveType: 'move'
    })

    expect(boardAfterMove.pieces).toEqual(
        [
            [u('⚫🏰'), u('⚫🐴'), u('⚫⛪'), u('⚫👸'), u('⚫🤴'), u('⚫⛪'), u('⚫🐴'), u('⚫🏰')],
            [u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [m('⚪♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟')],
            [u('⚪🏰'), u('⚪🐴'), u('⚪⛪'), u('⚪👸'), u('⚪🤴'), u('⚪⛪'), u('⚪🐴'), u('⚪🏰')],
        ]
    )
    expect(boardAfterMove.whiteScore).toBe(0);
    expect(boardAfterMove.piecesCapturedByWhite).toEqual([])
    expect(boardAfterMove.blackScore).toBe(0);
    expect(boardAfterMove.piecesCapturedByBlack).toEqual([])

    testReset(boardAfterMove);
});

test('capture', () => {
    const boardBeforeCapture = new Board(
        [
            [u('⚫🏰'), u('⚫🐴'), u('⚫⛪'), u('⚫👸'), u('⚫🤴'), u('⚫⛪'), u('⚫🐴'), u('⚫🏰')],
            [u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫♟')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚪♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [m('⚪♟'), u('⚪♟'), u('⚪♟'), e('🕳 🕳'), u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟')],
            [u('⚪🏰'), u('⚪🐴'), u('⚪⛪'), u('⚪👸'), u('⚪🤴'), u('⚪⛪'), u('⚪🐴'), u('⚪🏰')],
        ],
        'white'
    )
    const boardAfterMove = boardReducer(boardBeforeCapture, {
        type: 'move',
        piece: u('⚪⛪'),
        moveFrom: { rowIndex: 7, columnIndex: 2 },
        moveTo: { rowIndex: 2, columnIndex: 7 },
        chessMoveType: 'capture',
        capturingPiece: m('⚫♟')
    })

    expect(boardAfterMove.pieces).toEqual(
        [
            [u('⚫🏰'), u('⚫🐴'), u('⚫⛪'), u('⚫👸'), u('⚫🤴'), u('⚫⛪'), u('⚫🐴'), u('⚫🏰')],
            [u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚪♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [m('⚪♟'), u('⚪♟'), u('⚪♟'), e('🕳 🕳'), u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟')],
            [u('⚪🏰'), u('⚪🐴'), e('🕳 🕳'), u('⚪👸'), u('⚪🤴'), u('⚪⛪'), u('⚪🐴'), u('⚪🏰')],
        ]
    )
    expect(boardAfterMove.whiteScore).toBe(1);
    expect(boardAfterMove.piecesCapturedByWhite).toEqual([m('⚫♟')])
    expect(boardAfterMove.blackScore).toBe(0);
    expect(boardAfterMove.piecesCapturedByBlack).toEqual([])

    testReset(boardAfterMove);
});

const testReset = (board: Board) => {
    const boardAfterReset = boardReducer(board, { type: 'reset' });
    expect(flattenArray(boardAfterReset.pieces).every(p => !p || !p.hasBeenMoved)).toBe(true);
    expect(boardAfterReset.pieces).toEqual(startingPosition);
    expect(boardAfterReset.whiteScore).toBe(0);
    expect(boardAfterReset.piecesCapturedByWhite).toEqual([])
    expect(boardAfterReset.blackScore).toBe(0);
    expect(boardAfterReset.piecesCapturedByBlack).toEqual([])
}