import * as THREE from 'three';
import { each, map } from 'lodash';

import Media from './Media';
import Line from './Line';
import { clamp, lerp } from '../../../utils/math';

export default class Home {
  constructor({ scene, camera, geometry, screen, viewport }) {
    this.scene = scene;
    this.camera = camera;
    this.geometry = geometry;
    this.screen = screen;
    this.viewport = viewport;

    this.mediaElements = document.querySelectorAll('.home__project__media');
    this.trackCurrentElement = document.querySelector('.home__track__current');
    this.lineElement = document.querySelector('.home__line');

    this.currentIndex = null;
    this.hoverIndex = null;
    this.mediaGroup = new THREE.Group();
    this.linesGroup = new THREE.Group();

    this.totalMedias = this.mediaElements.length;
    this.isDetailed = false;
    this.isDown = false;

    this.scroll = {
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
      velocity: 0,
      ease: 0.07,
    };

    this.createRaycast();
    this.createMedia();
    this.createLine();
  }

  createRaycast() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
  }

  createMedia() {
    this.medias = map(this.mediaElements, (element, index) => {
      const media = new Media({
        element: element,
        index: index,
        scene: this.mediaGroup,
        geometry: this.geometry,
        screen: this.screen,
        viewport: this.viewport,
      });

      media.on('open', this.onOpen.bind(this));
      media.on('close', this.onClose.bind(this));

      return media;
    });
  }

  createLine() {
    this.lines = map(
      this.mediaElements,
      (_, index) =>
        new Line({
          element: this.lineElement,
          index,
          total: this.mediaElements.length,
          scene: this.linesGroup,
          screen: this.screen,
          viewport: this.viewport,
        })
    );
  }

  /**
   * Animations.
   */
  show() {
    this.scene.add(this.mediaGroup);
    this.scene.add(this.linesGroup);
    this.isVisible = true;

    each(this.medias, (media) => {
      if (media && media.show) {
        media.show();
      }
    });

    each(this.lines, (minimap) => {
      if (minimap && minimap.show) {
        minimap.show();
      }
    });
  }

  hide() {
    this.scene.remove(this.mediaGroup);
    this.scene.remove(this.linesGroup);

    this.isVisible = false;

    each(this.medias, (media) => {
      if (media && media.hide) {
        media.hide();
      }
    });

    each(this.lines, (minimap) => {
      if (minimap && minimap.hide) {
        minimap.hide();
      }
    });
  }

  /**
   * Events.
   */
  onResize({ screen, viewport }) {
    const pxToRem = (this.screen.width / 1920) * 10;

    const mediaSizes = {
      width: 106 * pxToRem,
      height: 24 * pxToRem,
      gap: 3.2 * pxToRem,
    };

    const detailedMediaSizes = {
      width: 112 * pxToRem,
      height: 63.2 * pxToRem,
      gap: 11.2 * pxToRem,
    };

    if (this.isDetailed) {
      this.scroll.limit =
        (detailedMediaSizes.height + detailedMediaSizes.gap) *
          (this.totalMedias - 1) -
        detailedMediaSizes.height / 2 +
        detailedMediaSizes.gap;
    } else {
      this.scroll.limit =
        (mediaSizes.height + mediaSizes.gap) * (this.totalMedias - 1) -
        mediaSizes.height / 2 +
        mediaSizes.gap;
    }

    each(this.medias, (media) => {
      if (media && media.onResize) {
        media.onResize({ screen, viewport, mediaSizes, detailedMediaSizes });
      }
    });

    each(this.lines, (minimap) => {
      if (minimap && minimap.onResize) {
        minimap.onResize({ screen, viewport });
      }
    });
  }

  onTouchDown(event) {
    if (!this.isVisible) return;

    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientY : event.clientY;
  }

  onTouchMove(event) {
    if (!this.isVisible) return;

    this.pointer.x = (event.clientX / this.screen.width) * 2 - 1;
    this.pointer.y = -(event.clientY / this.screen.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.scene.children[0].children
    );

    if (intersects.length > 0) {
      const object = intersects[0].object;

      console.log(object.index);

      if (object.index !== this.hoverIndex) {
        console.log(this.medias[this.hoverIndex]);
        // this.medias[this.hoverIndex].onMouseEnter();

        this.hoverIndex = object.index;
      }
    } else if (this.hoverIndex !== null) {
      this.medias[this.hoverIndex].onMouseLeave();
      console.log(this.medias[this.hoverIndex]);

      this.hoverIndex = null;
    }

    if (!this.isDown) return;

    const y = event.touches ? event.touches[0].clientY : event.clientY;
    const distance = (this.start - y) * 3;

    console.log(this.scroll.position + distance);

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    if (!this.isVisible) return;

    this.isDown = false;
  }

  onWheel(normalized) {
    if (!this.isVisible) return;

    const speed = normalized.pixelY * 0.5;

    this.scroll.target += speed;
  }

  onIndexChange(index) {
    if (this.medias[this.currentIndex]) {
      this.medias[this.currentIndex].hideColor();
    }

    if (this.medias[index]) {
      this.medias[index].showColor();
    }

    if (this.lines[this.currentIndex]) {
      this.lines[this.currentIndex].hideColor();
    }

    if (this.lines[index]) {
      this.lines[index].showColor();
    }

    this.trackCurrentElement.textContent =
      index + 1 < 10 ? `0${index + 1}` : index + 1;

    this.currentIndex = index;
  }

  onOpen(index) {
    console.log('open', index);

    // this.scroll.target =
    //   (detailedMediaSizes.height + detailedMediaSizes.gap) * index;

    each(this.medias, (media) => {
      if (media && media.onOpen) {
        media.onOpen(scroll, index);
      }
    });
  }

  onClose(index) {
    console.log('close', index);

    each(this.medias, (media) => {
      if (media && media.onClose) {
        media.onClose(scroll, index);
      }
    });
  }

  /**
   * Loop.
   */
  update(scroll) {
    if (!this.isVisible) return;

    this.scroll.target = clamp(0, this.scroll.limit, this.scroll.target);

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );
    this.scroll.current = Math.floor(this.scroll.current);

    if (this.scroll.current < 0.1) {
      this.scroll.current = 0;
    }

    each(this.animations, (animation) => {
      if (animation.update) {
        animation.update(this.scroll);
      }
    });

    this.scroll.velocity =
      ((this.scroll.current - this.scroll.last) / this.screen.width) * 5;

    this.scroll.last = this.scroll.current;

    const index = Math.floor(
      Math.abs((this.scroll.current / this.scroll.limit) * this.totalMedias)
    );

    if (index !== this.currentIndex) {
      this.onIndexChange(index);
    }

    each(this.medias, (media) => {
      if (media && media.update) {
        media.update(this.scroll, index);
      }
    });

    each(this.lines, (line) => {
      if (line && line.update) {
        line.update(this.scroll, index);
      }
    });
  }
}
