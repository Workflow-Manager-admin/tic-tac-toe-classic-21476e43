import React, { useRef, useEffect, useState, useCallback } from "react";
import "./App.css";

/**
 * -- SNAKE GAME COMPONENT --
 * Responsive, playable Snake game styled to match KAVIA Tic Tac Toe frontend.
 */

// Colors/theme
const COLORS = {
  main: '#1976d2',      
  accent: '#388e3c',
  secondary: '#fff176',
  snakeHead: '#1976d2',
  snakeBody: '#64b5f6',
  food: '#388e3c',
  border: '#e9ecef',
  bg: 'var(--bg-secondary)',
  grid: '#e8eaed',
};

// Game settings
const BOARD_SIZE = 15;       // 15x15 grid
const INIT_SNAKE = [
  { x: 7, y: 9 },
  { x: 7, y: 10 },
];
const INIT_DIR = { x: 0, y: -1 }; // moving up by default
const SPEEDS = {
  Slow: 160,
  Normal: 100,
  Fast: 70,
};

// Helpers
const getRandomPosition = (snake) => {
  while (true) {
    const pos = { x: Math.floor(Math.random()*BOARD_SIZE), y: Math.floor(Math.random()*BOARD_SIZE) };
    if (!snake.some(seg => seg.x === pos.x && seg.y === pos.y)) return pos;
  }
};

/**
 * Game Status:
 *  "ready"  - initial (not started)
 *  "running" - playing
 *  "paused"
 *  "over"
 */

// PUBLIC_INTERFACE
function SnakeGame() {
  // State
  const [snake, setSnake] = useState([...INIT_SNAKE]);
  const [dir, setDir] = useState({...INIT_DIR}); // direction: {x,y}
  const [food, setFood] = useState(getRandomPosition(INIT_SNAKE));
  const [status, setStatus] = useState("ready");
  const [score, setScore] = useState(0);
  const [lastDir, setLastDir] = useState({...INIT_DIR});
  const [speed, setSpeed] = useState("Normal");
  const [growFlag, setGrowFlag] = useState(false);

  const intervalRef = useRef(null);

  // -- KEYBOARD CONTROLS --
  useEffect(() => {
    if (status !== "running") return;

    const handleKey = (e) => {
      let k = e.key;
      // Arrow keys or WASD
      if (k === "ArrowUp" || k === "w") {
        if (lastDir.y !== 1) setDir({ x: 0, y: -1 });
      } else if (k === "ArrowDown" || k === "s") {
        if (lastDir.y !== -1) setDir({ x: 0, y: 1 });
      } else if (k === "ArrowLeft" || k === "a") {
        if (lastDir.x !== 1) setDir({ x: -1, y: 0 });
      } else if (k === "ArrowRight" || k === "d") {
        if (lastDir.x !== -1) setDir({ x: 1, y: 0 });
      } else if (k === " ") {
        setStatus((st) => st === "running" ? "paused" : "running");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line
  }, [lastDir, status]);

  // -- MAIN GAME LOOP --
  useEffect(() => {
    if (status !== "running") {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSnake(prevSnake => moveSnake(prevSnake));
    }, SPEEDS[speed] || 100);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, [status, dir, speed]);

  // Move the snake, handle growth, collision, food
  const moveSnake = useCallback((prevSnake) => {
    const newHead = { x: prevSnake[0].x + dir.x, y: prevSnake[0].y + dir.y };
    setLastDir(dir);
    // Out of bounds?
    if (
      newHead.x < 0 ||
      newHead.x >= BOARD_SIZE ||
      newHead.y < 0 ||
      newHead.y >= BOARD_SIZE ||
      prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)
    ) {
      setStatus("over");
      return prevSnake;
    }
    // Eat food?
    let grow = false;
    if (newHead.x === food.x && newHead.y === food.y) {
      setFood(getRandomPosition([...prevSnake, newHead]));
      setScore(s => s + 1);
      grow = true;
      setGrowFlag(true);
    }

    // Create new snake array
    let nextSnake = [newHead, ...prevSnake];
    if (!growFlag && !grow) nextSnake.pop();
    else setGrowFlag(false);

    return nextSnake;
  }, [dir, food, growFlag]);

  // Handle Start, Pause, Restart
  function handleStart() {
    setSnake([...INIT_SNAKE]);
    setDir({ ...INIT_DIR });
    setLastDir({ ...INIT_DIR });
    setFood(getRandomPosition(INIT_SNAKE));
    setScore(0);
    setStatus("running");
    setGrowFlag(false);
  }
  function handlePause() {
    if (status === "running") setStatus("paused");
    else if (status === "paused") setStatus("running");
  }
  function handleRestart() {
    handleStart();
  }
  function handleSpeedChange(val) {
    setSpeed(val);
    handleStart();
  }

  // Touch/Swipe controls for mobile
  useEffect(() => {
    let startX = null, startY = null;
    function touchStart(e) {
      if (!e.touches) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
    function touchMove(e) {
      if (!e.touches || startX === null || startY === null) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        // left or right
        if (dx > 14 && lastDir.x !== -1) setDir({ x: 1, y: 0 });
        if (dx < -14 && lastDir.x !== 1) setDir({ x: -1, y: 0 });
      } else {
        // up or down
        if (dy > 14 && lastDir.y !== -1) setDir({ x: 0, y: 1 });
        if (dy < -14 && lastDir.y !== 1) setDir({ x: 0, y: -1 });
      }
      startX = null;
      startY = null;
    }
    window.addEventListener("touchstart", touchStart, { passive: false });
    window.addEventListener("touchmove", touchMove, { passive: false });
    return () => {
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
    };
  });

  // Accessibility: Focus game board so Arrow keys just work
  const boardRef = useRef();
  useEffect(() => {
    if (status === "running") boardRef.current?.focus();
  }, [status]);

  // Render cell
  function renderCell(x, y) {
    const isHead = snake[0].x === x && snake[0].y === y;
    const isSnake = snake.some(seg => seg.x === x && seg.y === y);
    const isFood = food.x === x && food.y === y;
    let cellStyle = {
      width: "auto",
      aspectRatio: "1/1",
      background: isHead ? COLORS.snakeHead : isSnake ? COLORS.snakeBody : isFood ? COLORS.food : COLORS.bg,
      borderRadius: isHead ? 10 : isSnake ? 12 : isFood ? "50%" : 6,
      border: isFood ? `2px solid ${COLORS.snakeHead}` : `1px solid ${COLORS.grid}`,
      margin: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: isHead ? 800 : isSnake ? 600 : 400,
      fontSize: isFood ? 18 : 12,
      boxShadow: isFood ? "0 2px 8px #388e3c33" : undefined,
      transition: "background 0.18s, border 0.18s",
      color: isFood ? "#fff" : "#000",
      userSelect: "none",
    };

    return (
      <div
        key={`${x},${y}`}
        tabIndex={-1}
        role={isFood ? "img" : undefined}
        aria-label={
          isHead
            ? "Snake head"
            : isFood
            ? "Food"
            : isSnake
            ? "Snake body"
            : "Empty"
        }
        style={cellStyle}
      >
        {isHead ? "" : isFood ? "★" : ""}
      </div>
    );
  }

  return (
    <div
      className="snake-game-root"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 0 22px 0",
        background: "var(--bg-primary)",
        borderRadius: 16,
        minHeight: 390,
        minWidth: 0,
      }}
    >
      <h2 style={{
        margin: 0,
        color: COLORS.main,
        fontWeight: 700,
        fontSize: "1.5rem",
        letterSpacing: 1,
        marginBottom: 6
      }}>
        Snake Game
      </h2>
      <div style={{
        margin: "0 0 6px 0",
        fontSize: "1.05rem",
        color: "#333B",
        fontWeight: 400
      }}>
        Use <b>Arrow keys</b> or <b>WASD</b> to move. Eat food, avoid tail/walls.<br />
        <span style={{ color: "#888", fontSize: "0.98em" }}>Tap/drag to change direction on mobile.</span>
      </div>
      {/* Controls */}
      <div style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        margin: "6px 0 10px 0",
        flexWrap: "wrap"
      }}>
        <button
          className="ttt-btn"
          style={{
            background: COLORS.main,
            color: "#fff",
            fontWeight: 700,
            opacity: status === "running" ? 0.86 : 1,
            minWidth: 66
          }}
          onClick={handleStart}
          disabled={status === "running"}
        >Start</button>
        <button
          className="ttt-btn"
          style={{
            background: COLORS.accent,
            color: "#fff",
            fontWeight: 700,
            minWidth: 66,
            opacity: status !== "running" ? 0.8 : 1
          }}
          onClick={handlePause}
          disabled={status === "ready" || status === "over"}
        >{status === "paused" ? "Resume" : "Pause"}</button>
        <button
          className="ttt-btn"
          style={{
            background: COLORS.secondary,
            color: COLORS.main,
            fontWeight: 700,
            minWidth: 66,
            border: "2px solid #1976d2",
            opacity: status === "ready" ? 0.8 : 1
          }}
          onClick={handleRestart}
          disabled={status === "ready"}
        >Restart</button>
        {/* Speed selector */}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 4 }}>
          <span style={{ marginRight: 3, fontSize: 12, color: '#666' }}>Speed:</span>
          <select
            className="ttt-btn"
            value={speed}
            style={{
              padding: "2px 6px",
              fontWeight: 600,
              border: "1.5px solid #1976d2",
              color: COLORS.main,
              background: "#fff",
              fontSize: 13,
              borderRadius: 5,
            }}
            onChange={e => handleSpeedChange(e.target.value)}
            disabled={status === "running"}
            aria-label="Change speed"
          >
            {Object.keys(SPEEDS).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Score display */}
      <div style={{
        margin: "4px 0 12px 0",
        fontWeight: 600,
        fontSize: "1.14rem",
        color: COLORS.accent,
        textShadow: "0 1px #bbb7"
      }}>
        Score: {score}
      </div>
      {/* Game Board */}
      <div
        ref={boardRef}
        tabIndex={0}
        className="snake-board"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(14px, 1fr))`,
          gap: 2,
          background: "var(--bg-secondary)",
          borderRadius: 12,
          border: `2.5px solid ${COLORS.main}`,
          maxWidth: 450, minWidth: "min(96vw, 230px)",
          minHeight: "min(96vw, 230px)",
          margin: "0 auto 10px auto",
          boxShadow: "0 8px 16px rgba(32,34,72,0.08)",
          outline: "none"
        }}
        aria-label="Snake Game Grid"
      >
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => {
          const x = i % BOARD_SIZE;
          const y = Math.floor(i / BOARD_SIZE);
          return renderCell(x, y);
        })}
      </div>
      {/* Status message */}
      <div style={{
        margin: "10px 0 0 0",
        fontWeight: 600,
        fontSize: "1.16rem",
        color: status === "over" ? "#d32f2f" : "#444"
      }}>
        {status === "over" && (
          <span>
            Game Over! Your score: <b>{score}</b>{" "}
            <button className="ttt-btn" style={{ marginLeft: 8, fontSize: 14, padding: "4px 12px" }} onClick={handleRestart}>
              Play Again
            </button>
          </span>
        )}
        {status === "paused" && <span>Paused</span>}
        {status === "ready" && <span>Press <b>Start</b> to play</span>}
      </div>
    </div>
  );
}

export default SnakeGame;
