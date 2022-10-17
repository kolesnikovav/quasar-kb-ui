import rimraf from 'rimraf';
import path from 'path'

export const clean = () => {
    rimraf.sync(path.resolve(__dirname, '../dist/*'))
    console.log(` 💥 Cleaned build artifacts.\n`)    
}
