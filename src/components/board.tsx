import React from 'react';
import { ColumnComponent } from './column';

type BoardProps = {
    numColumns: number;
    numRows: number;
}
export const BoardComponent = ({ numColumns, numRows }: BoardProps) => {
    return (
        <div className="flex-grid">
            <div className="col header">
                <div className="header"/>
                {Array(numRows).fill(null).map((_, rowIndex) => (
                    <div key={rowIndex} className="cell">{numRows - rowIndex}</div>
                ))}
            </div>
            {Array(numColumns).fill(null).map((_, columnIndex) => (
                <ColumnComponent key={columnIndex} columnIndex={columnIndex} numRows={numRows} />
            ))}
            <div className="col header">
                <div className="header"/>
                {Array(numRows).fill(null).map((_, rowIndex) => (
                    <div key={rowIndex} className="cell">{numRows - rowIndex}</div>
                ))}
            </div>
        </div>
    );
}