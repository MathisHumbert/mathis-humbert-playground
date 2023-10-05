import * as THREE from 'three';
import gsap from 'gsap';
import AutoBind from 'auto-bind';
import EventEmitter from 'events';

import fragment from '../../../shaders/fragment.glsl';
import vertex from '../../../shaders/vertex.glsl';

export default class Media extends EventEmitter {
  constructor({ element, index, scene, geometry, screen, viewport }) {
    super();

    AutoBind(this);

    this.element = element;
    this.index = index;
    this.scene = scene;
    this.geometry = geometry;
    this.screen = screen;
    this.viewport = viewport;

    this.currentIndex = 0;
    this.scroll = 0;
    this.isVisible = false;
    this.isHover = false;
    this.isDetailed = 0;

    this.createMaterial();
    this.createMesh();
  }

  /**
   * Create.
   */
  createMaterial() {
    const texture = window.TEXTURES[this.element.getAttribute('data-src')];

    this.material = new THREE.RawShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      transparent: true,
      uniforms: {
        uTexture: { value: texture },
        uAlpha: { value: 0 },
        uVelocity: { value: 0 },
        uColor: { value: 0 },
        uImageRes: {
          value: new THREE.Vector2(
            texture.image.naturalWidth,
            texture.image.naturalHeight
          ),
        },
        uPlaneRes: {
          value: null,
        },
        uViewportRes: {
          value: new THREE.Vector2(this.viewport.width, this.viewport.height),
        },
      },
    });
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.index = this.index;

    this.scene.add(this.mesh);
  }

  createBounds() {
    this.material.uniforms.uPlaneRes.value = new THREE.Vector2(
      gsap.utils.interpolate(
        this.mediaSizes.width,
        this.detailedMediaSizes.width,
        this.isDetailed
      ),
      gsap.utils.interpolate(
        this.mediaSizes.height,
        this.detailedMediaSizes.height,
        this.isDetailed
      )
    );

    this.material.uniforms.uViewportRes.value = new THREE.Vector2(
      this.viewport.width,
      this.viewport.height
    );
  }

  /**
   * Update.
   */
  updateScale() {
    this.material.uniforms.uPlaneRes.value = new THREE.Vector2(
      gsap.utils.interpolate(
        this.mediaSizes.width,
        this.detailedMediaSizes.width,
        this.isDetailed
      ),
      gsap.utils.interpolate(
        this.mediaSizes.height,
        this.detailedMediaSizes.height,
        this.isDetailed
      )
    );

    this.mesh.scale.x = gsap.utils.interpolate(
      (this.viewport.width * this.mediaSizes.width) / this.screen.width,
      (this.viewport.width * this.detailedMediaSizes.width) / this.screen.width,
      this.isDetailed
    );

    this.mesh.scale.y = gsap.utils.interpolate(
      (this.viewport.height * this.mediaSizes.height) / this.screen.height,
      (this.viewport.height * this.detailedMediaSizes.height) /
        this.screen.height,
      this.isDetailed
    );
  }

  updateY(y = 0) {
    this.mesh.position.y =
      this.index * -this.mesh.scale.y -
      this.index *
        ((this.viewport.height *
          gsap.utils.interpolate(
            this.mediaSizes.gap,
            this.detailedMediaSizes.gap,
            this.isDetailed
          )) /
          this.screen.height) +
      (y / this.screen.height) * this.viewport.height;
  }

  /**
   * Animations.
   */
  show() {
    this.isVisible = true;

    gsap.fromTo(this.material.uniforms.uAlpha, { value: 0 }, { value: 0.2 });
    gsap.fromTo(this.material.uniforms.uColor, { value: 0 }, { value: 0 });
  }

  hide() {
    this.isVisible = false;

    gsap.to(this.material.uniforms.uAlpha, {
      value: 0,
    });
  }

  showColor() {
    gsap.to(this.material.uniforms.uAlpha, { value: 1 });
    gsap.to(this.material.uniforms.uColor, { value: 1 });
  }

  hideColor() {
    gsap.to(this.material.uniforms.uAlpha, { value: 0.2 });
    gsap.to(this.material.uniforms.uColor, { value: 0 });
  }

  onOpen() {
    gsap.to(this, { isDetailed: 1, duration: 1 });
  }

  onClose() {
    gsap.to(this, { isDetailed: 0, duration: 1 });
  }

  /**
   * Events.
   */
  onResize({ screen, viewport, mediaSizes, detailedMediaSizes }) {
    this.screen = screen;
    this.viewport = viewport;
    this.mediaSizes = mediaSizes;
    this.detailedMediaSizes = detailedMediaSizes;

    this.createBounds();
  }

  onMouseEnter() {
    gsap.to(this.material.uniforms.uAlpha, { value: 1 });
    gsap.to(this.material.uniforms.uColor, { value: 1 });
  }

  onMouseLeave() {
    if (this.index !== this.currentIndex) {
      gsap.to(this.material.uniforms.uAlpha, { value: 0.2 });
      gsap.to(this.material.uniforms.uColor, { value: 0 });
    }
  }

  /**
   * Loop.
   */
  update(scroll, index) {
    if (!this.isVisible) return;

    this.updateScale();

    this.material.uniforms.uVelocity.value = scroll.velocity;

    this.updateY(scroll.current);

    this.scroll = scroll.current;
    this.currentIndex = index;
  }
}
