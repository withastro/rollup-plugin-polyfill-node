
export type OnPolyfill = (module: string, implementation: string | undefined) => boolean | string

export const createHasModule = (modules: Map<string, string>, polyfills: Record<string, string>, onPolyfill: OnPolyfill | undefined ) => {
  if (onPolyfill === undefined) {
    return (module: string) => modules.has(module)
  }
  
  const cachedResult = new Map<string, boolean>();
  return (module: string) => {
    const emptyPath = polyfills['empty.js'];

    if (modules.has(module)) {
      // some special cases, matching injected modules and underscored modules 
      // are likely to need to be implemented as part of a previously added polyfill
      if (module === 'buffer' || module === 'process' || module ==='global' || module.startsWith("_")) {
        return true;
      }

      const implementation = modules.get(module);

      // call the callback only once per module
      if (cachedResult.has(module)) {
        return cachedResult.get(module)!;
      } else {
        let result = onPolyfill(module, implementation === emptyPath ? undefined : implementation);
        
        if (result === undefined || result === false) {
          cachedResult.set(module, false);
          return false;
        } else if (typeof result === 'string') {
          // callback wants to replace the polyfill with a different implementation
          if (result === '') {
            modules.set(module, emptyPath);
          } else {
            modules.set(module, result);
          }
          result = true
        }

        cachedResult.set(module, result);
        return result;
      }
    }
  }
};