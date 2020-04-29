import { whitePawnJustReachedEndOfBoardAtRow0Col6 } from "../models/arrangements";
import { Board } from "../models/board";
import { c } from "../models/cell_shorthand";
import { e, m, u } from "../models/piece_shorthand";
import { AvailableMovesService } from "./available_moves";

test('simple move is available', () => {
    const boardAtStart = new Board();
    const service = new AvailableMovesService(boardAtStart, 'white')
    expect(service.getAllAvailableMovesFlat()).toContainEqual({
        type: 'move',
        piece: u('⚪♟'),
        moveFrom: c('f2'),
        moveTo: c('f4)'),
    })
});

describe('can castle when allowed', () => {
    test('can castle', () => {
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
        const service = new AvailableMovesService(initialBoard, 'white')
        expect(service.getAllAvailableMovesFlat()).toContainEqual({
            type: 'castle',
            piece: u('⚪🤴'),
            moveFrom: { rowIndex: 7, columnIndex: 4 },
            moveTo: { rowIndex: 7, columnIndex: 7 }
        })
    })

    test('cannot castle if king has moved', () => {
        const initialBoard = new Board(
            [
                [u('⚫🏰'), u('⚫🐴'), u('⚫⛪'), u('⚫👸'), u('⚫🤴'), u('⚫⛪'), u('⚫🐴'), u('⚫🏰')],
                [u('⚫♟'), u('⚫♟'), u('⚫♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚫♟'), u('⚫♟')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫♟'), m('⚫♟'), m('⚫♟'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), m('⚪♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚪🐴'), e('🕳 🕳'), e('🕳 🕳')],
                [u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟'), e('🕳 🕳'), u('⚪♟'), u('⚪♟'), u('⚪♟')],
                [u('⚪🏰'), u('⚪🐴'), u('⚪⛪'), u('⚪👸'), e('🕳 🕳'), m('⚪🤴'), e('🕳 🕳'), u('⚪🏰')],
            ],
            'white'
        )
        const service = new AvailableMovesService(initialBoard, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'castle',
            piece: u('⚪🤴'),
            moveFrom: { rowIndex: 7, columnIndex: 4 },
            moveTo: { rowIndex: 7, columnIndex: 7 }
        })
    })
    test('cannot castle if rook has moved', () => {
        const initialBoard = new Board(
            [
                [u('⚫🏰'), u('⚫🐴'), u('⚫⛪'), u('⚫👸'), u('⚫🤴'), u('⚫⛪'), u('⚫🐴'), u('⚫🏰')],
                [u('⚫♟'), u('⚫♟'), u('⚫♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚫♟'), u('⚫♟')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫♟'), m('⚫♟'), m('⚫♟'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), m('⚪♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚪🐴'), e('🕳 🕳'), e('🕳 🕳')],
                [u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟'), e('🕳 🕳'), u('⚪♟'), u('⚪♟'), u('⚪♟')],
                [u('⚪🏰'), u('⚪🐴'), u('⚪⛪'), u('⚪👸'), u('⚪🤴'), e('🕳 🕳'), m('⚪🏰'), e('🕳 🕳')],
            ],
            'white'
        )
        const service = new AvailableMovesService(initialBoard, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'castle',
            piece: u('⚪🤴'),
            moveFrom: { rowIndex: 7, columnIndex: 4 },
            moveTo: { rowIndex: 7, columnIndex: 7 }
        })
    })
    test('cannot castle if king is in check', () => {
        const initialBoard = new Board(
            [
                [u('⚫🏰'), u('⚫🐴'), u('⚫⛪'), u('⚫👸'), u('⚫🤴'), u('⚫⛪'), u('⚫🐴'), e('🕳 🕳')],
                [u('⚫♟'), u('⚫♟'), u('⚫♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚫♟'), u('⚫♟')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫♟'), m('⚫♟'), m('⚫♟'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), m('⚪♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚪🐴'), e('🕳 🕳'), e('🕳 🕳')],
                [u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟'), m('⚫🏰'), u('⚪♟'), u('⚪♟'), u('⚪♟')],
                [u('⚪🏰'), u('⚪🐴'), u('⚪⛪'), u('⚪👸'), u('⚪🤴'), e('🕳 🕳'), e('🕳 🕳'), u('⚪🏰')],
            ],
            'white'
        )
        const service = new AvailableMovesService(initialBoard, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'castle',
            piece: u('⚪🤴'),
            moveFrom: { rowIndex: 7, columnIndex: 4 },
            moveTo: { rowIndex: 7, columnIndex: 7 }
        })
    })
    test('cannot castle if king will move through check', () => {
        const initialBoard = new Board(
            [
                [u('⚫🏰'), u('⚫🐴'), e('🕳 🕳'), u('⚫👸'), u('⚫🤴'), u('⚫⛪'), u('⚫🐴'), u('⚫🏰')],
                [u('⚫♟'), u('⚫♟'), u('⚫♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), u('⚫♟'), u('⚫♟')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫♟'), m('⚫♟'), m('⚫♟'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), m('⚪♟'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
                [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫⛪'), e('🕳 🕳'), u('⚪🐴'), e('🕳 🕳'), e('🕳 🕳')],
                [u('⚪♟'), u('⚪♟'), u('⚪♟'), u('⚪♟'), e('🕳 🕳'), u('⚪♟'), u('⚪♟'), u('⚪♟')],
                [u('⚪🏰'), u('⚪🐴'), u('⚪⛪'), u('⚪👸'), u('⚪🤴'), e('🕳 🕳'), e('🕳 🕳'), u('⚪🏰')],
            ],
            'white'
        )
        const service = new AvailableMovesService(initialBoard, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'castle',
            piece: u('⚪🤴'),
            moveFrom: { rowIndex: 7, columnIndex: 4 },
            moveTo: { rowIndex: 7, columnIndex: 7 }
        })
    })
})

test('can put opponent in check', () => {
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
    const service = new AvailableMovesService(boardBeforeMove, 'black')
    expect(service.getAllAvailableMovesFlat()).toContainEqual({
        type: 'move',
        piece: m('⚫👸'),
        moveFrom: { rowIndex: 5, columnIndex: 1 },
        moveTo: { rowIndex: 2, columnIndex: 4 },
    })
})

describe('cannot move self into check', () => {
    test('by moving king into cell under attack', () => {
        const move = {
            type: 'move',
            piece: m('⚪🤴'),
            moveFrom: { rowIndex: 2, columnIndex: 3 },
            moveTo: { rowIndex: 3, columnIndex: 3 },
        }
        const boardNotUnderAttackBeforeMove = new Board([
            [e('🕳 🕳'), m('⚫🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), m('⚫♟'), e('🕳 🕳'), m('⚪🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫🏰'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), m('⚫🐴'), e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), e('🕳 🕳')]
        ], 'white')
        const serviceNotUnderAttack = new AvailableMovesService(boardNotUnderAttackBeforeMove, 'white')
        expect(serviceNotUnderAttack.getAllAvailableMovesFlat()).toContainEqual(move)

        const boardBeforeMove = new Board([
            [e('🕳 🕳'), m('⚫🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), m('⚫♟'), e('🕳 🕳'), m('⚪🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), m('⚫👸'), e('🕳 🕳'), e('🕳 🕳'), m('⚫🏰'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), m('⚫🐴'), e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), e('🕳 🕳')]
        ], 'white')
        const service = new AvailableMovesService(boardBeforeMove, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual(move)
    })

    test('by removing a piece that was protecting the king', () => {
        const move = {
            type: 'move',
            piece: m('⚪🏰'),
            moveFrom: { rowIndex: 3, columnIndex: 3 },
            moveTo: { rowIndex: 7, columnIndex: 3 },
        };

        const boardBeforeMoveNotUnderAttack = new Board([
            [e('🕳 🕳'), m('⚫🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), m('⚫♟'), e('🕳 🕳'), e('🕳 🕳'), m('⚪🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚪🏰'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫🏰'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), m('⚫🐴'), e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), e('🕳 🕳')]
        ], 'white')
        const serviceNotUnderAttack = new AvailableMovesService(boardBeforeMoveNotUnderAttack, 'white')
        expect(serviceNotUnderAttack.getAllAvailableMovesFlat()).toContainEqual(move)

        const boardBeforeMove = new Board([
            [e('🕳 🕳'), m('⚫🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), m('⚫♟'), e('🕳 🕳'), e('🕳 🕳'), m('⚪🤴'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚪🏰'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), m('⚫👸'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), m('⚫🏰'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳'), e('🕳 🕳')],
            [e('🕳 🕳'), e('🕳 🕳'), m('⚫🐴'), e('🕳 🕳'), e('🕳 🕳'), m('⚪⛪'), e('🕳 🕳'), e('🕳 🕳')]
        ], 'white')
        const service = new AvailableMovesService(boardBeforeMove, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'move',
            piece: m('⚪🏰'),
            moveFrom: { rowIndex: 3, columnIndex: 3 },
            moveTo: { rowIndex: 7, columnIndex: 3 },
        })
    })
})


describe('illegal move not returned', () => {
    test('cannot move empty piece', () => {
        const boardAtStart = new Board();
        const service = new AvailableMovesService(boardAtStart, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'move',
            piece: u('⚪♟'),
            moveFrom: { rowIndex: 5, columnIndex: 0 },
            moveTo: { rowIndex: 4, columnIndex: 0 },
        })
    });

    test('cannot move onto a piece of own color', () => {
        const boardAtStart = new Board();
        const service = new AvailableMovesService(boardAtStart, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'move',
            piece: u('⚪♟'),
            moveFrom: { rowIndex: 6, columnIndex: 0 },
            moveTo: { rowIndex: 6, columnIndex: 1 },
        })
    });

    test('cannot perform meaningless move', () => {
        const boardAtStart = new Board();
        const service = new AvailableMovesService(boardAtStart, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'move',
            piece: u('⚪♟'),
            moveFrom: { rowIndex: 6, columnIndex: 0 },
            moveTo: { rowIndex: 6, columnIndex: 0 },
        })
    });

    test('piece must at designated location', () => {
        const boardAtStart = new Board();
        const service = new AvailableMovesService(boardAtStart, 'black')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'move',
            piece: u('⚫🤴'),
            moveFrom: { rowIndex: 6, columnIndex: 0 },
            moveTo: { rowIndex: 6, columnIndex: 1 },
        })
    });

    test('piece to capture must be at destination', () => {
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
        const service = new AvailableMovesService(boardBeforeCapture, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'capture',
            piece: u('⚪⛪'),
            moveFrom: { rowIndex: 7, columnIndex: 2 },
            moveTo: { rowIndex: 3, columnIndex: 6 },
            capturingPiece: m('⚫♟')
        })
    });

    test('promote pawn piece not at location', () => {
        const boardBeforeCapture = new Board(whitePawnJustReachedEndOfBoardAtRow0Col6, 'black')
        const service = new AvailableMovesService(boardBeforeCapture, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'promote_pawn',
            piece: u('⚪♟'),
            location: { rowIndex: 0, columnIndex: 0 },
            promotedTo: 'queen'
        })
    });

    test('promote pawn not at end of board', () => {
        const boardBeforeCapture = new Board(whitePawnJustReachedEndOfBoardAtRow0Col6, 'black')
        const service = new AvailableMovesService(boardBeforeCapture, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'promote_pawn',
            piece: u('⚪♟'),
            location: { rowIndex: 6, columnIndex: 0 },
            promotedTo: 'queen'
        })
    });

    test('cannot promote queen', () => {
        const boardBeforeCapture = new Board(whitePawnJustReachedEndOfBoardAtRow0Col6, 'black')
        const service = new AvailableMovesService(boardBeforeCapture, 'white')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'promote_pawn',
            piece: u('⚪👸'),
            location: { rowIndex: 7, columnIndex: 3 },
            promotedTo: 'queen'
        })
    });

    test('cannot pass wrong color for pawn at location', () => {
        const boardBeforeCapture = new Board(whitePawnJustReachedEndOfBoardAtRow0Col6, 'black')
        const service = new AvailableMovesService(boardBeforeCapture, 'black')
        expect(service.getAllAvailableMovesFlat()).not.toContainEqual({
            type: 'promote_pawn',
            piece: u('⚫♟'),
            location: { rowIndex: 0, columnIndex: 6 },
            promotedTo: 'queen'
        })
    });
})
