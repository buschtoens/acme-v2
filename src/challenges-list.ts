import Challenge from './challenge';

/**
 * @external {Iterator} https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator
 */

/**
 * An `ChallengesList` is an {@link Iterator} that yields all {@link Challenge}s
 *   belonging to an {@link Authorization}.
 */
export default class ChallengesList {
  /**
   * The order this instance is associated with.
   * @type {Authorization}
   */
  authorization;

  /**
   * The challenges that were sent inline by the server.
   * @type {Object[]}
   */
  inlineData = [];

  /**
   * @param {Authorization} authorization
   */
  constructor(authorization) {
    this.authorization = authorization;
  }

  /**
   * Loads all challenges of this ChallengesList.
   * @yields {Challenge}
   */
  *[Symbol.iterator]() {
    for (const challengeData of this.inlineData) {
      yield new Challenge(this.authorization, challengeData);
    }
  }
}
