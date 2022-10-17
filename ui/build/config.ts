import { name, author, version } from '../package.json';
const year = (new Date()).getFullYear()

export const config = {
  name,
  version,
  banner:
    '/*!\n' +
    ' * ' + name + ' v' + version + '\n' +
    ' * (c) ' + year + ' ' + author + '\n' +
    ' * Released under the MIT License.\n' +
    ' */\n'
}
