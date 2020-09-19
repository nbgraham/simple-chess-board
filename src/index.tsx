import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { LocalApp } from './LocalApp';
import { playOff } from './computer_players/game_play';
import { RandomStrategy } from './computer_players/stategies/random_strategy';
import { MinimaxWithLocationStrategy, MinimaxStrategy } from './computer_players/stategies/minimax_strategy';
import { CaptureHighestPieceStrategy } from './computer_players/stategies/capture_strategy';

ReactDOM.render(
  <React.StrictMode>
    <LocalApp />
  </React.StrictMode>,
  document.getElementById('root')
);

// Standings:
// 1. Smart Boi 4-23-3 126
// 2. GottaCaptureEmAll 3-25-2 52
// 3. Minimax 3-21-6 -187
// 4. Rando 2-27-1 9
// playOff(
//   { strategy: new RandomStrategy(), label: 'Rando' },
//   { strategy: new CaptureHighestPieceStrategy(false), label: 'GottaCaptureEmAll' },
//   { strategy: new MinimaxStrategy(), label: 'Minimax' },
//   { strategy: new MinimaxWithLocationStrategy(), label: 'Smart Boi' }
// )

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
