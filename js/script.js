document.addEventListener('DOMContentLoaded', function() {
  initBreadcrumb();
  initSidebarNav();
  initFooterNav();
  initTouchSupport();
  initCarousel();
  initVR();
  initDropdown();
});

/* ===== 面包屑导航 ===== */
function initBreadcrumb() {
  var breadcrumb = document.querySelector('.breadcrumb');
  if (!breadcrumb) return;

  var currentPath = window.location.pathname.replace(/\\/g, '/');
  var projectRootIndex = currentPath.indexOf('XiaotangCommunity');
  if (projectRootIndex !== -1) {
    currentPath = currentPath.substring(projectRootIndex + 'XiaotangCommunity'.length);
  }

  var parts = currentPath.split('/').filter(function(p) {
    return p && !p.includes('.html');
  });

  var links = [];
  var jsonLdItems = [{
    '@type': 'ListItem',
    position: 1,
    name: '首页',
    item: window.location.origin + '/index.html'
  }];

  if (parts.length > 0) {
    var currentLink = '';
    parts.forEach(function(part, index) {
      currentLink += '/' + part;
      var decodedPart = decodeURIComponent(part);
      var label = getPageLabel(decodedPart);
      var isLast = index === parts.length - 1;
      var fullPath = window.location.origin + currentLink + (isLast ? '' : '/index.html');

      if (isLast) {
        links.push('<span aria-current="page">' + label + '</span>');
      } else {
        links.push('<a href="' + currentLink + '/index.html">' + label + '</a>');
      }

      jsonLdItems.push({
        '@type': 'ListItem',
        position: index + 2,
        name: label,
        item: fullPath
      });
    });
  }

  breadcrumb.innerHTML = links.join(' <span aria-hidden="true">›</span> ');
  breadcrumb.setAttribute('aria-label', '面包屑导航');

  var jsonLd = document.createElement('script');
  jsonLd.type = 'application/ld+json';
  jsonLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: jsonLdItems
  });
  document.head.appendChild(jsonLd);
}

function getPageLabel(part) {
  var labels = {
    'map': '地图总览',
    'library': '读书驿站',
    'exhibition': '物品展',
    '1-origin': '开村纪事',
    '2-family': '氏族谱系',
    '3-famous': '历史名人',
    '1-milestones': '世纪回响',
    '1-education': '兴学兴业',
    '2-economy': '集体经济',
    '1-intro': '开篇总述',
    '2-infrastructure': '基础设施',
    '3-services': '民生服务',
    '4-governance': '治理创新',
    '5-culture': '文体生活',
    '6-architecture': '建筑遗存',
    '7-honors': '荣誉榜',
    '8-future': '未来展望',
    '1-nature': '物华天宝',
    '2-culture': '文脉赓续',
    '3-people': '人物风流',
    '4-arts': '艺海拾贝'
  };
  return labels[part] || part;
}

/* ===== 侧边导航 ===== */
function initSidebarNav() {
  var sidebar = document.querySelector('.sidebar-nav');
  if (!sidebar) return;

  sidebar.setAttribute('aria-label', '侧边导航');

  var items = sidebar.querySelectorAll('.sidebar-nav-item');
  var currentPath = window.location.pathname.replace(/\\/g, '/');
  var currentFileName = currentPath.substring(currentPath.lastIndexOf('/') + 1);

  items.forEach(function(item) {
    var href = item.getAttribute('href');
    var hrefFileName = href.substring(href.lastIndexOf('/') + 1);

    item.setAttribute('role', 'menuitem');
    item.setAttribute('tabindex', '0');

    if (currentFileName === hrefFileName) {
      item.classList.add('active');
      item.setAttribute('aria-current', 'page');
    }
  });
}

/* ===== 底部导航高亮 ===== */
function initFooterNav() {
  var footerNav = document.querySelector('.footer-nav');
  if (!footerNav) return;

  footerNav.setAttribute('role', 'navigation');
  footerNav.setAttribute('aria-label', '底部导航');

  var items = footerNav.querySelectorAll('.footer-nav-item');
  var currentPath = window.location.pathname.replace(/\\/g, '/');

  var villagePages = ['index.html', 'ting-entrance.html', 'front-hall.html', 'middle-hall.html', 'back-hall.html'];
  var isVillagePage = villagePages.some(function(page) {
    return currentPath.endsWith('/' + page) || currentPath.endsWith(page);
  });

  items.forEach(function(item) {
    item.classList.remove('active');
    item.removeAttribute('aria-current');

    var href = item.getAttribute('href');
    if (href && currentPath.includes(href)) {
      item.classList.add('active');
      item.setAttribute('aria-current', 'page');
    }
  });

  var villageBtn = document.getElementById('villageDropdownBtn');
  if (villageBtn) {
    villageBtn.classList.remove('active');
    if (isVillagePage) {
      villageBtn.classList.add('active');
    }
  }

  var middleHallPages = ['middle-hall.html', 'middle-hall-preface.html', 'middle-hall-ch1.html',
    'middle-hall-ch2.html', 'middle-hall-main-wall.html', 'middle-hall-ch3.html',
    'middle-hall-ch4.html', 'middle-hall-famous-people.html', 'middle-hall-leaders.html',
    'middle-hall-references.html', 'middle-hall-conclusion.html'];
  var isMiddleHallPage = middleHallPages.some(function(page) {
    return currentPath.endsWith('/' + page) || currentPath.endsWith(page);
  });
  var subLinks = document.querySelectorAll('.footer-dropdown-submenu .footer-dropdown-item');
  subLinks.forEach(function(link) {
    link.classList.remove('active');
    var href = link.getAttribute('href');
    if (href && currentPath.includes(href)) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
  var middleTrigger = document.querySelector('.footer-dropdown-trigger');
  if (middleTrigger && isMiddleHallPage) {
    middleTrigger.classList.add('active');
  }
}

/* ===== 村史馆下拉菜单（含中厅二级嵌套） ===== */
function initDropdown() {
  var btn = document.getElementById('villageDropdownBtn');
  var menu = document.getElementById('villageDropdownMenu');
  if (!btn || !menu) return;

  var nestedTrigger = menu.querySelector('.footer-dropdown-trigger');
  var submenu = menu.querySelector('.footer-dropdown-submenu');

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var isOpen = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (!isOpen && submenu) {
      submenu.classList.remove('open');
      if (nestedTrigger) nestedTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  if (nestedTrigger && submenu) {
    nestedTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var isSubOpen = submenu.classList.toggle('open');
      nestedTrigger.setAttribute('aria-expanded', isSubOpen ? 'true' : 'false');
    });
  }

  document.addEventListener('click', function(e) {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      if (submenu) {
        submenu.classList.remove('open');
        if (nestedTrigger) nestedTrigger.setAttribute('aria-expanded', 'false');
      }
    } else if (submenu && !submenu.contains(e.target) && nestedTrigger && !nestedTrigger.contains(e.target)) {
      submenu.classList.remove('open');
      if (nestedTrigger) nestedTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (submenu && submenu.classList.contains('open')) {
        submenu.classList.remove('open');
        if (nestedTrigger) nestedTrigger.setAttribute('aria-expanded', 'false');
      } else {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

/* ===== 入口卡片键盘支持 ===== */
function initTouchSupport() {
  var cards = document.querySelectorAll('.entry-card');
  cards.forEach(function(card) {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var href = card.getAttribute('data-href');
        if (href) {
          window.location.href = href;
        }
      }
    });
  });
}

/* ===== 轮播图统一初始化 ===== */
function initCarousel() {
  var carousels = document.querySelectorAll('.carousel');
  carousels.forEach(function(carousel) {
    var track = carousel.querySelector('.carousel-track');
    var slides = carousel.querySelectorAll('.carousel-slide');
    var prevBtn = carousel.querySelector('.carousel-btn.prev');
    var nextBtn = carousel.querySelector('.carousel-btn.next');
    var dotsContainer = carousel.querySelector('.carousel-dots');
    if (!track || slides.length === 0 || !dotsContainer) return;

    var totalSlides = slides.length;
    var currentIndex = 0;

    // 创建指示点
    for (var i = 0; i < totalSlides; i++) {
      var dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'button');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-label', '第' + (i + 1) + '张');
      dotsContainer.appendChild(dot);
    }

    var dots = dotsContainer.querySelectorAll('.carousel-dot');

    function updateCarousel() {
      track.scrollTo({ left: currentIndex * track.clientWidth, behavior: 'smooth' });
      dots.forEach(function(dot, idx) {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateCarousel();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateCarousel();
    }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // 指示点点击
    dots.forEach(function(dot, idx) {
      dot.addEventListener('click', function() {
        currentIndex = idx;
        updateCarousel();
      });
    });

    // 触摸滑动
    var touchStartX = 0;
    track.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', function(e) {
      var touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 50) {
        nextSlide();
      } else if (touchEndX > touchStartX + 50) {
        prevSlide();
      }
    });
  });
}

/* ===== 工具函数 ===== */
function goBack() {
  window.history.back();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleFontSize() {
  var html = document.documentElement;
  var currentSize = parseFloat(window.getComputedStyle(html).fontSize);

  if (currentSize >= 24) {
    html.style.fontSize = '16px';
  } else {
    html.style.fontSize = (currentSize + 2) + 'px';
  }
}

/* ===== VR 全景嵌入 ===== */
function initVR() {
  var iframe = document.getElementById('vrIframe');
  var openNewBtn = document.getElementById('vrOpenNew');
  if (!iframe) return;

  var vrUrl = 'https://realsee.cn/WQYRoNgV?entry=share&wssid=daef904cf22c4e8b98aad09ca624a706&wstsp=1785818323038&wssig=1DECBE240DD9D33A91DEE9CE8BF071F1&open_app_id=Gq9g8lMqd43lXOvE&_start_live=1&shareCode=EgvAR1yA';

  if (vrUrl === 'YOUR_WECHAT_ARTICLE_URL_HERE') {
    var loading = document.getElementById('vrLoading');
    if (loading) {
      loading.innerHTML = '<div style="text-align:center;color:var(--color-text);"><div style="font-size:3rem;margin-bottom:1rem;">📱</div><div style="font-weight:600;margin-bottom:0.5rem;">请替换公众号文章链接</div><div style="font-size:var(--font-size-sm);color:var(--color-text-muted);">打开 js/script.js，将 YOUR_WECHAT_ARTICLE_URL_HERE 替换为你的公众号文章链接</div></div>';
      loading.style.display = 'flex';
      loading.style.flexDirection = 'column';
      loading.style.justifyContent = 'center';
    }
    return;
  }

  iframe.src = vrUrl;

  if (openNewBtn) {
    openNewBtn.href = vrUrl;
  }
}