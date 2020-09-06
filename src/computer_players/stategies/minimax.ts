type EdgeToChildNode<TNode, TEdge> = {
    edge: TEdge
    childNode: TNode
}

type MinimaxedEdge<TNode, TEdge> = {
    value: number
    edge?: TEdge
    childNode?: TNode
    nodesExplored?: number
}

type PruneMethod = 'alpha-beta' | 'none'

export class Minimax<TNode, TEdge> {
    private readonly getHeuristicValue: (node: TNode) => number
    private readonly nodeIsTerminal: (node: TNode) => boolean
    private readonly getChildren: (node: TNode) => EdgeToChildNode<TNode, TEdge>[]
    private readonly pruneMethod: PruneMethod

    constructor(getHeuristicValue: (node: TNode) => number, nodeIsTerminal: (node: TNode) => boolean, getChildren: (node: TNode) => EdgeToChildNode<TNode, TEdge>[], pruneMethod: PruneMethod) {
        this.getHeuristicValue = getHeuristicValue;
        this.nodeIsTerminal = nodeIsTerminal;
        this.getChildren = getChildren;
        this.pruneMethod = pruneMethod
    }

    private getDefaultValue(maximizingPlayer: boolean) {
        return maximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
    }

    private isNewExtreme(maximizingPlayer: boolean, newValue: number, existingValue: number) {
        return maximizingPlayer ? newValue > existingValue : newValue < existingValue;
    }

    private alphaBetaPrune(maximizingPlayer: boolean, alpha: number, beta: number, extremeValue: number) {
        let shouldPrune = false

        if (maximizingPlayer) {
            alpha = Math.max(alpha, extremeValue);
            if (alpha >= beta) {
                shouldPrune = true;
            }
        } else {
            beta = Math.min(beta, extremeValue)
            if (beta <= alpha) {
                shouldPrune = true;
            }
        }

        return {
            alpha,
            beta,
            shouldPrune
        };
    }

    minimax(node: TNode, depth: number, maximizingPlayer: boolean, alpha = Number.NEGATIVE_INFINITY, beta = Number.POSITIVE_INFINITY, nodesExplored = 0): MinimaxedEdge<TNode, TEdge> {
        if (depth === 0 || this.nodeIsTerminal(node)) {
            return {
                value: this.getHeuristicValue(node),
                nodesExplored: 1
            }
        }

        let extremeEdge: MinimaxedEdge<TNode, TEdge> = {
            value: this.getDefaultValue(maximizingPlayer),
        }

        for (const child of this.getChildren(node)) {
            const minimaxEdge = this.minimax(child.childNode, depth - 1, !maximizingPlayer, alpha, beta, nodesExplored);
            nodesExplored += minimaxEdge.nodesExplored ?? 0;
            if (this.isNewExtreme(maximizingPlayer, minimaxEdge.value, extremeEdge.value)) {
                extremeEdge = {
                    value: minimaxEdge.value,
                    edge: child.edge,
                    childNode: child.childNode,
                }
            }
            if (this.pruneMethod === 'alpha-beta') {
                const result = this.alphaBetaPrune(maximizingPlayer, alpha, beta, extremeEdge.value)
                alpha = result.alpha
                beta = result.beta
                if (result.shouldPrune) {
                    break;
                }
            }
        }

        return {
            ...extremeEdge,
            nodesExplored
        }
    }
}