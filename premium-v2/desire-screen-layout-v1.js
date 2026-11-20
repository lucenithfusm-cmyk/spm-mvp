/* Responsive presentation only. Clinical actions, values and persistence stay in each week's app. */
(function () {
  'use strict';

  const ART_WIDTH = 864;
  const ART_HEIGHT = 1536;
  const MIN_PHOTO_HEIGHT = 100;
  const ACTIVE_CLASS = 'spm-desire-screen-active';
  const OPEN_CLASS = 'spm-desire-options-open';
  const root = document.documentElement;
  let app;
  let observer;
  let active = null;
  let frame = 0;
  let viewportProbe;

  function px(value) { return `${Math.round(value * 10000) / 10000}px`; }

  function setStyle(node, property, value) {
    if (node.style.getPropertyValue(property) !== value) node.style.setProperty(property, value);
  }

  function photoFor(portrait) {
    const entry = window.SPM_DESIRE_PHOTO_LAYOUT?.[portrait.dataset.screen];
    if (!entry || typeof entry.src !== 'string' || !entry.src ||
        !Number.isFinite(entry.y) || !Number.isFinite(entry.height) ||
        entry.y <= 0 || entry.height <= 0 || entry.y + entry.height >= ART_HEIGHT) return null;
    return entry;
  }

  function makeNode(tag, className) {
    const node = document.createElement(tag);
    node.className = className;
    return node;
  }

  function ensureViewportProbe() {
    if (viewportProbe) return;
    viewportProbe = makeNode('div', 'spm-desire-viewport-probe');
    viewportProbe.setAttribute('aria-hidden', 'true');
    document.body.append(viewportProbe);
  }

  function viewport() {
    ensureViewportProbe();
    const style = getComputedStyle(viewportProbe);
    const visual = window.visualViewport;
    return {
      height: visual?.height || window.innerHeight || root.clientHeight,
      top: Math.max(0, visual?.offsetTop || 0),
      safeTop: parseFloat(style.paddingTop) || 0,
      safeBottom: parseFloat(style.paddingBottom) || 0
    };
  }

  // Read the original percentage coordinates once, before any responsive positioning.
  function rememberCoordinates(state, node, scale) {
    if (state.coordinates.has(node)) return state.coordinates.get(node);
    function originalY(value, fallback) {
      if (!value) return fallback;
      const number = parseFloat(value);
      if (!Number.isFinite(number)) return fallback;
      return value.endsWith('%') ? number * ART_HEIGHT / 100 : number / scale;
    }
    const entry = {
      topStyle: node.style.top,
      heightStyle: node.style.height,
      top: originalY(node.style.top, node.classList.contains('clock-tag') ? ART_HEIGHT * .76 : 0),
      height: node.style.height ? originalY(node.style.height, null) : null
    };
    state.coordinates.set(node, entry);
    return entry;
  }

  function updateLayout() {
    if (!active?.portrait.isConnected) return;
    const state = active;
    const width = state.portrait.getBoundingClientRect().width;
    if (!(width > 0)) return;
    const view = viewport();
    const scale = width / ART_WIDTH;
    const photo = state.photo;
    // A contextual note (the day 19 repeat) remains visible and consumes actual space.
    const noteHeight = [...app.children].filter(node => node.classList.contains('repeat-note'))
      .reduce((sum, node) => sum + node.getBoundingClientRect().height, 0);
    const topHeight = photo.y * scale;
    const bottomHeight = (ART_HEIGHT - photo.y - photo.height) * scale;
    const available = Math.max(0, view.height - view.safeTop - view.safeBottom - noteHeight);
    const photoHeight = Math.max(MIN_PHOTO_HEIGHT, available - topHeight - bottomHeight);
    const portraitHeight = topHeight + photoHeight + bottomHeight;
    const photoEnd = photo.y + photo.height;

    function mapY(y) {
      if (y <= photo.y) return y * scale;
      if (y >= photoEnd) return topHeight + photoHeight + (y - photoEnd) * scale;
      return topHeight + (y - photo.y) / photo.height * photoHeight;
    }

    setStyle(root, '--spm-desire-visible-height', px(view.height));
    setStyle(root, '--spm-desire-visual-top', px(view.top));
    setStyle(root, '--spm-desire-safe-top', px(view.safeTop));
    setStyle(root, '--spm-desire-safe-bottom', px(view.safeBottom));
    // The lower decorative corners stay clear of titles, CTAs and centered progress dots.
    setStyle(app, '--spm-desire-tools-top', px(view.safeTop + noteHeight + portraitHeight - 48));
    setStyle(state.portrait, '--spm-desire-screen-height', px(portraitHeight));
    setStyle(state.portrait, '--spm-desire-art-height', px(ART_HEIGHT * scale));
    setStyle(state.portrait, '--spm-desire-photo-top', px(topHeight));
    setStyle(state.portrait, '--spm-desire-photo-height', px(photoHeight));
    setStyle(state.portrait, '--spm-desire-photo-radius', px(24 * scale));
    setStyle(state.portrait, '--spm-desire-bottom-top', px(topHeight + photoHeight));
    setStyle(state.portrait, '--spm-desire-bottom-height', px(bottomHeight));
    setStyle(state.portrait, '--spm-desire-bottom-offset', px(-photoEnd * scale));

    state.portrait.querySelectorAll('.spm-layer, .clock-tag').forEach(node => {
      const original = rememberCoordinates(state, node, scale);
      setStyle(node, 'top', px(mapY(original.top)));
      if (original.height !== null) {
        setStyle(node, 'height', px(mapY(original.top + original.height) - mapY(original.top)));
      }
    });
  }

  function resourceIsOpen() {
    const resource = document.getElementById('resourceOverlay');
    return resource && !resource.hidden;
  }

  function closePanel(restoreFocus = true) {
    if (!active?.footer || !active.panelOpen) return;
    const state = active;
    state.panelOpen = false;
    state.footer.hidden = true;
    state.footer.removeAttribute('role');
    state.footer.removeAttribute('aria-modal');
    state.veil.hidden = true;
    state.options.setAttribute('aria-expanded', 'false');
    state.portrait.inert = state.portraitWasInert;
    if (state.statusbar) state.statusbar.inert = state.statusbarWasInert;
    root.classList.remove(OPEN_CLASS);
    if (restoreFocus && state.options.isConnected) state.options.focus({preventScroll: true});
  }

  function openPanel(focusTarget) {
    if (!active?.footer) return;
    const state = active;
    state.panelOpen = true;
    state.footer.hidden = false;
    state.footer.setAttribute('role', 'dialog');
    state.footer.setAttribute('aria-modal', 'true');
    state.veil.hidden = false;
    state.options.setAttribute('aria-expanded', 'true');
    state.portrait.inert = true;
    if (state.statusbar) state.statusbar.inert = true;
    root.classList.add(OPEN_CLASS);
    state.footer.scrollTop = 0;
    (focusTarget || state.closeButton).focus({preventScroll: true});
  }

  function preparePanel(state) {
    const footer = state.footer;
    if (!footer) return;
    state.footerOriginal = {
      hidden: footer.hidden,
      id: footer.getAttribute('id'),
      labelledby: footer.getAttribute('aria-labelledby')
    };
    footer.id = 'spm-desire-options-panel';
    footer.dataset.desirePanel = '';
    footer.setAttribute('aria-labelledby', 'spm-desire-options-title');
    footer.hidden = true;

    const header = makeNode('div', 'spm-desire-options-heading');
    const title = makeNode('h2', 'spm-desire-options-title');
    title.id = 'spm-desire-options-title';
    title.textContent = 'Opciones de la práctica';
    const close = makeNode('button', 'spm-desire-options-close');
    close.type = 'button';
    close.dataset.desireOptionsClose = '';
    close.setAttribute('aria-label', 'Cerrar opciones de la práctica');
    close.textContent = '×';
    header.append(title, close);
    footer.prepend(header);
    state.panelHeader = header;
    state.closeButton = close;

    // The counter belongs with the other auxiliary controls, not below the viewport.
    state.moved = [...app.children].filter(node => node.classList.contains('char-info'))
      .map(node => ({node, next: node.nextSibling}));
    state.moved.forEach(({node}) => footer.append(node));

    const options = makeNode('button', 'spm-desire-options-toggle');
    options.type = 'button';
    options.dataset.desireOptions = '';
    options.setAttribute('aria-label', 'Opciones de la práctica');
    options.setAttribute('title', 'Opciones de la práctica');
    options.setAttribute('aria-haspopup', 'dialog');
    options.setAttribute('aria-controls', footer.id);
    options.setAttribute('aria-expanded', 'false');
    options.innerHTML = '<span aria-hidden="true">⋯</span>';
    state.options = options;
    state.veil = makeNode('div', 'spm-desire-options-veil');
    state.veil.dataset.desireOptionsDismiss = '';
    state.veil.setAttribute('aria-hidden', 'true');
    state.veil.hidden = true;
    app.append(options, state.veil);
  }

  function createLayout(portrait, photo) {
    const backdrop = portrait.querySelector('img.backdrop');
    if (!backdrop) return null;
    const state = {
      portrait, photo, backdrop, coordinates: new Map(), seenConsents: new WeakSet(),
      footer: app.querySelector('.screen-footer'),
      statusbar: app.querySelector('.statusbar'),
      portraitWasInert: portrait.inert, panelOpen: false
    };
    state.statusbarWasInert = state.statusbar?.inert;
    const originalImage = `url(${JSON.stringify(backdrop.currentSrc || backdrop.src)})`;
    const top = makeNode('div', 'spm-desire-art spm-desire-art-top');
    const bottom = makeNode('div', 'spm-desire-art spm-desire-art-bottom');
    top.style.backgroundImage = originalImage;
    bottom.style.backgroundImage = originalImage;
    const photoBox = makeNode('div', 'spm-desire-photo');
    const fill = makeNode('img', 'spm-desire-photo-fill');
    const image = makeNode('img', 'spm-desire-photo-image');
    [fill, image].forEach(node => {
      node.src = photo.src;
      node.alt = '';
      node.draggable = false;
      node.decoding = 'async';
    });
    photoBox.append(fill, image);
    state.layers = [top, photoBox, bottom];
    state.layers.forEach(node => node.setAttribute('aria-hidden', 'true'));
    portrait.prepend(...state.layers);
    portrait.dataset.spmLayout = 'bands';
    root.classList.add(ACTIVE_CLASS);
    preparePanel(state);
    return state;
  }

  function restoreAttribute(node, name, value) {
    if (value === null) node.removeAttribute(name);
    else node.setAttribute(name, value);
  }

  function clearLayout() {
    if (!active) return;
    closePanel(false);
    const state = active;
    state.layers.forEach(node => node.remove());
    state.coordinates.forEach((original, node) => {
      node.style.top = original.topStyle;
      node.style.height = original.heightStyle;
    });
    delete state.portrait.dataset.spmLayout;
    Array.from(state.portrait.style).filter(name => name.startsWith('--spm-desire-'))
      .forEach(name => state.portrait.style.removeProperty(name));
    if (state.footer) {
      state.panelHeader.remove();
      state.options.remove();
      state.veil.remove();
      delete state.footer.dataset.desirePanel;
      state.footer.hidden = state.footerOriginal.hidden;
      restoreAttribute(state.footer, 'id', state.footerOriginal.id);
      restoreAttribute(state.footer, 'aria-labelledby', state.footerOriginal.labelledby);
      state.moved.forEach(({node, next}) => {
        if (state.footer.isConnected) app.insertBefore(node, next?.parentNode === app ? next : null);
      });
    }
    app.style.removeProperty('--spm-desire-tools-top');
    root.classList.remove(ACTIVE_CLASS, OPEN_CLASS);
    ['--spm-desire-visible-height', '--spm-desire-visual-top', '--spm-desire-safe-top', '--spm-desire-safe-bottom']
      .forEach(name => root.style.removeProperty(name));
    active = null;
  }

  function showPendingConsent() {
    if (!active?.footer) return;
    const pending = [...active.footer.querySelectorAll('.partner-confirm input[type="checkbox"]')]
      .find(input => !input.checked && !active.seenConsents.has(input));
    if (pending) {
      active.seenConsents.add(pending);
      openPanel(pending);
    }
  }

  function reconcile() {
    frame = 0;
    // Own layer/panel insertions are synchronous and are not app renders.
    observer.disconnect();
    try {
      const portrait = app.querySelector('.portrait[data-screen]');
      const photo = portrait && photoFor(portrait);
      if (!portrait || !photo) {
        clearLayout();
        return;
      }
      if (!active || active.portrait !== portrait || active.photo !== photo) {
        clearLayout();
        active = createLayout(portrait, photo);
      }
      updateLayout();
      showPendingConsent();
    } finally {
      observer.observe(app, {childList: true, subtree: true});
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(reconcile);
  }

  function onClick(event) {
    if (!active || !(event.target instanceof Element)) return;
    if (event.target.closest('[data-desire-options]') === active.options) {
      if (active.panelOpen) closePanel();
      else openPanel();
    } else if (event.target.closest('[data-desire-options-close], [data-desire-options-dismiss]')) {
      closePanel();
    } else if (active.panelOpen && resourceIsOpen()) {
      // The existing resource dialog owns focus and Escape while it is open.
      closePanel(false);
    }
  }

  function onKeydown(event) {
    if (!active?.panelOpen || resourceIsOpen() || event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...active.footer.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
    )].filter(node => node.getClientRects().length && !node.closest('[inert]'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first) return;
    const focus = document.activeElement;
    if (!active.footer.contains(focus) || (event.shiftKey && focus === first) || (!event.shiftKey && focus === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  }

  function init() {
    app = document.getElementById('app');
    if (!app) return;
    observer = new MutationObserver(records => {
      // Timer/count text updates need no layout work. New elements and app renders do.
      if (records.some(record => [...record.addedNodes, ...record.removedNodes]
        .some(node => node.nodeType === Node.ELEMENT_NODE))) schedule();
    });
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('resize', schedule, {passive: true});
    window.visualViewport?.addEventListener('resize', schedule, {passive: true});
    window.visualViewport?.addEventListener('scroll', schedule, {passive: true});
    reconcile();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
}());
