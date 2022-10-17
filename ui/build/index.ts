import {syncAppExt} from './script.app-ext';
import {clean} from './script-clean';
import { buildUtils }  from './utils';
import os from 'os';
import child_process from 'child_process';
import { join } from 'path';
import { green, blue } from 'chalk';

process.env.NODE_ENV = 'production'

const parallel = os.cpus().length > 1
//const runJob = parallel ? require('child_process').fork : require
const runJob = parallel ? child_process.fork : require

console.log()

syncAppExt()
clean()

console.log(` 📦 Building ${green('v' + require('../package.json').version)}...${parallel ? blue(' [multi-threaded]') : ''}\n`)

buildUtils.createFolder('dist')

runJob(join(__dirname, './script.javascript.ts'))
runJob(join(__dirname, './script.css.ts'))
