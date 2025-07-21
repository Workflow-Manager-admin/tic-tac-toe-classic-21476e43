import React, { useState, useEffect } from 'react';
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

// PUBLIC_INTERFACE
function App() {
  // Game state
  const [squares, setSquares] = useState(INITIAL_BOARD);
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState(MODES.SINGLE);
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [startingPlayer, setStartingPlayer] = useState('X'); // Tracks who starts NEW game (alternate)
  const [showNewGameAnim, setShowNewGameAnim] = useState(false);

  // Theme (light only but preserve toggle option for structure/future)
  const [theme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Session storage for scores
  useEffect(() => {
    // On mount: retrieve scores
    const data = sessionStorage.getItem('tttScores');
    if (data) setScores(JSON.parse(data));
    // On start: alternate who starts
    setStartingPlayer('X');
  }, []);
  useEffect(() => {
    sessionStorage.setItem('tttScores', JSON.stringify(scores));
  }, [scores]);

  // Detect winner or tie when squares change
  useEffect(() => {
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
  }, [squares]);

  // Computer Move for single player
  useEffect(() => {
    if (
      mode === MODES.SINGLE &&
      !gameOver &&
      !xIsNext // O is computer
    ) {
      // Delay for normal feel
      const moveTimeout = setTimeout(() => {
        const idx = getRandomMove(squares);
        if (idx !== null) {
          handleMove(idx);
        }
      }, 400);
      return () => clearTimeout(moveTimeout);
    }
    // eslint-disable-next-line
  }, [squares, mode, gameOver, xIsNext]);

  // PUBLIC_INTERFACE
  function handleMove(idx) {
    // If occupied, ignore
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
    // Alternate starting player
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
    handleNewGame(); // Clear board & reset scores when switching mode
  }

  // PUBLIC_INTERFACE
  function getStatusText() {
    if (gameOver) {
      if (winner === 'X') return 'X Wins!';
      if (winner === 'O') return 'O Wins!';
      return 'It\'s a Tie!';
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

  // Board render
  return (
    <div className="App" style={{ background: "var(--bg-primary)", minHeight: '100vh' }}>
      <header className="ttt-header" style={{
        margin: "0 auto",
        background: COLORS.main,
        color: "#fff",
        width: "100%",
        padding: "16px 0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
      }}>
        <h1 style={{
          margin: 0,
          fontWeight: 700,
          letterSpacing: "2px",
          fontSize: "clamp(1.5rem, 3vw, 2.5rem)"
        }}>
          Tic Tac Toe Classic
        </h1>
        <div style={{
          marginTop: 8,
          fontSize: "1rem",
          color: COLORS.secondary,
          fontWeight: 400
        }}>
          Play against {mode === MODES.SINGLE ? "the Computer" : "a Friend"}
        </div>
      </header>

      <main className="ttt-main" style={{
        maxWidth: 400, margin: "24px auto", display: "flex", flexDirection: "column", alignItems: "center",
      }}>
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
              aria-label={`cell ${idx+1}`}
              onClick={() => {
                // Only allow move if not computer's turn (single mode)
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
        Tic Tac Toe &middot; Powered by React &middot; Classic Mode
      </footer>
    </div>
  );
}

export default App;
