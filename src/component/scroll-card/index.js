import { h, Component } from 'preact'
import { $ } from "../../common/util/helper"
import InfiniteScroll from "../../common/util/infinite-scroll"

export default class ScrollCard extends Component {
    constructor() {
        super()
    }
    componentDidMount() {
        // this.lazyLoadImg()
        this.lazyLoadDom()
    }

    lazyLoadDom() {
        let indicatorEl = $(".card-list>.indicator")
        let scroll = new InfiniteScroll({
            container: $(".card-list"),
            scroller: $(".card-list"),
            itemsContainer: $(".card-list"),
            rootMarginY: 300,
            indicator: indicatorEl
        })
        scroll.request = (param) => {
            return this.props.request(param)
        }
        scroll.init()
    }
    render({ children, cls }) {
        return (
            <div class={"card-list " + (cls || "")} >
                {children}
                <div class="indicator loading"></div>
            </div>
        )
    }
}