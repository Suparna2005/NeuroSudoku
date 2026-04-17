import fs from 'fs';

const publicDir = 'public';
if (!fs.existsSync(publicDir)){
    fs.mkdirSync(publicDir);
}

fs.copyFileSync('C:/Users/supar/.gemini/antigravity/brain/c4e34718-af12-42d8-8725-dbc58b1b8e12/sudoku_logo_1776398119107.png', 'public/logo.png');
fs.copyFileSync('C:/Users/supar/.gemini/antigravity/brain/c4e34718-af12-42d8-8725-dbc58b1b8e12/sudoku_mascot_1776398159555.png', 'public/mascot.png');

console.log("Assets copied successfully to public folder!");
