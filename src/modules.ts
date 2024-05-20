import POLYFILLS from './polyfills';
export const EMPTY_PATH = POLYFILLS['empty.js'];

export function getModules() {
  const libs = new Map<string, string>();

  libs.set('process', POLYFILLS['process-es6.js']);
  libs.set('global', POLYFILLS['global.js']);
  libs.set('buffer', POLYFILLS['buffer-es6.js']);
  libs.set('util', POLYFILLS['util.js']);
  libs.set('sys', libs.get('util') as string);
  libs.set('events', POLYFILLS['events.js']);
  libs.set('stream', POLYFILLS['stream.js']);
  libs.set('path', POLYFILLS['path.js']);
  libs.set('querystring', POLYFILLS['querystring.js']);
  libs.set('punycode', POLYFILLS['punycode.js']);
  libs.set('url', POLYFILLS['url.js']);
  libs.set('string_decoder', POLYFILLS['string-decoder.js']);
  libs.set('http', POLYFILLS['http.js']);
  libs.set('https', POLYFILLS['http.js']);
  libs.set('os', POLYFILLS['os.js']);
  libs.set('assert', POLYFILLS['assert.js']);
  libs.set('constants', POLYFILLS['constants.js']);
  libs.set('_stream_duplex', POLYFILLS['__readable-stream/duplex.js']);
  libs.set('_stream_passthrough', POLYFILLS['__readable-stream/passthrough.js']);
  libs.set('_stream_readable', POLYFILLS['__readable-stream/readable.js']);
  libs.set('_stream_writable', POLYFILLS['__readable-stream/writable.js']);
  libs.set('_stream_transform', POLYFILLS['__readable-stream/transform.js']);
  libs.set('_inherits', POLYFILLS['inherits.js']);
  libs.set('_buffer_list', POLYFILLS['__readable-stream/buffer-list.js']);
  libs.set('timers', POLYFILLS['timers.js']);
  libs.set('console', POLYFILLS['console.js']);
  libs.set('vm', POLYFILLS['vm.js']);
  libs.set('zlib', POLYFILLS['zlib.js']);
  libs.set('tty', POLYFILLS['tty.js']);
  libs.set('domain', POLYFILLS['domain.js']);

  // TODO: Decide if we want to implement these or not
  // currently causing trouble in tests
  libs.set('fs', EMPTY_PATH);
  libs.set('crypto', EMPTY_PATH);
  // libs.set('fs', POLYFILLS['browserify-fs.js']);
  // libs.set('crypto', POLYFILLS['crypto-browserify.js']);

  // TODO: No good polyfill exists yet
  libs.set('http2', EMPTY_PATH);
  
  // not shimmed
  libs.set('dns', EMPTY_PATH);
  libs.set('dgram', EMPTY_PATH);
  libs.set('child_process', EMPTY_PATH);
  libs.set('cluster', EMPTY_PATH);
  libs.set('module', EMPTY_PATH);
  libs.set('net', EMPTY_PATH);
  libs.set('readline', EMPTY_PATH);
  libs.set('repl', EMPTY_PATH);
  libs.set('tls', EMPTY_PATH);
  libs.set('perf_hooks', EMPTY_PATH);

  return libs;
}
