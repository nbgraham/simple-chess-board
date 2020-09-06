import React from 'react';
import { useBoardContext } from '../context';
import { Piece } from '../models/piece';
import { PieceIcon } from './piece_icon';
import { copyToClipboard } from '../utils/clipboard_utils';
import { ChessMove } from '../models/chess_move';
import { Board } from '../models/board';
import { BoardColor } from '../utils/board_utils';
import { last } from '../utils/array_utils';
import { RandomStrategy } from '../computer_players/stategies/random_strategy';

const buttonStyle: React.CSSProperties = { fontSize: 20, margin: 5 };
const scoreBoardSectionStyle: React.CSSProperties = { flex: 2, margin: 12 };
const capturedPiecesStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap' };

function definedAndEqual<T>(a?: T, b?: T) {
  return !!a && !!b && a === b
}

type Props = {
  showAutoPlayStrategies?: boolean;
}

export const ScorePanel: React.FC<Props> = ({ showAutoPlayStrategies }) => {
  const { gameState, resetBoard, undoLastMove, redoMove, moveHistory, playerColor, playerThatCanRedo, dispatchAction } = useBoardContext();
  const copyBoard = () => copyToClipboard(Board.asShorthand(gameState.board))

  const lastMoveTakeBy = last(moveHistory)?.piece.color

  const currentPlayerCanRedo = definedAndEqual(playerColor, playerThatCanRedo)
  const currentPlayerCanUndo = definedAndEqual(playerColor, lastMoveTakeBy)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={scoreBoardSectionStyle}>
        <button onClick={resetBoard} style={buttonStyle}>New Game</button>
        {currentPlayerCanUndo && <button onClick={undoLastMove} style={buttonStyle}>Undo Move</button>}
        {currentPlayerCanRedo && <button onClick={redoMove} style={buttonStyle}>Redo Move</button>}
        <button onClick={copyBoard} style={buttonStyle}>Copy Board</button>
      </div>
      <div style={scoreBoardSectionStyle}>
        {playerColor && <>You are: <ColorBanner color={playerColor} /></>}
        {gameState.winner
          ? <><ColorBanner color={gameState.winner} /> wins! </>
          : <>
            <div>Turn: <ColorBanner color={gameState.board.currentTurn} /></div>
            {gameState.board.currentTurn === playerColor && <div>It's your turn!</div>}
          </>
        }
      </div>
      <div style={scoreBoardSectionStyle}>
        <p>White score: {gameState.board.whiteScore}</p>
        <div style={capturedPiecesStyle}>
          <CapturedPiecesDisplay capturedPieces={gameState.board.piecesCapturedByWhite} />
        </div>
        <p>Black score: {gameState.board.blackScore}</p>
        <div style={capturedPiecesStyle}>
          <CapturedPiecesDisplay capturedPieces={gameState.board.piecesCapturedByBlack} />
        </div>
      </div>
      {showAutoPlayStrategies &&
        <div style={scoreBoardSectionStyle}>
          <AutoPlayStrategies board={gameState.board} sendMove={dispatchAction} />
        </div>
      }
      <div style={{ ...scoreBoardSectionStyle }}>
        <MoveHistory completedMoves={moveHistory} />
      </div>
    </div>
  );
}

const autoPlayStrategies = [
  {
    label: 'Random',
    strategy: new RandomStrategy()
  }
]

type AutoPlayStrategies = {
  board: Board,
  sendMove: (move: ChessMove) => void,
}
const AutoPlayStrategies: React.FC<AutoPlayStrategies> = ({ board, sendMove }) => {
  return (
    <>
      AutoPlay:
      {autoPlayStrategies.map((strategy) => (
        <button key={strategy.label} onClick={() => sendMove(strategy.strategy.getNextMove(board))}>{strategy.label}</button>
      ))}
    </>
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
        <div key={i}>{i + 1}: {ChessMove.getDescription(completedMove)}</div>
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
  capturedPieces: Piece[]
}
const CapturedPiecesDisplay = ({ capturedPieces }: CapturedPiecesDisplayProps) => {
  return (
    <>
      {capturedPieces.map((piece, i) => (
        piece && <PieceIcon key={`${Piece.toString(piece)}-${i}`} style={{ height: 25 }} piece={piece} />
      ))}
    </>
  );
}