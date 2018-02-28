export default class Challenge {
  constructor(authorization, data) {
    this.authorization = authorization;
    Object.assign(this, data);
  }
}
