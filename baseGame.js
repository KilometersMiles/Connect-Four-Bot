// Player constants
export const playerRed = 1;
export const playerYellow = 2;
export let currPlayer = playerRed;

export var botIdentity = 1;

export let gameOver = false;
export var board;

export const rows = 6;
export const columns = 7;
export let currColumns = []; // keeps track of which row each column is at.

// Starts game
window.onload = function () {
    setGame();
};

export function setBotYellow() {
    var checkBox = document.getElementById("botIdentity");
    if (checkBox.checked == true) {
        botIdentity = 2;
    } else {
        botIdentity = 1;
    }
}

export function setGame() {
    gameOver = false;
    board = [];
    currColumns = Array(columns).fill(rows - 1);

    // Initialize the board state
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            row.push(0); // Use 0 to represent empty spaces
        }
        board.push(row);
    }

    // Clear previous board and display the current board
    displayBoard();

    document.getElementById("winner").innerText = ""; // Clear previous winner message
    logBoardState(); // Log the initial state of the board
    currPlayer = playerRed;
}

export function setPiece() {
    if (gameOver) return;

    let [r, c] = this.id.split("-").map(Number);
    r = currColumns[c];

    if (r < 0) return;

    board[r][c] = currPlayer; // Update the board state
    currPlayer = currPlayer === playerRed ? playerYellow : playerRed;

    currColumns[c]--;

    // Display the updated board state
    displayBoard();

    const winner = checkWinnerFromState(board);
    if (winner) {
        setWinner(winner);
    } else if (isBoardFull(board)) {
        setDraw();
    }
}

export function checkWinnerFromState(board) {
    // Check horizontal, vertical, and both diagonals for a winner
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] !== 0) {
                if (
                    checkDirection(board, r, c, 1, 0) || // Horizontal
                    checkDirection(board, r, c, 0, 1) || // Vertical
                    checkDirection(board, r, c, 1, 1) || // Anti-diagonal
                    checkDirection(board, r, c, 1, -1)
                ) {
                    // Diagonal
                    return board[r][c];
                }
            }
        }
    }
    return null;
}

export function checkDirection(board, r, c, dr, dc) {
    let player = board[r][c];
    for (let i = 1; i < 4; i++) {
        let newRow = r + dr * i;
        let newCol = c + dc * i;
        if (
            newRow < 0 ||
            newRow >= rows ||
            newCol < 0 ||
            newCol >= columns ||
            board[newRow][newCol] !== player
        ) {
            return false;
        }
    }
    return true;
}

export function isBoardFull(board) {
    for (let c = 0; c < columns; c++) {
        if (board[0][c] === 0) {
            return false;
        }
    }
    return true;
}

export function setWinner(winner) {
    let winnerText = document.getElementById("winner");
    winnerText.innerText = winner === playerRed ? "Red Wins" : "Yellow Wins";
    gameOver = true;
    disableBoard();
}

export function setDraw() {
    let winnerText = document.getElementById("winner");
    winnerText.innerText = "It's a Draw!";
    gameOver = true;
    disableBoard();
}

export function disableBoard() {
    document
        .querySelectorAll(".tile")
        .forEach((tile) => tile.removeEventListener("click", setPiece));
}

export function logBoardState() {
    console.log(board);
}

export function displayBoard() {
    document.getElementById("board").innerHTML = ""; // Clear previous board

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = `${r}-${c}`;
            tile.classList.add("tile");
            if (board[r][c] === playerRed) {
                tile.classList.add("red-piece");
            } else if (board[r][c] === playerYellow) {
                tile.classList.add("yellow-piece");
            }
            tile.addEventListener("click", setPiece);
            document.getElementById("board").append(tile);
        }
    }
}

export function getPlayerTurn(board) {
    let player1Count = 0;
    let player2Count = 0;

    // Count the number of player 1's and player 2's pieces on the board
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] === playerRed) {
                player1Count++;
            } else if (board[r][c] === playerYellow) {
                player2Count++;
            }
        }
    }

    // Determine which player's turn it is based on the counts
    return player1Count <= player2Count ? playerRed : playerYellow;
}

export function setBoardState(newState) {
    if (newState.length !== rows || newState[0].length !== columns) {
        console.error("Invalid board state dimensions.");
        return;
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            board[r][c] = newState[r][c];
        }
    }

    // Update the display to reflect the new board state
    displayBoard();
}

export function updateCurrColumns() {
    currColumns = Array(columns).fill(rows - 1);
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
            if (board[r][c] !== 0) {
                currColumns[c] = r - 1;
                break;
            }
        }
    }
}

export function getBoard() {
    return board;
}

export function setBoard(newBoard) {
    board = newBoard;
}

export function setCurrentPlayer(newPlayer) {
    currPlayer = newPlayer;
}

export function makeBotMove(newState) {
    if (!gameOver) {
        // Update the current board state to the new state
        setBoard(newState);

        // Recalculate the column heights in currColumns based on the new board state
        updateCurrColumns();

        // Display the updated board state
        displayBoard();

        // Check for a winner or draw
        const winner = checkWinnerFromState(board);
        if (winner) {
            setWinner(winner);
        } else if (isBoardFull(board)) {
            setDraw();
        }

        // Switch the current player
        setCurrentPlayer(currPlayer === playerRed ? playerYellow : playerRed);
    }
}

window.setBotYellow = setBotYellow;
window.getBoard = getBoard;
window.setGame = setGame;
