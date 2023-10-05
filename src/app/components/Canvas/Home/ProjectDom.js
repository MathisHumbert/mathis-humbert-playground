import gsap from 'gsap';
import SplitType from 'split-type';

import Component from '../../../classes/Component';
import { each, map } from 'lodash';

export default class ProjectDom extends Component {
  constructor({ element }) {
    super({
      element: element,
      elements: {
        title: '.home__project__title',
        titleSpans: null,
        infos: '.home__project__infos',
        infoSpans: [],
      },
      classes: { active: 'home__project--active' },
    });

    this.color = this.element.getAttribute('data-color');
    this.background = this.element.getAttribute('data-background');

    this.createTitle();
    this.createDescription();

    gsap.set(this.element, { opacity: 1 });
  }

  createTitle() {
    this.elements.titleSpans = new SplitType(this.elements.title, {
      types: 'chars',
      tagName: 'span',
    }).chars;

    gsap.set(this.elements.titleSpans, { yPercent: 105 });
  }

  createDescription() {
    const infoItemsElements = this.elements.infos.querySelectorAll(
      '.home__project__info'
    );
    each(infoItemsElements, (element) => {
      each(element.childNodes, (element) => {
        this.elements.infoSpans.push(
          new SplitType(element, {
            types: 'lines',
            tagName: 'span',
          }).lines
        );
      });
    });

    gsap.set(this.elements.infoSpans, { yPercent: 105, opacity: 0 });
  }

  show(delay) {
    this.element.classList.add(this.classes.active);

    gsap.to(document.documentElement, {
      color: this.color,
      background: this.background,
      duration: 1,
    });

    // set color of lines and track

    const tl = gsap.timeline({
      onStart: () => gsap.set(this.element, { opacity: 1 }),
      delay: delay,
    });

    tl.to(this.elements.titleSpans, { yPercent: 0, stagger: 0.02 }).to(
      this.elements.infoSpans,
      { yPercent: 0, opacity: 1, stagger: 0.05 },
      0.2
    );
  }

  hide() {
    this.element.classList.remove(this.classes.active);

    gsap.killTweensOf(this.elements.titleSpans);
    gsap.killTweensOf(this.elements.infoSpans);

    const tl = gsap.timeline({
      onComplete: () => {
        res();
        gsap.set(this.element, { opacity: 0 });
      },
    });

    tl.to(this.elements.titleSpans, {
      yPercent: 105,
      stagger: 0.02,
      duration: 0.3,
    });
    tl.to(
      this.elements.infoSpans,
      {
        yPercent: 105,
        opacity: 0,
        duration: 0.3,
      },
      0
    );
  }
}
