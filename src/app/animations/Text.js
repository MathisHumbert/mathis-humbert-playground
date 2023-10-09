import gsap from 'gsap';
import SplitType from 'split-type';
import each from 'lodash/each';

import Component from '../classes/Animation';
import { smooth } from '../utils/easing';
import { wrapLines } from '../utils/text';

export default class Text extends Component {
  constructor({ element }) {
    super({ element, elements: { texts: [], spans: [] } });

    this.isAnimated = false;
    this.elements.texts = this.element.querySelectorAll('p');
    this.delay;
    each(this.elements.texts, (text) => {
      this.elements.spans.push(
        new SplitType(text, {
          types: 'lines',
          tagName: 'span',
        })
      );
    });

    each(this.elements.spans, (span) => {
      wrapLines(span.lines, 'div', 'oh');
    });
  }

  animateIn() {
    each(this.elements.spans, (span, index) => {
      gsap.fromTo(
        span.lines,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.7,
          ease: smooth,
          stagger: 0.1,
          delay: 0.1 + this.delay + index * 0.1,
          onComplete: () => (this.isAnimated = true),
        }
      );
    });
  }

  animateOut() {
    this.isAnimated = false;
  }

  onResize() {
    each(this.elements.spans, (span) => {
      span.split();

      wrapLines(span.lines, 'div', 'oh');

      if (!this.isAnimated) {
        gsap.set(span.lines, {
          opacity: 0,
        });
      }
    });
  }
}
