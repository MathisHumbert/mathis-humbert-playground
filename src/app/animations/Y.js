import gsap from 'gsap';

import Animation from '../classes/Animation';

export default class Y extends Animation {
  constructor({ element, delay, index }) {
    super({
      element,
    });

    this.delay = delay;
    this.index = index;

    gsap.set(this.element, { yPercent: 175 });
  }

  animateIn() {
    gsap.fromTo(
      this.element,
      { yPercent: 175 },
      {
        yPercent: 0,
        duration: 1,
        ease: 'power2',
        delay: this.delay + this.index * 0.1,
      }
    );
  }

  animateOut() {
    gsap.set(this.spans, {
      yPercent: 175,
    });
  }
}
