import { h, PropType, defineProps } from 'vue'
import { QTable, QTableProps, QTableSlots } from 'quasar'

export default {
  name: 'QAdvTable',
  props: {
    ...QTableProps,
  },
  setup () {
    return () => h(QTable, {
      class: 'MyComponent',
      label: 'MyComponent'
    })
  }
}
