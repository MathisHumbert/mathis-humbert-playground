import * as THREE from 'three';
import gsap from 'gsap';
import each from 'lodash/each';

import Component from '../classes/Component';
import Highlight from '../animations/Highlight';
import Description from '../animations/Description';
import { mapEach } from '../utils/dom';
import { smooth } from '../utils/easing';

export default class Preloader extends Component {
  constructor() {
    super({
      element: '.preloader',
      elements: {
        animationsHighlights: '[data-animation="highlight"]',
        animationsDescriptions: '[data-animation="description"]',
        number: '.preloader__number',
      },
    });

    window.TEXTURES = {};
    this.textureLoaded = 0;
    this.totalAssets = window.ASSETS.length;

    this.createAnimations();

    gsap.delayedCall(0.2, () => this.createLoader());
  }

  createAnimations() {
    this.animationsHighlight = mapEach(
      this.elements.animationsHighlights,
      (element, index) => {
        return new Highlight({ element, index, delay: 0 });
      }
    );

    this.animationsDescription = mapEach(
      this.elements.animationsDescriptions,
      (element) => {
        return new Description({ element });
      }
    );

    gsap.set(this.elements.number, { opacity: 0 });
  }

  createLoader() {
    each(this.animationsHighlight, (element) => {
      element.animateIn();
    });

    each(this.animationsDescription, (element) => {
      element.onResize();
      element.animateIn();
    });

    gsap.to(this.elements.number, {
      opacity: 1,
      delay: 0.4,
      duration: 1,
      stagger: 0.1,
      ease: smooth,
    });

    const textureLoader = new THREE.TextureLoader();

    window.ASSETS.forEach((image) => {
      textureLoader.load(image, (texture) => {
        window.TEXTURES[image] = texture;

        this.onAssetLoaded();
      });
    });
  }

  onAssetLoaded() {
    this.textureLoaded += 1;

    const percent = this.textureLoaded / this.totalAssets;

    this.elements.number.textContent = `${Math.round(percent * 100)}%`;

    if (percent === 1) {
      gsap.delayedCall(2, () => this.onLoaded());
      // this.onLoaded();
    }
  }

  onLoaded() {
    each(this.animationsHighlight, (element) => {
      element.animateOut();
    });

    each(this.animationsDescription, (element) => {
      element.animateOut();
    });

    gsap.to(this.elements.number, {
      opacity: 0,
      delay: 0.2,
      duration: 1,
      stagger: 0.1,
      ease: smooth,
      onComplete: () => {
        this.element.remove();
        this.emit('loaded');
      },
    });
  }
}
