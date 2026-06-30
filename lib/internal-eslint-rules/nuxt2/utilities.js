/**
 * Shared utilities for internal Nuxt ESLint rules.
 * Ported from eslint-plugin-nuxt (https://github.com/nuxt/eslint-plugin-nuxt).
 */

import { createRequire } from 'module';

// createRequire is needed here to load the CJS internal utils from eslint-plugin-vue.

const vueUtilities = createRequire(import.meta.url)('eslint-plugin-vue/dist/utils/index.js').default;
const { getStaticPropertyName } = vueUtilities;

export const executeOnVue = vueUtilities.executeOnVue.bind(vueUtilities);
export const executeOnVueComponent = vueUtilities.executeOnVueComponent.bind(vueUtilities);

/**
 * Finds the first property with the given name on the object expression node that matches the condition.
 * @param {Readonly<object>} node - The object expression node.
 * @param {string} name - The property name to find.
 * @param {(p: object) => boolean} condition - Predicate the property must satisfy.
 * @returns {object | undefined} The matching property node, if any.
 */
export function getProperty(node, name, condition) {
  return node.properties.find(
    (p) => p.type === 'Property' && name === getStaticPropertyName(p) && condition(p),
  );
}

/**
 * Finds the property with the given name whose value is a function expression.
 * @param {Readonly<object>} rootNode - The object expression node.
 * @param {string} name - The property name to find.
 * @returns {object | undefined} The matching property node, if any.
 */
export function getFunctionWithName(rootNode, name) {
  return getProperty(
    rootNode,
    name,
    (item) => item.value.type === 'ArrowFunctionExpression' || item.value.type === 'FunctionExpression',
  );
}

/**
 * Returns true if the child node is located inside the function node.
 * @param {Readonly<object>} function_ - The function property node.
 * @param {Readonly<object>} child - The node to check.
 * @returns {boolean} Whether the child is inside the function.
 */
export function isInFunction(function_, child) {
  return (
    function_.value.type === 'FunctionExpression'
    && child != null
    && child.loc.start.line >= function_.value.loc.start.line
    && child.loc.end.line <= function_.value.loc.end.line
  );
}

/**
 * Yields all child nodes that appear inside any of the named functions on the object expression.
 * @param {Readonly<object>} rootNode - The object expression node.
 * @param {ReadonlySet<string>} functionNames - The set of function names to search within.
 * @param {readonly {name: string, node: object}[]} childNodes - The child nodes to look for.
 * @yields {{name: string, node: object, func: object, funcName: string}} Each matching child.
 */
export function* getFunctionWithChild(rootNode, functionNames, childNodes) {
  const functionNodes = rootNode.properties.filter(
    (p) => p.type === 'Property' && (functionNames.size === 0 || functionNames.has(getStaticPropertyName(p))),
  );

  for (const function_ of functionNodes) {
    const functionName = getStaticPropertyName(function_);
    if (!functionName) {
      continue;
    }

    for (const { name, node: child } of childNodes) {
      if (isInFunction(function_, child)) {
        yield { name, node: child, func: function_, funcName: functionName };
      }
    }
  }
}

/**
 * Gets the first and last tokens of a node, expanding outward through any wrapping parentheses.
 * @param {Readonly<object>} sourceCode - The ESLint source code object.
 * @param {Readonly<object>} node - The node whose tokens to retrieve.
 * @returns {{first: object, last: object}} The outermost first and last tokens.
 */
export function getFirstAndLastTokens(sourceCode, node) {
  let first = sourceCode.getFirstToken(node);
  let last = sourceCode.getLastToken(node);

  while (true) {
    const previous = sourceCode.getTokenBefore(first);
    const next = sourceCode.getTokenAfter(last);
    if (previous?.type === 'Punctuator' && previous.value === '(' && next?.type === 'Punctuator' && next.value === ')') {
      first = previous;
      last = next;
    }
    else {
      return { first, last };
    }
  }
}
