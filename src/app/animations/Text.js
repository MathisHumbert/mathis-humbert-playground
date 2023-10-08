import gsap from 'gsap';
import SplitType from 'split-type';

import Animation from '../classes/Animation';
import { smooth } from '../utils/easing';
import { wrapLines } from '../utils/text';

export default class Text extends Animation {
  constructor({ element }) {
    super({ element, elements: { spans: [] } });

    this.elements.spans = new SplitType(this.element, {
      types: 'lines',
      tagName: 'span',
    });

    wrapLines(this.elements.spans.lines, 'div', 'oh');
  }

  animateIn() {
    gsap.set(this.elements.spans.lines, { yPercent: 105, opacity: 1 });

    gsap.to(this.elements.spans.lines, {
      yPercent: 0,
      duration: 0.7,
      ease: smooth,
      stagger: 0.05,
      delay: this.delay,
    });

    super.animateIn();
  }

  animateOut() {
    super.animateOut();
  }

  onResize() {
    this.elements.spans.split();

    wrapLines(this.elements.spans.lines, 'div', 'oh');
  }
}
