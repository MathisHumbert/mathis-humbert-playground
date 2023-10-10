import gsap from 'gsap';
import SplitType from 'split-type';

import Component from '../classes/Component';
import { smooth } from '../utils/easing';
import { wrapLines } from '../utils/text';

export default class Description extends Component {
  constructor({ element }) {
    super({ element, elements: { spans: [] } });

    this.elements.spans = new SplitType(this.element, { types: 'lines' });
    wrapLines(this.elements.spans.lines, 'div', 'oh');

    this.delay = Number(this.element.getAttribute('data-delay'));

    gsap.set(this.elements.spans.lines, {
      yPercent: 105,
    });
  }

  animateIn() {
    gsap.to(this.elements.spans.lines, {
      yPercent: 0,
      duration: 1,
      stagger: 0.1,
      ease: smooth,
    });
  }

  animateOut() {
    gsap.to(this.elements.spans.lines, {
      yPercent: -105,
      delay: 0.2,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2',
    });
  }

  onResize() {
    this.elements.spans.split();

    wrapLines(this.elements.spans.lines, 'div', 'oh');

    gsap.set(this.elements.spans.lines, {
      yPercent: 105,
    });
  }
}
