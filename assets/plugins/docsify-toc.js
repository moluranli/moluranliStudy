/**
 * 阅读进度条 + 右侧本页目录（自写，不依赖停更的 docsify-toc / docsify-progress）
 *
 * 行为：
 *  - 页面顶部一条 3px 进度条，宽度 = 当前滚动百分比
 *  - 右侧悬浮「本页目录」，取正文里的 h2 / h3，h3 缩进一档
 *  - 滚动时高亮当前所在小节（scroll-spy），点击平滑跳转
 *  - 目录少于 2 条、或视口窄于 1400px 时整体隐藏
 */
;(function () {
  var MIN_WIDTH = 1400 // 太窄会把正文挤扁，直接不显示
  var ACTIVE_OFFSET = 120 // 判定"当前小节"的顶部基准线（px）

  var state = { headings: [], active: -1, ticking: false }

  function ensureDom() {
    if (!document.getElementById('read-progress')) {
      var bar = document.createElement('div')
      bar.id = 'read-progress'
      bar.innerHTML = '<i></i>'
      document.body.appendChild(bar)
    }
    if (!document.getElementById('toc-panel')) {
      var nav = document.createElement('nav')
      nav.id = 'toc-panel'
      nav.innerHTML = '<div class="toc-title">本页目录</div><ol class="toc-list"></ol>'
      document.body.appendChild(nav)
    }
  }

  function updateProgress() {
    var bar = document.querySelector('#read-progress > i')
    if (!bar) return
    var doc = document.documentElement
    var max = doc.scrollHeight - doc.clientHeight
    var ratio = max > 0 ? doc.scrollTop / max : 0
    if (ratio < 0) ratio = 0
    if (ratio > 1) ratio = 1
    bar.style.width = (ratio * 100).toFixed(2) + '%'
  }

  function updateActive() {
    if (!state.headings.length) return
    var index = 0
    for (var i = 0; i < state.headings.length; i++) {
      if (state.headings[i].getBoundingClientRect().top - ACTIVE_OFFSET <= 0) {
        index = i
      }
    }
    if (index === state.active) return
    state.active = index
    var links = document.querySelectorAll('#toc-panel .toc-list a')
    for (var j = 0; j < links.length; j++) {
      links[j].classList.toggle('active', j === index)
    }
  }

  function onScroll() {
    if (state.ticking) return
    state.ticking = true
    window.requestAnimationFrame(function () {
      updateProgress()
      updateActive()
      state.ticking = false
    })
  }

  function build() {
    ensureDom()
    var nav = document.getElementById('toc-panel')
    var list = nav.querySelector('.toc-list')
    var section = document.querySelector('.markdown-section')
    var nodes = section ? section.querySelectorAll('h2, h3') : []

    list.innerHTML = ''
    state.headings = []
    state.active = -1

    for (var i = 0; i < nodes.length; i++) {
      var heading = nodes[i]
      if (!heading.id) heading.id = 'section-' + i

      var link = document.createElement('a')
      link.href = 'javascript:void(0)'
      link.className = heading.tagName === 'H3' ? 'lv3' : 'lv2'
      link.textContent = heading.textContent.trim()
      link.setAttribute('data-target', heading.id)
      link.addEventListener('click', onJump)

      var li = document.createElement('li')
      li.appendChild(link)
      list.appendChild(li)
      state.headings.push(heading)
    }

    var visible = state.headings.length >= 2 && window.innerWidth >= MIN_WIDTH
    nav.classList.toggle('show', visible)
    updateProgress()
    updateActive()
  }

  function onJump(event) {
    event.preventDefault()
    var id = this.getAttribute('data-target')
    var target = id && document.getElementById(id)
    if (!target) return
    // 不写 hash：docsify 用 hash 做路由，写进去会被当成新页面
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function onResize() {
    var nav = document.getElementById('toc-panel')
    if (!nav) return
    nav.classList.toggle('show', state.headings.length >= 2 && window.innerWidth >= MIN_WIDTH)
    updateProgress()
  }

  function install(hook) {
    hook.mounted(function () {
      ensureDom()
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onResize)
      onScroll()
    })
    hook.doneEach(build)
  }

  window.$docsify = window.$docsify || {}
  window.$docsify.plugins = [].concat(window.$docsify.plugins || [], install)
  // 供调试/外部脚本使用
  window.$tocPlugin = { build: build, update: function () { updateProgress(); updateActive() } }
})()
