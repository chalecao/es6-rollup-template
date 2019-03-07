// Import stylesheets
import { onLoad } from "./common/util/helper"
import router from "./module/router/index"
import firstAction from "./module/first-screen/index"
import lastAction from "./module/last-screen/index"
import coverAction from "./module/cover-page/index"
import './style.css';

const state = {
  params: {},
  el: '.main-content',
}

const View = () => {
  return `<div class="first-screen"></div>
	<div class="last-screen"></div>`;
}

const Action = {
  init: async () => {
    document.querySelector(state.el).innerHTML = View()

    firstAction.init()
    onLoad(() => {
      Action.handleOnload()
    })

  },
  handleOnload: () => {
    lastAction.init()
  },
  unload: () => {
    firstAction.unload()
    lastAction.unload()
  }
}

const routeConfig = [
  {
    path: '/main',
    action: Action.init,
    unload: Action.unload,
    'default': true
  },
  {
    path: '/cover',
    action: coverAction.init,
    unload: coverAction.unload
  }
]

router.init(routeConfig)
