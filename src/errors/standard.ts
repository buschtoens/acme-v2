import ACMEError from './acme';

export default class StandardError extends ACMEError {
  static type = null;
  static description = 'A standardized error that is defined in the ACME reference RFC';
}
