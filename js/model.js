import * as THREE from 'three';

import { OBJLoader } from './three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from './three/examples/jsm/loaders/MTLLoader.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { lightingConfig } from './3D-object/config/lightingConfig.js';
import { textureConfig } from './3D-object/config/textureConfig.js';

// HTML элементы
const canvas = document.getElementById("canvas");
const loadingBanner = document.getElementById("loading-banner");
const loadingText = document.getElementById("loading-text");


// Материалы
const customColor = new THREE.Color(0x5221d1);
const customColorRed = new THREE.Color(0xff0000);
const showMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5, color: customColor });
const hideMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.3, color: customColorRed });

// Сцена, камера и рендерер
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Переменные для сохранения оригинальных материалов
const originalMaterials = {};

// Функция для создания текстуры из canvas
function createTextureFromCanvas(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = textureConfig.wrapS;
  texture.wrapT = textureConfig.wrapT;
  texture.repeat.set(textureConfig.repeat.x, textureConfig.repeat.y);
  return texture;
}

function startBanners() {
  loadingBanner.style.display = "block";
}

// Функция для обновления текста баннера
function updateLoadingText(text) {
  loadingText.innerText = text;
}

// Функция для отключения баннеров
function stopBanners() {
  loadingBanner.style.display = "none";
}

// Функция для обновления положения камеры
function updateCameraPosition() {
  const minCameraY = -2;
  if (camera.position.y < minCameraY) {
    camera.position.y = minCameraY;
  }
}

// Обработчик события изменения размеров окна
function onWindowResize() {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(newWidth, newHeight);
}
// Инициализация объектов дома
function initElementsHome(object, elementsToInit, isVisible) {
  elementsToInit.forEach(elementName => {
    const element = object.getObjectByName(elementName);
    if (element) {
      element.visible = isVisible;
      originalMaterials[elementName] = element.material;
    }
  });
}

function loadModelsAndTextures() {
  updateLoadingText("Загрузка окружения...");

  // Загрузка модели "Buttom"
  const bottomLoader = new OBJLoader();
  const bottomMtlLoader = new MTLLoader();
  bottomMtlLoader.load('./js/3D-object/module.mtl', (materials) => {
    materials.preload();
    bottomLoader.setMaterials(materials);

    bottomLoader.load('./js/3D-object/module.obj', function (object) {
      object.position.set(object.position.x, -2, object.position.z);
      object.name = "Buttom";
      scene.add(object);
    });
  });

  updateLoadingText("Загрузка дома...");

  // Загрузка модели "Home"
  const homeLoader = new OBJLoader();
  const homeMtlLoader = new MTLLoader();
  homeMtlLoader.load('./js/3D-object/home.mtl', (materials) => {
    materials.preload();
    homeLoader.setMaterials(materials);

    homeLoader.load('./js/3D-object/home.obj', function (object) {
      object.position.set(object.position.x, -2, object.position.z);
      object.name = "Home";

      initElementsHome(object, ["L-2", "Roof", "Garage", "Hall"], false)
      initElementsHome(object, ["L-1", "Roof1",], true)

      scene.add(object);

      stopBanners()
    });
  });
}

// Инициализация сцены, камеры и контролов
function init() {
  updateLoadingText("Настройка сцены, света и фона...");

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xd8d8d8);
  document.getElementById('layout-3d-three').appendChild(renderer.domElement);

  const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
  const skyMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('./imgs/sky-1.jpg'),
    side: THREE.BackSide
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);

  loadModelsAndTextures();

  camera.position.set(0, 2, 3);

  const ambientLightColor = new THREE.Color(lightingConfig.ambientLightColor);
  const ambientLight = new THREE.AmbientLight(ambientLightColor, lightingConfig.ambientLightIntensity);
  scene.add(ambientLight);

  const directionalLightColor = new THREE.Color(lightingConfig.directionalLightColor);
  const directionalLight = new THREE.DirectionalLight(directionalLightColor, lightingConfig.directionalLightIntensity);
  directionalLight.position.set(
    lightingConfig.directionalLightPosition.x,
    lightingConfig.directionalLightPosition.y,
    lightingConfig.directionalLightPosition.z
  );

  scene.add(directionalLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 2;
  controls.maxDistance = 5;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.5;
  controls.minPolarAngle = Math.PI / 4;
  controls.maxPolarAngle = Math.PI / 1.5;


  onWindowResize();

  const animate = () => {
    requestAnimationFrame(animate);

    updateCameraPosition();
    controls.update();

    renderer.render(scene, camera);
  };

  animate();
}

// startBanners();
init();

// Функция для обновления текстуры стен
export function updateWallTexture() {
  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      // Обойдем все дочерние объекты homeObject
      homeObject.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          // Проверяем, есть ли у объекта материалы
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              // Используем регулярное выражение для поиска материалов с приставкой "-wall"
              if (material.name && /-wall(\.\d+)?$/.test(material.name)) {
                const wallTexture = createTextureFromCanvas(canvas);
                wallTexture.encoding = THREE.sRGBEncoding;
                material.map = wallTexture;
                material.color = new THREE.Color(1, 1, 1);
                material.needsUpdate = true;
              }
            });
          } else {
            // Если у объекта только один материал
            const material = child.material;
            if (material.name && /-wall(\.\d+)?$/.test(material.name)) {
              const wallTexture = createTextureFromCanvas(canvas);
              wallTexture.encoding = THREE.sRGBEncoding;
              material.map = wallTexture;
              material.color = new THREE.Color(1, 1, 1);
              material.needsUpdate = true;
            }
          }
        }
      });
    }
  }
}



const elementInfo = {
  'L-1': { visible: true },
  'Roof1': { visible: true },
  'L-2': { visible: false },
  'Roof': { visible: false },
  'Hall': { visible: false },
  'Garage': { visible: false },
};

const buttons = [
  { buttonId: "layout-type-1", elementsToShow: ["L-1", "Roof1"], elementsToHide: ["L-2", "Roof", "Hall", "Garage"] },
  { buttonId: "layout-type-2", elementsToShow: ["L-2", "Roof"], elementsToHide: ["Roof1", "Hall", "Garage"] },
  { buttonId: "layout-type-3", elementsToShow: ["L-2", "Roof", "Hall"], elementsToHide: ["Roof1", "Garage"] },
  { buttonId: "layout-type-4", elementsToShow: ["L-2", "Roof", "Hall", "Garage"], elementsToHide: ["Roof1"] },
];

buttons.forEach(button => {
  const buttonElement = document.getElementById(button.buttonId);

  buttonElement.addEventListener('click', () => {
    buttons.forEach(otherButton => {
      const otherButtonElement = document.getElementById(otherButton.buttonId);
      otherButtonElement.classList.remove('active');
    });

    buttonElement.classList.add('active');

    handleClick(button.elementsToShow, button.elementsToHide)
    updateWallTexture()
  });

  buttonElement.addEventListener('mouseover', handleMouseOver(button.elementsToShow, button.elementsToHide));
  buttonElement.addEventListener('mouseout', handleMouseOut(button.elementsToShow, button.elementsToHide));
});

function handleMouseOver(elementsToShow, elementsToHide) {
  return () => {
    if (scene) {
      const homeObject = scene.getObjectByName("Home");

      if (homeObject) {
        for (const elementName of elementsToShow) {
          const object = homeObject.getObjectByName(elementName);

          if (!elementInfo[elementName].visible) {
            showObjectWithMaterial(object, showMaterial);
          }
        }
        for (const elementName of elementsToHide) {
          const object = homeObject.getObjectByName(elementName);

          if (elementInfo[elementName].visible) {
            object.material = hideMaterial;
          }
        }
      }
    }
  };
}

function handleMouseOut(elementsToShow, elementsToHide) {
  return () => {
    if (scene) {
      const homeObject = scene.getObjectByName("Home");

      if (homeObject) {
        for (const elementName of elementsToShow) {
          const object = homeObject.getObjectByName(elementName);

          if (!elementInfo[elementName].visible) {
            hideObject(object);
          }
        }
      }
      for (const elementName of elementsToHide) {
        const object = homeObject.getObjectByName(elementName);

        if (elementInfo[elementName].visible) {
          object.material = originalMaterials[elementName];
        }
      }
    }
  };
}

function handleClick(elementsToShow, elementsToHide) {
  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      for (const elementName of elementsToShow) {
        const element = homeObject.getObjectByName(elementName);
        elementInfo[elementName].visible = true;
        showObjectWithMaterial(element, originalMaterials[elementName]);
      }
      for (const elementName of elementsToHide) {
        const element = homeObject.getObjectByName(elementName);
        elementInfo[elementName].visible = false;
        hideObject(element);
      }
    }
  }
}

function hideObject(object) {
  if (object) {
    object.visible = false;
  }
}

function showObjectWithMaterial(object, material) {
  if (object) {
    object.material = material;
    object.visible = true;
  }
}
updateWallTexture()

window.addEventListener('resize', onWindowResize);




const itemsWondows = document.querySelectorAll('#windows .item');
const currentColor = new THREE.Color(0x000000);
itemsWondows.forEach(item => item.addEventListener('click', handleClickColor));

function handleClickColor(event) {
  itemsWondows.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');
  const hexColor = event.currentTarget.getAttribute('data-color');
  currentColor.setStyle(`#${hexColor}`);

  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      homeObject.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              if (material.name && /-stavny(\.\d+)?$/.test(material.name)) {
                material.color.set(currentColor);
                material.needsUpdate = true;
              }
            });
          } else {
            const material = child.material;
            if (material.name && /-stavny(\.\d+)?$/.test(material.name)) {
              material.color.set(currentColor);
              material.needsUpdate = true;
            }
          }
        }
      });
    }
  }
}
const itemsDodo = document.querySelectorAll('#dado .item');
itemsDodo.forEach(item => item.addEventListener('click', handleClickTexture));

function handleClickTexture(event) {
  itemsDodo.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');
  const textureUrl = event.currentTarget.getAttribute('data-textures');

  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      homeObject.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              if (material.name && /-pallet(\.\d+)?$/.test(material.name)) {
                const texture = new THREE.TextureLoader().load(textureUrl);
                texture.wrapS = textureConfig.wrapS;
                texture.wrapT = textureConfig.wrapT;
                texture.repeat.set(0.8, 0.8);
                texture.encoding = THREE.sRGBEncoding;
                material.map = texture;
                material.magFilter = THREE.LinearFilter;
                material.minFilter = THREE.LinearMipmapLinearFilter;
                material.needsUpdate = true;
              }
            });
          } else {
            const material = child.material;
            if (material.name && /-pallet(\.\d+)?$/.test(material.name)) {
              const texture = new THREE.TextureLoader().load(textureUrl);
              texture.wrapS = textureConfig.wrapS;
              texture.wrapT = textureConfig.wrapT;
              texture.repeat.set(0.8, 0.8);
              texture.encoding = THREE.sRGBEncoding;
              material.map = texture;
              material.magFilter = THREE.LinearFilter;
              material.minFilter = THREE.LinearMipmapLinearFilter;
              material.needsUpdate = true;
            }
          }
        }
      });
    }
  }
}


const itemsCher = document.querySelectorAll('#cher .item');
itemsCher.forEach(item => item.addEventListener('click', handleClickTextureCher));

function handleClickTextureCher(event) {
  itemsCher.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');
  const textureUrl = event.currentTarget.getAttribute('data-textures');

  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      homeObject.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              if (material.name && /-cherepicza(\.\d+)?$/.test(material.name)) {
                const texture = new THREE.TextureLoader().load(textureUrl);
                texture.wrapS = textureConfig.wrapS;
                texture.wrapT = textureConfig.wrapT;
                texture.repeat.set(1, 1);
                texture.encoding = THREE.sRGBEncoding;
                material.map = texture;
                material.magFilter = THREE.LinearFilter;
                material.minFilter = THREE.LinearMipmapLinearFilter;
                material.needsUpdate = true;
              }
            });
          } else {
            const material = child.material;
            if (material.name && /-cherepicza(\.\d+)?$/.test(material.name)) {
              const texture = new THREE.TextureLoader().load(textureUrl);
              texture.wrapS = textureConfig.wrapS;
              texture.wrapT = textureConfig.wrapT;
              texture.repeat.set(1, 1);
              texture.encoding = THREE.sRGBEncoding;
              material.map = texture;
              material.magFilter = THREE.LinearFilter;
              material.minFilter = THREE.LinearMipmapLinearFilter;
              material.needsUpdate = true;
            }
          }
        }
      });
    }
  }
}
