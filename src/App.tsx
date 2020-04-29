import React, { useCallback } from 'react';
import './App.css';
import { BoardComponent } from './components/board';
import { BoardContextProvider, useBoardContext } from './context';

function App() {
  return (
    <BoardContextProvider>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        width: '100%'
      }}>
        <div style={{ flex: 1 }}>
          <Scoreboard />
        </div>
        <div style={{ flex: 6 }}>
          <BoardComponent numColumns={8} numRows={8} />
        </div>
      </div>
    </BoardContextProvider>
  );
}

const Scoreboard = () => {
  const { board, dispatchAction } = useBoardContext();
  const resetBoard = useCallback(() => dispatchAction({ type: 'reset' }), [dispatchAction]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 2, padding: 20 }}>
        <button onClick={resetBoard} style={{ fontSize: 25 }}>New Game</button>
      </div>
      <div style={{ flex: 2, padding: 20 }}>
        {board.winner ? `${board.winner} wins!` : `Turn: ${board.currentTurn}`}
      </div>
      <div style={{ flex: 2, padding: 20 }}>
        <p>White score: {board.whiteScore}</p>
        <p>Black score: {board.blackScore}</p>
      </div>
      <div style={{ flex: 2, padding: 20 }}>
        Moves:
        {board.completedMoves.map((completedMove, i) => (
        <div style={{ flex: 1 }}>{i + 1}: {completedMove.description}</div>
      ))}
      </div>
    </div>
  );
}

export default App;
