const getMatches = require('../index');
const assert = require('assert');

describe('Matches to regExp', () => {
  it('should return []', () => {
    assert.deepEqual(getMatches('123456'), []);
    assert.deepEqual(getMatches('11abcbbbbbcbcbagghh4'), []);
  });
  
  it('should return an array of mathes', () => {        
    assert.deepEqual(getMatches('bcdbcd'), ['bcd', 'bcd']);
    assert.deepEqual(getMatches('bdbdbdbcdbdbc'), ['bdbdbd', 'bcdbd'] );
    assert.deepEqual(getMatches('abcabcdbdbcdbbbdbd'), ['bcdbd', 'bcd', 'bdbd']);
  });
});