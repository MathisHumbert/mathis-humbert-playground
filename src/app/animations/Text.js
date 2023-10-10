import gsap from 'gsap';

import Component from '../classes/Component';
import { smooth } from '../utils/easing';

export default class Text extends Component {
  constructor({ element }) {
    super({
      element,
      elements: {
        texts: '.text',
      },
    });

    this.delay = this.element.getAttribute('data-delay');

    this.animateOut();
  }

  animateIn() {
    gsap.fromTo(
      [this.elements.texts],
      { opacity: 0 },
      {
        opacity: 1,
        delay: this.delay,
        duration: 1,
        stagger: 0.1,
        ease: smooth,
      }
    );
  }

  animateOut() {
    gsap.set([this.elements.texts], { opacity: 0 });
  }
}
