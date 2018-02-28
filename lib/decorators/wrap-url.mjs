export default WrapperClass => (target, key, descriptor) => {
  descriptor.initializer = function initializer() {
    return new WrapperClass(this);
  };
  descriptor.set = url => {
    descriptor.value.url = url;
  };
};
