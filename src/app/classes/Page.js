import autoBind from 'auto-bind';
import EventEmitter from 'events';
import { each } from 'lodash';
import Prefix from 'prefix';
import gsap from 'gsap';

import AsyncLoad from './AsyncLoad';
import { Detection } from '../classes/Detection';
import { clamp, lerp } from '../utils/math';
import { mapEach } from '../utils/dom';
import { smooth } from '../utils/easing';
import { COLOR_CARARRA, COLOR_COD_GRAY } from '../utils/color';

export default class Page extends EventEmitter {
  constructor({ classes, id, element, elements, isScrollable = true }) {
    super();

    autoBind(this);

    this.classes = { ...classes };
    this.id = id;
    this.selectors = {
      element,
      elements: {
        preloaders: '[data-src]',

        ...elements,
      },
    };
    this.isScrollable = isScrollable;

    this.scroll = {
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
      velocity: 0,
      ease: 0.07,
    };

    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.transformPrefix = Prefix('transform');

    this.isVisible = false;

    this.create();
  }

  create() {
    this.animations = [];

    this.element = document.querySelector(this.selectors.element);
    this.elements = {};

    each(this.selectors.elements, (selector, key) => {
      if (
        selector instanceof window.HTMLElement ||
        selector instanceof window.NodeList
      ) {
        this.elements[key] = selector;
      } else if (Array.isArray(selector)) {
        this.elements[key] = selector;
      } else {
        this.elements[key] = this.element.querySelectorAll(selector);

        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else if (this.elements[key].length === 1) {
          this.elements[key] = this.element.querySelector(selector);
        }
      }
    });

    if (this.isScrollable) {
      this.scroll = {
        position: 0,
        current: 0,
        target: 0,
        limit: this.elements.wrapper.clientHeight - this.screen.height,
        velocity: 0,
        ease: 0.07,
      };
    }

    this.createAnimations();
    this.createObserver();
    this.createPreloaders();
  }

  /**
   * Animations.
   */
  createAnimations() {}

  /**
   * Observer.
   */
  createObserver() {
    this.observer = new window.ResizeObserver((entries) => {
      let shouldUpdateLimit = false;

      for (const _entry of entries) {
        if (_entry.target === this.elements.wrapper) {
          shouldUpdateLimit = true;
          break;
        }
      }

      if (shouldUpdateLimit) {
        window.requestAnimationFrame(() => {
          this.scroll.limit =
            this.elements.wrapper.clientHeight - this.screen.height;
        });
      }
    });

    this.observer.observe(this.elements.wrapper);
  }

  /**
   * Loader.
   */
  createPreloaders() {
    this.preloaders = mapEach(
      this.elements.preloaders,
      (element) =>
        new AsyncLoad({
          element,
        })
    );
  }

  /**
   * Animations.
   */
  reset() {
    this.scroll = {
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
      velocity: 0,
      ease: 0.07,
    };
  }

  set(value) {
    this.scroll.current = this.scroll.target = this.scroll.last = value;

    this.transform(this.elements.wrapper, this.scroll.current);
  }

  show() {
    this.reset();

    each(this.animations, (animation) => animation.createAnimation());

    gsap.to(
      document.documentElement,
      {
        backgroundColor: COLOR_COD_GRAY,
        color: COLOR_CARARRA,
        duration: 0.7,
        ease: smooth,
      },
      0
    );
    gsap.to(this.element, { autoAlpha: 1, duration: 0.7, ease: smooth }, 0);

    this.isVisible = true;

    this.addEventListeners();
  }

  hide() {
    this.isVisible = false;

    this.removeEventListeners();

    each(this.animations, (animation) => animation.destroyAnimation());

    return new Promise((res) => {
      gsap.to(this.element, {
        autoAlpha: 0,
        duration: 0.7,
        ease: smooth,
        onComplete: () => {
          res();
          each(this.animations, (animation) => animation.destroyAnimation());
        },
      });
    });
  }

  transform(element, y) {
    element.style[this.transformPrefix] = `translate3d(0, ${-Math.round(
      y
    )}px, 0)`;
  }

  /**
   * Events.
   */
  onResize() {
    if (!this.elements.wrapper) return;

    this.screen.width = window.innerWidth;
    this.screen.height = window.innerHeight;

    window.requestAnimationFrame(() => {
      this.scroll.limit =
        this.elements.wrapper.clientHeight - this.screen.height;

      each(this.animations, (animation) => {
        if (animation.onResize) {
          animation.onResize();
        }
      });
    });
  }

  onTouchDown(event) {
    if (!Detection.isMobile || !this.isVisible) return;

    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientY : event.clientY;
  }

  onTouchMove(event) {
    if (!Detection.isMobile || !this.isDown || !this.isVisible) return;

    const y = event.touches ? event.touches[0].clientY : event.clientY;
    const distance = (this.start - y) * 3;

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    if (!Detection.isMobile || !this.isVisible) return;

    this.isDown = false;
  }

  onWheel(normalized) {
    if (!this.isVisible) return;

    const speed = normalized.pixelY * 0.5;

    this.scroll.target += speed;

    return speed;
  }

  /**
   * Listeners.
   */
  addEventListeners() {}

  removeEventListeners() {}

  /**
   * Loop.
   */
  update() {
    if (!this.isScrollable || !this.isVisible) return;

    this.scroll.target = clamp(0, this.scroll.limit, this.scroll.target);

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );
    this.scroll.current = Math.floor(this.scroll.current);

    if (this.scroll.current < 0.1) {
      this.scroll.current = 0;
    }

    if (this.elements.wrapper) {
      this.transform(this.elements.wrapper, this.scroll.current);
    }

    each(this.animations, (animation) => {
      if (animation.update) {
        animation.update(this.scroll);
      }
    });

    this.scroll.velocity =
      ((this.scroll.current - this.scroll.last) / this.screen.width) * 5;

    this.scroll.last = this.scroll.current;
  }
}
