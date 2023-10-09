import { each } from 'lodash';
import Page from '../../classes/Page';
import { mapEach } from '../../utils/dom';
import Text from '../../animations/Text';

export default class About extends Page {
  constructor() {
    super({
      id: 'about',
      classes: { active: 'about--active' },
      element: '.about',
      elements: {
        wrapper: '.about__wrapper',
        animationsTexts: '[data-animation="text"]',
      },
    });

    this.animationsText = mapEach(this.elements.animationsTexts, (element) => {
      return new Text({ element });
    });
  }

  /**
   * Animations.
   */
  async show(url) {
    this.element.classList.add(this.classes.active);

    each(this.animationsText, (text) => {
      text.animateIn();
    });

    return super.show();
  }

  async hide(url) {
    this.element.classList.remove(this.classes.active);

    each(this.animationsText, (text) => {
      text.animateOut();
    });

    return super.hide();
  }

  onResize() {
    each(this.animationsText, (text) => text.onResize());
  }
}
