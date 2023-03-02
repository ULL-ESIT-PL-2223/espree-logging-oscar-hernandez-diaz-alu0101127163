# [Práctica Espree Logging](https://ull-esit-gradoii-pl.github.io/practicas/esprima-logging)

### Procesadores de lenguajes 2021-2022

#### Óscar Hernández Díaz alu0101127163

## Resumen de lo aprendido

En esta práctica hemos aprendido diferentes herramientas para el  de como funciona un compilador, entre ellos la construcción un árbol AST mediante la herramienta [Esprima](https://esprima.org/). También hemos aprendido ha usar la herramienta [Estraverse](https://github.com/estools/estraverse), donde nos facilita la búsqueda dentro del árlbol AST para hallar aquellos nodos que nos interesasn ej. `FunctionDeclaration`. Por último, hemos podido usar la herramienta [Escodegen](https://github.com/estools/escodegen), la cúal usamos para poder generar de nuevo el código de js a través del árbol AST.

## Indicar los valores de los argumentos

Se ha modificado el código de `logging-espree.js` para que el log también indique los valores de los argumentos que se pasaron a la función. 
Ejemplo:

```javascript
function foo(a, b) {
  var x = 'blah';
  var y = (function (z) {
    return z+3;
  })(2);
}
foo(1, 'wut', 3);
```

```javascript
function foo(a, b) {
    console.log(`Entering foo(${ a }, ${ b })`);
    var x = 'blah';
    var y = function (z) {
        console.log(`Entering <anonymous function>(${ z })`);
        return z + 3;
    }(2);
}
foo(1, 'wut', 3);
```

## CLI con [Commander.js](https://www.npmjs.com/package/commander)

Para usar `commander` debemos deponer el siguiente código en nuestro programa: 

```js
program
  .version(version)
  .description(description)
  .usage('[options] <filename> [...]')
  .option('-o, --output <filename>', 'establecer el fichero de salida del resultado del programa');

program.parse(process.argv);
```

Esto lo que hará, por ejemplo, si le pasamos la opción `-V`, nos mostrará la versión de nuestro programa, la cual está guardada en nuestro `package.json`. También podemos pasarle la opción `-h` y nos mostrará la guía de uso.

## Reto 1: Soportar funciones flecha


Para poder considerar las funciones flecha en nuestro programa, simplemente tenemos que añadirle el nombre del nodo al que le corresponde, en este caso sería `ArrowFunctionExpression`, con esto ya podemos evaluar las funciones flecha y trabajar con este nodo.

```javascript
function addLogging(code) {
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
```

## Reto 2: Añadir el número de línea

En este caso, para añadir el número de líneas y tabajar con estas, debemos primerp decirle a la herramienta `esprima` que queremos que nos incluya el número de línea donde se encuentra cada nodo, esto se hace añadiendo `loc: true` en el `parse` de `esprima`. 

```javascript
function addLogging(code) {
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
```

Por último, para incluilo en el `output` sencillamente añadimos en el `console.log` -> `${node.loc.start.line}`, y así nos añadirá en que linea se situa el nodo.

```javascript
function addBeforeCode(node) {
  const name = node.id ? node.id.name : '<anonymous function>';
  const parameters = node.params.map(param => `\$\{${param.name}\}`);
  const beforeCode = `console.log(\`Entering ${name}(${parameters}) at line ${node.loc.start.line}\`);`;
  const newbeforeCode = spacesAfterComas(beforeCode);
  const beforeNodes = espree.parse(newbeforeCode, { ecmaVersion: 6 }).body;
  node.body.body = beforeNodes.concat(node.body.body);
}
```

## Tests and Covering

Para realizar los test se hace uso de la herramienta [mocha](https://mochajs.org/). Ahora que ya tenemos los test de mocha podemos implementar covering/cubrimiento para poder testear si nuestro código y saber la calidad de este usando la herramienta [nyc](https://www.npmjs.com/package/nyc).
```
> espree-logging-solution@0.3.0 cov
> npx nyc --reporter=html --reporter=text --report-dir docs mocha



  Testing espree logging
    ✔ transpile(test1.js, logged1.js) (42ms)

  Testing espree logging
    ✔ transpile(test2.js, logged2.js)

  Testing espree logging
    ✔ transpile(test3.js, logged3.js)

  Testing espree logging
    ✔ transpile(test4.js, logged4.js)


  4 passing (87ms)

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |       0 |        0 |       0 |       0 |                   
----------|---------|----------|---------|---------|-------------------
```
Para mejor visuzalización podemos usar GitHub, activarlo en nuestro repositorio, crear una carpeta llamada `docs` y volcar el resultado en ella.

```sh
npx nyc --reporter=html --reporter=text --report-dir docs mocha
``` 

## References

* [espree-logging-template](https://github.com/ULL-ESIT-PL/espree-logging-template)
* [Tipos de nodo Ast](https://ull-esit-gradoii-pl.github.io/assets/temas/tema0-introduccion-a-pl/espree-visitorkeys)
* [Espree](https://github.com/eslint/espree)
* [Escodegen](https://github.com/estools/escodegen)
* [Estraverse](https://github.com/estools/estraverse/wiki/Usage)