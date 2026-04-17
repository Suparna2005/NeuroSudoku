from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import api.sudoku_core as sudoku_core # Relative import for Vercel

app = FastAPI(title="Sudoku Solver Platform")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BoardData(BaseModel):
    board: List[List[int]]

class SolveResponse(BaseModel):
    status: str
    board: Optional[List[List[int]]] = None

@app.get("/api/generate")
def generate_board(difficulty: str = "medium"):
    levels = {"easy": 40, "medium": 30, "hard": 25, "expert": 20}
    clues = levels.get(difficulty.lower(), 30)
    board, solution = sudoku_core.generate_game(clues)
    return {"board": board, "solution": solution}

@app.post("/api/solve", response_model=SolveResponse)
def solve_board(data: BoardData):
    grid = [row[:] for row in data.board]
    if not sudoku_core.is_valid_board(grid):
        return {"status": "error", "board": None, "message": "Invalid state."}
    if sudoku_core.solve(grid):
        return {"status": "success", "board": grid}
    else:
        return {"status": "unsolvable", "board": None}

@app.post("/api/validate")
def validate_board(data: BoardData):
    is_valid = sudoku_core.is_valid_board(data.board)
    is_complete = sudoku_core.is_completely_filled(data.board)
    status = "valid"
    if not is_valid: status = "invalid"
    elif is_complete and is_valid: status = "solved"
    return {"status": status}
