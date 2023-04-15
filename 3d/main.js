import * as THREE from 'three';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/PointerLockControls.js';



const textureLoader = new THREE.TextureLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());

const onKeyDown = (event) => {
  switch (event.code) {
    case 'KeyW':
      controls.moveForward(0.1);
      break;
    case 'KeyS':
      controls.moveForward(-0.1);
      break;
    case 'KeyA':
      controls.moveRight(-0.1);
      break;
    case 'KeyD':
      controls.moveRight(0.1);
      break;
  }
};

document.addEventListener('keydown', onKeyDown);
document.body.addEventListener('click', () => controls.lock());

scene.add(ground);

camera.position.y = 1.6;

//textureLoader.load('skybox-texture-flip.jpg', (texture) => {
//  createSkybox(texture);
//});

// Vertex shader
const vertexShader = `
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  in vec3 color;

  void main() {
    vColor = color;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader
const fragmentShader = `
  uniform vec3 ambientLightColor;
  uniform vec3 directionalLightColor;
  uniform vec3 directionalLightDirection;

  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vViewPosition);

    // Ambient light
    vec3 ambient = ambientLightColor * vColor;

    // Diffuse light
    float diffuseFactor = max(dot(normal, directionalLightDirection), 0.0);
    vec3 diffuse = directionalLightColor * vColor * diffuseFactor;

    // Specular light
    vec3 halfwayDirection = normalize(directionalLightDirection + viewDirection);
    float specularFactor = pow(max(dot(normal, halfwayDirection), 0.0), 20.0);
    vec3 specular = directionalLightColor * specularFactor;

    // Combine all lighting components
    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
  }
`;


const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

const shaderGeometry = new THREE.BoxGeometry(5, 5, 5);
const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial);
shaderMesh.position.set(-10, 2.5, 0);
scene.add(shaderMesh);


function setGeometryColor(geom, color) {
  const colors = new Float32Array(geom.attributes.position.count * 3);
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

const info = document.getElementById('info');

function updateInfoUI() {
  const position = controls.getObject().position;
  const pitchAngle = 0; // (controls.pitchObject.rotation.x * (180 / Math.PI)).toFixed(2);
  const yawAngle = ((controls.getObject().rotation.y * (180 / Math.PI)) + 360) % 360;

  info.innerHTML = `
    Position: X: ${position.x.toFixed(2)} Y: ${position.y.toFixed(2)} Z: ${position.z.toFixed(2)}<br>
    Pitch: ${pitchAngle}°<br>
    Yaw: ${yawAngle.toFixed(2)}°
  `;
}

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

const domUpdate = () => {
  requestAnimationFrame(domUpdate);
  updateInfoUI();
};

function createBush(x, y, z, scale) {
	const directionalLight = scene.getObjectByName('DirectionalLight');

	const bushShaderMaterial = new THREE.ShaderMaterial({
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		uniforms: {
			ambientLightColor: { value: scene.background },
			directionalLightColor: { value: directionalLight.color },
			directionalLightDirection: { value: directionalLight.position },
		},
	});

	const bush = new THREE.Group();
	bush.position.set(x, y, z);

	const sphereGeometry = new THREE.SphereGeometry(scale, 16, 16);	

	const createSphere = (offsetX, offsetY, offsetZ) => {
		const sphere = new THREE.Mesh(sphereGeometry, bushShaderMaterial);
		setGeometryColor(sphere.geometry, new THREE.Color(0x228B22));
		
		sphere.position.set(offsetX, offsetY, offsetZ);
		return sphere;
	};

	// At least one sphere touching the ground
	bush.add(createSphere(0, scale, 0));

	// Random number of spheres (2 to 4)
	const numSpheres = Math.floor(Math.random() * 3) + 2;
	for (let i = 0; i < numSpheres; i++) {
		const offsetX = Math.random() * scale - scale / 2;
		const offsetY = Math.random() * scale + scale / 2;
		const offsetZ = Math.random() * scale - scale / 2;
		bush.add(createSphere(offsetX, offsetY, offsetZ));
	}

	return bush;
}


const colliders = [];

// Add trees
for (let i = 0; i < 25; i++) {
  const x = Math.random() * 100 - 50;
  const z = Math.random() * 100 - 50;
  const height = Math.random() * 5 + 5;
  const tree = createTree(x, 0, z, height);
  scene.add(tree);

  // Add tree colliders for collision detection
  const treeCollider = new THREE.Mesh(
    new THREE.CylinderGeometry(height * 0.05, height * 0.05, height * 0.25, 16),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  treeCollider.position.set(x, height * 0.25 / 2, z);
  colliders.push(treeCollider);
  scene.add(treeCollider);
}

// Add bushes
for (let i = 0; i < 20; i++) {
  const x = Math.random() * 100 - 50;
  const z = Math.random() * 100 - 50;
  const scale = Math.random() * 0.5 + 0.5;
  const bush = createBush(x,0, z, scale);
  scene.add(bush);
}

animate();
domUpdate();



