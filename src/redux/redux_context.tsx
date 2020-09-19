import React, { useCallback, useEffect, useContext } from "react";
import { Provider } from 'react-redux';
import { useApiClient } from "../api/use_api_client";
import { API_CLIENT, IApiClient } from "../api_client";
import { BoardContextProviderProps, TBoardContext } from "../context";
import { ChessMove } from "../models/chess_move";
import { useDispatchAppAction, useTypedSelector, useDispatchAppThunk } from "./react_redux";
import { gameStateActions, store, playerActions, moveHistoryActions } from "./store";
import { useSubscribe } from "../hooks/use_subscribe";
import { BoardColor } from "../utils/board_utils";
import { chessMoveAsClass } from "../utils/serde";
import { SerDeRewindableReducerState } from "../utils/rewindable_reducer";
import { GameStateDto } from "../models/game_state_dto";
import { useApiClientOfType, ApiClientType } from "../hooks/use_api_client_of_type";
import { thunks } from "./thunks";
import { useShallowMemo } from "../hooks/use_shallow_memo";

const ApiClientContext = React.createContext({
    apiClient: API_CLIENT as IApiClient,
    apiClientType: 'server' as ApiClientType
});

export const ReduxBoardContextProvider: React.FC<BoardContextProviderProps> = ({ children, apiClientType, controlBothSides }) => {
    const apiClient = useApiClientOfType(apiClientType);
    const context = useShallowMemo({ apiClient, apiClientType });

    return (
        <ApiClientContext.Provider value={context}>
            <Provider store={store}>
                <SetInitialReduxValues controlBothSides={controlBothSides} />
                <SubscribeReduxStoreToApiClient />
                {children}
            </Provider>
        </ApiClientContext.Provider>
    )
}

type Props = {
    controlBothSides: boolean | undefined;
}
export const SetInitialReduxValues: React.FC<Props> = ({ controlBothSides }) => {
    const setControlBothSides = useDispatchAppAction(playerActions.setControlBothSides);

    useEffect(() => {
        if (controlBothSides !== undefined) {
            setControlBothSides(controlBothSides)
        }
    }, [controlBothSides, setControlBothSides])
    return null;
}

export const SubscribeReduxStoreToApiClient: React.FC = () => {
    const playerColor = useTypedSelector(state => state.player.selectedColor)

    const setGameState = useDispatchAppAction(gameStateActions.setGameState);
    const setMoveHistory = useDispatchAppAction(moveHistoryActions.replace);
    const setCanRedo = useDispatchAppAction(playerActions.setCanRedo);

    const setPlayerThatCanRedo = useCallback(
        (player?: BoardColor) => setCanRedo(player === playerColor),
        [setCanRedo, playerColor]
    )

    const onBoardChange = useCallback(
        (b: SerDeRewindableReducerState<GameStateDto, ChessMove>) => {
            setGameState(b.currentState)
            setMoveHistory(b.pastActions.map(chessMoveAsClass))
            setPlayerThatCanRedo(b.futureActions.length > 0 ? chessMoveAsClass(b.futureActions[0]).piece.color : undefined)
        },
        [setGameState, setMoveHistory, setPlayerThatCanRedo]
    )

    const { apiClient } = useContext(ApiClientContext);
    useSubscribe(() => apiClient.subcribeToBoard(onBoardChange), [apiClient, onBoardChange])

    return null;
}

export const useReduxBoardContext = (): TBoardContext => {
    const gameState = useTypedSelector(state => state.gameState.gameState)
    const availablePlacesToMove = useTypedSelector(state => state.gameState.availablePlacesToMove)
    const moveHistory = useTypedSelector(state => state.moveHistory)

    const { apiClient, apiClientType } = useContext(ApiClientContext);

    const setPlayerColor = useDispatchAppAction(playerActions.setSelectedColor)
    const tryToSelectCell = useDispatchAppThunk(thunks.tryToSelectCell);
    const _tryToMakeMove = useDispatchAppThunk(thunks.tryToMakeMove);
    const tryToMakeMove = useCallback(
        (move: ChessMove) => _tryToMakeMove({ move, apiClientType }),
        [_tryToMakeMove, apiClientType]
    )

    const { resetBoard, undoLastMove, redoMove } = useApiClient(apiClient);

    return {
        gameState,
        moveHistory,
        availablePlacesToMove,
        resetBoard,
        undoLastMove,
        redoMove,
        setSelectedCell: tryToSelectCell,
        makeMove: tryToMakeMove,
        setPlayerColor
    };
}