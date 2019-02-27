/**
 * A scrollview which support infinite scroll.
 */
class InfiniteScroll {
    /**
     * @param {Object} config
     *    @param {String|HTMLElement} config.container - the container
     *    @param {String|HTMLElement} [config.scroller=window] - the scroll element，need be seted in ios, because need bind scroll event
     *    @param {String|HTMLElement} [config.itemsContainer=.items] - the container of items
     *    @param {String|HTMLElement} [config.indicator=.indicator] - the loading indicator
     *    @param {Number} [config.rootMarginY=200] - the distance to determine when to load the next page
     */
    constructor(config = {}) {
        config = Object.assign({
            rootMarginY: 200,
            scroller: window,
            itemsContainer: '.items',
            indicator: '.indicator'
        }, config);

        let getEl = function (el, container) {
            return typeof el === 'string' ? (container || document).querySelector(el) : el;
        }

        /**
         * @property {HTMLElement} container - the infinite scroll's container
         */
        this.container = getEl(config.container);
        this._itemsContainer = getEl(config.itemsContainer, this.container);
        this._scroller = getEl(config.scroller, this.container);
        this._indicator = getEl(config.indicator, this.container);
        this._rootMarginY = config.rootMarginY;

        /**
         * @property {Number} page - the current page's index (start from 0)
         */
        this.page = 0;
    }

    /**
     * the common plug interface to add functions
     * @param {Object} Plugin - the plugin
     * @param {Object} [config] - the plugin's config
     */
    use(Plugin, config) {
        return Plugin.init(this, config)
    }

    /**
     * strat infinite scroll, and request the first page of data
     */
    init() {
        // init infinite scroll
        if (window.IntersectionObserver) {
            this._io = new IntersectionObserver((entries) => {
                if (entries[0].intersectionRatio > 0) {
                    this.pause();
                    this._requestAndRender();
                }
            }, {
                    root: this._scroller === window ? null : this._scroller,
                    threshold: 0.000001,
                    rootMargin: `${this._rootMarginY}px 0px`
                })
        } else {
            this._listener = () => {
                if (this._check()) {
                    this.pause();
                    this._requestAndRender();
                }
            };
        }

        // request first page
        this._requestAndRender();
    }

    /**
     * reset state, empty the items container, resume infinite scroll
     */
    reset() {
        this._itemsContainer.innerHTML = '';
        this._indicator.style.display = '';
        this.page = 0;
        this._requestAndRender();
    }

    /**
     * resume infinite scroll
     */
    resume() {
        if (this._io) {
            this._io.observe(this._indicator);
        } else if (this._listener) {
            this._scroller.addEventListener('scroll', this._listener, { passive: true });
        }
    }

    /**
     * pause infinite scroll
     */
    pause() {
        if (this._io) {
            this._io.unobserve(this._indicator);
        } else if (this._listener) {
            this._scroller.removeEventListener('scroll', this._listener);
        }
    }

    /**
     * request data and render
     * @private
     */
    _requestAndRender() {
        this.request({
            page: this.page
        }).then((res) => {
            if (res && res.hasMore) {
                this.page++;
                setTimeout(() => {
                    this.resume();
                }, 100);
            } else {
                this._indicator.style.display = 'none';
            }
        }, () => {
            this._indicator.style.display = 'none';
        });
    }

    /**
     * try again to load the current page and render
     */
    retry() {
        this._indicator.style.display = '';

        this._requestAndRender();
    }

    /**
     * you must achieve this interface to request data, you should return a promise
     * @method InfiniteScroll#request
     * @param {Object} params - the request data
     *     @param {Number} params.page - the page number
     * @return {Promise}
     */

    /**
     * you must achieve this interface to render view
     * @method InfiniteScroll#render
     * @param {*} params - the data return by the request interface
     * @return {String|HTMLElement}
     */

    /**
     * detect if need to request next page
     * @returns {boolean}
     * @private
     */
    _check() {
        let scrollerIsWindow = this._scroller === window;
        let height = (scrollerIsWindow ? document.body : this._scroller).scrollHeight;
        let top = scrollerIsWindow ? window.pageYOffset : this._scroller.scrollTop;
        let offset = scrollerIsWindow ? window.innerHeight : this._scroller.clientHeight;

        return (height - top - offset) <= this._rootMarginY;
    }
}

export default InfiniteScroll