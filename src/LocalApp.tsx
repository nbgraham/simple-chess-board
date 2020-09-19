import React from 'react';
import './App.css';
import { BoardComponent } from './components/board';
import { BoardContextProvider } from './context';
import { ScorePanel } from './components/score_panel';
import { API_CLIENT as MockApiClient } from './__mocks__/api_client';

type AppState = {
  hasError: boolean
}
export class LocalApp extends React.Component<{}, AppState> {
  state = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    console.error(error)
    return {
      hasError: true
    }
  }

  reload = () => this.setState({ hasError: false })

  reset = () => {
    MockApiClient.resetBoard()
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
      <BoardContextProvider apiClient={MockApiClient} controlBothSides={true}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          width: '100%',
          overflow: 'hidden'
        }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <ScorePanel showAutoPlayStrategies={true} alwaysAllowUndoRedo={true} />
          </div>
          <div style={{ flex: 6 }}>
          <BoardComponent numColumns={8} numRows={8} />
          </div>
        </div>
      </BoardContextProvider>
    )
  }
}

