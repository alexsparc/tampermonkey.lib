if (typeof window._tmlib === 'undefined') {
    window._tmlib = {}
}

window._tmlib.Cleaner = (() => {
    'use strict';

    const _propTag = 'tm-data'
    const _propVal = 'cleared'

    let _config = {
        'logging': false,
        'interval.defaultLength': 1,
        'interval.growCoefficient': 1.4,
    };

    let _handlers = [];
    let _intervals = {};


    let _log = (msg) => {
        if (_config['logging']) {
            console.log(msg)
        }
    }

    let _startInterval = (conf, intervalLength) => {
        _intervals[conf.name] = {
            id: setInterval(() => _clean(conf), intervalLength * 1000),
            length: intervalLength
        }
    }

    let _stopInterval = name => {
        clearInterval(_intervals[name].id);
        delete (_intervals[name].id);
        _log(`${name} stopped.`)
    }

    let _prolongInterval = conf => {
        let newIntervalLength = Math.round((_intervals[conf.name].length * _config['interval.growCoefficient'] + Number.EPSILON) * 100) / 100
        _stopInterval(conf.name);
        _startInterval(conf, newIntervalLength);
        _log(`${conf.name} prolonged to ${newIntervalLength}`)
    }

    let _resetInterval = conf => {
        _stopInterval(conf.name);
        _startInterval(conf, _config['interval.defaultLength']);
        _log(`${conf.name} reset to ${_config['interval.defaultLength']}`)
    }

    let _hideElem = (e) => {
        if (e instanceof HTMLElement) {
            e.style.setProperty('display', 'none', 'important')
            e.setAttribute(_propTag, _propVal)
        }
    }

    let _hideElems = (e) => {
        if (e instanceof Array) {
            e.forEach(_hideElem)
        }
    }

    let _clean = conf => {
        let elems = conf.callable()
            .filter(elem => !elem.hasAttribute(_propTag) || elem.getAttribute(_propTag) !== _propVal)
        if (elems.length > 0) {
            _hideElems(elems)
            _resetInterval(conf)
        } else {
            _prolongInterval(conf)
        }
    }

    return {
        configure: kvConf => {
            if (kvConf instanceof Object) {
                Object.keys(kvConf).forEach(key => {
                    if (_config.hasOwnProperty(key)) {
                        _config[key] = kvConf[key]
                    }
                });
            }
        },

        push: (name, callable, interval = 0) => {
            _handlers.push({
                name: name, callable: callable, interval: interval
            })
        },

        run: () => {
            _handlers.forEach(conf => _startInterval(conf, _config['interval.defaultLength']))
        },

        stop: () => Object.keys(_intervals).forEach(name => _stopInterval(name))
    };
})();

window._tmlib.DOMWalker = (() => {
    'use strict';


    class Walker {
        #selection = [];

        constructor(selector) {
            this.#selection = Array.from(document.querySelectorAll(selector))
        }

        nodes() {
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
                this.#selection = this.up().children()
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

        /** Strategies */

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
        get: selector => new Walker(selector)
    };

})();
