import gsap from 'gsap';
import * as THREE from 'three';

import fragment from '../../../shaders/line-fragment.glsl';
import vertex from '../../../shaders/line-vertex.glsl';
import { COLOR_CARARRA } from '../../../utils/color';

export default class Line {
  constructor({ element, index, total, scene, screen, viewport }) {
    this.element = element;
    this.index = index;
    this.total = total;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;

    this.createMaterial();
    this.createMesh();
    this.createBounds();
  }

  /**
   * Create.
   */
  createMaterial() {
    this.material = new THREE.RawShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      transparent: true,
      uniforms: {
        uAlpha: { value: 0 },
        uColor: { value: new THREE.Color(COLOR_CARARRA) },
        uVelocity: { value: 0 },
        uViewportRes: {
          value: new THREE.Vector2(this.viewport.width, this.viewport.height),
        },
      },
    });
  }

  createMesh() {
    this.points = [];
    this.points.push(new THREE.Vector3(0, 0, 0));
    this.points.push(new THREE.Vector3(0, 0, 0));

    this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);

    this.line = new THREE.Line(this.geometry, this.material);

    this.scene.add(this.line);
  }

  createBounds() {
    const rect = this.element.getBoundingClientRect();

    this.bounds = {
      left: rect.left,
      width: rect.width,
    };

    this.scaleX = (this.viewport.width * this.bounds.width) / this.screen.width;
    this.posX =
      -this.viewport.width / 2 -
      this.scaleX +
      (this.bounds.left / this.screen.width) * this.viewport.width;

    this.line.position.x = this.posX;
    this.line.position.y = this.index * -0.04 + this.total * 0.02;

    this.points[0].set(-this.scaleX, 0, 0);
    this.points[1].set(this.scaleX, 0, 0);

    this.geometry.setFromPoints(this.points);
  }

  /**
   * Animations.
   */
  show() {
    this.isVisible = true;

    gsap.fromTo(this.material.uniforms.uAlpha, { value: 0 }, { value: 0.2 });
  }

  hide() {
    this.isVisible = false;

    gsap.to(this.material.uniforms.uAlpha, {
      value: 0,
    });
  }

  showColor() {
    gsap.to(this.line.scale, { x: this.line.scale.x + 0.25 });
    gsap.to(this.material.uniforms.uAlpha, { value: 1 });

    const tl = gsap.timeline();

    tl.to(this.line.scale, { x: this.line.scale.x + 0.25 })
      .to(this.material.uniforms.uAlpha, { value: 1 }, 0)
      .to(
        this.material.uniforms.uVelocity,
        {
          value: 1,
          onComplete: () =>
            gsap.to(this.material.uniforms.uVelocity, { value: 0 }),
        },
        0
      );
  }

  hideColor() {
    gsap.to(this.line.scale, { x: 1 });
    gsap.to(this.material.uniforms.uAlpha, { value: 0.2 });
    gsap.to(this.material.uniforms.uVelocity, { value: 0 });
  }

  /**
   * Events.
   */
  onResize({ screen, viewport }) {
    this.screen = screen;
    this.viewport = viewport;

    this.createBounds();
  }
}
