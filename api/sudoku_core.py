import random
import copy

def find_empty(bo):
    for i in range(len(bo)):
        for j in range(len(bo[0])):
            if bo[i][j] == 0:
                return (i, j)
    return None

def valid(bo, num, pos):
    for i in range(len(bo[0])):
        if bo[pos[0]][i] == num and pos[1] != i:
            return False
    for i in range(len(bo)):
        if bo[i][pos[1]] == num and pos[0] != i:
            return False
    box_x = pos[1] // 3
    box_y = pos[0] // 3
    for i in range(box_y*3, box_y*3 + 3):
        for j in range(box_x * 3, box_x*3 + 3):
            if bo[i][j] == num and (i,j) != pos:
                return False
    return True

def solve(bo):
    find = find_empty(bo)
    if not find: return True
    else: row, col = find
    for i in range(1, 10):
        if valid(bo, i, (row, col)):
            bo[row][col] = i
            if solve(bo): return True
            bo[row][col] = 0
    return False

def is_valid_board(bo):
    for i in range(9):
        for j in range(9):
            num = bo[i][j]
            if num != 0:
                bo[i][j] = 0
                if not valid(bo, num, (i, j)):
                    bo[i][j] = num
                    return False
                bo[i][j] = num
    return True

def is_completely_filled(bo):
    for i in range(9):
        for j in range(9):
            if bo[i][j] == 0:
                return False
    return True

def generate_full_board():
    board = [[0 for _ in range(9)] for _ in range(9)]
    for i in range(0, 9, 3):
        fill_box(board, i, i)
    solve(board)
    return board

def fill_box(board, row_start, col_start):
    num_list = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    random.shuffle(num_list)
    idx = 0
    for i in range(3):
        for j in range(3):
            board[row_start + i][col_start + j] = num_list[idx]
            idx += 1

def generate_game(clues=30):
    solution = generate_full_board()
    board = copy.deepcopy(solution)
    cells_to_remove = 81 - clues
    removed = 0
    while removed < cells_to_remove:
        row = random.randint(0, 8)
        col = random.randint(0, 8)
        if board[row][col] != 0:
            board[row][col] = 0
            removed += 1
    return board, solution
