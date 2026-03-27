const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
    console.error('Usage: node clean_patch.js <input> <output>');
    process.exit(1);
}

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split(/\r?\n/);

const keepBlocks = [];
let currentBlock = [];
let includeCurrent = false;

for (const line of lines) {
    if (line.startsWith('diff --git')) {
        if (currentBlock.length > 0 && includeCurrent) {
            keepBlocks.push(...currentBlock);
        }
        currentBlock = [line];
        includeCurrent = false;

        const filePath = line.split(' ').pop().trim();
        if (filePath.includes('node_modules/react-native-floating-bubble/android/')) {
            const excluded = ['.project', '.settings/', '/build/', '/tmp/', '/outputs/', '.bin', '.class', '.dex', '.jar', '.flat'];
            if (excluded.some(x => filePath.includes(x))) {
                includeCurrent = false;
            } else {
                includeCurrent = true;
            }
        } else {
            includeCurrent = true;
        }
    } else {
        currentBlock.push(line);
    }
}

if (currentBlock.length > 0 && includeCurrent) {
    keepBlocks.push(...currentBlock);
}

fs.writeFileSync(outputFile, keepBlocks.join('\n') + '\n', 'utf8');
console.log(`Cleaned patch written to ${outputFile}`);
