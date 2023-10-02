import * as THREE from 'three';

import Media from './Media';
import { each, map } from 'lodash';
import Minimap from './Minimap';

export default class Home {
  constructor({ scene, geometry, screen, viewport }) {
    this.scene = scene;
    this.geometry = geometry;
    this.screen = screen;
    this.viewport = viewport;

    this.mediaElements = document.querySelectorAll('.home__project__media');
    this.trackCurrentElement = document.querySelector('.home__track__current');
    this.minimapElement = document.querySelector('.home__minimap');

    this.currentIndex = null;
    this.group = new THREE.Group();

    // this.createMedia();
    this.createMinimap();
  }

  createMedia() {
    this.medias = map(
      this.mediaElements,
      (element, index) =>
        new Media({
          element: element,
          index: index,
          scene: this.group,
          geometry: this.geometry,
          screen: this.screen,
          viewport: this.viewport,
        })
    );
  }

  createMinimap() {
    // this.minimaps = map(
    //   this.mediaElements,
    //   (_, index) =>
    //     new Minimap({
    //       element: this.minimapElement,
    //       index,
    //       scene: this.group,
    //       screen: this.screen,
    //       viewport: this.viewport,
    //     })
    // );

    new Minimap({
      element: this.minimapElement,
      index: 0,
      scene: this.group,
      screen: this.screen,
      viewport: this.viewport,
    });
  }

  /**
   * Animations.
   */
  show() {
    this.scene.add(this.group);

    each(this.medias, (media) => {
      if (media && media.show) {
        media.show();
      }
    });
  }

  hide() {
    this.scene.remove(this.group);

    each(this.medias, (media) => {
      if (media && media.hide) {
        media.hide();
      }
    });
  }

  /**
   * Events.
   */
  onResize({ screen, viewport }) {
    each(this.medias, (media) => {
      if (media && media.onResize) {
        media.onResize({ screen, viewport });
      }
    });
  }

  onIndexChange(index) {
    if (this.medias[this.currentIndex]) {
      this.medias[this.currentIndex].hideColor();
    }

    if (this.medias[index]) {
      this.medias[index].showColor();
    }

    this.trackCurrentElement.textContent =
      index + 1 < 10 ? `0${index + 1}` : index + 1;

    this.currentIndex = index;
  }

  /**
   * Loop.
   */
  update(scroll) {
    // const index = Math.floor(
    //   Math.abs((scroll.current / scroll.limit) * this.medias.length)
    // );

    // if (index !== this.currentIndex) {
    //   this.onIndexChange(index);
    // }

    each(this.medias, (media) => {
      if (media && media.update) {
        media.update(scroll);
      }
    });
  }
}
