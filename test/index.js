const vm = require('vm');
const rollup = require('rollup');
const nodePolyfills = require('..');
const os = require('os');
const constants = require('constants');
const assert = require('assert')
const debug = require('debug')('builtins:test');
const files = [
  'events.js',
  'crypto.js',
  'url-parse.js',
  'url-file-url-to-path.js',
  'url-format.js',
  'stream.js',
  'assert.js',
  'constants.js',
  'os.js',
  'path.js',
  'string-decoder.js',
  'zlib.js',
  'domain.js',
];

const runCode = (code, done) => {
  const script = new vm.Script(code);
  const context = vm.createContext({
    done: done,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    console: console,
    _constants: constants,
    _osEndianness: os.endianness()
  });
  context.self = context;

  return script.runInContext(context);
}

describe('rollup-plugin-node-polyfills', function() {
  
  this.timeout(5000);

  files.forEach((file) => {
    it('works with ' + file, function (done) {
      rollup.rollup({
        input: 'test/examples/' + file,
        plugins: [
          nodePolyfills({
            include: null,
            onPolyfill: function (module) {
              return true;
            }
          })
        ]
      })
      .then(bundle => bundle.generate({format: 'cjs'}))
      .then(generated => {
        const code = generated.output[0].code;
        debug(code);
        return runCode(code, done);
      })
      .catch(done)
    });
  })

  it('crypto option works (though is broken)', function(done) {
    rollup.rollup({
      input: 'test/examples/crypto-broken.js',
      plugins: [
        nodePolyfills({
          include: null,
          // this flag has no effect
          crypto: true
        })
      ]
    }).then(function() {
      done(new Error ('should not get here'))
    }, function (err) {
      if (err.message === `"diffieHellman" is not exported by "\u0000polyfill-node.crypto.js", imported by "test/examples/crypto-broken.js".`) {
        done();
        return;
      }
      done(err)
    });
  });

  it('can exclude a polyfill', function(done) {
    rollup.rollup({
      input: 'test/examples/filter.js',
      plugins: [
        nodePolyfills({
          include: null,
          onPolyfill: function (module, implementation) {
            if (module === 'util') {
              // exclude the util module
              return false
            }
            return true;
          }
        })
      ]
    }).then(bundle => bundle.generate({format: 'esm'}))
    .then(generated => {
      if (generated.output[0].imports.includes('util')) {
        done();
      } else {
        done(new Error('util module was not excluded'));
      }
    }).catch(done);
  });

  it('can replace a polyfill', function(done) {
    rollup.rollup({
      input: 'test/examples/alt-assert.js',
      plugins: [
        nodePolyfills({
          include: null,
          onPolyfill: function (module, implementation) {
            if (module === 'assert') {
              assert(implementation !== undefined, 'assert implementation should be defined')
              // replace the assert module with a custom one
              // must be a properly formatted as cjs formatted code

              // use a partial mock implementation of assert
              return `
              function assert(value, message) {
                // custom assert implementation, upper-cases the message
                // call the 'callback' below with the upper-cased message
                if (!value) done(message.toUpperCase());
              }
              export default assert;
              `;
            }
            return true;
          }
        })
      ]
    }).then(bundle => bundle.generate({format: 'cjs'}))
    .then(generated => {
      const code = generated.output[0].code;

      const callback = (assertMsg) => {
        assert.equal(assertMsg, 'CUSTOM POLYFILL ASSERT SHOULD BE INVOKED, AS CAPITALIZED MESSAGE')
        done()
      }
      return runCode(code, callback);
    }).catch(done);
  });

  it('can note an empty polyfill implementation', function(done) {
    rollup.rollup({
      input: 'test/examples/crypto.js',
      plugins: [
        nodePolyfills({
          include: null,
          onPolyfill: function (module, implementation) {
            if (module === 'crypto') {
              // crypto currently is a no-op polyfill, with an empty implementation
              assert(implementation === undefined, 'crypto implementation should be undefined')
            }
            return true;
          }
        })
      ]
    }).then(bundle => bundle.generate({format: 'cjs'}))
    .then(generated => {
      const code = generated.output[0].code;
      return runCode(code, done);
    }).catch(done);
  });

})
