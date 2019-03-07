// the attribute that save image src
const ATTR_IMAGE_URL = 'data-src';
// the img's className
const CLASSNAME = 'fe-lazyload';
// the unloaded img's selector
const IMG_SELECTOR = `img[${ATTR_IMAGE_URL}].${CLASSNAME}`;
// the default rootMargin Y
const DEFAULT_ROOTMARGINY = 667;
// the default rootMargin X
const DEFAULT_ROOTMARGINX = 0;

/**
 * @method onload
 * @param callback {Function}
 * @private
 */
function onload(callback) {
    let run = function () {
        setTimeout(callback, 10);
    };

    if (document.readyState === 'complete') {
        run();
    } else {
        window.addEventListener('load', run);
    }
}

/**
 * _.throttle from Underscore.js
 * @param func
 * @param wait
 * @returns {Function}
 * @private
 */
function throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var _now = function () {
        return window.performance ? performance.now() : Date.now();
    }
    var later = function () {
        previous = options.leading === false ? 0 : _now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function () {
        var now = _now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    }
}

/**
 * convert anything to an array that contain elements
 * @method processElement
 * @param container
 * @returns {*}
 * @private
 */
function processElement(container) {
    if (typeof container === 'string') {
        // return [...document.querySelectorAll(container)]
        return Array.from(document.querySelectorAll(container))
    } else if (container instanceof HTMLElement) {
        return [container];
    } else if (container instanceof HTMLCollection) {
        // return [...container];
        return Array.from(container);
    } else {
        return container;
    }
}

// store innerHeight & innerWidth
let _innerHeight;
let _innerWidth;
const getInnerHeight = function () {
    return _innerHeight || (_innerHeight = window.innerHeight);
};
const getInnerWidth = function () {
    return _innerWidth || (_innerWidth = window.innerWidth);
};

/**
 * a lazyload component
 */
class Lazyload {
    /**
     * @param {String|HTMLElement|HTMLCollection} [container=document.body] - the images' container, support
     * @param {Object} [config]
     *      @param {Number} [config.rootMarginY=0] - same as the IntersectionObserver's rootMargin. The default is 0, and will auto increase to 667 after onload, then check if the images are need to load
     *      @param {Number} [config.rootMarginX=0] - same as the IntersectionObserver's rootMargin.
     *      @param {String|HTMLElement} [config.scroller=window] - the scroll element, same as the IntersectionObserver's root
     *      @param {Function} [config.processor] - the function to change the image's src before load
     */
    constructor(container, config = {}) {
        this._containers = container ? processElement(container) : [document.body];
        this._config = Object.assign({
            scroller: window,
            rootMarginY: 0,
            rootMarginX: 0
        }, config);
        if (typeof this._config.scroller === 'string') {
            this._config.scroller = document.querySelector(this._config.scroller);
        }
        if (!config.rootMarginY) {
            onload(() => {
                this._config.rootMarginY = DEFAULT_ROOTMARGINY;
                if (window.IntersectionObserver) {
                    this.pause();
                    this.resume();
                } else {
                    this._check();
                }
            });
        }

        this.refresh();
    }

    /**
     * recollect images, and load images which is in viewport immediately
     */
    refresh() {
        this.pause();

        this._containers.forEach((container) => {
            // container.images = [...container.querySelectorAll(IMG_SELECTOR)];
            container.images = Array.from(container.querySelectorAll(IMG_SELECTOR));

        });

        this.resume();
    }

    /**
     * pause the listener
     */
    pause() {
        if (!this._runing) {
            return;
        }
        this._runing = false;

        if (this._io) {
            this._io.disconnect();
        } else {
            this._config.scroller.removeEventListener('scroll', this._listener, {
                passive: true
            });
            if (this._config.scroller !== window) {
                window.removeEventListener('scroll', this._listener, {
                    passive: true
                });
            }
            window.removeEventListener('orientationchange', this._listener);
        }
    }

    /**
     * resume the listener, and load images which is in viewport immediately
     */
    resume() {
        if (this._runing) {
            return;
        }
        this._runing = true;

        if (window.IntersectionObserver) {
            this._io = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.intersectionRatio > 0) {
                        let target = entry.target;
                        this._load(target);
                        this._io.unobserve(target);
                        if (this._containers.every(container => {
                            container.images = container.images.filter(img => {
                                return img !== target;
                            });
                            return !container.images.length;
                        })) {
                            this.pause();
                        }
                    }
                });
            }, {
                    //root: this._config.scroller === window ? null : this._config.scroller,
                    rootMargin: `${this._config.rootMarginY}px ${this._config.rootMarginX}px`,
                    threshold: 0.0001
                });

            this._containers.forEach(container => {
                container.images.forEach(img => {
                    this._io.observe(img);
                });
            });
        } else {
            this._listener = throttle(() => {
                this._check();
            }, 50);
            this._config.scroller.addEventListener('scroll', this._listener, {
                passive: true
            });
            if (this._config.scroller !== window) {
                window.addEventListener('scroll', this._listener, {
                    passive: true
                });
            }
            window.addEventListener('orientationchange', this._listener);
            this._check();
        }
    }

    /**
     * add container that contain images, and load images which is in viewport immediately
     * @param {String|HTMLElement} el - the images' container
     */
    addContainer(el) {
        this._containers = this._containers.concat(processElement(el));
        this.refresh();
    }

    /**
     * load image
     * @param {HTMLElement} el - the image element
     * @private
     */
    _load(el) {
        let source = el.getAttribute(ATTR_IMAGE_URL);

        if (source) {
            let processor = this._config.processor;
            if (processor) {
                source = processor(source, el);
            }

            el.addEventListener('load', () => {
                el.classList.remove(CLASSNAME);
            });
            el.src = source;
            el.removeAttribute(ATTR_IMAGE_URL);
        }
    }

    /**
     * check if the image is in viewport, and load images which is in viewport immediately
     * @private
     */
    _check() {
        let rootMarginY = this._config.rootMarginY;
        let rootMarginX = this._config.rootMarginX;
        let isInViewPort = this.constructor.isInViewPort;

        let notEmptyContainers = this._containers.filter((container) => {
            // if the container is not in the viewport, then return
            if (!isInViewPort(container, {
                rootMarginX,
                rootMarginY
            })) {
                return true;
            }

            let loadImgs = (imgs) => {
                return imgs.filter((img) => {
                    let is = isInViewPort(img, {
                        rootMarginX,
                        rootMarginY
                    });
                    if (is) {
                        // maybe other instance had done
                        if (!img.getAttribute(ATTR_IMAGE_URL)) {
                            return false;
                        }
                        this._load(img);
                    }
                    return !is;
                });
            };

            // load images and filter them from the list
            container.images = loadImgs(container.images);

            return container.images.length;
        });

        if (!notEmptyContainers.length) {
            // pause self after all images had loaded
            this.pause();
        }
    }

    /**
     * observe an element when entering into the viewport
     * @static
     * @param {String|HTMLElement|HTMLCollection} el - the element to be observed
     * @param {Function} callback - the callback function 
     * @param {Object} [config]
     *      @param {Number} [config.rootMarginY] - same as the IntersectionObserver's rootMargin.
     *      @param {Number} [config.rootMarginX] - same as the IntersectionObserver's rootMargin.
     *      @param {String|HTMLElement} [config.scroller=window] - the scroll element, same as the IntersectionObserver's root
     */
    static addListener(el, callback, config) {
        if (typeof el === 'string') {
            el = document.querySelector(el);
        }
        config = Object.assign({
            scroller: window,
            rootMarginY: DEFAULT_ROOTMARGINY,
            rootMarginX: DEFAULT_ROOTMARGINX
        }, config);
        let isInViewPort = this.isInViewPort;

        if (window.IntersectionObserver) {
            let io = new IntersectionObserver(entries => {
                if (entries[0].intersectionRatio > 0) {
                    callback();
                    io.disconnect();
                }
            }, {
                    root: config.scroller === window ? null : config.scroller,
                    rootMargin: `${config.rootMarginY}px ${config.rootMarginX}px`,
                    threshold: 0.0001
                });

            io.observe(el);
        } else {
            let check = function () {
                return isInViewPort(el, {
                    rootMarginX: config.rootMarginX,
                    rootMarginY: config.rootMarginY
                });
            }

            if (check()) {
                return callback();
            }

            let listener = throttle(() => {
                if (check()) {
                    config.scroller.removeEventListener('scroll', listener, {
                        passive: true
                    });
                    window.removeEventListener('orientationchange', listener);
                    callback();
                }
            }, 50);

            config.scroller.addEventListener('scroll', listener, {
                passive: true
            });
            window.addEventListener('orientationchange', listener);
        }
    }

    /**
     * to detect if the element is in the viewport
     * @param {HTMLElement} el - the element that to be detected 
     * @param {Object} [config]
     *      @param {Number} [config.rootMarginY=0] - same as the IntersectionObserver's rootMargin
     *      @param {Number} [config.rootMarginX=0] - same as the IntersectionObserver's rootMargin
     * @returns {boolean}
     * @static
     */
    static isInViewPort(el, config) {
        if (!_innerHeight || !_innerWidth) {
            window.addEventListener('orientationchange', function () {
                _innerHeight = window.innerHeight;
                _innerWidth = window.innerWidth;
            });
        }
        config = Object.assign({
            rootMarginX: 0,
            rootMarginY: 0
        }, config);
        let clientRect = el.getBoundingClientRect();

        return !(
            (!clientRect.width && !clientRect.height) ||
            clientRect.top - getInnerHeight() > config.rootMarginY ||
            clientRect.bottom + config.rootMarginY < 0 ||
            clientRect.left - getInnerWidth() > config.rootMarginX ||
            clientRect.right + config.rootMarginX < 0
        )
    }
}

export default Lazyload;