import React from 'react';
import { CellComponent } from './cell';
import { range } from '../utils/range_utils';
import { getLabelForColumn } from '../models/board';

type ColumnProps = {
  numRows: number;
  columnIndex: number;
}
export const ColumnComponent = ({ numRows, columnIndex }: ColumnProps) => {
  return (
    <div className="col">
      <div className="header">{getLabelForColumn(columnIndex)}</div>
      {range(0, numRows).map(rowIndex => (
        <CellComponent key={rowIndex} rowIndex={rowIndex} columnIndex={columnIndex} />
      ))}
      <div className="header">{getLabelForColumn(columnIndex)}</div>
    </div>
  );
}