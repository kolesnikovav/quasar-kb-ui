import { boot } from 'quasar/wrappers'
import vuePlugin from '../../../src/vue-plugin' // "ui" is aliased in quasar.conf.js

export default boot(({ app }) => {
  app.use(vuePlugin)
})
