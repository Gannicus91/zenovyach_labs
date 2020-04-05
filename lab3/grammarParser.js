const SEP = '->';
const EMPT = '~';

class GrammarParser{
  /**
   * @param {Array} axioms - массив аксиом 
   */
  constructor(axioms){
    this.axioms = {}
    // генерируем из строк-аксиом массив пар [нетерминал, его порождение], далее для проходим по этому массиву и создаем 
    // объект {нетерминал: массив его порождений}
    axioms.map(item => [item.split(SEP)[0].trim(), item.split(SEP)[1].trim().replace(' ', '')]).forEach(item => {
      this.axioms[item[0]] ? this.axioms[item[0]].push(item[1]) : this.axioms[item[0]] = [item[1]];
    })

    this.nonTerminals = Object.keys(this.axioms);

    const SPAWNS = axioms.map(item => item.split(SEP)[1].trim());

    // ищем порождение длины 3, в котором в середине находится нетерминал, а слева и справа от него - терминалы
    // эти терминалы будут обозначать скобки в нашей грамматике
    const bracketSpawn = SPAWNS
      .find(item => 
        item.length === 3 &&
        !this.nonTerminals.includes(item[0]) && 
        this.nonTerminals.includes(item[1]) && 
        !this.nonTerminals.includes(item[2]));        
    this.brackets = [bracketSpawn[0], bracketSpawn[2]];
    
    // ищем порождения длины 3, в которых в середине находится терминал, а слева и спарва - нетерминалы
    // это бинарные операторы в нашей грамматике
    this.biOperators = SPAWNS
      .reduce((prevVal, item) => {
        item.length === 3 && !this.nonTerminals.includes(item[1]) 
          ? prevVal.push(item[1])
          : prevVal;
        return prevVal;
      }, []);

    // ищем порождение длины 2, в котором первый символ - не цифра
    // это унарный оператор в нашей грамматике
    this.unOperator = SPAWNS
      .find(item => 
        item.length === 2 &&
        isNaN(item[0]))[0];
    
    // генерируем иерархию нетерминалов
    this.hierarchy = [];
    for (let key in this.axioms){
      // получаем одиночные нетерминалы пораждаемые текущим просматриваемым нетерминалом
      let single = this.axioms[key].filter(item => this.nonTerminals.includes(item));
      // если такие существуют И текущий нетерминал и всего его порождения еще не включены в иерархию
      if (single.length && !(this.hierarchy.includes(key) && this.hierarchy.includes(...single))){
        // если текущий нетерминал уже есть в иерархии, то вставляем его порождения после него
        if (this.hierarchy.includes(key)){
          this.hierarchy.splice(this.hierarchy.indexOf(key) + 1, 0, ...single);
        // если порождения нетерминала есть в иерархии, то вставляем текущий перед порождением
        } else if (this.hierarchy.includes(...single)){
          this.hierarchy.splice(this.hierarchy.indexOf(...single), 0, key);
        // иначе добавляем нетереминал и его порождения в конец
        } else {
          this.hierarchy.push(key, ...single);
        }
      }
      // поиск нетерминала обозначающего переменную
      // каждое порождение должно быть одиночным символом, непустой строкой и терминальным символом 
      if(this.axioms[key].every(item => item.length === 1 && item !== EMPT && !this.nonTerminals.includes(item))){
        this.variables = key;
      }

      // поиск нетерминала обозначающего константу
      if(this.axioms[key].length === 1){
        this.constants = key;
      }
    }
  }

  /**
   * генерирует массив порождений, по которому получается заданное выражение
   * 
   * @param {String} expression - выражение
   * @returns {Array} - массив порождений, по  которому строится выражение
   */
  getSpawnChain(nonTerminal, expression) {
    if (!expression){
      return [nonTerminal, EMPT];
    }
  
    let spawnChain = [nonTerminal];
    let brackets = [];

    // если в выражении содержатся скобки
    if (~expression.indexOf(this.brackets[0])){
      // проходим по строке и получаем массив с индексами скобок. Каждый элемент массива - это пара индексов
      for (let i = 0; i < expression.length; i++){
        // если скобка открывающая кладем в массив первый элемент пары
        if (expression[i] === this.brackets[0]){
          brackets.push([i]);
        }
        // если скобка закрывающая, то ищем последнюю открывающую скобку, к которой еще не было закрывающей 
        // и дополняем пару индексом закрывающей скобки
        if (expression[i] === this.brackets[1]){
          brackets.reverse().find(item => item.length === 1).push(i);
          brackets.reverse();
        }
      }
      
      // избавляемся от вложенных скобок
      brackets = brackets.reduce((prevVal, item) => {
        // если индекс открывающей скобки больше, чем индекс закрывающей у последней добавленной пары, 
        // то оставляем пару
        // (если скобка вложенная, то индекс открывающей скобки бдует меньше)
        if (item[0] > prevVal[prevVal.length - 1][1]){
          prevVal.push(item);
        }
        return prevVal;
      }, [brackets[0]]);
    }

    // получаем список операторов присутствующих в выражении
    // при этом игнорируются операторы, находящиеся внутри скобок
    let operatorsInExpr = [...this.biOperators, ...this.unOperator].filter(item => {
      // проходим по строке
      for (let i = 0; i < expression.length; i++){
        // ищем пару скобок на которой сейчас находится итеротор цикла
        let bracket_block = brackets.find(item => item[0] === i);
        // если нашли
        if (bracket_block){
          // перескакиваем к концу блока
          i = bracket_block[1];
        }
        // если символ совапдает с оператором
        if (expression[i] === item){
          return true;
        }
      }
    });

    // если в выражении нет операторов
    if (!operatorsInExpr.length){
      switch (nonTerminal){
        case this.variables: // нетерминал - переменная
        case this.constants: // нетерминал - константся
          spawnChain.push(expression);
          break;
        case this.hierarchy[3]: // нетерминал - множитель
          // если выражение - одно из порождений нетерминала переменных
          if (this.axioms[this.variables].includes(expression)){
            spawnChain.push(...this.getSpawnChain(this.variables, expression));
          // если выражение начинается со скобки
          } else if (expression[0] === this.brackets[0]){
            spawnChain.push(...this.getSpawnChain(this.hierarchy[1], expression.slice(1, -1)).map(item => this.brackets[0] + item + this.brackets[1]));
          // иначе - константа
          } else {
            spawnChain.push(...this.getSpawnChain(this.constants, expression));
          }
          break;
        default: // по умолчанию переходим вниз по иерархии нетерминалов
          spawnChain.push(...this._toDeepLevel(nonTerminal, expression));
      }
    } else { // если в выражении есть операторы
      switch (nonTerminal){
        case this.hierarchy[0]: // стартовый нетерминал
          spawnChain.push(...this._toDeepLevel(nonTerminal, expression));
          break;
        case this.hierarchy[1]: // выражение 
        case this.hierarchy[2]: // одночлен
          // получаем массив порождений, доступных из текущего нетерминала, с учетом присутствующих в выражении операторов
          let spawns = this.axioms[nonTerminal].filter(item => operatorsInExpr.includes(item[1]));

          // если есть доступные порождения
          if (spawns.length){
            let op_i = -1;
            let new_i = -1;
            // ищем индекс последнего оператора, игнорируя скобки
            spawns.forEach(item => {
              for (let i = 0; i < expression.length; i++){
                let bracket_block = brackets.find(item => item[0] === i);
                if (bracket_block){
                  i = bracket_block[1];
                }
                if (expression[i] === item[1]){
                  new_i = i;
                }
              }
              op_i = new_i > op_i ? new_i : op_i;
            });
            // если оператор - первый символ выражения, то он унарный
            // спускаемся на уровень ниже
            if (op_i === 0){
              spawnChain.push(...this._toDeepLevel(nonTerminal, expression));
            } else {
              let operator = expression[op_i];
              // ищем нужное порождение
              let spawn = spawns.find(item => item[1] === operator);
              // получаем цепочку порождений для выражения до оператора из левого нетерминала 
              // и конкатенируем каждый рузультат с оператором и оставшимся правым нетерминалом
              // также получаем цепочку порождений для выражения после оператора из правого нетерминала
              // и конкатенируем каждый результат с выражением до оператора и оператором
              spawnChain.push(...this.getSpawnChain(spawn[0], expression.slice(0, op_i)).map(item => item + operator + spawn[2]),
                ...this.getSpawnChain(spawn[2], expression.slice(op_i+1)).slice(1).map(item => expression.slice(0, op_i) + operator + item));
            }
          } else {
            // если доступных порождений нет, спускаемся вниз по иерархии
            spawnChain.push(...this._toDeepLevel(nonTerminal, expression));
          }
          break;
        case this.hierarchy[3]: // множитель
          // если первый символ - унарный оператор
          if (expression[0] === this.unOperator){
            // получаем цепочку для выражения без унарного оператора и добавляем унарный оператор к каждому элементу цепочки
            spawnChain.push(...this.getSpawnChain(nonTerminal, expression.slice(1)).map(item => this.unOperator + item));
          } 
          break;
      }
    }
    return spawnChain;
  }

  /**
   * Функция проксирует вычисление цепочки порождений для нетерминала и выражения
   * на уровень ниже
   * @param {String} nonTerminal - нетерминальный символ
   * @param {String} expression - выражение
   * @returns {Array} - массив порождений
   * 
   * @example:
   * пусть S - стартовый нетерминальный символ и есть правило S -> E
   *  this._toDeepLevel('S', '<какое-то выражение>'); - передаст вычисление цепочки порождений 
   *  того же выражения, функции getSpawnChain, однако уже с нетерминалом E
   */
  _toDeepLevel(nonTerminal, expression){
    return this.getSpawnChain(this.hierarchy[this.hierarchy.indexOf(nonTerminal) + 1], expression)
  }
}

module.exports = GrammarParser;