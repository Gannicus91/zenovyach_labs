const fs = require("fs");

const fileContent = fs.readFileSync('test.txt', 'utf8');

let result = getMatches(fileContent);

console.log(result);

function getMatches(string){
  const pattern = '(bc+d)*(bd)*'

  let accStr = '';
  let matches = {};
  let lastMatchId = 0;
  let lastJoinedCharId = 0;

  for (let i=0; i<string.length; i++){
    if (canMatch(accStr, string[i])){
      accStr += string[i];
      if (isMatch(accStr)){
        matches[lastMatchId] = accStr;
        lastJoinedCharId = i;
      }
    } else {
      lastMatchId++;
      if (accStr){
        accStr = '';
        i = lastJoinedCharId++;
      }
    }
  }

  return Object.values(matches);
}

function canMatch(accumulator, char) {
  let prevChar = accumulator[accumulator.length - 1] || '';
  switch (prevChar){
    case '':
      return char === 'b';
    case 'b':
      if (~accumulator.indexOf('d')){
        return char === 'd';
      }
      return char === 'c' || char === 'd';
    case 'c':
      return char === 'c' || char === 'd';
    case 'd':
      return char === 'b';
  }  
}

function isMatch(string){
  return string[string.length - 1] === 'd';
}

module.exports = getMatches;
