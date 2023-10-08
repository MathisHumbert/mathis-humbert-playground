import gsap from 'gsap';
import SplitType from 'split-type';

import Component from '../classes/Component';
import { smooth } from '../utils/easing';

export default class SlowText extends Component {
  constructor({ element }) {
    super({ element, elements: { spans: [] } });

    this.elements.spans = new SplitType(this.element, {
      types: 'words',
      tagName: 'span',
    }).words;

    this.delay = Number(this.element.getAttribute('data-delay'));
  }

  animateIn() {
    gsap.to(this.elements.spans, {
      yPercent: 0,
      rotate: 0,
      duration: 1,
      delay: this.delay,
      stagger: 0.1,
      ease: smooth,
    });
  }

  animateOut() {
    gsap.set(this.elements.spans, {
      yPercent: 115,
      rotate: '5deg',
    });
  }
}
