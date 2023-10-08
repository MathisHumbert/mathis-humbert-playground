import { each, find } from 'lodash';
import gsap from 'gsap';

import Link from '../animations/Link';
import Title from '../animations/Title';
import Component from '../classes/Component';
import { mapEach } from '../utils/dom';

export default class Navigation extends Component {
  constructor({ template }) {
    super({
      element: 'body',
      elements: {
        nav: '.nav',
        footer: '.footer',
        links: '[data-animation="link"]',
        titles: '[data-animation="title"]',
      },
    });

    this.template = template;

    this.elements.animationsLink = mapEach(
      this.elements.links,
      (link) =>
        new Link({
          element: link,
        })
    );

    this.elements.animationsTitle = mapEach(
      this.elements.titles,
      (title) =>
        new Title({
          element: title,
        })
    );

    each(this.elements.animationsLink, (link) => link.animateOut());
    each(this.elements.animationsTitle, (title) => title.animateOut());

    this.aboutLink = find(
      this.elements.animationsLink,
      (link) => link.href === '/about'
    );
    this.homeLink = find(
      this.elements.animationsLink,
      (link) => link.href === '/'
    );
  }

  show() {
    each(this.elements.animationsLink, (link) => {
      if (link.href === '/' || link.href === '/about') {
        if (link.href !== this.template) {
          link.animateIn();
        }
      } else {
        link.animateIn();
      }
    });

    each(this.elements.animationsTitle, (title) => title.animateIn());
  }

  onChange(template) {
    if (this.template === '/') {
      this.aboutLink.hide();
      gsap.delayedCall(0.5, () => this.homeLink.animateIn());
    } else {
      this.homeLink.hide();
      gsap.delayedCall(0.5, () => this.aboutLink.animateIn());
    }

    this.template = template;
  }
}
