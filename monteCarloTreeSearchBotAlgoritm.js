import {
    playerRed,
    playerYellow,
    board,
    currPlayer,
    gameOver,
    botIdentity,
    rows,
    columns,
    currColumns,
    setBotYellow,
    setGame,
    setPiece,
    checkWinnerFromState,
    checkDirection,
    isBoardFull,
    setWinner,
    setDraw,
    disableBoard,
    logBoardState,
    displayBoard,
    getPlayerTurn,
    setBoardState,
    updateCurrColumns,
    getBoard,
    setBoard,
    setCurrentPlayer,
    applyBotMove,
    applyMove
} from "./baseGame.js";

// Monte Carlo Tree Search Implementation
class Node {
    constructor(state, parent = null) {
        this.state = state; // The current board state
        this.parent = parent; // The parent node in the tree
        this.children = []; // The children nodes (possible future states)
        this.wins = 0; // The number of wins for this node
        this.visits = 0; // The number of visits to this node
    }

    // Method to add a child node
    addChild(childNode) {
        this.children.push(childNode);
    }

    // Method to get the UCT value of the node
    getUCTValue(explorationParameter = 1.2) {
        if (this.visits === 0) {
            return Infinity; // Return a high value for unvisited nodes
        }
        return (
            this.wins / this.visits +
            explorationParameter *
            Math.sqrt(Math.log(this.parent.visits) / this.visits)
        );
    }
}

// Function to simulate a random game from the given state
function simulateRandomGame(state) {
    let currentState = state;

    while (!isTerminal(currentState)) {
        // Pre-check for immediate winning move for currentPlayer
        let legalMoves = getLegalMoves(currentState);
        const currentPlayer = getPlayerTurn(currentState);
        let randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        const opponent = currentPlayer === playerRed ? playerYellow : playerRed;
        for (let move of legalMoves) {
            if (isWinningMove(currentState, move, currentPlayer)) {
                randomMove = move;
            }
        }

        // Pre-check for immediate blocking move against opponent
        for (let move of legalMoves) {
            if (isWinningMove(currentState, move, opponent)) {
                randomMove = move;
            }
        }
        currentState = applyMove(
            currentState,
            randomMove,
            getPlayerTurn(currentState)
        );
    }
    return getWinner(currentState);
}

// Function to determine if the state is terminal (game over)
function isTerminal(state) {
    var playerWinning = checkWinnerFromState(state);
    return playerWinning != null || isBoardFull(state);
}

// Function to get legal moves from the given state
function getLegalMoves(state) {
    const legalMoves = [];
    for (let c = 0; c < columns; c++) {
        if (state[0][c] === 0) {
            legalMoves.push(c); // Add column index as a legal move
        }
    }
    return legalMoves;
}


// Function to get the winner of the game from the given state
function getWinner(state) {
    var playerWinning = checkWinnerFromState(state);
    if (botIdentity == 1) {
        if (playerWinning == playerRed) {
            return 1;
        } else if (playerWinning == playerYellow) {
            return -1.5;
        } else {
            return 0;
        }
    } else if (botIdentity == 2) {
        if (playerWinning == playerRed) {
            return -1.5;
        } else if (playerWinning == playerYellow) {
            return 1;
        } else {
            return 0;
        }
    }
}

// MCTS implementation with pre-check for immediate threats
export function mcts(rootState, illegalMoves = []) {
    const rootNode = new Node(rootState);
    const currentPlayer = getPlayerTurn(rootState);
    const opponent = currentPlayer === playerRed ? playerYellow : playerRed;

    // Pre-check for immediate winning move for currentPlayer
    const legalMoves = getLegalMoves(rootState).filter(move => !illegalMoves.includes(move));
    console.log("legal moves: " + legalMoves);
    for (let move of legalMoves) {
        if (isWinningMove(rootState, move, currentPlayer)) {
            console.log("winning move");
            return applyMove(rootState, move, currentPlayer); // Complete the winning move
        }
    }

    // Pre-check for immediate blocking move against opponent
    for (let move of legalMoves) {
        if (isWinningMove(rootState, move, opponent)) {
            console.log("blocking move");
            return applyMove(rootState, move, currentPlayer); // Block opponent's winning move
        }
    }

    var startTime = performance.now();
    var duration = 3000; // 5 seconds in milliseconds
    let iterations = 0;

    while (performance.now() - startTime < duration) {
        iterations++;
        // Selection
        let node = rootNode;
        while (node.children.length > 0) {
            node = node.children.reduce((a, b) =>
                a.getUCTValue() > b.getUCTValue() ? a : b
            );
        }

        // Expansion
        if (node.visits > 0) {
            const legalMoves = getLegalMoves(node.state).filter(move => !illegalMoves.includes(move));
            legalMoves.forEach((move) => {
                const newState = applyMove(node.state, move, getPlayerTurn(node.state));
                const childNode = new Node(newState, node);
                node.addChild(childNode);
            });
            if (node.children.length > 0) {
                node = node.children[Math.floor(Math.random() * node.children.length)];
            }
        }

        // Simulation
        const result = simulateRandomGame(node.state);

        // Backpropagation
        while (node != null) {
            node.visits += 1;
            if (result === 1) {
                node.wins += 1;
            } else if (result === -1) {
                node.wins -= 1;
            }
            node = node.parent;
        }
    }

    // Select the best move
    const bestChild = rootNode.children.reduce((a, b) =>
        a.visits > b.visits ? a : b
    );
    return bestChild.state;
}

// Helper function to check if a move results in a win
function isWinningMove(state, move, player) {
    const newState = applyMove(state, move, player);
    return checkWinnerFromState(newState) === player;
}

window.mcts = mcts;
