import * as fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { green, blue, red, cyan } from 'chalk';

export const buildUtils = {
  getSize (code: string|Array<any>|Buffer|any) {
    return (code.length / 1024).toFixed(2) + 'kb'
  },
  createFolder (folder: string) {
    const dir = path.join(__dirname, '..', folder)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  },
  writeFile (dest: string, code: string|Array<any>| any, zip: boolean) {
    const banner = dest.indexOf('.json') > -1
      ? red('[json]')
      : dest.indexOf('.js') > -1
        ? green('[js]  ')
        : dest.indexOf('.ts') > -1
          ? cyan('[ts]  ')
          : blue('[css] ')
  
    return new Promise((resolve, reject) => {
      function report (extra: any) {
        console.log(`${banner} ${path.relative(process.cwd(), dest).padEnd(41)} ${buildUtils.getSize(code).padStart(8)}${extra || ''}`)
        resolve(code)
      }
  
      fs.writeFile(dest, code, err => {
        if (err) return reject(err)
        if (zip) {
          zlib.gzip(code, (err, zipped) => {
            if (err) return reject(err)
            report(` (gzipped: ${buildUtils.getSize(zipped).padStart(8)})`)
          })
        }
        else {
          report('')
        }
      })
    })
  },
  readFile (file: string) {
    return fs.readFileSync(file, 'utf-8')
  },
  logError (err: Error|any) {
    console.error('\n' + red('[Error]'), err)
    console.log()
  }  
}
