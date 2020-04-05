const GrammarParser = require('../grammarParser');
const assert = require('assert');
const fs = require("fs");

const axiomsFile = fs.readFileSync('axioms.txt', 'utf8');
const STRINGS = axiomsFile.split('\n');
const PARSER = new GrammarParser(STRINGS);

describe('Spawn chain for an expression', () => {
  it('Empty expr test', () => {
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], ''), ['S', '~']);
  });

  it('Single constant', () => {
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '2'), ['S', 'E', 'T', 'F', 'C', '2']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '533'), ['S', 'E', 'T', 'F', 'C', '533']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '10'), ['S', 'E', 'T', 'F', 'C', '10']);
  });

  it('Single variable', () => {
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], 'x'), ['S', 'E', 'T', 'F', 'V', 'x']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], 'y'), ['S', 'E', 'T', 'F', 'V', 'y']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], 'z'), ['S', 'E', 'T', 'F', 'V', 'z']);
  });

  it('Unar operator', () => {
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '-2'), ['S', 'E', 'T', 'F', '-F', '-C', '-2']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '-x'), ['S', 'E', 'T', 'F', '-F', '-V', '-x']);
  });
  
  it('Expressions without brackets', () => {
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '2+2'), ['S', 'E', 'E+T', 'T+T', 'F+T', 'C+T', '2+T', '2+F', '2+C', '2+2']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '2-2'), ['S', 'E', 'E-T', 'T-T', 'F-T', 'C-T', '2-T', '2-F', '2-C', '2-2']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '2+x-2'), ['S', 'E', 'E-T', 'E+T-T', 'T+T-T', 'F+T-T', 'C+T-T', '2+T-T', '2+F-T', '2+V-T', '2+x-T', '2+x-F', '2+x-C', '2+x-2']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '2*2'), ['S', 'E', 'T', 'T*F', 'F*F', 'C*F', '2*F', '2*C', '2*2']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '2/2'), ['S', 'E', 'T', 'T/F', 'F/F', 'C/F', '2/F', '2/C', '2/2']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '-2/2'), ['S', 'E', 'T', 'T/F', 'F/F', '-F/F', '-C/F', '-2/F', '-2/C', '-2/2']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '-2+2'), ['S', 'E', 'E+T', 'T+T', 'F+T', '-F+T', '-C+T', '-2+T', '-2+F', '-2+C', '-2+2']);
  });

  it('Expressions with brackets', () => {
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '(2)'), ['S', 'E', 'T', 'F', '(E)', '(T)', '(F)', '(C)', '(2)']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '(-2)'), ['S', 'E', 'T', 'F', '(E)', '(T)', '(F)', '(-F)', '(-C)', '(-2)']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '(2+2)'), ['S', 'E', 'T', 'F', '(E)', '(E+T)', '(T+T)', '(F+T)', '(C+T)', '(2+T)', '(2+F)', '(2+C)', '(2+2)' ]);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '(2+2)+(x+y)'), ['S', 'E', 'E+T', 'T+T', 'F+T', '(E)+T', '(E+T)+T', '(T+T)+T', '(F+T)+T', '(C+T)+T', '(2+T)+T', '(2+F)+T', '(2+C)+T', '(2+2)+T', '(2+2)+F', '(2+2)+(E)', '(2+2)+(E+T)', '(2+2)+(T+T)', '(2+2)+(F+T)', '(2+2)+(V+T)', '(2+2)+(x+T)', '(2+2)+(x+F)', '(2+2)+(x+V)', '(2+2)+(x+y)']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '(2+2+(7+2))'), ['S', 'E', 'T', 'F', '(E)', '(E+T)', '(E+T+T)', '(T+T+T)', '(F+T+T)', '(C+T+T)', '(2+T+T)', '(2+F+T)', '(2+C+T)', '(2+2+T)', '(2+2+F)', '(2+2+(E))', '(2+2+(E+T))', '(2+2+(T+T))', '(2+2+(F+T))', '(2+2+(C+T))', '(2+2+(7+T))', '(2+2+(7+F))', '(2+2+(7+C))', '(2+2+(7+2))']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '(-2)/2'), ['S', 'E', 'T', 'T/F', 'F/F', '(E)/F', '(T)/F', '(F)/F', '(-F)/F', '(-C)/F', '(-2)/F', '(-2)/C', '(-2)/2']);
    assert.deepEqual(PARSER.getSpawnChain(PARSER.hierarchy[0], '((((2+2))))'), ['S', 'E', 'T', 'F', '(E)', '(T)', '(F)', '((E))', '((T))', '((F))', '(((E)))', '(((T)))', '(((F)))', '((((E))))', '((((E+T))))', '((((T+T))))', '((((F+T))))', '((((C+T))))', '((((2+T))))', '((((2+F))))', '((((2+C))))', '((((2+2))))']);
  });
});