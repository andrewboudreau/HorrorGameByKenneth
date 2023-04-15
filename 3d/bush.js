import * as THREE from 'https://cdn.skypack.dev/three';

export class Bush {
  constructor(x, y, z, numSpheres) {
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

    const bushShaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    const spheres = [];

    for (let i = 0; i < numSpheres; i++) {
      const radius = 0.5 + Math.random() * 1.5;
      const offsetX = (Math.random() - 0.5) * 2 * radius;
      const offsetY = radius;
      const offsetZ = (Math.random() - 0.5) * 2 * radius;

      const sphereGeometry = new THREE.SphereGeometry(radius, 16, 16);
      const sphere = new THREE.Mesh(sphereGeometry, bushShaderMaterial);
      sphere.position.set(x + offsetX, y + offsetY, z + offsetZ);
	sphere.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Array(sphere.geometry.attributes.position.count * 3).fill(0.1333), 3));
      spheres.push(sphere);
    }

    this.mesh = new THREE.Object3D();
    for (let i = 0; i < numSpheres; i++) {
      this.mesh.add(spheres[i]);
    }
  }

  getMesh() {
    return this.mesh;
  }
}