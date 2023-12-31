import * as THREE from 'three';
import { each, map } from 'lodash';
import gsap from 'gsap';

import Media from './Media';
import Line from './Line';
import ProjectDom from './ProjectDom';
import TrackDom from './TrackDom';
import { clamp, lerp } from '../../../utils/math';
import { COLOR_CARARRA, COLOR_COD_GRAY } from '../../../utils/color';
import { Detection } from '../../../classes/Detection';

export default class Home {
  constructor({ scene, camera, geometry, screen, viewport }) {
    this.scene = scene;
    this.camera = camera;
    this.geometry = geometry;
    this.screen = screen;
    this.viewport = viewport;

    this.projectElements = document.querySelectorAll('.home__project');
    this.mediaElements = document.querySelectorAll('.home__project__media');
    this.lineElement = document.querySelector('.home__line');
    this.trackLineElement = document.querySelector('.home__track__line');

    this.mediaGroup = new THREE.Group();
    this.linesGroup = new THREE.Group();

    this.currentIndex = null;
    this.hoverIndex = null;
    this.detailedIndex = null;
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
    this.createProjectDom();
    this.createTrackDom();
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

  createProjectDom() {
    this.projectsDom = map(
      this.projectElements,
      (element) =>
        new ProjectDom({
          element,
          trackLineElement: this.trackLineElement,
          lines: this.lines,
        })
    );
  }

  createTrackDom() {
    this.trackDom = new TrackDom();
  }

  reset() {
    const pxToRem = (this.screen.width / 1920) * 10;

    this.mediaSizes = {
      width: 106 * pxToRem,
      height: 24 * pxToRem,
      gap: 3.2 * pxToRem,
    };

    this.detailedMediaSizes = {
      width: 112 * pxToRem,
      height: 63.2 * pxToRem,
      gap: 11.2 * pxToRem,
    };

    if (this.isDetailed) {
      this.scroll.limit =
        (this.detailedMediaSizes.height + this.detailedMediaSizes.gap) *
          this.totalMedias -
        this.detailedMediaSizes.height / 2 +
        this.detailedMediaSizes.gap;
    } else {
      this.scroll.limit =
        (this.mediaSizes.height + this.mediaSizes.gap) * (this.totalMedias - 1);
    }
  }

  /**
   * Animations.
   */
  show() {
    this.scroll = {
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
      velocity: 0,
      ease: 0.07,
    };

    this.scene.add(this.mediaGroup);
    this.scene.add(this.linesGroup);

    gsap.delayedCall(0.7, () => (this.isVisible = true));

    gsap.fromTo(this.mediaGroup.position, { y: -2 }, { y: 0, duration: 1 });

    each(this.medias, (media) => {
      if (media && media.show) {
        media.show();
      }
    });

    each(this.lines, (line) => {
      if (line && line.show) {
        line.show();
      }
    });

    this.trackDom.show();
  }

  hide() {
    this.isVisible = false;

    gsap.delayedCall(1, () => {
      this.scene.remove(this.mediaGroup);
      this.scene.remove(this.linesGroup);

      if (this.isDetailed) {
        each(this.medias, (media) => {
          if (media && media.onClose) {
            media.onClose();
          }
        });

        each(this.lines, (line) => {
          line.material.uniforms.uColor.value = new THREE.Color(COLOR_CARARRA);
        });
      }

      this.isDetailed = false;
      this.detailedIndex = null;
      this.currentIndex = null;
      this.hoverIndex = null;
    });

    if (this.isDetailed) {
      this.projectsDom[this.detailedIndex].hide();
    }

    gsap.to(this.trackLineElement, {
      background: COLOR_CARARRA,
    });

    each(this.medias, (media) => {
      if (media && media.hide) {
        media.hide();
      }
    });

    each(this.lines, (line) => {
      if (line && line.hide) {
        line.hide();
      }
    });

    this.trackDom.hide();
  }

  /**
   * Events.
   */
  onResize({ screen, viewport }) {
    this.screen = screen;
    this.viewport = viewport;

    this.reset();

    let scroll = 0;

    if (this.isDetailed) {
      scroll =
        (this.detailedMediaSizes.height + this.detailedMediaSizes.gap) *
        this.currentIndex;
    } else {
      scroll =
        (this.mediaSizes.height + this.mediaSizes.gap) * this.currentIndex;
    }

    this.scroll.target = this.scroll.current = this.scroll.last = scroll;

    each(this.medias, (media) => {
      if (media && media.onResize) {
        media.onResize({
          screen,
          viewport,
          mediaSizes: this.mediaSizes,
          detailedMediaSizes: this.detailedMediaSizes,
        });
      }
    });

    each(this.lines, (line) => {
      if (line && line.onResize) {
        line.onResize({ screen, viewport });
      }
    });
  }

  onTouchDown(event) {
    if (!this.isVisible) return;

    this.isDown = true;

    if (!Detection.isMobile) return;

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    this.pointer.x = (clientX / this.screen.width) * 2 - 1;
    this.pointer.y = -(clientY / this.screen.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.scene.children[0].children
    );

    if (intersects.length > 0) {
      const object = intersects[0].object;

      if (object.index !== this.hoverIndex) {
        this.hoverIndex = object.index;
      }
    } else if (this.hoverIndex !== null) {
      this.hoverIndex = null;
    }

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientY : event.clientY;
  }

  onTouchMove(event) {
    if (!this.isVisible) return;

    if (Detection.isMobile) {
      if (this.isDown && this.isDetailed && !this.isAnimating) {
        this.onClose(this.currentIndex);

        return;
      }

      if (!this.isDown || this.isDetailed) return;

      this.hoverIndex = null;

      const y = event.touches ? event.touches[0].clientY : event.clientY;
      const distance = (this.start - y) * 3;

      this.scroll.target = this.scroll.position + distance;
    } else {
      this.pointer.x = (event.clientX / this.screen.width) * 2 - 1;
      this.pointer.y = -(event.clientY / this.screen.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);

      const intersects = this.raycaster.intersectObjects(
        this.scene.children[0].children
      );

      if (intersects.length > 0) {
        const object = intersects[0].object;

        if (object.index !== this.hoverIndex) {
          if (this.hoverIndex !== null) {
            this.medias[this.hoverIndex].onMouseLeave();
          }

          this.hoverIndex = object.index;

          this.medias[this.hoverIndex].onMouseEnter();
          document.body.style.cursor = 'pointer';
        }
      } else if (this.hoverIndex !== null) {
        this.medias[this.hoverIndex].onMouseLeave();
        document.body.style.cursor = '';

        this.hoverIndex = null;
      }
    }
  }

  onTouchUp() {
    if (!this.isVisible) return;

    if (this.hoverIndex !== null && this.detailedIndex !== this.hoverIndex) {
      if (this.isDetailed) {
        this.onChange(this.hoverIndex);
      } else {
        this.onOpen(this.hoverIndex);
      }
    }

    this.isDown = false;
  }

  onWheel(normalized) {
    if (!this.isVisible) return;

    if (this.isDetailed && !this.isAnimating) {
      this.onClose(this.currentIndex);

      return;
    }

    const speed = normalized.pixelY;

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

    this.trackDom.onChange(index);

    this.currentIndex = index;
  }

  onOpen(index) {
    this.isAnimating = true;
    this.isDetailed = true;

    this.reset();

    const scroll =
      (this.detailedMediaSizes.height + this.detailedMediaSizes.gap) * index;

    gsap.to(this.scroll, {
      target: scroll,
      current: scroll,
      last: scroll,
      duration: 1,
    });

    each(this.medias, (media) => {
      if (media && media.onOpen) {
        media.onOpen();
      }
    });

    this.projectsDom[index].show(0);

    this.detailedIndex = index;

    gsap.delayedCall(1, () => (this.isAnimating = false));
  }

  onClose(index) {
    this.isAnimating = true;
    this.isDetailed = false;

    each(this.medias, (media) => {
      if (media && media.onClose) {
        media.onClose();
      }
    });

    this.reset();

    const scroll = (this.mediaSizes.height + this.mediaSizes.gap) * index;

    gsap.to(this.scroll, {
      target: scroll,
      current: scroll,
      last: scroll,
      duration: 1,
    });

    this.projectsDom[this.detailedIndex].hide();

    gsap.to(document.documentElement, {
      color: COLOR_CARARRA,
      background: COLOR_COD_GRAY,
    });

    gsap.to(this.trackLineElement, {
      background: COLOR_CARARRA,
    });

    each(this.lines, (line) => {
      line.material.uniforms.uColor.value = new THREE.Color(COLOR_CARARRA);
    });

    this.detailedIndex = null;

    gsap.delayedCall(1, () => (this.isAnimating = false));
  }

  onChange(index) {
    this.isAnimating = true;

    const oldIndex = this.detailedIndex;
    this.detailedIndex = index;

    this.scroll.target =
      (this.detailedMediaSizes.height + this.detailedMediaSizes.gap) *
      this.detailedIndex;

    this.projectsDom[oldIndex].hide();
    this.projectsDom[this.detailedIndex].show(0.25);

    this.isAnimating = false;
  }

  /**
   * Loop.
   */
  update() {
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
      this.isDetailed || this.isAnimating
        ? 0
        : ((this.scroll.current - this.scroll.last) / this.screen.width) * 5;

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
  }
}
