import gsap from 'gsap';
import SplitType from 'split-type';

import Animation from '../classes/Animation';

export default class Highlight extends Animation {
  constructor({ element, index, delay }) {
    super({
      element,
      elements: {
        spans: [],
      },
    });

    this.index = index;
    this.delay = delay;

    const firstSpans = new SplitType(this.element, {
      types: 'chars',
      tagName: 'span',
      charClass: 'char__wrap',
    }).chars;

    this.spans = new SplitType(firstSpans, {
      types: 'chars',
      tagName: 'span',
    }).chars;

    gsap.set(this.spans, { xPercent: 103 });
  }

  animateIn() {
    gsap.fromTo(
      this.spans,
      { xPercent: 103 },
      {
        xPercent: 0,
        duration: 1,
        ease: 'power2',
        delay: this.delay + this.index * 0.3,
        stagger: 0.05,
      }
    );
  }

  animateOut() {
    gsap.to(this.spans, {
      xPercent: -103,
      duration: 0.5,
      ease: 'power2',
      delay: this.delay + this.index * 0.1,
      stagger: 0.025,
    });
  }
}
