// CLEAR SCOPE WHEN EVAL IS CALLED FIRST TIME
// ERROR INTERRUPTING MY ERROR
// CLEAN UP CALLS

// Access functions & scope

// var scopeNum = 0; // to not have to subtract 1 everywhere, tho is this just going to eq assignment.thisScope?

var specialForms = {
  'if': function (args) { 
    if (evaluate(args[0])){
      return evaluate(args[1]);
    } else {
      return evaluate(args[2]);
    }
  }

  ,
  'let': function (args){ 
    var flatArgs = _.flatten(args);
    return assignment(flatArgs[0], flatArgs.slice(1));
  },

  'assignment': assignment,

  'var': lookup
};

// var scopes = { 

//   'built-in': {
//     '+': infix,
//     '-': infix,
//     '*': infix,
//     '<': infix,
//     '>': infix,

//     '=': function (operator, args) {
//       var args = moveOverArgs([], args);
//       return eval(args.join('==='));
//     },
    
//     'print': function (operator, args) {
//       var args = moveOverArgs([], args);
//       return args.join('');
//     }

//   },

//   'user': [ ] // user-defined scopes
// }; 

var builtIn = {
    '+': infix,
    '-': infix,
    '*': infix,
    '<': infix,
    '>': infix,

    '=': function (operator, args) {
      var args = moveOverArgs([], args);
      return eval(args.join('==='));
    },
    
    'print': function (operator, args, scope) {
      var args = moveOverArgs([], args, scope);
      return args.join('');
    }

  }

var scopes = [ builtIn ];

// Utility functions

function moveOverArgs(currentArr, arr, scope) {

  // in here have to indicate in eval call that it is in a scope if called from assignment?
  // alternately check in eval itself?

  typeof arr[0] === 'object' ? currentArr.push(evaluate(arr[0], scope)) : currentArr.push(arr[0]);
  
  var remainingArr = arr.slice(1);
  if (remainingArr.length > 0) { 
    return moveOverArgs(currentArr, remainingArr, scope);
  } else {
    return currentArr;
  }
}


function infix (operator, args) {
  args = moveOverArgs([], args);
  return eval(args.join(operator));
}

function assignment (assign, rest, scoped) {

    // how to rewrite so that scope increments for new things & then is passed into move over args/lookup
    // scopes.length?

    // increment scope number since we are now in the base user scope

    // scopeNum++
    // console.log('scopeNum:', scopeNum);

    // the first expression following 'let' MUST be a binding

    var variable = assign.expressions[0].expressions,
        value = assign.expressions[1];
        // userScope = scopes['user'],
        // thisScope = userScope[scopeNum]; 

    // put identity in current scope or create new scope and add

    if (scoped) {
      scopes[scopes.length - 1][variable] = value;
      console.log('scopes arr:', scopes);
    } else { 
      scopes.push(Object.create(Object.prototype));
      scopes[scopes.length - 1][variable] = value;
      console.log('scopes arr:', scopes);
    }
      
    // iterate through all assignments before then evaluate other expressions

    if(rest.length && rest[0].operator === 'assignment'){
      return specialForms.assignment(rest[0], rest.slice(1), true);
    } else {
      return moveOverArgs([], rest, scopes.length - 1); // how do I pass scope here for correct evaluation?
    }
}

function lookup(args, scope){

  var scope = scope;  

  var res = (function checkScope(check){
    if (check >= 0){
      if (scopes[scope][args]){
        return scopes[scope][args];
      } else {
        return checkScope(scope--);
      }
    } else {
    return 'Reference error. There is no variable ' + args + '. '
    }
  })(scope);

  return res;
}

// Evaluation

var evaluate = function(ast, scope) {

  // Check first that on recursion we haven't just received a scalar value that can be returned

  if(!(ast && typeof ast === 'object')) {
    return ast;
  }

  // Then set scope & evaluate
  // Note that when the var operator is used, special will be called before func, assuring that it is found

  var scope, special, func;

  // (scopeNum > -1) ?
  //   (scope = 'user'[scopeNum]) :
  //   (scope = 'built-in');

  scope = scope || 0;
  special = specialForms[ast.operator];
  // func = scopes[scope][ast.operator];

  console.log(ast, ast.operator, scope);

  if (special) {
    return special(ast.expressions, scope);
  } else {
    return lookup(ast.operator, scope)(ast.operator, ast.expressions, scope);  // does this have to change to lookup, so it can go up the chain?
  } 

  // else {
  //   return "Reference error: " + ast.operator + " is not defined."
  // }

};

// Run function

var run = function(source) {
  var ast = PLT.parser.parse(source);
  return evaluate(ast);
};