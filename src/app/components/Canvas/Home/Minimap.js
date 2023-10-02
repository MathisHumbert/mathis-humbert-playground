import * as THREE from 'three';

export default class Minimap {
  constructor({ element, index, scene, screen, viewport }) {
    this.element = element;
    this.index = index;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;

    const bounds = element.getBoundingClientRect();

    const scaleX = (this.viewport.width * bounds.width) / this.screen.width;
    const scaleY = (this.viewport.height * bounds.height) / this.screen.height;

    console.log((bounds.left / this.screen.width) * this.viewport.width);

    const posX =
      -this.viewport.width / 2 -
      scaleX +
      (bounds.left / this.screen.width) * this.viewport.width;

    const material = new THREE.LineBasicMaterial({
      color: 'red',
    });

    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(1, 0, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);

    scene.add(line);

    line.scale.x += 0.1;

    console.log(line);
  }
}
