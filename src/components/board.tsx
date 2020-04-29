import React from 'react';
import { ColumnComponent } from './column';
import { getLabelForRow } from '../models/board';
import { range } from '../utils/range_utils';

type BoardProps = {
    numColumns: number;
    numRows: number;
}
export const BoardComponent = ({ numColumns, numRows }: BoardProps) => {
    return (
        <div className="flex-grid">
            <ColumnWithRowLabels numRows={numRows} />
            {range(0, numColumns).map(columnIndex => (
                <ColumnComponent key={columnIndex} columnIndex={columnIndex} numRows={numRows} />
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
                <div key={rowIndex} className="cell">{getLabelForRow(rowIndex)}</div>
            ))}
        </div>
    )
})