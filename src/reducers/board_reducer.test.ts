import { boardReducer } from './board_reducer';
import { u, e, m } from '../models/piece_shorthand';
import { IllegalMoveError } from '../utils/assert';
import { whitePawnJustReachedEndOfBoardAtRow0Col6 } from '../models/arrangements';
import { startingBoard, Board } from '../models/board';

test('first move works', () => {
    const boardAtStart = startingBoard;
    const boardAfterMove = boardReducer(boardAtStart, {
        type: 'move',
        piece: u('⚪♟'),
        moveFrom: { rowIndex: 6, columnIndex: 0 },
        moveTo: { rowIndex: 5, columnIndex: 0 },
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
        type: 'capture',
        piece: u('⚪⛪'),
        moveFrom: { rowIndex: 7, columnIndex: 2 },
        moveTo: { rowIndex: 2, columnIndex: 7 },
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
});

describe('castling', () => {

    test('castle king side', () => {
        const initialBoard = new Board(
            [
                [u('⚫🏰'), u('⚫🐴'), u('⚫⛪'), u('⚫👸'), u('⚫🤴'), u('⚫⛪'), u('⚫🐴'), u('⚫🏰')],
                [u('⚫♟'), u('⚫♟'), u('⚫♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚫♟'), u('⚫♟')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫♟'), m('⚫♟'), m('⚫♟'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), m('⚪♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚪🐴'), e('🕳 🕳'), e('🕳 🕳')],
                [u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟'), e('🕳 🕳'), u('⚪♟'), u('⚪♟'), u('⚪♟')],
                [u('⚪🏰'), u('⚪🐴'), u('⚪⛪'), u('⚪👸'), u('⚪🤴'), e('🕳 🕳'), e('🕳 🕳'), u('⚪🏰')],
            ],
            'white'
        )

        const boardAfterCastle = boardReducer(initialBoard, {
            type: 'castle',
            piece: u('⚪🤴'),
            moveFrom: { rowIndex: 7, columnIndex: 4 },
            moveTo: { rowIndex: 7, columnIndex: 7 }
        })


        expect(Board.getAllPieceLocations(initialBoard, 'white')).toHaveLength(16)
        expect(Board.getAllPieceLocations(initialBoard, 'black')).toHaveLength(16)
        expect(Board.getAllPieceLocations(boardAfterCastle, 'white')).toHaveLength(16)
        expect(Board.getAllPieceLocations(boardAfterCastle, 'black')).toHaveLength(16)

        expect(boardAfterCastle.pieces).toEqual(
            [
                [u('⚫🏰'), u('⚫🐴'), u('⚫⛪'), u('⚫👸'), u('⚫🤴'), u('⚫⛪'), u('⚫🐴'), u('⚫🏰')],
                [u('⚫♟'), u('⚫♟'), u('⚫♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚫♟'), u('⚫♟')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫♟'), m('⚫♟'), m('⚫♟'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), m('⚪♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚪🐴'), e('🕳 🕳'), e('🕳 🕳')],
                [u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟'), e('🕳 🕳'), u('⚪♟'), u('⚪♟'), u('⚪♟')],
                [u('⚪🏰'), u('⚪🐴'), u('⚪⛪'), u('⚪👸'), e('🕳 🕳'), m('⚪🏰'), m('⚪🤴'), e('🕳 🕳')],
            ]
        )
    })


    test('castle queen side', () => {
        const initialBoard = new Board(
            [
                [u('⚫🏰'), u('⚫🐴'), u('⚫⛪'), u('⚫👸'), u('⚫🤴'), u('⚫⛪'), u('⚫🐴'), u('⚫🏰')],
                [u('⚫♟'), u('⚫♟'), u('⚫♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚫♟')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫♟'), m('⚫♟'), m('⚫♟'), m('⚫♟'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚪♟'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), m('⚪🐴'), m('⚪👸'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [u('⚪♟'), u('⚪♟'), u('⚪♟'), e('🕳 🕳'), u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟')],
                [u('⚪🏰'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚪🤴'), u('⚪⛪'), u('⚪🐴'), u('⚪🏰')],
            ],
            'white'
        )

        const boardAfterCastle = boardReducer(initialBoard, {
            type: 'castle',
            piece: u('⚪🤴'),
            moveFrom: { rowIndex: 7, columnIndex: 4 },
            moveTo: { rowIndex: 7, columnIndex: 0 }
        })

        expect(Board.getAllPieceLocations(initialBoard, 'white')).toHaveLength(16)
        expect(Board.getAllPieceLocations(initialBoard, 'black')).toHaveLength(16)
        expect(Board.getAllPieceLocations(boardAfterCastle, 'white')).toHaveLength(16)
        expect(Board.getAllPieceLocations(boardAfterCastle, 'black')).toHaveLength(16)

        expect(boardAfterCastle.pieces).toEqual(
            [
                [u('⚫🏰'), u('⚫🐴'), u('⚫⛪'), u('⚫👸'), u('⚫🤴'), u('⚫⛪'), u('⚫🐴'), u('⚫🏰')],
                [u('⚫♟'), u('⚫♟'), u('⚫♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚫♟')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫♟'), m('⚫♟'), m('⚫♟'), m('⚫♟'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚪♟'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), m('⚪🐴'), m('⚪👸'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [u('⚪♟'), u('⚪♟'), u('⚪♟'), e('🕳 🕳'), u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟')],
                [e('🕳 🕳'), e('🕳 🕳'), m('⚪🤴'), m('⚪🏰'), e('🕳 🕳'), u('⚪⛪'), u('⚪🐴'), u('⚪🏰')],
            ],
        )
    })
})

test('promote pawn', () => {
    const boardBeforeCapture = new Board(whitePawnJustReachedEndOfBoardAtRow0Col6, 'black')

    const boardAfterMove = boardReducer(boardBeforeCapture, {
        type: 'promote_pawn',
        piece: u('⚪♟'),
        location: { rowIndex: 0, columnIndex: 6 },
        promotedTo: 'queen'
    })

    expect(boardAfterMove.pieces).toEqual(
        [
            [u('⚫🏰'), u('⚫🐴'), u('⚫⛪'), u('⚫👸'), u('⚫🤴'), u('⚫⛪'), m('⚪👸'), u('⚫🏰')],
            [u('⚫♟'), u('⚫♟'), u('⚫♟'), u('⚫♟'), e('🕳 🕳'), u('⚫♟'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫♟'), m('⚫🐴'), e('🕳 🕳'), m('⚫♟')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫♟'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟'), e('🕳 🕳'), e('🕳 🕳'), u('⚪♟')],
            [u('⚪🏰'), u('⚪🐴'), u('⚪⛪'), u('⚪👸'), u('⚪🤴'), u('⚪⛪'), u('⚪🐴'), u('⚪🏰')]
        ]
    )
});

test('queen move puts opponent in check', () => {
    const boardBeforeMove = new Board([
        [e('🕳 🕳'), m('⚫🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), m('⚫♟'), e('🕳 🕳'), m('⚪🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), m('⚫👸'), e('🕳 🕳'), e('🕳 🕳'), m('⚫🏰'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), e('🕳 🕳'), m('⚫🐴'), e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), e('🕳 🕳')]
    ], 'black')

    const boardAfterMove = boardReducer(boardBeforeMove, {
        type: 'move',
        piece: m('⚫👸'),
        moveFrom: { rowIndex: 5, columnIndex: 1 },
        moveTo: { rowIndex: 2, columnIndex: 4 },
    })

    expect(boardAfterMove.pieces).toEqual(
        [
            [e('🕳 🕳'), m('⚫🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), m('⚫♟'), e('🕳 🕳'), m('⚪🤴'), m('⚫👸'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫🏰'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), m('⚫🐴'), e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), e('🕳 🕳')]
        ]
    )

})



test('knight move puts opponent in check', () => {
    const boardBeforeMove = new Board([
        [e('🕳 🕳'), m('⚫🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚪🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), m('⚫♟'), e('🕳 🕳'), e('🕳 🕳'), m('⚫🏰'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), m('⚫👸'), e('🕳 🕳'), m('⚫🐴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪')],
        [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
        [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')]
    ], 'black')

    const boardAfterMove = boardReducer(boardBeforeMove, {
        type: 'move',
        piece: m('⚫🐴'),
        moveFrom: { rowIndex: 5, columnIndex: 3 },
        moveTo: { rowIndex: 3, columnIndex: 2 },
    })

    expect(boardAfterMove.pieces).toEqual(
        [
            [e('🕳 🕳'), m('⚫🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚪🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), m('⚫♟'), e('🕳 🕳'), e('🕳 🕳'), m('⚫🏰'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), m('⚫🐴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), m('⚫👸'), e('🕳 🕳'),  e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')]
        ]
    )

})