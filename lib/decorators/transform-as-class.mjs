// HACK / TODO: replace this shit show once spec compliant decorators land
// https://github.com/babel/babel/pull/6107

const instanceMap = new WeakMap();

export default (WrapperClass, field = 'url') => (target, key, descriptor) => {
  delete descriptor.value;
  delete descriptor.writable;
  delete descriptor.initializer;

  descriptor.get = function wrappedGetter() {
    if (instanceMap.has(this)) {
      const instance = instanceMap.get(this);
      if (instance.has(key)) {
        return instance.get(key);
      }
      const wrapped = new WrapperClass(this);
      instance.set(key, wrapped);
      return wrapped;
    }
    const wrapped = new WrapperClass(this);
    instanceMap.set(this, new Map([[key, wrapped]]));
    return wrapped;
  };

  descriptor.set = function wrappedSetter(value) {
    this[key][field] = value;
  };
};
