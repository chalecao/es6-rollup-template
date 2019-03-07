
/**
 * render last screen
 */
import { emptyImg } from '../../common/util/helper'
import "./index.less"


const state = {
  params: {},
  el: '.last-screen',
}

const View = ({ cardData }, { renderHeader, renderCard }) => {
  return `<div class="last-content">last-screen</div>`
}

const lastAction = {
  init: (data) => {
    //handle data
    state.cardData = data

    lastAction.render()
  },
  renderHeader: () => {

  },
  renderCard: () => {

  },
  unload(){
    document.querySelector(`${state.el}`).innerHTML = ""
  },
  render: () => {
    document.querySelector(`${state.el}`).innerHTML = View(state, lastAction)
  }
}

export default lastAction