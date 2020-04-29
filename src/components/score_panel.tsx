import React from 'react';
import { useBoardContext } from '../context';
import { TPiece, Piece } from '../models/piece';
import { PieceIcon } from './piece_icon';
import { BoardColor } from '../models/board';
import { copyToClipboard } from '../utils/clipboard_utils';
import { ChessMove, getMoveDescription } from '../models/chess_move';

const buttonStyle: React.CSSProperties = { fontSize: 20, margin: 5 };

export const ScorePanel = () => {
  const { board, resetBoard, undoLastMove, redoMove, moveHistory } = useBoardContext();
  const copyBoard = () => copyToClipboard(board.asShorthand())

  const scoreBoardSectionStyle: React.CSSProperties = { flex: 2, margin: 12 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={scoreBoardSectionStyle}>
        <button onClick={resetBoard} style={buttonStyle}>New Game</button>
        <button onClick={undoLastMove} style={buttonStyle}>Undo Move</button>
        <button onClick={redoMove} style={buttonStyle}>Redo Move</button>
        <button onClick={copyBoard} style={buttonStyle}>Copy Board</button>
      </div>
      <div style={scoreBoardSectionStyle}>
        {board.winner
          ? <><ColorBanner color={board.winner} /> wins! </>
          : <>Turn: <ColorBanner color={board.currentTurn} /></>
        }
      </div>
      <div style={scoreBoardSectionStyle}>
        <p>White score: {board.whiteScore}</p>
        <div style={{ display: 'flex' }}>
          <CapturedPiecesDisplay capturedPieces={board.piecesCapturedByWhite} />
        </div>
        <p>Black score: {board.blackScore}</p>
        <div style={{ display: 'flex' }}>
          <CapturedPiecesDisplay capturedPieces={board.piecesCapturedByBlack} />
        </div>
      </div>
      <div style={{ ...scoreBoardSectionStyle }}>
        <MoveHistory completedMoves={moveHistory} />
      </div>
    </div>
  );
}

type MoveHistoryProps = {
  completedMoves: ChessMove[]
}
const MoveHistory: React.SFC<MoveHistoryProps> = React.memo(({ completedMoves }) => {
  return (
    <>
      Moves:
      {completedMoves.map((completedMove, i) => (
        <div key={i}>{i + 1}: {getMoveDescription(completedMove)}</div>
      ))}
    </>
  )
})

type ColorBannerProps = {
  color: BoardColor
}
const ColorBanner = ({ color }: ColorBannerProps) => {
  return (
    <>{color}<PieceIcon style={{ height: 25 }} piece={Piece.create('king', color)} /></>
  )
};

type CapturedPiecesDisplayProps = {
  capturedPieces: TPiece[]
}
const CapturedPiecesDisplay = ({ capturedPieces }: CapturedPiecesDisplayProps) => {
  return (
    <>
      {capturedPieces.map(piece => (
        piece && <PieceIcon key={Piece.toString(piece)} style={{ height: 25 }} piece={piece} />
      ))}
    </>
  );
}