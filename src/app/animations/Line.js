import gsap from 'gsap';

import Animation from '../classes/Animation';

export default class Line extends Animation {
  constructor({ element, delay, index }) {
    super({
      element,
    });

    this.delay = delay;
    this.index = index;

    gsap.set(this.element, { scaleX: 0 });
  }

  animateIn() {
    gsap.fromTo(
      this.element,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1,
        ease: 'power2',
        delay: this.delay + this.index * 0.1,
      }
    );
  }

  animateOut() {
    gsap.set(this.spans, {
      scaleX: 0,
    });
  }
}
