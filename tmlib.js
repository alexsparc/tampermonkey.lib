if (typeof window._tmlib === 'undefined') {
    window._tmlib = {}
}

window._tmlib.Cleaner = (() => {
    'use strict';

    let _handlers = [];
    let _intervals = {};

    let _clearInterval = name => {
        clearInterval(_intervals[name]);
        delete (_intervals[name]);
    }

    let _hideElem = (e) => {
        if (e instanceof HTMLElement) {
            e.style.setProperty('display', 'none', 'important')
        }
    }

    let _hideElems = (e) => {
        if (e instanceof Array) {
            e.forEach(_hideElem)
        }
    }

    let _log = (msg) => console.log(msg)

    return {
        push: (name, callable, interval = 0) => {
            _handlers.push({
                name: name, callable: callable, interval: interval
            })
        },

        run: () => {
            _handlers.forEach(conf => {
                _intervals[conf.name] = setInterval(() => {
                    let elems = conf.callable()
                    if (elems.length > 0) {
                        _hideElems(elems)
                    } else {
                        _clearInterval(conf.name)
                    }
                }, conf.interval * 1000)
            })
        },

        stop: () => Object.keys(_intervals).forEach(name => _clearInterval(name))
    };
})();

window._tmlib.DOMWalker = (() => {
    'use strict';


    class Walker {
        #selection = [];

        constructor(selector) {
            this.#selection = Array.from(document.querySelectorAll(selector))
        }

        getSelection() {
            return this.#selection
        }


        up(times = 1) {
            if (this.#selection.length > 0) {
                let node = this.#selection[0]
                for (let i = 0; i < times; i++) {
                    node = node.parentNode ? node.parentNode : null
                }
                this.#selection = [node]
            }
            return this
        }


        down(selector) {
            if (this.#selection.length > 0) {
                if (this.#selection.length > 1) {
                    console.error('Multiple nodes detected. Apply a strategy before go deeper')
                } else {
                    this.#selection = Array.from(this.#selection[0].querySelectorAll(selector))
                }
            }

            return this
        }

        children() {
            if (this.#selection.length > 0) {
                if (this.#selection.length > 1) {
                    console.error('Multiple nodes detected. Apply a strategy before go deeper')
                } else {
                    this.#selection = Array.from(this.#selection[0].childNodes)
                }
            }
            return this
        }

        siblings() {
            if (this.#selection.length > 0) {
                if (this.#selection.length > 1) {
                    console.error('Multiple nodes detected. Apply a strategy before go wider')
                } else {
                    this.#selection = this.up().children()
                }
            }
            return this
        }

        next() {
            if (this.#selection.length > 0) {
                if (this.#selection.length > 1) {
                    console.error('Multiple nodes detected. Apply a strategy before go next')
                } else {
                    this.#selection = [this.#selection[0].nextSibling]
                }
            }
            return this
        }

        prev() {
            if (this.#selection.length > 0) {
                if (this.#selection.length > 1) {
                    console.error('Multiple nodes detected. Apply a strategy before go back')
                } else {
                    this.#selection = [this.#selection[0].previousSibling]
                }
            }
            return this
        }

        first() {
            if (this.#selection.length > 0) {
                this.#selection = [this.#selection[0]]
            }
            return this
        }

        last() {
            if (this.#selection.length > 0) {
                this.#selection = [this.#selection[this.#selection.length - 1]]
            }
            return this
        }

        index(index = 0) {
            if (this.#selection.length > 0 && this.#selection.hasOwnProperty(index)) {
                this.#selection = [this.#selection[index]]
            }
            return this
        }

    }

    return {
        init: selector => new Walker(selector)
    };

})();
