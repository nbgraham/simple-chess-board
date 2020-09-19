import { IApiClient } from "../api_client"
import { useCallback } from "react"
import { ChessMove } from "../models/chess_move"

export const useApiClient = (apiClient: IApiClient) => {
    const resetBoard = useCallback(() => apiClient.resetBoard(), [apiClient])
    const undoLastMove = useCallback(() => apiClient.undoMove(), [apiClient])
    const redoMove = useCallback(() => apiClient.redoMove(), [apiClient])
    const makeMove = useCallback((move: ChessMove) => apiClient.sendMove(move), [apiClient]);

    return { resetBoard, undoLastMove, redoMove, makeMove };
}