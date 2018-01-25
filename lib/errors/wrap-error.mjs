import got from 'got';
import * as acmeErrors from './acme-errors';

const { HTTPError } = got;

/**
 * Returns the correct ACMEError base class for the type string of an HTTPError.
 * @param {string} type
 * @return {ACMEError}
 */
export function getErrorClassForType(type) {
  return (
    Object.values(acmeErrors).find(ErrorClass => ErrorClass.type === type) ||
    acmeErrors.NonStandardError
  );
}

/**
 * Takes any instance of Error and tries to wrap it in an appropriate custom error class.
 * @param {Error} error
 * @return {Error}
 */
export default function wrapError(error) {
  if (error instanceof HTTPError) {
    if (error.response && error.response.body && error.response.body.type) {
      const ErrorClass = getErrorClassForType(error.response.body.type);
      const wrappedError = new ErrorClass(error);
      Error.captureStackTrace(wrappedError, wrapError);
      return wrappedError;
    }
    return error;
  }
  return error;
}
