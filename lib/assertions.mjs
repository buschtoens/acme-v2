import jose from 'node-jose';
import ACMEV2Client from './client';
import Account from './account';

const { JWK } = jose;

/**
 * Asserts that the provided object is an instance of {@link ACMEV2Client}.
 * @param {Object} acme
 * @throws {TypeError}
 */
export function assertIsACMEV2Client(acme) {
  if (!(acme instanceof ACMEV2Client))
    throw new TypeError(
      `Expected 'acme' to be an instance of 'ACMEV2Client'. Instead got: ${acme}`
    );
}

/**
 * Asserts that the provided object is an instance of jose.JWK.Key.
 * @param {Object} key
 * @throws {TypeError}
 */
export function assertIsKey(key) {
  if (!JWK.isKey(key))
    throw new TypeError(
      `Expected 'key' to be an instance of 'jose.JWK.Key'. Instead got: ${key}`
    );
}

/**
 * Asserts that the provided object is an instance of {@link Account}.
 * @param {Object} account
 * @throws {TypeError}
 */
export function assertIsAccount(account) {
  if (!(account instanceof Account))
    throw new TypeError(
      `Expected 'account' to be an instance of 'Account'. Instead got: ${account}`
    );
}
