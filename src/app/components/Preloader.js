import * as THREE from 'three';
import gsap from 'gsap';
import each from 'lodash/each';

import Component from '../classes/Component';
import Highlight from '../animations/Highlight';
import Description from '../animations/Description';
import { mapEach } from '../utils/dom';

export default class Preloader extends Component {
  constructor() {
    super({
      element: '.preloader',
      elements: {
        animationsHighlights: '[data-animation="highlight"]',
        animationsDescriptions: '[data-animation="description"]',
      },
    });

    window.TEXTURES = {};
    this.textureLoaded = 0;
    this.totalAssets = window.ASSETS.length;

    this.createAnimations();

    this.createLoader();
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
  }

  createLoader() {
    gsap.set(this.element, { autoAlpha: 1 });

    each(this.animationsHighlight, (element) => {
      element.animateIn();
    });

    each(this.animationsDescription, (element) => {
      element.onResize();
      element.animateIn();
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

    if (percent === 1) {
      gsap.delayedCall(2, () => this.onLoaded());
    }
  }

  onLoaded() {
    each(this.animationsHighlight, (element) => {
      element.animateOut();
    });

    each(this.animationsDescription, (element) => {
      element.animateOut();
    });

    gsap.delayedCall(0.6, () => {
      this.element.remove();
      this.emit('loaded');
    });
  }
}
