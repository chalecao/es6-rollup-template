
/**
 * render first screen
 */
import { emptyImg } from '../../common/util/helper'
import "./index.less"

const state = {
  params: {},
  el: '.first-screen',
}

const View = ({ cardData }, { renderHeader, renderCard }) => {
  return `<div class="cover">
       <div>cover content<div>
       <a href="#/main">back</a>
  </div>`
}

const coverAction = {
  init: (data) => {
    //handle data
    state.cardData = data

    coverAction.render()
  },
  renderHeader: () => {

  },
  renderCard: () => {

  },
  unload: () => {
    let node = document.querySelector(".cover")
    node && node.classList.remove("show")
    setTimeout(() => {
      node && node.remove()
    }, 5e2)

  },
  render: () => {
    document.querySelector(".cover-box").innerHTML = View(state, coverAction)
    setTimeout(() => {
      let node = document.querySelector(".cover")
      node.classList.add("show")
    }, 32)

  }
}

export default coverAction