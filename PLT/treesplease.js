var dict = {
  '+': infix,
  '-': infix,
  '*': infix,
  '<': infix,
  '>': infix,
  '=': comparison,
  'print': print,
  'if': conditional,
  'let': let,
  'assignment': assignment
};

var vars = { }; // to hold any vars declared with let

function moveOverArgs(currentArr, arr) {
  typeof arr[0] === 'object' ? currentArr.push(evaluate(arr[0])) : currentArr.push(arr[0]);
  
  var remainingArr = arr.slice(1);
  if (remainingArr.length > 0) { 
    return moveOverArgs(currentArr, remainingArr);
  } else {
    return currentArr;
  }
}

function moveOverAssignment(currentArr, arr){

  var expression = arr[0];
  expression = replaceVars(expression, Object.keys(vars));
  currentArr.push(evaluate(PLT.parser.parse(expression)));

  var remainingArr = arr.slice(1);
  if (remainingArr.length > 0){
    return moveOverAssignment(currentArr, remainingArr);
  } else {
    return currentArr.join(", ");
  }
}

function replaceVars(expression, keys){

  var key = keys[0];
  expression = expression.replace(key, '"' + vars[key] + '"');

  var remainingKeys = keys.slice(1);
  if (remainingKeys.length > 0){
    return replaceVars(expression, remainingKeys);
  } else {
    return expression;
  }
}

function unpackAssignment(assignmentArr){
  for (var i=0; i < assignmentArr.length; i++){
    assignment(assignmentArr[i].left, assignmentArr[i].right);
  }
  return true;
}

function infix(operator, args) {
  args = moveOverArgs([], args);
  return eval(args.join(operator));
};

function comparison(operator, args) {
  args = moveOverArgs([], args);
  return eval(args.join('==='));
};

function print(operator, args) {
  return ''+ args.slice(0, -1); // remove comma
};

function conditional(operator, args) { 
  if (args[0]){
    return evaluate(args[1]);
  } else {
    return evaluate(args[2]);
  }
}

function let(operator, args) {
  return moveOverAssignment([], args.slice(1)); // first arg from let returns true 
}

function assignment(a, b) {
  vars[a] = b;
}

var evaluate = function(ast) {

  var unpacked = (function unpack(left, right) {

    left instanceof Array && (left = unpackAssignment(left));
    typeof left === 'object' && (left = evaluate(left));
    
    var args = [];
    args.push(left);
    return args.concat(right);

  })(ast.left, ast.right);

  return dict[ast.operator](ast.operator, unpacked);

};

 /*
 * run code
 * this takes as input a javascript string representing code in your laguage,
 * parses it using the grammar you provided to the PLT framework, then acts
 * on it using the functions above. 
 */

var run = function(source) {
  var ast = PLT.parser.parse(source);
  return evaluate(ast);
};

// connect the REPL prompt in the browser to your language's run function
// PLT.repl = run;