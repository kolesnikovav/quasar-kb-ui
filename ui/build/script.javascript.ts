import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import * as rollup from 'rollup';
import uglify from 'uglify-js';
import buble from '@rollup/plugin-buble';
import json from '@rollup/plugin-json';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import {version } from '../package.json';

import { buildUtils } from './utils';
import { config as buildConf} from './config';
import typescript from 'rollup-plugin-typescript2';
import keysTransformer from 'ts-transformer-keys/transformer';
import { Program } from 'typescript';

const rollupPlugins = [
  typescript({ transformers: [service => ({
    before: [ keysTransformer(service.getProgram() as Program) ],
    after: []
  })] }),
  replace({
    preventAssignment: false,
    values: {
      __UI_VERSION__: `'${ version }'`
    }
  }),
  nodeResolve({
    extensions: ['.js','.ts'],
    preferBuiltins: false
  }),
  json(),
  buble({
    objectAssign: 'Object.assign'
  })
]

const builds = [
  {
    rollup: {
      input: {
        input: pathResolve('../src/index.esm.ts')
      },
      output: {
        file: pathResolve('../dist/index.esm.js'),
        format: 'es'
      }
    },
    build: {
      // unminified: true,
      minified: true
    }
  },
  {
    rollup: {
      input: {
        input: pathResolve('../src/index.common.ts')
      },
      output: {
        file: pathResolve('../dist/index.common.js'),
        format: 'cjs'
      }
    },
    build: {
      // unminified: true,
      minified: true
    }
  },
  {
    rollup: {
      input: {
        input: pathResolve('../src/index.umd.ts')
      },
      output: {
        name: 'kbUi',
        file: pathResolve('../dist/index.umd.js'),
        format: 'umd'
      }
    },
    build: {
      unminified: true,
      minified: true,
      minExt: true
    }
  }
]

// Add your asset folders here, if needed
// addAssets(builds, 'icon-set', 'iconSet')
// addAssets(builds, 'lang', 'lang')

build(builds)

/**
 * Helpers
 */

function pathResolve (_path: string) {
  return path.resolve(__dirname, _path)
}

// eslint-disable-next-line no-unused-vars
function addAssets (builds: any, type: any, injectName: any) {
  const
    files = fs.readdirSync(pathResolve('../../ui/src/components/' + type)),
    plugins = [ buble(/* bubleConfig */) ],
    outputDir = pathResolve(`../dist/${type}`)

    fse.mkdirp(outputDir)

  files
    .filter(file => file.endsWith('.ts'))
    .forEach(file => {
      const name = file.substr(0, file.length - 3).replace(/-([a-z])/g, g => g[1].toUpperCase())
      builds.push({
        rollup: {
          input: {
            input: pathResolve(`../src/components/${type}/${file}`),
            plugins
          },
          output: {
            file: addExtension(pathResolve(`../dist/${type}/${file}`), 'umd'),
            format: 'umd',
            name: `kbUi.${injectName}.${name}`
          }
        },
        build: {
          minified: true
        }
      })
    })
}

function build (builds: any) {
  return Promise
    .all(builds.map(genConfig).map(buildEntry))
    .catch(buildUtils.logError)
}

function genConfig (opts: any) {
  Object.assign(opts.rollup.input, {
    plugins: rollupPlugins,
    external: [ 'vue', 'quasar' ]
  })

  Object.assign(opts.rollup.output, {
    banner: buildConf.banner,
    globals: { vue: 'Vue', quasar: 'Quasar' }
  })

  return opts
}

function addExtension (filename: string, ext = 'min') {
  const insertionPoint = filename.lastIndexOf('.')
  return `${filename.slice(0, insertionPoint)}.${ext}${filename.slice(insertionPoint)}`
}

function buildEntry (config: any) {
  return rollup
    .rollup(config.rollup.input)
    .then(bundle => bundle.generate(config.rollup.output))
    .then(({ output }) => {
      const code = config.rollup.output.format === 'umd'
        ? injectVueRequirement(output[0].code)
        : output[0].code

      return config.build.unminified
        ? buildUtils.writeFile(config.rollup.output.file, code, false)
        : code
    })
    .then(code => {
      if (!config.build.minified) {
        return code
      }

      const minified = uglify.minify(code, {
        compress: {
          pure_funcs: ['makeMap']
        }
      })

      if (minified.error) {
        return Promise.reject(minified.error)
      }

      return buildUtils.writeFile(
        config.build.minExt === true
          ? addExtension(config.rollup.output.file)
          : config.rollup.output.file,
        buildConf.banner + minified.code,
        true
      )
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}

function injectVueRequirement (code: any) {
  // eslint-disable-next-line
  const index = code.indexOf(`Vue = Vue && Vue.hasOwnProperty('default') ? Vue['default'] : Vue`)

  if (index === -1) {
    return code
  }

  const checkMe = ` if (Vue === void 0) {
    console.error('[ Quasar ] Vue is required to run. Please add a script tag for it before loading Quasar.')
    return
  }
  `

  return code.substring(0, index - 1) +
    checkMe +
    code.substring(index)
}
