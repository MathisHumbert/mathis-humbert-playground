import * as THREE from 'three';
import gsap from 'gsap';

import Component from '@classes/Component';

export default class Preloader extends Component {
  constructor() {
    super({
      element: null,
      elements: null,
    });

    window.TEXTURES = {};
    this.textureLoaded = 0;
    this.totalAssets = window.ASSETS.length;

    this.createLoader();
  }

  createLoader() {
    // animateIn loader

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
      this.onLoaded();
    }
  }

  onLoaded() {
    // animateOut laoder
    gsap.delayedCall(1, () => this.emit('loaded'));

    // this.destroy()
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}
