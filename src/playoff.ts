import { playOff } from './computer_players/game_play';
import { RandomStrategy } from './computer_players/stategies/random_strategy';
import { MinimaxWithLocationStrategy, MinimaxStrategy } from './computer_players/stategies/minimax_strategy';
import { CaptureHighestPieceStrategy } from './computer_players/stategies/capture_strategy';

// Standings:
// 1. Smart Boi 4-23-3 126
// 2. GottaCaptureEmAll 3-25-2 52
// 3. Minimax 3-21-6 -187
// 4. Rando 2-27-1 9
playOff(
  { strategy: new RandomStrategy(), label: 'Rando' },
  { strategy: new CaptureHighestPieceStrategy(false), label: 'GottaCaptureEmAll' },
  { strategy: new MinimaxStrategy(), label: 'Minimax' },
  { strategy: new MinimaxWithLocationStrategy(), label: 'Smart Boi' }
)
