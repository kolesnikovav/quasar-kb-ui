import path from 'path';
import sass from 'sass';
import postcss from 'postcss';
import cssnano from 'cssnano';
import rtl from 'rtlcss';
import autoprefixer from 'autoprefixer';
import { buildUtils } from './utils';
import { config as buildConf} from './config';

const postCssCompiler = postcss([ autoprefixer ])
const postCssRtlCompiler = postcss([ rtl({}) ])

const nano = postcss([
  cssnano({
    preset: ['default', {
      mergeLonghand: false,
      convertValues: false,
      cssDeclarationSorter: false,
      reduceTransforms: false
    }]
  })
])

Promise
  .all([
    generate('src/index.sass', `dist/index`)
  ])
  .catch(e => {
    console.error(e)
    process.exit(1)
  })

/**
 * Helpers
 */

function resolve (_path: string) {
  return path.resolve(__dirname, '..', _path)
}

function generate (src: string, dest: string) {
  src = resolve(src)
  dest = resolve(dest)

  return new Promise((resolve, reject) => {
    sass.render({ file: src, includePaths: ['node_modules'] }, (err, result) => {
      if (err) {
        reject(err)
        return
      }

      resolve(result.css)
    })
  })
  .then(code => buildConf.banner + code)
  .then(code => postCssCompiler.process(code, { from: void 0 }))
  .then(code => {
    code.warnings().forEach(warn => {
      console.warn(warn.toString())
    })
    return code.css
  })
  .then(code => Promise.all([
    generateUMD(dest, code),
    postCssRtlCompiler.process(code, { from: void 0 })
      .then(code => generateUMD(dest, code.css, '.rtl'))
  ]))
}

function generateUMD (dest: string, code: any, ext = '') {
  return buildUtils.writeFile(`${dest}${ext}.css`, code, true)
    .then(code => nano.process((code as any), { from: void 0 }))
    .then(code => buildUtils.writeFile(`${dest}${ext}.min.css`, code.css, true))
}
