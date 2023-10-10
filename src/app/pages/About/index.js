import each from 'lodash/each';
import gsap from 'gsap';

import Page from '../../classes/Page';
import Text from '../../animations/Text';
import Title from '../../animations/Title';
import Highlight from '../../animations/Highlight';
import Link from '../../animations/Link';
import { mapEach } from '../../utils/dom';

export default class About extends Page {
  constructor() {
    super({
      id: 'about',
      classes: { active: 'about--active' },
      element: '.about',
      elements: {
        wrapper: '.about__wrapper',
        animationsTexts: '[data-animation="text"]',
        animationsTitles: '[data-animation="title"]',
        animationsHighlights: '[data-animation="highlight"]',
        animationsLinks: '[data-animation="link"]',
      },
    });

    this.animationsText = mapEach(this.elements.animationsTexts, (element) => {
      return new Text({ element });
    });

    this.animationsTitle = mapEach(
      this.elements.animationsTitles,
      (element) => {
        return new Title({ element });
      }
    );

    this.animationsHighlight = mapEach(
      this.elements.animationsHighlights,
      (element, index) => {
        return new Highlight({ element, index, delay: 0.6 });
      }
    );

    this.animationsLink = mapEach(
      this.elements.animationsLinks,
      (element, index) => {
        return new Link({ element });
      }
    );

    each(this.animationsLink, (element) => {
      element.animateOut();
    });
  }

  /**
   * Animations.
   */
  async show(url) {
    this.element.classList.add(this.classes.active);

    each(this.animationsText, (element) => {
      element.animateIn();
    });

    each(this.animationsTitle, (element) => {
      element.animateIn();
    });

    each(this.animationsHighlight, (element) => {
      element.animateIn();
    });

    each(this.animationsLink, (element) => {
      element.animateIn();
    });

    return super.show();
  }

  async hide(url) {
    this.element.classList.remove(this.classes.active);

    gsap.delayedCall(0.7, () =>
      each(this.animationsLink, (element) => {
        element.animateOut();
      })
    );

    return super.hide();
  }
}
