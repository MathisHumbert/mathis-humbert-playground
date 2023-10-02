import * as THREE from 'three';
import gsap from 'gsap';
import AutoBind from 'auto-bind';

import fragment from '../../../shaders/fragment.glsl';
import vertex from '../../../shaders/vertex.glsl';

export default class Media {
  constructor({ element, index, scene, geometry, screen, viewport }) {
    this.element = element;
    this.index = index;
    this.scene = scene;
    this.geometry = geometry;
    this.screen = screen;
    this.viewport = viewport;

    AutoBind(this);

    this.image = this.element.querySelector('img');

    this.scroll = 0;
    this.isVisible = false;
    this.isHover = false;

    this.createMaterial();
    this.createMesh();

    this.onResize({ viewport, screen });
    this.addEventListeners();
  }

  /**
   * Create.
   */
  createMaterial() {
    const texture = window.TEXTURES[this.image.getAttribute('data-src')];

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
    this.scene.add(this.mesh);
  }

  createBounds() {
    const rect = this.element.getBoundingClientRect();

    this.bounds = {
      top: rect.top + this.scroll,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };

    this.material.uniforms.uPlaneRes.value = new THREE.Vector2(
      this.bounds.width,
      this.bounds.height
    );

    this.material.uniforms.uViewportRes.value = new THREE.Vector2(
      this.viewport.width,
      this.viewport.height
    );

    this.updateScale();
    this.updateX();
    this.updateY(this.scroll);
  }

  /**
   * Update.
   */
  updateScale() {
    this.mesh.scale.x =
      (this.viewport.width * this.bounds.width) / this.screen.width;
    this.mesh.scale.y =
      (this.viewport.height * this.bounds.height) / this.screen.height;
  }

  updateX(x = 0) {
    this.mesh.position.x =
      -this.viewport.width / 2 +
      this.mesh.scale.x / 2 +
      ((this.bounds.left - x) / this.screen.width) * this.viewport.width;
  }

  updateY(y = 0) {
    this.mesh.position.y =
      this.viewport.height / 2 -
      this.mesh.scale.y / 2 -
      ((this.bounds.top - y) / this.screen.height) * this.viewport.height;
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

  /**
   * Events.
   */
  onResize({ screen, viewport }) {
    this.screen = screen;
    this.viewport = viewport;

    this.createBounds();
  }

  onClick() {
    console.log('click');
  }

  /***
   * Listeners.
   */
  addEventListeners() {
    this.element.addEventListener('click', this.onClick);
  }

  /**
   * Loop.
   */
  update(scroll) {
    if (!this.isVisible) return;

    this.material.uniforms.uVelocity.value = scroll.velocity;

    this.updateY(scroll.current);

    this.scroll = scroll.current;
  }
}
