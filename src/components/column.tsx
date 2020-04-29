import React from 'react';
import { CellComponent } from './cell';

const columnLetters = 'abcdefgh';
type ColumnProps = {
    numRows: number;
    columnIndex: number;
  }
  export const ColumnComponent = ({ numRows, columnIndex }: ColumnProps) => {
    return (
      <div className="col">
        <div className="header">{columnLetters[columnIndex]}</div>
        {Array(numRows).fill(null).map((_, rowIndex) => (
          <CellComponent key={rowIndex} rowIndex={rowIndex} columnIndex={columnIndex} />
        ))}
        <div className="header">{columnLetters[columnIndex]}</div>
      </div>
    );
  }