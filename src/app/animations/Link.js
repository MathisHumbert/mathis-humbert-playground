import gsap from 'gsap';

import Component from '../classes/Component';
import { split } from '../utils/text';
import { smooth } from '../utils/easing';

export default class Link extends Component {
  constructor({ element }) {
    const text = element.textContent;

    const textElement = document.createElement('div');
    textElement.textContent = text;
    const textSpansElements = split({
      append: false,
      element: textElement,
      expression: '<br />',
    });

    const hoverElement = document.createElement('div');
    hoverElement.textContent = text;
    const hoverSpansElements = split({
      append: false,
      element: hoverElement,
      expression: '<br />',
    });

    element.textContent = '';
    element.appendChild(textElement);
    element.appendChild(hoverElement);

    gsap.set(hoverElement, { position: 'absolute', top: 0, left: 0 });

    super({
      element,
      elements: {
        text: textElement,
      },
    });

    this.delay = Number(this.element.getAttribute('data-delay'));
    this.href = this.element.getAttribute('href');

    this.tl = gsap.timeline({ paused: true });

    this.tl
      .to(textSpansElements, {
        transform: 'rotate3d(1, 0.2, 0, -90deg)',
        ease: smooth,
        stagger: 0.02,
      })
      .fromTo(
        hoverSpansElements,
        { transform: 'rotate3d(1, 0.2, 0, 90deg)' },
        {
          transform: 'rotate3d(0, 0, 0, 90deg)',
          ease: smooth,
          stagger: 0.02,
        },
        0.05
      );

    this.addEventListener();
  }

  animateIn() {
    const tl = gsap.timeline({ delay: this.delay });

    tl.to(this.elements.text, {
      yPercent: 0,
      opacity: 1,
      duration: 1,
      ease: smooth,
    }).call(() => this.element.classList.add('visible'), null, 0.2);
  }

  animateOut() {
    this.element.classList.remove('visible');

    gsap.set(this.elements.text, {
      yPercent: 105,
      opacity: 0,
    });
  }

  hide() {
    this.element.classList.remove('visible');

    this.tl.reverse();

    gsap.to(this.elements.text, {
      yPercent: 105,
      opacity: 0,
      duration: 0.5,
      ease: smooth,
    });
  }

  onMouseEnter() {
    this.tl.play();
  }

  onMouseLeave() {
    this.tl.reverse();
  }

  addEventListener() {
    this.element.addEventListener('mouseenter', this.onMouseEnter);
    this.element.addEventListener('mouseleave', this.onMouseLeave);
  }
}
