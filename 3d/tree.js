import * as THREE from 'https://cdn.skypack.dev/three';

export class Tree {
  constructor(x, y, z, height) {
    const trunkRadius = height * 0.1;
    const trunkHeight = height * 0.8;
    const foliageRadius = height * 0.6;

    const cylinderGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 16);
    const coneGeometry = new THREE.ConeGeometry(foliageRadius, height - trunkHeight, 16);

    const vertexShader = `
      in vec3 color;
      out vec3 vColor;
      void main() {
        vColor = color;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      in vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `;

    const treeShaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    const trunk = new THREE.Mesh(cylinderGeometry, treeShaderMaterial);
    trunk.position.set(x, y + trunkHeight / 2, z);
    trunk.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Array(trunk.geometry.attributes.position.count * 3).fill(0.5451), 3));

    const foliage = new THREE.Mesh(coneGeometry, treeShaderMaterial);
    foliage.position.set(x, y + trunkHeight + (height - trunkHeight) / 2, z);
    foliage.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Array(foliage.geometry.attributes.position.count * 3).fill(0.1333), 3));

    this.mesh = new THREE.Object3D();
    this.mesh.add(trunk);
    this.mesh.add(foliage);
  }

  getMesh() {
    return this.mesh;
  }
}
