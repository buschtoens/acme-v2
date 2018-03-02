import util from 'util';

/**
 * @see https://github.com/nodejs/node/blob/be2cbccf003d110cad00317090072788021efa56/lib/util.js#L238-L263
 */
let debugEnvRegex = /^$/;
if (process.env.NODE_DEBUG) {
  let debugEnv = process.env.NODE_DEBUG;
  debugEnv = debugEnv
    .replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/,/g, '$|^')
    .toUpperCase();
  debugEnvRegex = new RegExp(`^${debugEnv}$`, 'i');
}

/**
 * The debug section ID for this project.
 * @type {string}
 */
export const SECTION = 'acme';

/**
 * Whether or not the debug mode is enabled.
 * @type {boolean}
 */
export const IS_DEBUG = debugEnvRegex.test(process.env.NODE_DEBUG);

/**
 * The debug logging function.
 * @type {function}
 */
export default util.debuglog(SECTION);
