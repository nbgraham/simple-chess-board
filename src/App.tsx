import React from 'react';
import './App.css';
import { BoardComponent } from './components/board';
import { BoardContextProvider } from './context';
import { ScorePanel } from './components/score_panel';

function App() {
  return (
    <BoardContextProvider>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ScorePanel />
        </div>
        <div style={{ flex: 6 }}>
          <BoardComponent numColumns={8} numRows={8} />
        </div>
      </div>
    </BoardContextProvider>
  );
}

export default App;
