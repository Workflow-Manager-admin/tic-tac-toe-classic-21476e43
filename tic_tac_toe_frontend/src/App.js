// Main app: Tic Tac Toe + Snake
import React, { useState, useEffect } from 'react';
import SnakeGame from './Snake';
import './App.css';

// Colors from project requirements
const COLORS = {
  main: '#1976d2',      // primary (blue)
  accent: '#388e3c',    // accent (green)
  secondary: '#fff176', // secondary (yellow)
};

// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /** Returns 'X', 'O', or null if the game isn't won. */
  // Lines for a 3x3 tic-tac-toe
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function getAvailableMoves(squares) {
  /** Get indices for available (empty) squares. */
  return squares.map((val, idx) => val === null ? idx : null).filter(idx => idx !== null);
}

// PUBLIC_INTERFACE
function getRandomMove(squares) {
  /** Returns a random empty index for computer move. */
  const empty = getAvailableMoves(squares);
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

const INITIAL_BOARD = Array(9).fill(null);

const MODES = {
  SINGLE: 'Single Player',
  TWO: 'Two Player',
};

/* --- MULTI-GAME APP: Tic Tac Toe (default) or Snake --- */

function App() {
  // Game selector (state): "tictactoe" or "snake"
  const [selectedGame, setSelectedGame] = useState("tictactoe");

  // Tic Tac Toe State (moved into hook)
  const [squares, setSquares] = useState(INITIAL_BOARD);
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState(MODES.SINGLE);
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [startingPlayer, setStartingPlayer] = useState('X'); // who starts new game
  const [showNewGameAnim, setShowNewGameAnim] = useState(false);

  // Theme (mainly for future dark mode, setting CSS var for Snake too)
  const [theme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Session storage for scores (TTT only)
  useEffect(() => {
    const data = sessionStorage.getItem('tttScores');
    if (data) setScores(JSON.parse(data));
    setStartingPlayer('X');
  }, []);
  useEffect(() => {
    sessionStorage.setItem('tttScores', JSON.stringify(scores));
  }, [scores]);

  // Detect winner or tie (TTT)
  useEffect(() => {
    if (selectedGame !== "tictactoe") return;
    const win = calculateWinner(squares);
    if (win) {
      setGameOver(true);
      setWinner(win);
      setScores(prev => ({ ...prev, [win]: prev[win] + 1 }));
    } else if (getAvailableMoves(squares).length === 0) {
      setGameOver(true);
      setWinner(null);
      setScores(prev => ({ ...prev, ties: prev.ties + 1 }));
    }
  }, [squares, selectedGame]);

  // Computer Move for TTT single player
  useEffect(() => {
    if (
      selectedGame !== "tictactoe" ||
      mode !== MODES.SINGLE ||
      gameOver ||
      xIsNext
    ) return;
    // Delay for normal feel
    const moveTimeout = setTimeout(() => {
      const idx = getRandomMove(squares);
      if (idx !== null) {
        handleMove(idx);
      }
    }, 400);
    return () => clearTimeout(moveTimeout);
    // eslint-disable-next-line
  }, [squares, mode, gameOver, xIsNext, selectedGame]);

  // PUBLIC_INTERFACE
  function handleMove(idx) {
    if (squares[idx] || gameOver) return;
    const player = xIsNext ? 'X' : 'O';
    const nextSquares = squares.slice();
    nextSquares[idx] = player;
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(INITIAL_BOARD);
    setXIsNext(startingPlayer === 'X');
    setGameOver(false);
    setWinner(null);
    setShowNewGameAnim(true);
    setTimeout(() => setShowNewGameAnim(false), 350);
  }

  // PUBLIC_INTERFACE
  function handleNewGame() {
    const nextStarter = startingPlayer === 'X' ? 'O' : 'X';
    setStartingPlayer(nextStarter);
    setSquares(INITIAL_BOARD);
    setXIsNext(nextStarter === 'X');
    setGameOver(false);
    setWinner(null);
    setScores({ X: 0, O: 0, ties: 0 });
    setShowNewGameAnim(true);
    setTimeout(() => setShowNewGameAnim(false), 350);
  }

  // PUBLIC_INTERFACE
  function handleChangeMode(newMode) {
    setMode(newMode);
    handleNewGame();
  }

  // PUBLIC_INTERFACE
  function getStatusText() {
    if (gameOver) {
      if (winner === 'X') return 'X Wins!';
      if (winner === 'O') return 'O Wins!';
      return "It's a Tie!";
    }
    return (
      <>
        <span style={{ color: xIsNext ? COLORS.main : COLORS.accent }}>
          {xIsNext ? 'X' : 'O'}
        </span>
        &nbsp;to move
      </>
    );
  }

  // --- TOP-LEVEL RENDER ----
  return (
    <div className="App" style={{ background: "var(--bg-primary)", minHeight: '100vh' }}>
      {/* Header, with game selection tabs */}
      <header className="ttt-header" style={{
        margin: "0 auto",
        background: COLORS.main,
        color: "#fff",
        width: "100%",
        padding: "0 0 0 0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        borderBottom: "4px solid #fff17644"
      }}>
        {/* GAME SELECTOR TABS */}
        <div
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            background: COLORS.main,
            padding: "0 0 0 0",
          }}
        >
          {/* Tab Buttons */}
          <button
            className="ttt-btn"
            aria-pressed={selectedGame === "tictactoe"}
            onClick={() => setSelectedGame("tictactoe")}
            style={{
              background: selectedGame === "tictactoe" ? "#fff176" : COLORS.main,
              color: selectedGame === "tictactoe" ? COLORS.main : "#fff",
              fontWeight: 800,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              margin: "0 4px 0 0",
              borderBottom: selectedGame === "tictactoe" ? "4px solid #fff176" : "none",
              borderRight: "0.5px solid #fff4",
              fontSize: "1.07rem",
              minWidth: 112,
              minHeight: 38,
              boxShadow: selectedGame === "tictactoe" ? "0 6px 22px #fff17619" : "none",
              transition: "background 0.23s, color 0.18s"
            }}
          >
            Tic Tac Toe
          </button>
          <button
            className="ttt-btn"
            aria-pressed={selectedGame === "snake"}
            onClick={() => setSelectedGame("snake")}
            style={{
              background: selectedGame === "snake" ? "#fff176" : COLORS.main,
              color: selectedGame === "snake" ? COLORS.main : "#fff",
              fontWeight: 800,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              margin: "0",
              borderBottom: selectedGame === "snake" ? "4px solid #fff176" : "none",
              minWidth: 112,
              minHeight: 38,
              boxShadow: selectedGame === "snake" ? "0 6px 22px #fff17619" : "none",
              transition: "background 0.23s, color 0.18s"
            }}
          >
            Snake
          </button>
          <span style={{ flex: 1 }} />
        </div>
        {/* Title and subtitle */}
        <div style={{
          margin: "0 auto",
          background: COLORS.main,
          color: "#fff",
          width: "100%",
          padding: "4px 0 6px 0",
        }}>
          <h1 style={{
            margin: 0,
            fontWeight: 700,
            letterSpacing: "2px",
            fontSize: "clamp(1.3rem, 3vw, 2.1rem)"
          }}>
            {selectedGame === "tictactoe" ? "Tic Tac Toe Classic" : "Snake Game"}
          </h1>
          <div style={{
            marginTop: 5,
            fontSize: "1rem",
            color: COLORS.secondary,
            fontWeight: 400
          }}>
            {selectedGame === "tictactoe"
              ? `Play against ${mode === MODES.SINGLE ? "the Computer" : "a Friend"}`
              : `Eat food, grow the snake!`}
          </div>
        </div>
      </header>

      {/* MAIN: Either Tic Tac Toe pane, or Snake Game (full view) */}
      <main className="ttt-main"
        style={{
          maxWidth: 430,
          margin: "24px auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: 440,
          width: "98vw"
        }}>
        {selectedGame === "tictactoe" && (
          <>
            {/* Game/Score Panel */}
            <div style={{
              width: "100%",
              display: "flex",
              gap: 6,
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16
            }}>
              {/* Mode toggle */}
              <div>
                <button
                  className={`ttt-btn ${mode === MODES.SINGLE ? 'mode-selected' : ''}`}
                  style={{ background: mode === MODES.SINGLE ? COLORS.accent : COLORS.main, color: "#fff", marginRight: 4 }}
                  onClick={() => handleChangeMode(MODES.SINGLE)}
                  aria-pressed={mode === MODES.SINGLE}
                >
                  Single
                </button>
                <button
                  className={`ttt-btn ${mode === MODES.TWO ? 'mode-selected' : ''}`}
                  style={{ background: mode === MODES.TWO ? COLORS.accent : COLORS.main, color: "#fff" }}
                  onClick={() => handleChangeMode(MODES.TWO)}
                  aria-pressed={mode === MODES.TWO}
                >
                  Two
                </button>
              </div>

              {/* Score Display */}
              <div className="ttt-score-box" style={{
                background: COLORS.secondary,
                color: COLORS.main,
                borderRadius: 8,
                minWidth: 100,
                textAlign: "center",
                padding: "4px 10px",
                fontWeight: 500,
                fontSize: "1.05rem"
              }}>
                X: {scores.X} &nbsp; O: {scores.O} &nbsp; T: {scores.ties}
              </div>
            </div>

            {/* Player status */}
            <div
              className="ttt-status-panel"
              style={{
                fontWeight: 600,
                marginBottom: 12,
                fontSize: "1.18rem"
              }}>
              {getStatusText()}
            </div>

            {/* 3x3 Board */}
            <div
              className={`ttt-board${showNewGameAnim ? " ttt-fade-in" : ""}`}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 4,
                background: "var(--bg-secondary)",
                borderRadius: 14,
                boxShadow: "0 4px 20px rgba(32,34,72,0.04)",
                padding: 8,
                marginBottom: 18,
                transition: "box-shadow 0.2s"
              }}
            >
              {squares.map((square, idx) => (
                <button
                  key={idx}
                  className="ttt-cell"
                  aria-label={`cell ${idx + 1}`}
                  onClick={() => {
                    if (mode === MODES.SINGLE && !xIsNext && !gameOver) return;
                    handleMove(idx);
                  }}
                  disabled={!!square || gameOver}
                  style={{
                    height: 76,
                    width: 76,
                    maxWidth: "28vw",
                    maxHeight: "28vw",
                    fontSize: "2.3rem",
                    fontWeight: 700,
                    color: !square ? COLORS.main
                      : square === 'X' ? COLORS.main : COLORS.accent,
                    background: "#fff",
                    border: `2.5px solid ${COLORS.main}`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: !!square ? "0 2px 6px rgba(0,0,0,0.07)" : "none",
                    opacity: !!square || gameOver ? 0.94 : 1,
                    cursor: !!square || gameOver ? "default" : "pointer",
                    transition: "background 0.2s, color 0.25s, border 0.18s, opacity 0.32s"
                  }}
                >
                  {square}
                </button>
              ))}
            </div>

            {/* Controls for game */}
            <div className="ttt-controls" style={{
              display: "flex", gap: 12, justifyContent: "center"
            }}>
              <button
                className="ttt-btn"
                style={{
                  background: COLORS.main,
                  color: "#fff",
                  fontWeight: 600
                }}
                onClick={handleRestart}
              >
                Restart
              </button>
              <button
                className="ttt-btn"
                style={{
                  background: COLORS.accent,
                  color: "#fff",
                  fontWeight: 600
                }}
                onClick={handleNewGame}
              >
                New Game
              </button>
            </div>
          </>
        )}

        {selectedGame === "snake" && (
          // SNAKE GAME (full game UI)
          <SnakeGame />
        )}
      </main>

      <footer className="ttt-footer" style={{
        margin: "2rem 0 1rem 0",
        width: "100%",
        textAlign: "center",
        fontWeight: 400,
        color: "#34495E",
        fontSize: "0.98rem",
        opacity: 0.7
      }}>
        {selectedGame === "tictactoe"
          ? "Tic Tac Toe · Powered by React · Classic Mode"
          : "Snake · Powered by React · Classic Arcade"}
      </footer>
    </div>
  );
}

export default App;
