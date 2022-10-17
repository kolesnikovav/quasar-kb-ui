import { boot } from 'quasar/wrappers'
import VuePlugin from 'quasar-ui-kb-ui'

export default boot(({ app }) => {
  app.use(VuePlugin)
})
