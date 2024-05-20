// @ts-ignore
import type { Plugin } from "rollup";
import inject, { type RollupInjectOptions } from "@rollup/plugin-inject";
import { getModules } from "./modules";
import { posix, resolve } from "path";
import { randomBytes } from "crypto";
import POLYFILLS from './polyfills';
import { isBuiltin } from "module";
import { createHasModule, type OnPolyfill } from "./has-module";

// Node import paths use POSIX separators
const { dirname, relative, join } = posix;

const PREFIX = `\0polyfill-node.`;
const PREFIX_LENGTH = PREFIX.length;

export interface NodePolyfillsOptions {
  baseDir?: string;
  sourceMap?: RollupInjectOptions['sourceMap'];
  include?: Array<string | RegExp> | string | RegExp | null;
  exclude?: Array<string | RegExp> | string | RegExp | null;
  
  /**
   * @deprecated, crypto flag behavior is not implemented
   */
  crypto?: boolean;
  
  // If a polyfill is skipped, should the external module name be prefixed with `node:`?
  prefixExternals?: boolean; // default: false

  // allow filtering or substitution of polyfills that are applied, returning false will result in dependency remaining external
  // if defaultPolyfill is undefined, the polyfill returns an empty module
  onPolyfill?: OnPolyfill;  // default: () => true
}

export default function (opts: NodePolyfillsOptions = {}): Plugin {
  const mods = getModules();
  const hasModule = createHasModule(mods, POLYFILLS, opts.onPolyfill);

  const injectPlugin = inject({
    include: opts.include === undefined ? ['node_modules/**/*.js'] : opts.include,
    exclude: opts.exclude,
    sourceMap: opts.sourceMap,
    modules: {
      process: PREFIX + "process",
      Buffer: [PREFIX + "buffer", "Buffer"],
      global: PREFIX + 'global',
      __filename: FILENAME_PATH,
      __dirname: DIRNAME_PATH,
    },
  });
  const basedir = opts.baseDir || "/";
  const dirs = new Map<string, string>();
  return {
    name: "polyfill-node",
    resolveId(importee: string, importer?: string) {
      // Fixes commonjs compatibility: https://github.com/FredKSchott/rollup-plugin-polyfill-node/pull/42
      if (importee[0] == '\0' && /\?commonjs-\w+$/.test(importee)) {
        importee = importee.slice(1).replace(/\?commonjs-\w+$/, '');
      }
      if (importee === DIRNAME_PATH) {
        const id = getRandomId();
        dirs.set(id, dirname("/" + relative(basedir, importer!)));
        return { id, moduleSideEffects: false };
      }
      if (importee === FILENAME_PATH) {
        const id = getRandomId();
        dirs.set(id, dirname("/" + relative(basedir, importer!)));
        return { id, moduleSideEffects: false };
      }
      if (importee && importee.slice(-1) === "/") {
        importee = importee.slice(0, -1);
      }

      if (isBuiltin(importee)) {
        importee = importee.replace(/^node:/, "");
        // if the module is known and not applying a polyfill, return it as an external        
        if (!hasModule(importee)) {
          return {
            id: opts.prefixExternals ? "node:" + importee : importee,
            external: true,
            moduleSideEffects: false,
          };
        }
      }
      
      if (importer && importer.startsWith(PREFIX) && importee.startsWith('.')) {
        importee = PREFIX + join(importer.substr(PREFIX_LENGTH).replace('.js', ''), '..', importee) + '.js';
      }
      if (importee.startsWith(PREFIX)) {
        importee = importee.substr(PREFIX_LENGTH);
      }
      if (hasModule(importee) || POLYFILLS[importee.replace('.js', '') + '.js']) {
        return { id: PREFIX + importee.replace('.js', '') + '.js', moduleSideEffects: false };
      }
      return null;
    },
    load(id: string) {
      if (dirs.has(id)) {
        return `export default '${dirs.get(id)}'`;
      }
      if (id.startsWith(PREFIX)) {
        const importee = id.substr(PREFIX_LENGTH).replace('.js', '');
        return mods.get(importee) || POLYFILLS[importee + '.js'];
      } 

    },
    transform(code: string, id: string) {
      if(id === PREFIX + 'global.js') return
      // @ts-ignore
      return injectPlugin.transform!.call(this, code, id.replace(PREFIX, resolve('node_modules', 'polyfill-node')));
    },
  };
}

function getRandomId() {
  return randomBytes(15).toString("hex");
}

const DIRNAME_PATH = "\0node-polyfills:dirname";
const FILENAME_PATH = "\0node-polyfills:filename";
