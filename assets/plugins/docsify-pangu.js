/**
 * 中英文之间自动加空格（pangu 10.x 本地版）
 * 原版 docsify-pangu 插件是从 jsdelivr 动态加载 pangu 的，国内经常拉不到，
 * 所以这里把库本地化，自己写 10 行胶水代码。
 */
;(function () {
  function spacing(section) {
    if (!window.pangu) return
    try {
      if (section && typeof pangu.spaceNodeSync === 'function') {
        // 同步版：渲染完立刻生效，避免截图/首屏看到没空格的文本
        pangu.spaceNodeSync(section)
      } else if (typeof pangu.spacePage === 'function') {
        pangu.spacePage()
      }
    } catch (e) {
      /* pangu 出错不应该影响页面渲染 */
    }
  }

  function install(hook) {
    hook.doneEach(function () {
      spacing(document.querySelector('.markdown-section'))
    })
  }

  window.$docsify = window.$docsify || {}
  window.$docsify.plugins = [].concat(window.$docsify.plugins || [], install)
})()
