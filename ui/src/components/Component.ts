import { h, PropType, defineProps } from 'vue'
import { QTable, QTableSlots } from 'quasar'

import {QTableProps } from 'quasar'

import { keys } from 'ts-transformer-keys';
const keysOfProps = keys<QTableProps>();

console.log(keysOfProps); // prints out  ["id", "title", "isDeleted"]

type K1 = keyof QTableProps; 
console.log({} as K1);

interface a {
  name: string,
  code?: number
}

const b:a = {name: 'test'} as a;
console.log(b);



export default {
  name: 'QAdvTable',
  props: {
    //...QTableProps,
  },
  setup () {
    return () => h(QTable, {
      class: 'MyComponent',
      label: 'MyComponent'
    })
  }
}
