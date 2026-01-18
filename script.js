import * as THREE from "./libs/three.module.js";
import { OrbitControls } from "./libs/OrbitControls.js";
import { GLTFLoader } from "./libs/GLTFLoader.js";
import { RGBELoader } from "./libs/RGBELoader.js";

const container = document.getElementById('viewer');
const loading = document.getElementById('loading');
const dropZone = document.getElementById('dropZone');
const glbInput = document.getElementById('glbInput');
const uploadText = document.getElementById('uploadText');
const uploadStatus = document.getElementById('uploadStatus');

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.01,
  2000
);
camera.position.set(0, 2, 6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
keyLight.position.set(6, 8, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -15;
keyLight.shadow.camera.right = 15;
keyLight.shadow.camera.top = 15;
keyLight.shadow.camera.bottom = -15;
keyLight.shadow.camera.near = 0.1;
keyLight.shadow.camera.far = 50;
keyLight.shadow.bias = -0.0001;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
fillLight.position.set(-6, 3, -6);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(0, 4, -8);
scene.add(rimLight);

const grid = new THREE.GridHelper(20, 20);
scene.add(grid);

const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.ShadowMaterial({ opacity: 0.5 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.4;
ground.receiveShadow = true;
scene.add(ground);

const loader = new GLTFLoader();
let model = null;
let initialCameraPos = camera.position.clone();
let initialTarget = controls.target.clone();
let autoRotate = false;

const originalMaterials = new Map();
function captureOriginalMaterials(object) {
  originalMaterials.clear();
  object.traverse((c) => {
    if (c.isMesh && c.material) {
      const mat = c.material;
      if (mat.isMeshStandardMaterial || mat.isMeshPhongMaterial || mat.isMeshBasicMaterial) {
        originalMaterials.set(c, {
          color: mat.color ? mat.color.clone() : null,
          map: mat.map || null,
          roughness: mat.roughness !== undefined ? mat.roughness : 1,
          metalness: mat.metalness !== undefined ? mat.metalness : 0
        });
      }
    }
  });
}
function resetAppearance() {
  originalMaterials.forEach(({ color, map, roughness, metalness }, mesh) => {
    if (mesh.material) {
      const mat = mesh.material;
      if (color) mat.color.copy(color);
      mat.map = map;
      if (mat.roughness !== undefined) mat.roughness = roughness;
      if (mat.metalness !== undefined) mat.metalness = metalness;
      mat.needsUpdate = true;
    }
  });

  const colorPicker = document.getElementById('colorPicker');
  const textureSelect = document.getElementById('textureSelect');
  if (colorPicker) colorPicker.value = '#ffffff';
  if (textureSelect) textureSelect.value = '';
}

function normalizeModel(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  if (isFinite(maxDim) && maxDim > 0) {
    const targetSize = 2;
    const scale = targetSize / maxDim;
    object.scale.multiplyScalar(scale);
  }
}

function getModelCenterAndSize(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  return { center, size };
}

function safeFrame(object) {
  const { center, size } = getModelCenterAndSize(object);
  const invalid = !isFinite(size.x + size.y + size.z) || (size.x === 0 && size.y === 0 && size.z === 0);
  const maxDim = invalid ? 2 : Math.max(size.x, size.y, size.z);
  const target = invalid ? new THREE.Vector3(0, 0, 0) : center;
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
  cameraZ = Math.max(cameraZ, 3);
  camera.near = Math.max(0.01, cameraZ / 1000);
  camera.far = cameraZ * 1000;
  camera.updateProjectionMatrix();
  camera.position.set(target.x, target.y + (invalid ? 0.5 : size.y * 0.5), cameraZ * 1.5);
  camera.lookAt(target);
  controls.target.copy(target);
  controls.update();
}

function setShadowQuality(level) {
  if (level === 'low') keyLight.shadow.mapSize.set(512, 512);
  if (level === 'medium') keyLight.shadow.mapSize.set(1024, 1024);
  if (level === 'high') keyLight.shadow.mapSize.set(2048, 2048);
  renderer.shadowMap.needsUpdate = true;
}

function setBackground(option) {
  if (option === 'light') scene.background = new THREE.Color(0xf0f0f0);
  if (option === 'dark') scene.background = new THREE.Color(0x111111);
  if (option === 'transparent') scene.background = null;
}

function loadHDRI(file) {
  if (!file) {
    scene.environment = null;
    return;
  }
  loading.style.display = 'block';
  const pmrem = new THREE.PMREMGenerator(renderer);
  new RGBELoader()
    .setPath('./hdr/')
    .load(file, (texture) => {
      try {
        const envMap = pmrem.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        texture.dispose();
        pmrem.dispose();
        loading.style.display = 'none';
      } catch (err) {
        console.error('Error processing HDRI:', err);
        loading.style.display = 'none';
      }
    }, undefined, (err) => {
      console.warn(`Could not load HDRI: ${file}`, err);
      loading.style.display = 'none';
    });
}

function applyColor(hex) {
  if (!model) {
    console.warn('Model not loaded yet');
    return;
  }
  try {
    model.traverse((c) => {
      if (c.isMesh && c.material && c.material.color) {
        c.material.color.set(hex);
        c.material.needsUpdate = true;
      }
    });
  } catch (err) {
    console.error('Error applying color:', err);
  }
}

function applyTexture(file) {
  if (!model) {
    console.warn('Model not loaded yet');
    return;
  }
  try {
    if (!file) {
      model.traverse((c) => {
        if (c.isMesh && c.material && c.material.map) {
          c.material.map = null;
          c.material.needsUpdate = true;
        }
      });
      return;
    }
    const texLoader = new THREE.TextureLoader();
    texLoader.setPath('./textures/');
    texLoader.load(file, (tex) => {
      model.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material.map = tex;
          c.material.needsUpdate = true;
        }
      });
    }, undefined, (err) => {
      console.warn(`Could not load texture: ${file}`, err);
    });
  } catch (err) {
    console.error('Error applying texture:', err);
  }
}

function cameraPresetFront() {
  if (!model) return;
  const { center, size } = getModelCenterAndSize(model);
  const dist = Math.max(size.x, size.y, size.z) * 1.2 + 3;
  controls.target.copy(center);
  camera.position.set(center.x, center.y + size.y * 0.25, center.z + dist);
  camera.lookAt(center);
  controls.update();
}
function cameraPresetSide() {
  if (!model) return;
  const { center, size } = getModelCenterAndSize(model);
  const dist = Math.max(size.x, size.y, size.z) * 1.2 + 3;
  controls.target.copy(center);
  camera.position.set(center.x + dist, center.y + size.y * 0.25, center.z);
  camera.lookAt(center);
  controls.update();
}
function cameraPresetTop() {
  if (!model) return;
  const { center, size } = getModelCenterAndSize(model);
  const dist = Math.max(size.x, size.y, size.z) * 0.6 + 2;
  controls.target.copy(center);
  camera.position.set(center.x, center.y + dist, center.z + 0.01);
  camera.lookAt(center);
  controls.update();
}

function loadModelFromFile(file) {
  if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
    alert('Please upload a .glb or .gltf file');
    return;
  }

  loading.style.display = 'block';
  uploadStatus.textContent = `Loading: ${file.name}...`;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const arrayBuffer = e.target.result;

      if (model) {
        scene.remove(model);
        model = null;
      }

      const loader = new GLTFLoader();
      loader.parse(arrayBuffer, '', (gltf) => {
        model = gltf.scene || gltf.scenes?.[0];
        if (!model) {
          console.error('No scene in uploaded GLB');
          uploadStatus.textContent = '❌ Error: No scene found in file';
          loading.style.display = 'none';
          return;
        }

        model.traverse((c) => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
            if (c.material) {
              if (c.material.isMeshStandardMaterial || c.material.isMeshPhongMaterial) {
                c.material.envMapIntensity = 1.0;
              }
            }
          }
        });

        normalizeModel(model);
        captureOriginalMaterials(model);
        scene.add(model);
        safeFrame(model);

        initialCameraPos = camera.position.clone();
        initialTarget = controls.target.clone();

        loading.style.display = 'none';
        uploadStatus.textContent = `✓ ${file.name} loaded`;
        setTimeout(() => { uploadStatus.textContent = ''; }, 3000);
        console.log('Model uploaded successfully');
      }, undefined, (err) => {
        console.error('Error parsing GLB:', err);
        uploadStatus.textContent = '❌ Error parsing file';
        loading.style.display = 'none';
      });
    } catch (err) {
      console.error('Error loading file:', err);
      uploadStatus.textContent = '❌ Error: Invalid file';
      loading.style.display = 'none';
    }
  };
  reader.onerror = () => {
    uploadStatus.textContent = '❌ Error reading file';
    loading.style.display = 'none';
  };
  reader.readAsArrayBuffer(file);
}

dropZone.addEventListener('click', () => glbInput.click());
glbInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    loadModelFromFile(e.target.files[0]);
  }
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
  if (e.dataTransfer.files.length > 0) {
    loadModelFromFile(e.dataTransfer.files[0]);
  }
});

loading.style.display = 'block';
loader.load(
  './product.glb',
  (gltf) => {
    try {
      model = gltf.scene || gltf.scenes?.[0];
      if (!model) {
        console.error('GLB has no scene');
        loading.style.display = 'none';
        return;
      }
      model.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material) {
            if (c.material.isMeshStandardMaterial || c.material.isMeshPhongMaterial) {
              c.material.envMapIntensity = 1.0;
            }
          }
        }
      });
      normalizeModel(model);
      captureOriginalMaterials(model);
      scene.add(model);
      safeFrame(model);
      initialCameraPos = camera.position.clone();
      initialTarget = controls.target.clone();
      loading.style.display = 'none';
      console.log('Model loaded successfully');
    } catch (err) {
      console.error('Error processing model:', err);
      loading.style.display = 'none';
    }
  },
  (progress) => {
    const percentage = (progress.loaded / progress.total) * 100;
    console.log(`Loading: ${percentage.toFixed(0)}%`);
  },
  (err) => {
    console.error('Error loading model:', err);
    loading.style.display = 'none';
    alert('Failed to load model. Make sure product.glb exists in the root directory.');
  }
);

document.getElementById('bgLight')?.addEventListener('click', () => setBackground('light'));
document.getElementById('bgDark')?.addEventListener('click', () => setBackground('dark'));
document.getElementById('bgTransparent')?.addEventListener('click', () => setBackground('transparent'));

document.getElementById('envPreset')?.addEventListener('change', (e) => {
  const file = e.target.value;
  loadHDRI(file);
});

document.getElementById('shadowQuality')?.addEventListener('change', (e) => {
  setShadowQuality(e.target.value);
});

document.getElementById('gridBtn')?.addEventListener('click', () => {
  grid.visible = !grid.visible;
});

document.getElementById('presetFront')?.addEventListener('click', cameraPresetFront);
document.getElementById('presetSide')?.addEventListener('click', cameraPresetSide);
document.getElementById('presetTop')?.addEventListener('click', cameraPresetTop);

document.getElementById('resetBtn')?.addEventListener('click', () => {
  camera.position.copy(initialCameraPos);
  controls.target.copy(initialTarget);
  controls.update();
});

document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
  if (!document.fullscreenElement) container.requestFullscreen();
  else document.exitFullscreen();
});

document.getElementById('autoRotateToggle')?.addEventListener('change', (e) => {
  autoRotate = e.target.checked;
});

document.getElementById('colorPicker')?.addEventListener('input', (e) => {
  applyColor(e.target.value);
});

document.getElementById('textureSelect')?.addEventListener('change', (e) => {
  applyTexture(e.target.value);
});

document.getElementById('resetAppearanceBtn')?.addEventListener('click', () => {
  resetAppearance();
});

document.getElementById('screenshotBtn')?.addEventListener('click', () => {

  const originalWidth = renderer.domElement.width;
  const originalHeight = renderer.domElement.height;
  const scale = 2;

  renderer.setSize(originalWidth * scale, originalHeight * scale);
  renderer.render(scene, camera);

  const dataURL = renderer.domElement.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `screenshot-${Date.now()}.png`;
  link.href = dataURL;
  link.click();

  renderer.setSize(originalWidth, originalHeight);
});

let lastTime = Date.now();
function animate() {
  requestAnimationFrame(animate);
  try {
    if (autoRotate && model) {
      model.rotation.y += 0.003;
    }
    controls.update();
    renderer.render(scene, camera);
  } catch (err) {
    console.error('Render error:', err);
  }
}
animate();

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    try {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    } catch (err) {
      console.error('Resize error:', err);
    }
  }, 250);
});