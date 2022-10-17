import Component from './components/Component'
import {version } from '../package.json'

function install (app: any) {
  app.component(Component.name, Component)
}

export const VuePlugin = {
  version,
  Component,
  install
};

export default VuePlugin;
