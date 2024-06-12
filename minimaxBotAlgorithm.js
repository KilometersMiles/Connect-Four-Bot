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
    applyMove,
} from "./baseGame.js";

export const depthLimit = 8; // Depth for pre-computation
let preComputedPositions = {};

// Function to convert a 2D board array into a string key
export function getBoardKey(board) {
    return board.flat().join("");
  }
  
  // Function to convert a string key back into a 2D board array
export function parseBoardKey(boardKey) {
    const rows = 6; // Number of rows in Connect Four
    const columns = 7; // Number of columns in Connect Four
    const flatBoard = boardKey.split("").map(Number);
  
    const board = [];
    for (let r = 0; r < rows; r++) {
      board.push(flatBoard.slice(r * columns, (r + 1) * columns));
    }
    return board;
  }
  
export function getPreComputedMove(board) {
    const key = getBoardKey(board);
    return preComputedPositions[key] || null;
}

// Minimax with Alpha-Beta Pruning
export function minimax(board, depth, alpha, beta, maximizingPlayer) {
    const winner = checkWinnerFromState(board);
    if (winner !== null) {
        return winner === playerRed ? 100 : -100;
    }
    if (isBoardFull(board) || depth === 0) {
        return 0; // Draw or max depth reached
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (let col = 0; col < columns; col++) {
            if (board[0][col] === 0) {
                const newBoard = applyMove(board, col, playerRed);
                const evaluation = minimax(newBoard, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) {
                    break;
                } // Beta cut-off
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let col = 0; col < columns; col++) {
            if (board[0][col] === 0) {
                const newBoard = applyMove(board, col, playerYellow);
                const evaluation = minimax(newBoard, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) {
                    break;
                } // Alpha cut-off
            }
        }
        return minEval;
    }
}

// Function to pre-compute moves for the first N plies
export function preComputeMoves(initialBoard, maxDepth) {
    console.log("computing...");
    const queue = [{ board: initialBoard, depth: 0 }];
    while (queue.length > 0) {
        console.log("next board...");
        const { board, depth: currentDepth } = queue.shift();
        if (currentDepth >= maxDepth) continue;

        const bestMove = findBestMove(board);
        const boardKey = getBoardKey(board);
        preComputedPositions[boardKey] = bestMove;

        // Apply the best move to generate new board state
        const newBoard = applyMove(
            board,
            bestMove,
            currentDepth % 2 === 0 ? playerRed : playerYellow
        );
        queue.push({ board: newBoard, depth: currentDepth + 1 });
    }
}

// Example usage: Pre-compute moves for the first 7 plies
const initialState = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
];

// Function to generate and display precomputed moves as text lines
export function displayPrecomputedMoves() {
    const precomputedData = Object.entries(preComputedPositions)
        .map(([key, move]) => `preComputedPositions["${key}"] = ${move};`)
        .join("\n");
    document.getElementById("precomputed-moves").innerText = precomputedData;
}

export function go() {
    preComputeMoves(initialState, 1);
}