/**
 * Decorates a getter method so that it is only evaluated once. The return value is cached.
 */
export default function memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalGetter = descriptor.get;

  if (!originalGetter) {
    throw new TypeError(`@memoize could not decorate ${propertyKey} on ${target.constructor.name}, since the was no getter method.`);
  }

  descriptor.get = function() {
    const value = originalGetter.call(this);
  
    Object.defineProperty(target, propertyKey, {
      ...Object.getOwnPropertyDescriptor(target, propertyKey),
      get() {
        return value;
      }
    });
  
    return value;
  }
}