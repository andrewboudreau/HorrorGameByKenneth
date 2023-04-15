import * as THREE from 'https://cdn.skypack.dev/three';

export class Ground {
  constructor(width, depth, heightData, texture) {
    const geometry = new THREE.PlaneGeometry(width, depth, width - 1, depth - 1);
    geometry.rotateX(-Math.PI / 2);
    geometry.computeVertexNormals();

    if (heightData) {
      for (let i = 0; i < geometry.attributes.position.count; i++) {
        geometry.attributes.position.array[i * 3 + 1] = heightData[i] * 10;
      }
    }

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 80,
    });

    this.mesh = new THREE.Mesh(geometry, material);
  }

  getMesh() {
    return this.mesh;
  }
}
