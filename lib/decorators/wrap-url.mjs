export default WrapperClass => (target, descriptor) => {
  descriptor.value = new WrapperClass(target);
  descriptor.set = url => {
    console.log(url);
    value.url = url;
  };
  return descriptor;
};
