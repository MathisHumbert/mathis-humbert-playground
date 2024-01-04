import '../styles/index.scss';
import './utils/polyfill';
import './utils/scroll';

import FontFaceObserver from 'fontfaceobserver';
import AutoBind from 'auto-bind';
import NormalizeWheel from 'normalize-wheel';
import { each } from 'lodash';

import Home from './pages/Home';
import About from './pages/About';
import Preloader from './components/Preloader';
import Navigation from './components/Navigation';
import Canvas from './components/Canvas';

class App {
  constructor() {
    this.template = window.location.pathname;

    AutoBind(this);

    this.init();
  }

  init() {
    this.createCanvas();
    this.createPreloader();
    this.createPages();
    this.createNavigation();

    this.addEventListeners();
    this.addLinkListeners();
  }

  createCanvas() {
    this.canvas = new Canvas({ template: this.template });
  }

  createPreloader() {
    this.preloader = new Preloader();

    this.preloader.once('loaded', this.onPreloaded);
  }

  createPages() {
    this.home = new Home();
    this.about = new About();

    this.pages = {
      '/': this.home,
      '/about': this.about,
    };

    if (this.template !== '/' && this.template.endsWith('/')) {
      this.template = this.template.slice(0, -1);
    }

    this.page = this.pages[this.template];
  }

  createNavigation() {
    this.navigation = new Navigation({ template: this.template });
  }

  /**
   * Events.
   */
  onPreloaded() {
    this.onResize();

    this.update();

    this.canvas.onPreloaded();

    this.page.show();

    this.navigation.show();
  }

  onPopState() {
    this.onChange({
      url: window.location.pathname,
      push: false,
    });
  }

  async onChange({ url, push = true }) {
    url = url.replace(window.location.origin, '');

    const page = this.pages[url];

    this.canvas.onChangeStart();

    await this.page.hide();

    if (push) {
      window.history.pushState({}, '', url);
    }

    this.template = window.location.pathname;

    this.navigation.onChange(this.template);

    this.canvas.onChangeEnd(this.template, true);

    this.page = page;
    this.page.show();

    this.onResize();
  }

  onResize() {
    if (this.page && this.page.onResize) {
      this.page.onResize();
    }

    window.requestAnimationFrame(() => {
      if (this.canvas && this.canvas.onResize) {
        this.canvas.onResize();
      }
    });
  }

  onTouchDown(event) {
    if (this.canvas && this.canvas.onTouchDown) {
      this.canvas.onTouchDown(event);
    }

    if (this.page && this.page.onTouchDown) {
      this.page.onTouchDown(event);
    }
  }

  onTouchMove(event) {
    if (this.canvas && this.canvas.onTouchMove) {
      this.canvas.onTouchMove(event);
    }

    if (this.page && this.page.onTouchDown) {
      this.page.onTouchMove(event);
    }
  }

  onTouchUp(event) {
    if (this.canvas && this.canvas.onTouchUp) {
      this.canvas.onTouchUp(event);
    }

    if (this.page && this.page.onTouchDown) {
      this.page.onTouchUp(event);
    }
  }

  onWheel(event) {
    const normalizedWheel = NormalizeWheel(event);

    if (this.canvas && this.canvas.onWheel) {
      this.canvas.onWheel(normalizedWheel);
    }

    if (this.page && this.page.onWheel) {
      this.page.onWheel(normalizedWheel);
    }
  }

  /**
   * Loop.
   */
  update() {
    if (this.page) {
      this.page.update();
    }

    if (this.canvas && this.canvas.update) {
      this.canvas.update(this.page.scroll);
    }

    window.requestAnimationFrame(this.update.bind(this));
  }

  /***
   * Listeners.
   */
  addEventListeners() {
    window.addEventListener('popstate', this.onPopState, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });

    window.addEventListener('mousedown', this.onTouchDown, {
      passive: true,
    });
    window.addEventListener('mousemove', this.onTouchMove, {
      passive: true,
    });
    window.addEventListener('mouseup', this.onTouchUp, { passive: true });

    window.addEventListener('touchstart', this.onTouchDown, {
      passive: true,
    });
    window.addEventListener('touchmove', this.onTouchMove, {
      passive: true,
    });
    window.addEventListener('touchend', this.onTouchUp, { passive: true });

    window.addEventListener('wheel', this.onWheel, { passive: true });
  }

  addLinkListeners() {
    const links = document.querySelectorAll('a');

    each(links, (link) => {
      const isLocal = link.href.indexOf(window.location.origin) > -1;
      const isAnchor = link.href.indexOf('#') > -1;

      const isNotEmail = link.href.indexOf('mailto') === -1;
      const isNotPhone = link.href.indexOf('tel') === -1;

      if (isLocal) {
        link.onclick = (event) => {
          event.preventDefault();

          if (!isAnchor) {
            this.onChange({
              url: link.href,
            });
          }
        };
      } else if (isNotEmail && isNotPhone) {
        link.rel = 'noopener';
        link.target = '_blank';
      }
    });
  }
}

console.log('pwa app 3');

const satoshiFont = new FontFaceObserver('Satoshi');
const bebasNeueFont = new FontFaceObserver('Bebas Neue');

Promise.all([satoshiFont.load(), bebasNeueFont.load()])
  .then(() => new App())
  .catch(() => new App());
