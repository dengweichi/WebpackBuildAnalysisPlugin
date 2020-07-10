
class WebpackBuildAnalysisPlugin {
    constructor(options = {}) {
        this.options = options
        this.map = new Map()
    }
    apply(compiler) {

        compiler.hooks.thisCompilation.tap('WebpackBuildAnalysisPlugin', () => {
            this.map = new Map()
        })

        const handleSetRecords = (records) => {
            if (this.map.has(records.name)) {
                records.time += this.map.get(records.name).time
            }
            this.map.set(records.name, records)
        }

        function wrap(hooks) {
            Object.keys(hooks).forEach((key) => {
                const hookItem = hooks[key]
                const taps = hookItem.taps
                if (taps && taps.length) {
                    const length = taps.length
                    for (let index = 0; index < length; ++index) {
                        const tapItem = taps[index]
                        const {type, fn: pluginFun, name} = tapItem
                        tapItem.fn = function (...args) {
                            const beginTime = Date.now()
                            switch (type) {
                                case 'sync':
                                    const result = pluginFun.call(this, ...args)
                                    const endTime = Date.now()
                                    handleSetRecords({
                                        type,
                                        name,
                                        time: endTime - beginTime
                                    })
                                    return result
                                default:
                                    const lastIndex = args.length - 1
                                    const callBack = args[lastIndex]
                                    if (typeof callBack === 'function') {
                                        args.splice(lastIndex, 1)
                                        const callBackWrap = function (...array) {
                                            callBack(...array)
                                            const endTime = Date.now()
                                            handleSetRecords({
                                                type,
                                                name,
                                                time: endTime - beginTime
                                            })
                                        }
                                        args.push(callBackWrap)
                                        return pluginFun.call(this, ...args)
                                    } else {
                                        return pluginFun.call(this, ...args).finally(() => {
                                            const endTime = Date.now()
                                            handleSetRecords({
                                                type,
                                                name,
                                                time: endTime - beginTime
                                            })
                                        })
                                    }
                            }
                        }
                    }
                }
            })
        }
        wrap.call(this, compiler.hooks)
        compiler.hooks.compilation.tap('WebpackBuildAnalysisPlugin', function (compilation) {
            return wrap.call(this, compilation.hooks)
        })
        compiler.hooks.done.tapAsync({
            name: 'WebpackBuildAnalysisPlugin',
            stage: 10000
        }, (stats, callback) => {
            callback()
            if (this.options.callback) {
                this.options.callback(this.map)
            } else {
                //console.log(this.map)
            }
        })
    }

}


module.exports.WebpackBuildAnalysisPlugin = WebpackBuildAnalysisPlugin
