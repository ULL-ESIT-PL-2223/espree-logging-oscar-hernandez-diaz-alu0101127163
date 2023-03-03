import * as escodegen from "escodegen";
import * as espree from "espree";
import * as estraverse from "estraverse";
import * as fs from "fs/promises";
import * as esprima from "esprima";


/**
 * @desc Read the file with the js program, calls addLogin to add the login messages and writes the output
 * @param {string} input_file - The name of the input file
 * @param {string} output_file - The name of the output file
 */
export async function transpile(input_file, output_file) {
  try {
     let program = await fs.readFile(input_file, 'utf8');
     let output = addLogging(program);
     if (output_file === undefined) {
      console.log(output);
      return;
     }
     await fs.writeFile(output_file, output);
   }
   catch (err) {
     console.log(err);
   }
}

/** 
 * Builds the AST and
 * Traverses it searching for function nodes and callas addBeforeNode to transform the AST
 * @param {string} code -the source code 
 * @returns -- The transformed AST 
 */
export function addLogging(code) {
  const ast = esprima.parse(code, { ecmaVersion: esprima.latestEcmaVersion, loc: true });
  estraverse.traverse(ast, {
    enter: function (node, parent) {
      if (node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression') {
        addBeforeCode(node);
      }
    }
  });
  return escodegen.generate(ast);
}

/**
 * AST transformation
 * @param {AST} node 
 */
export function addBeforeCode(node) {
  const name = node.id ? node.id.name : '<anonymous function>';
  const parameters = node.params.map(param => `\$\{${param.name}\}`);
  const beforeCode = `console.log(\`Entering ${name}(${parameters}) at line ${node.loc.start.line}\`);`;
  const beforeNodes = espree.parse(beforeCode, { ecmaVersion: 6 }).body;
  node.body.body = beforeNodes.concat(node.body.body);
}