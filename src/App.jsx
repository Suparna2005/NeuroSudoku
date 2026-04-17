import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  RefreshCw, Play, CheckCircle2, Search, 
  Settings2, Lightbulb, PenTool, Eraser, 
  Trophy, RotateCcw, Github
} from 'lucide-react';

// Using absolute path configured in Vite
import logoImg from 'C:/Users/supar/.gemini/antigravity/brain/c4e34718-af12-42d8-8725-dbc58b1b8e12/sudoku_logo_1776398119107.png';
import mascotImg from 'C:/Users/supar/.gemini/antigravity/brain/c4e34718-af12-42d8-8725-dbc58b1b8e12/sudoku_mascot_1776398159555.png';

// Use local proxy for Vite in dev mode, or root relative path in Vercel production
const API_BASE = import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '/api';

function App() {
  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [initialBoard, setInitialBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [solution, setSolution] = useState(null);
  
  const [selectedCell, setSelectedCell] = useState(null); 
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [notesMode, setNotesMode] = useState(false);
  const [notes, setNotes] = useState(Array(9).fill().map(() => Array(9).fill([])));
  
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null); 
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else if (!isPlaying && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timer]);

  const loadNewGame = async (diff) => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const res = await axios.get(`${API_BASE}/generate?difficulty=${diff}`);
      setBoard(res.data.board);
      setInitialBoard(res.data.board.map(row => [...row]));
      setSolution(res.data.solution);
      setNotes(Array(9).fill().map(() => Array(9).fill([])));
      setSelectedCell(null);
      setTimer(0);
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to fetch board. Make sure python backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewGame(difficulty);
  }, []);

  const handleCellClick = (r, c) => {
    setSelectedCell([r, c]);
    setErrorStatus(null);
  };

  const handleInput = useCallback((num) => {
    if (!selectedCell || !isPlaying) return;
    const [r, c] = selectedCell;
    
    if (initialBoard[r][c] !== 0) return;

    if (notesMode) {
      const newNotes = [...notes];
      const cellNotes = [...newNotes[r][c]];
      if (num === 0) {
         newNotes[r][c] = [];
      } else if (cellNotes.includes(num)) {
        newNotes[r][c] = cellNotes.filter(n => n !== num);
      } else {
        newNotes[r][c] = [...cellNotes, num];
      }
      setNotes(newNotes);
    } else {
      const newBoard = board.map((row, rowIndex) => 
        row.map((cell, colIndex) => {
          if (rowIndex === r && colIndex === c) return num;
          return cell;
        })
      );
      setBoard(newBoard);
    }
  }, [selectedCell, initialBoard, board, notesMode, notes, isPlaying]);

  const handleErase = () => handleInput(0);

  const handleKeyDown = useCallback((e) => {
    if (e.key >= '1' && e.key <= '9') {
      handleInput(parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      handleErase();
    } else if (selectedCell) {
      const [r, c] = selectedCell;
      if (e.key === 'ArrowUp' && r > 0) setSelectedCell([r - 1, c]);
      if (e.key === 'ArrowDown' && r < 8) setSelectedCell([r + 1, c]);
      if (e.key === 'ArrowLeft' && c > 0) setSelectedCell([r, c - 1]);
      if (e.key === 'ArrowRight' && c < 8) setSelectedCell([r, c + 1]);
    }
  }, [handleInput, selectedCell]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const solveGame = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/solve`, { board: initialBoard });
      if (res.data.status === 'success') {
        setBoard(res.data.board);
        setIsPlaying(false);
        setErrorStatus(null);
      } else {
        alert("Board is unsolvable or has conflicts.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateBoard = async () => {
    try {
      const res = await axios.post(`${API_BASE}/validate`, { board });
      if (res.data.status === 'valid') {
        setErrorStatus('Looks good so far!');
      } else if (res.data.status === 'invalid') {
        setErrorStatus('There are errors on the board.');
      } else if (res.data.status === 'solved') {
        setErrorStatus('Congratulations! You solved it!');
        setIsPlaying(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const provideHint = () => {
    if (!selectedCell || !solution) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return;
    
    const newBoard = [...board];
    newBoard[r] = [...newBoard[r]];
    newBoard[r][c] = solution[r][c];
    setBoard(newBoard);
  };

  const isHighlighted = (r, c) => {
    if (!selectedCell) return false;
    const [sr, sc] = selectedCell;
    const sameRow = r === sr;
    const sameCol = c === sc;
    const sameBlock = Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3);
    const selectedNum = board[sr][sc];
    const sameNumber = selectedNum !== 0 && board[r][c] === selectedNum;
    return sameRow || sameCol || sameBlock || sameNumber;
  };

  return (
    <>
      <div className="splash-screen">
        <img src={logoImg} alt="NeuroSudoku Logo" className="splash-logo" />
        <h2 className="splash-title">NeuroSudoku</h2>
      </div>
      
      <div className="app-container">
        
        <div className="header">
          <img src={logoImg} alt="Logo" className="header-logo" />
          <div className="header-text">
            <h1>NeuroSudoku</h1>
            <div className="badge">Created by <b>SUPARNA</b></div>
          </div>
        </div>

        <div className="main-layout">
          {/* Mascot Side Panel */}
          <div className="mascot-container">
            <img src={mascotImg} alt="Cute Robot Brain Mascot" className="mascot-img" />
            <p>I am calculating millions of possibilities! Use my powers to quickly solve or get hints.</p>
          </div>

          {/* Central Game Board */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', alignItems: 'center' }}>
              <div className="difficulty-selector">
                {['easy', 'medium', 'hard', 'expert'].map((d) => (
                  <button 
                    key={d} 
                    className={`diff-btn ${difficulty === d ? 'active' : ''}`}
                    onClick={() => { setDifficulty(d); loadNewGame(d); }}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {formatTime(timer)}
              </div>
            </div>

            <div className="board-container">
              <div className={`sudoku-grid ${loading ? 'loading' : ''}`}>
                {board.map((row, r) => 
                  row.map((cell, c) => {
                    const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
                    const isHighlight = isHighlighted(r, c);
                    const isInit = initialBoard[r][c] !== 0;
                    
                    let classes = 'sudoku-cell cell-wrapper ';
                    if (isSelected) classes += 'selected ';
                    else if (isHighlight) classes += 'highlighted ';
                    
                    if (isInit) classes += 'initial ';
                    else if (cell !== 0) classes += 'user-input ';

                    return (
                      <div 
                        key={`${r}-${c}`} 
                        className={classes}
                        onClick={() => handleCellClick(r, c)}
                      >
                        {cell !== 0 ? cell : (
                          <div style={{fontSize: '0.6rem', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '100%', height: '100%', placeItems: 'center'}}>
                            {notes[r][c].map(n => <span key={n}>{n}</span>)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                {loading && (
                  <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div className="loader"></div>
                  </div>
                )}
              </div>

              {/* Advanced Controls */}
              <div className="controls-panel">
                {errorStatus && (
                  <div style={{
                    padding: '0.8rem', 
                    borderRadius: '8px', 
                    background: errorStatus.includes('errors') ? 'var(--bg-cell-error)' : 'rgba(0, 240, 255, 0.2)',
                    color: errorStatus.includes('errors') ? 'var(--text-error)' : 'var(--text-primary)',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    {errorStatus}
                  </div>
                )}

                <div className="numpad">
                  {[1,2,3,4,5,6,7,8,9].map(num => (
                    <button key={num} className="btn" onClick={() => handleInput(num)}>{num}</button>
                  ))}
                </div>

                <div className="action-buttons">
                  <button 
                    className={`btn action-btn ${notesMode ? 'btn-primary' : ''}`} 
                    onClick={() => setNotesMode(!notesMode)}
                  >
                    <PenTool size={16} /> Notes
                  </button>
                  <button className="btn action-btn" onClick={handleErase}>
                    <Eraser size={16} /> Erase
                  </button>
                  <button className="btn action-btn" onClick={provideHint}>
                    <Lightbulb size={16} /> Hint
                  </button>
                  <button className="btn action-btn" onClick={validateBoard}>
                    <CheckCircle2 size={16} /> Check
                  </button>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }} onClick={solveGame}>
                  <Play size={18} /> Solve For Me
                </button>
                
                <button className="btn" style={{ width: '100%' }} onClick={() => loadNewGame(difficulty)}>
                  <RefreshCw size={18} /> New Game
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer & Info Panel */}
        <div className="info-panel">
          <p>
            <b>NeuroSudoku</b> uses an advanced backtracking Python engine to construct and solve unique Sudoku boards across varying difficulties instantly. 
          </p>
          <a href="https://github.com/Suparna2005" target="_blank" rel="noopener noreferrer">
            <Github size={20} /> View Source / GitHub Profile
          </a>
        </div>
      </div>
    </>
  );
}

export default App;
