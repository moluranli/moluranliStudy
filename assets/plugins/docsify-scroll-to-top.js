// 配置图标URL
const IMAGE_URL = {
    'arrow-up-1': 'https://unpkg.com/@zhg-x/resources@1.0.0/assets/images/arrow-up-1.png',
    'arrow-up-2': 'https://unpkg.com/@zhg-x/resources@1.0.0/assets/images/arrow-up-2.png',
};
const CONFIG = {
    auto: true,
    text: 'Top',
    icon: 'arrow-up-1',
    right: 15,
    bottom: 15,
    width: 50,
    height: 40,
    offset: 500
};

const pluginFunction = function (hook, vm) {
    let options = {};
    if (Object.prototype.toString.call(vm.config.scrollToTop) === '[object Object]') {
        const opts = vm.config.scrollToTop;
        options.auto = typeof opts.auto === 'boolean' ? opts.auto : CONFIG.auto;
        options.text = opts.text && typeof opts.text === 'string' ? opts.text : '';
        options.icon = opts.icon && typeof opts.icon === 'string' ? opts.icon : '';
        // 若文本项和图标项都没有配置，则使用默认配置中的文本文字
        if (!options.text && !options.icon) {
            options.text = CONFIG.text;
        }
        options.right = opts.right && typeof opts.right === 'number' ? opts.right : CONFIG.right;
        options.bottom = opts.bottom && typeof opts.bottom === 'number' ? opts.bottom : CONFIG.bottom;
        options.width = opts.width && typeof opts.width === 'number' ? opts.width : CONFIG.width;
        options.height = opts.height && typeof opts.height === 'number' ? opts.height : CONFIG.height;
        options.offset = opts.offset && typeof opts.offset === 'number' ? opts.offset : CONFIG.offset;
    } else {
        options = CONFIG;
    }
    const onScroll = function () {
        if (!options.auto) {
            return;
        }
        const offset = window.document.documentElement.scrollTop;
        const $scrollBtn = Docsify.dom.find('div.scroll-to-top');
        $scrollBtn.style.display = offset >= options.offset ? "block" : "none";
    };

    hook.mounted(function () {
        const scrollBtn = document.createElement('div'); // 创建元素节点
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.style.display = options.auto ? 'none' : 'block';
        scrollBtn.style.overflow = 'hidden';
        scrollBtn.style.position = 'fixed';
        scrollBtn.style.right = options.right + 'px';
        scrollBtn.style.bottom = options.bottom + 'px';
        scrollBtn.style.width = options.width + 'px';
        scrollBtn.style.height = options.height + 'px';
        scrollBtn.style.lineHeight = options.height + 'px';
        scrollBtn.style.background = 'white';
        scrollBtn.style.color = '#666';
        scrollBtn.style.border = '1px solid #ddd';
        scrollBtn.style.borderRadius = '4px';
        scrollBtn.style.fontSize = '16px';
        scrollBtn.style.textAlign = 'center';
        scrollBtn.style.boxShadow = '0px 0px 6px #eee';
        scrollBtn.style.cursor = 'pointer';

        let contentTag;
        if (options.text) {
            contentTag = document.createTextNode(options.text); // 创建文本节点
        } else {
            contentTag = document.createElement('img');
            contentTag.style.height = '40px';
            contentTag.src = IMAGE_URL[options.icon];
        }
        scrollBtn.appendChild(contentTag);
        document.body.appendChild(scrollBtn);
        window.addEventListener('scroll', onScroll);
        scrollBtn.onclick = function (e) {
            e.stopPropagation();
            const step = 50;
            const timer = setInterval(function () {
                const diff = window.scrollY - step;
                if (diff > 0) {
                    window.scrollTo(0, window.scrollY - step);
                } else {
                    window.scrollTo(0, 0);
                    clearInterval(timer);
                }
            });
        };
    });
};

if ($docsify.plugins && Array.isArray($docsify.plugins)) {
    $docsify.plugins.push(pluginFunction);
} else {
    $docsify.plugins = [pluginFunction];
}
