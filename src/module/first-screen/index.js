
/**
 * render first screen
 */
import { emptyImg } from '../../common/util/helper'
import { history } from '../router/index'
import "./index.less"

const state = {
  params: {},
  el: '.first-screen',
}

const View = ({ cardData }, { renderHeader, renderCard }) => {
  return `<div class="first-content">first-screen</div>
  <a class="open_cover" onclick="(${() => { console.log(1); window.exportContext.history.push('/cover', { some: 'state' }); }})()">open cover</a>`
}
//采用命名空间
window.exportContext = { history }

const Action = {
  init: (data) => {
    //handle data
    state.cardData = data
    Action.render()
  },
  dispatch(action) {
    //change state
  },
  renderHeader: () => {

  },
  renderCard: () => {

  },
  unload() {
    document.querySelector(`${state.el}`).innerHTML = ""
  },
  render: () => {
    document.querySelector(`${state.el}`).innerHTML = View(state, Action)
    //html 模板中已经处理了事件，这里不用处理
    let alink = document.querySelector(".open_cover").addEventListener("click", () => {
      // history.push('/cover', { some: 'state' })
    })
  }
}

export default Action