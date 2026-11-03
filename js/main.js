/* 大樸實業官網：GSAP 動畫（ScrollTrigger + ScrollToPlugin）
 * 沒載入 GSAP、或使用者偏好減少動態時，網站維持原本靜態樣式。 */
(function () {
  var html = document.documentElement;
  // true：遵守系統「減少動態效果」設定（只做淡入）；false：一律顯示完整動畫
  var RESPECT_REDUCED_MOTION = false;
  var reduce = RESPECT_REDUCED_MOTION && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || !window.ScrollTrigger) { html.classList.remove('js'); return; }
  window.__siteReady = true;

  // 系統開啟「減少動態效果」時：只做淡入，不位移、不視差、不縮放
  if (reduce) {
    html.classList.remove('js'); // 主視覺不隱藏、直接顯示
    gsap.registerPlugin(ScrollTrigger);
    var softSel = '.collage img, .feature .tab, .feature-text > *, .feature-img, .slider, .value-card, .steps li, .feats img, #future .center > *, #contact .split .text > *, #contact .form > *';
    var softEls = Array.prototype.slice.call(document.querySelectorAll(softSel));
    gsap.set(softEls, { autoAlpha: 0 });
    ScrollTrigger.batch(softEls, {
      start: 'top 92%', once: true,
      onEnter: function (b) { gsap.to(b, { autoAlpha: 1, duration: 0.7, stagger: 0.06, ease: 'power1.out', overwrite: true }); }
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { gsap.set(softEls, { autoAlpha: 1 }); }, 6000); // 保險：6 秒後一律顯示
    return;
  }

  try {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    gsap.defaults({ ease: 'power3.out', duration: 1 });
    html.style.scrollBehavior = 'auto'; // 錨點捲動改由 GSAP 負責

    var header = document.querySelector('.site-header');
    var menuToggle = document.getElementById('menu-toggle');
    var q = function (s, r) { return (r || document).querySelector(s); };
    var qa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

    /* ---------- 首頁主視覺 ---------- */
    var heroImg = q('.hero-img img');
    var tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo(heroImg, { scale: 1.3, autoAlpha: 0 }, { scale: 1.15, autoAlpha: 1, duration: 2.2, ease: 'power2.out' }, 0)
      .fromTo('.hero-text > *', { y: 36, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.14, immediateRender: false }, 0.5);

    // 視差：往下捲時背景慢慢位移
    gsap.to(heroImg, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    /* ---------- 導覽列：向下捲動收起、向上捲動出現 ---------- */
    ScrollTrigger.create({
      start: 10, end: 'max',
      toggleClass: { targets: header, className: 'scrolled' }
    });
    var hidden = false;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        if (menuToggle && menuToggle.checked) return;
        var y = self.scroll();
        var shouldHide = self.direction === 1 && y > 240;
        var shouldShow = self.direction === -1 || y <= 240;
        if (shouldHide && !hidden) { hidden = true; gsap.to(header, { yPercent: -100, duration: 0.5, overwrite: 'auto' }); }
        else if (shouldShow && hidden) { hidden = false; gsap.to(header, { yPercent: 0, duration: 0.5, overwrite: 'auto' }); }
      }
    });

    /* ---------- 通用：進入視窗時依序浮現 ---------- */
    function batchUp(sel, o) {
      o = o || {};
      var els = qa(sel);
      if (!els.length) return;
      gsap.set(els, { autoAlpha: 0, y: o.y == null ? 50 : o.y, scale: o.scale || 1 });
      ScrollTrigger.batch(els, {
        start: o.start || 'top 88%', once: true,
        onEnter: function (batch) {
          gsap.to(batch, { autoAlpha: 1, y: 0, scale: 1, duration: o.duration || 1.1, stagger: o.stagger == null ? 0.12 : o.stagger, overwrite: true });
        }
      });
    }

    /* 大樸之道：拼貼 */
    var collage = q('.collage');
    if (collage) {
      var tiles = qa('.collage img');
      gsap.set(tiles, { autoAlpha: 0, y: 60, scale: 0.94 });
      gsap.to(tiles, {
        autoAlpha: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.15,
        scrollTrigger: { trigger: collage, start: 'top 80%', once: true }
      });
      // 山水素材輕微漂移（視差）
      gsap.fromTo('.c-sansui1', { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: collage, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.fromTo('.c-sansui2', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: collage, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    }

    /* 大智如愚 / 復歸於樸 / 成就不凡：色塊 + 文字 + 照片 */
    qa('.feature').forEach(function (f) {
      var rev = f.classList.contains('reverse');
      var tab = q('.tab', f), txt = qa('.feature-text > *', f), glyph = q('.glyph', f);
      var pic = q('.feature-img', f) || q('.slider', f);
      var t = gsap.timeline({ scrollTrigger: { trigger: f, start: 'top 75%', once: true } });
      gsap.set(tab, { scaleX: 0, transformOrigin: rev ? 'right center' : 'left center' });
      gsap.set(txt, { autoAlpha: 0, y: 34 });
      if (glyph) gsap.set(glyph, { scale: 0.7, transformOrigin: rev ? 'right bottom' : 'left bottom' });
      gsap.set(pic, { autoAlpha: 0, clipPath: rev ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' });
      t.to(tab, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, 0)
       .to(pic, { autoAlpha: 1, clipPath: 'inset(0 0% 0 0%)', duration: 1.4, ease: 'power3.inOut' }, 0.1)
       .to(txt, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.14 }, 0.3);
      if (glyph) t.to(glyph, { scale: 1, duration: 1.2, ease: 'back.out(1.6)' }, 0.35);
    });

    /* 從土地本質：照片視差 + 卡片上浮 */
    var vImg = q('.value .pic img');
    if (vImg) {
      gsap.set(vImg, { scale: 1.18 });
      gsap.fromTo(vImg, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.value', start: 'top bottom', end: 'bottom top', scrub: true } });
    }
    var vCard = q('.value-card');
    if (vCard) {
      gsap.set(vCard, { autoAlpha: 0, y: 90 });
      gsap.to(vCard, { autoAlpha: 1, y: 0, duration: 1.3, scrollTrigger: { trigger: vCard, start: 'top 88%', once: true } });
    }

    /* 洞悉價值：卡片依序浮現，圖示彈出 */
    var steps = qa('.steps li');
    if (steps.length) {
      batchUp('.steps li', { y: 70, stagger: 0.15, duration: 1.2 });
      steps.forEach(function (li) {
        var ic = q('.icon img', li);
        gsap.set(ic, { scale: 0.3, autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: li, start: 'top 85%', once: true,
          onEnter: function () { gsap.to(ic, { scale: 1, autoAlpha: 1, duration: 0.9, delay: 0.35, ease: 'back.out(2)' }); }
        });
      });
    }

    /* 成就不凡：業績照片 */
    batchUp('.feats img', { y: 70, scale: 0.94, stagger: 0.12, duration: 1.2, start: 'top 92%' });

    /* 共築未來 */
    batchUp('#future .center > *', { y: 40, stagger: 0.12, start: 'top 85%' });

    /* 聯絡我們 */
    batchUp('#contact .split .text > *', { y: 40, stagger: 0.12, start: 'top 85%' });
    batchUp('#contact .form > *', { y: 30, stagger: 0.08, duration: 0.9, start: 'top 90%' });

    /* 頁尾 */
    batchUp('.site-footer .container > *', { y: 20, stagger: 0.1, duration: 0.9, start: 'top 98%' });

    /* ---------- 錨點平滑捲動 ---------- */
    qa('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        var target = id === '#top' || id === '#' ? null : q(id);
        if (id !== '#top' && id !== '#' && !target) return;
        e.preventDefault();
        if (menuToggle) menuToggle.checked = false;
        gsap.to(window, {
          scrollTo: { y: target || 0, offsetY: target ? header.offsetHeight - 1 : 0, autoKill: true },
          duration: 1.4, ease: 'power3.inOut'
        });
        if (history.replaceState) history.replaceState(null, '', id);
      });
    });

    /* ---------- 保險：主視覺若 6 秒後仍看不見，強制顯示 ---------- */
    setTimeout(function () {
      qa('.hero-img img, .hero-text > *').forEach(function (e) {
        var cs = getComputedStyle(e);
        if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) gsap.set(e, { autoAlpha: 1 });
      });
    }, 6000);

    /* ---------- 版面變動後重新計算 ---------- */
    var rt;
    document.addEventListener('load', function (e) {
      if (e.target && e.target.tagName === 'IMG') { clearTimeout(rt); rt = setTimeout(function () { ScrollTrigger.refresh(); }, 150); }
    }, true);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  } catch (err) {
    console.error('GSAP init failed:', err);
    html.classList.remove('js');
    gsap.killTweensOf('*');
    ScrollTrigger.getAll().forEach(function (s) { s.kill(); });
    document.querySelectorAll('[style]').forEach(function (el) { el.style.removeProperty('visibility'); el.style.removeProperty('opacity'); el.style.removeProperty('clip-path'); el.style.removeProperty('transform'); });
  }
})();
