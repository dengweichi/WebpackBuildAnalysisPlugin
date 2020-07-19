# WebpackBuildAnalysisPlugin
# webpack构建分析插件

---
### 1.安装 
```js
    // 安装
    // npm install webpack-build-analysis-plugin
    // const {  WebpackBuildAnalysisPlugin } = require('webpack-build-analysis-plugin')
    // vue-cli使用
    module.exports = {
        configureWebpack(config) {
            config.plugins.push(new WebpackBuildAnalysisPlugin())
        }
    }
    // webpack使用
    module.exports = {
        plugins: [
           new WebpackBuildAnalysisPlugin()
         ]
    }
```
---
可传递参数实现自定义数据显示，参数为一个map对象，包括插件名称和插件花费的时间
```js
    new WebpackBuildAnalysisPlugin({
        callback: (map) => {
            console.log(map)
        }
    })

```
