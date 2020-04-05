const GrammarParser = require('./grammarParser');
const fs = require("fs");

const axiomsFile = fs.readFileSync('axioms.txt', 'utf8');
const EXPRESSION = fs.readFileSync('test.txt', 'utf8');

const STRINGS = axiomsFile.split('\n');

const PARSER = new GrammarParser(STRINGS);

console.log(PARSER.getSpawnChain(PARSER.hierarchy[0], EXPRESSION));