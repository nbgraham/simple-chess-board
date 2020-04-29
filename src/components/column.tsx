import React from 'react';
import { CellComponent } from './cell';
import { range } from '../utils/range_utils';
import { BoardUtils } from '../utils/board_utils';

type ColumnProps = {
  numRows: number;
  columnIndex: number;
  flipped?: boolean;
}
export const ColumnComponent = ({ numRows, columnIndex , flipped}: ColumnProps) => {
  const rowIndexes = flipped ? range(0, numRows).reverse() : range(0, numRows)
  return (
    <div className="col">
      <div className="header">{BoardUtils.getLabelForColumn(columnIndex)}</div>
      {rowIndexes.map(rowIndex => (
        <CellComponent key={rowIndex} rowIndex={rowIndex} columnIndex={columnIndex} />
      ))}
      <div className="header">{BoardUtils.getLabelForColumn(columnIndex)}</div>
    </div>
  );
}