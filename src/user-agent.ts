import pkg from '../package.json';

export default `${pkg.name} v${pkg.version} via Node.js ${process.version} on ${
  process.platform
}`;
