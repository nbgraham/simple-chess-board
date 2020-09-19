import React from 'react';
import './App.css';
import { SmartBoard } from './components/board';
import { BoardContextProvider } from './context';
import { ScorePanel } from './components/score_panel';
import { API_CLIENT } from './api_client';

type AppState = {
  hasError: boolean
}
class App extends React.Component<{}, AppState> {
  state = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    console.error(error)
    return {
      hasError: true
    }
  }

  reload = () => this.setState({ hasError: false })

  reset = () => {
    API_CLIENT.resetBoard()
    this.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ height: '20%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>Oops, something went wrong!</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><button style={{ margin: 'auto', width: '50%', padding: 10 }} onClick={this.reload}>Reload, Keep Game State</button></div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><button style={{ margin: 'auto', width: '50%', padding: 10 }} onClick={this.reset}>Reset, Lose Game State</button ></div>
          </div>
        </div >
      )
    }

    return (
      <BoardContextProvider apiClientType={'server'}>
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
            <SmartBoard />
          </div>
        </div>
      </BoardContextProvider>
    )
  }
}

export default App;
