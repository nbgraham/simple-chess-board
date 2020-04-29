import React from 'react';
import { ColumnComponent } from './column';
import { range } from '../utils/range_utils';
import { BoardUtils } from '../utils/board_utils';
import { useBoardContext } from '../context';
import { PieceIcon } from './piece_icon';

type SmartBoard = {

}
export const SmartBoard = () => {
    const { playerColor, setPlayerColor } = useBoardContext();
    if (!playerColor) {
        return (
            <div >
                Choose Color:
                <div data-testid="Choose Black" onClick={() => setPlayerColor('black')} >
                    Black
                    <PieceIcon piece={{type: 'king', color: 'black', hasBeenMoved: false}} />
                </div>
                <div data-testid="Choose White" onClick={() => setPlayerColor('white')} >
                    White
                    <PieceIcon piece={{type: 'king', color: 'white', hasBeenMoved: false}} />
                </div>
            </div>
        )
    }
    return (
        <BoardComponent flipped={playerColor === 'black'} numColumns={8} numRows={8} />
    )
}

type BoardProps = {
    numColumns: number;
    numRows: number;
    flipped?: boolean;
}
export const BoardComponent = ({ numColumns, numRows, flipped }: BoardProps) => {
    const colIndexes = flipped ? range(0, numColumns).reverse() : range(0, numColumns)
    return (
        <div className="flex-grid">
            <ColumnWithRowLabels numRows={numRows} />
            {colIndexes.map(columnIndex => (
                <ColumnComponent key={columnIndex} flipped={flipped} columnIndex={columnIndex} numRows={numRows} />
            ))}
            <ColumnWithRowLabels numRows={numRows} />
        </div>
    );
}

type ColumnWithRowLabelsProps = {
    numRows: number;
}
const ColumnWithRowLabels = React.memo(({ numRows }: ColumnWithRowLabelsProps) => {
    return (
        <div className="col header">
            <div className="header" />
            {range(0, numRows).map(rowIndex => (
                <div key={rowIndex} className="cell">{BoardUtils.getLabelForRow(rowIndex)}</div>
            ))}
        </div>
    )
})