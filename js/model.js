import * as THREE from 'three';

import { OBJLoader } from './three/examples/jsm/loaders/OBJLoader.js';

import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js';

import { MTLLoader } from './three/examples/jsm/loaders/MTLLoader.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { lightingConfig } from './3D-object/config/lightingConfig.js';
import { textureConfig } from './3D-object/config/textureConfig.js';

// HTML элементы
const container = document.getElementById('layout-3d-three');
const canvas = document.getElementById("canvas");
const loadingBanner = document.getElementById("loading-banner");
const loadingText = document.getElementById("loading-text");

// Материалы
const customColor = new THREE.Color(0x5221d1);
const customColorRed = new THREE.Color(0xff0000);
const showMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5, color: customColor });
const hideMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.3, color: customColorRed });
// Переменные для сохранения оригинальных материалов
const originalMaterials = {};
const buttons = [
  { buttonId: "layout-type-1", elementsToShow: ["L-1", "Roof1", "V-1"], elementsToHide: ["L-2", "Roof", "Hall", "Garage", 'V-h', 'V-g', 'V-2'] },
  { buttonId: "layout-type-2", elementsToShow: ["L-2", "Roof", 'V-2'], elementsToHide: ["Roof1", "Hall", "Garage", "V-1", 'V-h', 'V-g',] },
  { buttonId: "layout-type-3", elementsToShow: ["L-2", "Roof", 'V-2', "Hall", "V-h"], elementsToHide: ["Roof1", "Garage", "V-1", 'V-g',] },
  { buttonId: "layout-type-4", elementsToShow: ["L-2", "Roof", 'V-2', "Hall", "Garage", "V-h", 'V-g'], elementsToHide: ["Roof1", "V-1"] },
];

// Сцена, камера и рендерер
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.8, 1000);
const initialCameraPosition = new THREE.Vector3(-2.07, -1.94, 3.66); // Начальная позиция камеры
const lookAtPosition = new THREE.Vector3(0, -10, -10); // Позиция, на которую камера смотрит
var renderer = new THREE.WebGLRenderer({ antialias: true });

const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load('imgs/sky-1.jpg'), //imgs/sky-1.jpg
  side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);

const backgroundCheckbox = document.getElementById('check_bg');
const roofCheckbox = document.getElementById('check_roof');
const l2Checkbox = document.getElementById('check_l2');
let backgroundCheckboxisChecked = false
let roofCheckboxChecked = true
let l2CheckboxChecked = true

// Добавляем обработчик события при изменении состояния чекбокса
backgroundCheckbox.addEventListener('change', function () {
  // Получаем состояние чекбокса
  backgroundCheckboxisChecked = backgroundCheckbox.checked;

  // Вызываем функцию ShowBackgroundModel в зависимости от состояния чекбокса
  ShowBackgroundModel();
});
roofCheckbox.addEventListener('change', handleRoofCheckboxChange);
l2Checkbox.addEventListener('change', handleL2CheckboxChange);

function handleRoofCheckboxChange() {
  roofCheckboxChecked = roofCheckbox.checked;
  if (scene) {
    const homeObject = scene.getObjectByName("Home");
    let isL2Show = isElementVisible(homeObject, "L-2");

    if (homeObject) {
      if (roofCheckboxChecked) {
        if (isL2Show) {
          initElementsHome(homeObject, ["Roof", 'V-2'], true, false);
        } else {
          initElementsHome(homeObject, ["Roof1", 'V-1'], true, false);
        }
        initElementsHome(homeObject, ["L-2-top", 'L-1-top'], false, false);
      } else {
        if (isL2Show) {
          initElementsHome(homeObject, ["Roof", 'V-2'], false, false);
          initElementsHome(homeObject, ["L-2-top"], true, false);
        } else {
          initElementsHome(homeObject, ["Roof1", 'V-1'], false, false);
          initElementsHome(homeObject, ["L-1-top"], true, false);
        }
      }
    }
  }
}
function handleL2CheckboxChange() {
  l2CheckboxChecked = l2Checkbox.checked;
  if (scene) {
    const homeObject = scene.getObjectByName("Home");
    let isL2Show = isElementVisible(homeObject, "L-2");

    if (homeObject) {
      if (!l2CheckboxChecked) {
        if (isL2Show) {
          initElementsHome(homeObject, ["Roof", "L-2", "L-2-top", 'V-2'], false, false);
          if (roofCheckboxChecked) {
            initElementsHome(homeObject, ["Roof1", 'V-1'], true, false);
            initElementsHome(homeObject, ["L-1-top"], false, false);
          } else {
            initElementsHome(homeObject, ["Roof1", 'V-1'], false, false);
            initElementsHome(homeObject, ["L-1-top"], true, false);
          }
        } else {
          l2Checkbox.checked = true;
        }
      } else {
        initElementsHome(homeObject, ["L-2", "L-2-top"], true, false);
        initElementsHome(homeObject, ["L-1-top", 'Roof1'], false, false);
        if (roofCheckboxChecked) {
          initElementsHome(homeObject, ["Roof", 'V-2'], true, false);
          initElementsHome(homeObject, ["L-2-top"], false, false);
        } else {
          initElementsHome(homeObject, ["Roof", 'V-2'], false, false);
          initElementsHome(homeObject, ["L-2-top"], true, false);
        }
      }
    }
  }
}

// Функция для создания текстуры из canvas
function createTextureFromCanvas(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = textureConfig.wrapS;
  texture.wrapT = textureConfig.wrapT;
  texture.repeat.set(textureConfig.repeat.x, textureConfig.repeat.y);
  return texture;
}

// Функция для обновления текста баннера
function updateLoadingText(text) {
  loadingText.innerText = text;
}

// Функция для отключения баннеров
function stopBanners() {
  loadingBanner.style.display = "none";
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
function initElementsHome(object, elementsToInit, isVisible, isMaterials = true) {
  elementsToInit.forEach(elementName => {
    const element = object.getObjectByName(elementName);
    if (element) {
      element.visible = isVisible;
      element.castShadow = true;
      if (isMaterials) {
        originalMaterials[elementName] = element.material;
      } else {
        for (const elementName of elementsToInit) {
          const element = object.getObjectByName(elementName);
          element.material = originalMaterials[elementName];
        }
      }

    }
  });
}

function isElementVisible(object, elementName) {
  const element = object.getObjectByName(elementName);
  return element ? element.visible : false;
}

let activeLandscape = "Land-1";
let activeFenceVariant = 1;
function showFenceForLandscape(object, landscape, fenceVariant) {
  const regex1 = new RegExp(`^${landscape}(_\\d+)?$`);
  const regex2 = new RegExp(`${landscape}-zabor-${fenceVariant}(_\\d+)?$`);

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (regex1.test(child.name) || regex2.test(child.name)) {
        child.visible = true;
        child.castShadow = true;
      } else {
        child.visible = false;
      }
    }
  });

  // Вызов функции ShowBackgroundModel() за пределами цикла traverse
  ShowBackgroundModel();
}

function loadModelsAndTextures() {

  updateLoadingText("Загрузка моделей...");

  let modelsLoaded = 0; // Счетчик для отслеживания загруженных моделей

  function checkLoadingComplete() {
    modelsLoaded++;
    if (modelsLoaded === 1) {
      updateLoadingText("Загрузка окружения...");
    }
    if (modelsLoaded === 2) {
      // Обе модели загружены, запускаем stopBanners
      stopBanners();
    }
  }

  // Загрузка модели "Buttom"
  // const bottomLoader = new OBJLoader();
  // const bottomMtlLoader = new MTLLoader();
  // bottomMtlLoader.load('./js/3D-object/module.mtl', (materials) => {

  //   materials.preload();
  //   bottomLoader.setMaterials(materials);

  //   bottomLoader.load('./js/3D-object/module.obj', function (object) {

  //     object.name = "Buttom";

  //     showFenceForLandscape(object, activeLandscape, activeFenceVariant);

  //     object.traverse(function (child) {
  //       if (child instanceof THREE.Mesh) {
  //         if (Array.isArray(child.material)) {
  //           child.material.forEach((material) => {
  //             if (material.map) {
  //               // Установка текстурного фильтра
  //               material.map.magFilter = THREE.LinearFilter;
  //               material.map.minFilter = THREE.LinearMipmapLinearFilter;
  //             }
  //           });
  //         } else {
  //           if (child.material.map) {
  //             // Установка текстурного фильтра
  //             child.material.map.magFilter = THREE.LinearFilter;
  //             child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
  //           }
  //         }
  //       }
  //     });

  //     object.position.set(object.position.x, -2, object.position.z);
  //     object.castShadow = true;
  //     scene.add(object);

  //     checkLoadingComplete();
  //   });
  // });

  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./js/3D-object/drako/'); // Укажите правильный путь к DRACO декодеру
  gltfLoader.setDRACOLoader(dracoLoader);

  // Загрузка GLTF-модели
  gltfLoader.load('./js/3D-object/scena.gltf', (gltf) => {
    const object = gltf.scene;
    object.name = "Buttom";

    // Ваша функция showFenceForLandscape
    showFenceForLandscape(object, activeLandscape, activeFenceVariant);

    // Настройка текстурного фильтра для всех материалов
    object.traverse((child) => {
      if (child.isMesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (material.map) {
            // Установка текстурного фильтра
            material.map.magFilter = THREE.LinearFilter;
            material.map.minFilter = THREE.LinearMipmapLinearFilter;
          }
        });
      }
    });

    object.position.set(object.position.x, -2, object.position.z);
    object.castShadow = true;
    scene.add(object);

    checkLoadingComplete();
  });


  // Загрузка модели "Home"
  const homeLoader = new OBJLoader();
  const homeMtlLoader = new MTLLoader();
  homeMtlLoader.load('./js/3D-object/home.mtl', (materials) => {
    updateLoadingText("Загрузка дома...");

    materials.preload();
    homeLoader.setMaterials(materials);

    homeLoader.load('./js/3D-object/home.obj', function (object) {
      object.position.set(object.position.x, -2.01, object.position.z);
      object.name = "Home";

      initElementsHome(object, ["L-2", "Roof", "Garage", "Hall", 'V-h', 'V-g', 'V-2', 'L-1-top', 'L-2-top'], false)
      initElementsHome(object, ["L-1", "Roof1", "V-1"], true)

      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              if (material.map) {
                // Установка текстурного фильтра
                material.map.magFilter = THREE.LinearFilter;
                material.map.minFilter = THREE.LinearMipmapLinearFilter;
              }
            });
          } else {
            if (child.material.map) {
              // Установка текстурного фильтра
              child.material.map.magFilter = THREE.LinearFilter;
              child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
            }
          }
        }
      });
      object.castShadow = true;
      scene.add(object);
      checkLoadingComplete();
    });
  });
}

function ShowBackgroundModel() {
  if (scene) {
    const homeObject = scene.getObjectByName("Buttom");
    if (homeObject) {
      const BG = new RegExp(`^BG(_\\d+)?$`);
      homeObject.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (BG.test(child.name)) {
            if (backgroundCheckboxisChecked) {
              scene.add(sky);
            } else {
              scene.remove(sky);
            }
            child.visible = backgroundCheckboxisChecked;
          }
        }
      })
    }
  }
}

// =================== Инициализация сцены, камеры и контролов ==============
function init() {
  updateLoadingText("Настройка сцены, света и фона...");

  renderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true,
    antialias: true
  });
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);;
  renderer.setClearColor(0xFFFFFF);

  container.appendChild(renderer.domElement);

  const ambientLightColor = new THREE.Color(lightingConfig.ambientLightColor);
  const ambientLight = new THREE.AmbientLight(ambientLightColor, lightingConfig.ambientLightIntensity);
  scene.add(ambientLight);

  const directionalLightColor = new THREE.Color(lightingConfig.directionalLightColor);
  const directionalLight = new THREE.DirectionalLight(directionalLightColor, lightingConfig.directionalLightIntensity);
  directionalLight.castShadow = true;
  // Разрешение карты теней (чем выше, тем качественнее, но и требовательнее по ресурсам)
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;

  // Расстояние отката теней (чем больше, тем дальше тени будут бросаться)
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 200;

  // Коэффициент смещения теней (может потребоваться настройка)
  directionalLight.shadow.bias = -0.005;
  directionalLight.position.set(
    lightingConfig.directionalLightPosition.x,
    lightingConfig.directionalLightPosition.y,
    lightingConfig.directionalLightPosition.z
  );

  scene.add(directionalLight);

  camera.position.copy(initialCameraPosition);
  camera.lookAt(lookAtPosition);

  loadModelsAndTextures();

  const controls = new OrbitControls(camera, renderer.domElement);

  controls.minPolarAngle = 0; // Ограничение по углу наклона вверх
  controls.maxPolarAngle = Math.PI / 2.0;  // Ограничение по углу наклона вниз
  controls.minDistance = 3.2 ///3.2//3.3;  // Ограничение по дистанции
  controls.maxDistance = 10.3  // Ограничение по дистанции
  controls.enablePan = false; // Отключение перемещения камеры (панорамирования)
  controls.enableDamping = false; // Включение затухания для более плавных движений
  controls.dampingFactor = 1; // Включение затухания для более плавных движений
  controls.rotateSpeed = 0.5; // Скорость вращения

  onWindowResize();

  const animate = () => {
    directionalLight.position.copy(camera.position);
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
  };
  animate();
}

init();

// =================== Функция для обновления текстуры стен ==================
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

// ================ Реализация переключение планировки ===========
const elementInfo = {
  'L-1': { visible: true },
  'Roof1': { visible: true },
  'L-2': { visible: false },
  'Roof': { visible: false },
  'Hall': { visible: false },
  'Garage': { visible: false },
  'V-1': { visible: false },
  'V-2': { visible: false },
  'V-h': { visible: false },
  'V-g': { visible: false },
};

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

      handleRoofCheckboxChange()
      handleL2CheckboxChange()
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

// ============= Смена текстур по data-textures и data-color ===============
const itemsWindows = document.querySelectorAll('#windows .item');
itemsWindows.forEach(item => item.addEventListener('click', function (event) {
  itemsWindows.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');
  const hexColor = event.currentTarget.getAttribute('data-color');
  changeColor(hexColor, 'stavny')
}));
const itemsStovepipe = document.querySelectorAll('#stovepipe .image-item');
itemsStovepipe.forEach(item => item.addEventListener('click', function (event) {
  itemsStovepipe.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');
  const hexColor = event.currentTarget.getAttribute('data-color');
  changeColor(hexColor, 'stovepipe')
}));
const itemsWater = document.querySelectorAll('#water .image-item');
itemsWater.forEach(item => item.addEventListener('click', function (event) {
  itemsWater.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');
  const hexColor = event.currentTarget.getAttribute('data-color');
  changeColor(hexColor, 'water')
}));

const itemsDodo = document.querySelectorAll('#dado .item');
itemsDodo.forEach(item => item.addEventListener('click', function (event) {
  itemsDodo.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');
  const textureUrl = event.currentTarget.getAttribute('data-textures');

  handleClickTexture(textureUrl, 'pallet', "Home")
}));
const itemsCher = document.querySelectorAll('#cher .item');
itemsCher.forEach(item => item.addEventListener('click', function (event) {
  itemsCher.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');
  const textureUrl = event.currentTarget.getAttribute('data-textures');

  handleClickTexture(textureUrl, 'cherepicza', "Home")
}));

const itemsPaving = document.querySelectorAll('#paving .item');
itemsPaving.forEach(item => item.addEventListener('click', function (event) {
  itemsPaving.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');
  const textureUrl = event.currentTarget.getAttribute('data-textures');

  handleClickTexture(textureUrl, 'paving', "Buttom")
}));
const itemsZabor = document.querySelectorAll('#zabor .item');
itemsZabor.forEach(item => item.addEventListener('click', function (event) {
  itemsZabor.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');
  const textureUrl = event.currentTarget.getAttribute('data-textures');

  handleClickTexture(textureUrl, 'zabor', "Buttom")
}));


function changeColor(color, materialName) {
  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      homeObject.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              if (material.name && new RegExp(`-${materialName}(\\.\\d+)?$`).test(material.name)) {
                material.color.set(`#${color}`);
                material.needsUpdate = true;
              }
            });
          } else {
            const material = child.material;
            if (material.name && new RegExp(`-${materialName}(\\.\\d+)?$`).test(material.name)) {
              material.color.set(`#${color}`);
              material.needsUpdate = true;
            }
          }
        }
      });
    }
  }
}
function handleClickTexture(textureUrl, materialName, objectName, size = 0.8) {
  if (scene) {
    const homeObject = scene.getObjectByName(objectName);

    if (homeObject) {
      homeObject.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => {
              if (material.name && new RegExp(`-${materialName}(\\.\\d+)?$`).test(material.name)) {
                const texture = new THREE.TextureLoader().load(textureUrl);
                texture.wrapS = textureConfig.wrapS;
                texture.wrapT = textureConfig.wrapT;
                texture.repeat.set(size, size);
                texture.encoding = THREE.sRGBEncoding;
                material.map = texture;
                material.magFilter = THREE.LinearFilter;
                material.minFilter = THREE.LinearMipmapLinearFilter;
                material.needsUpdate = true;
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
              }
            });
          } else {
            const material = child.material;
            if (material.name && new RegExp(`-${materialName}(\\.\\d+)?$`).test(material.name)) {
              const texture = new THREE.TextureLoader().load(textureUrl);
              texture.wrapS = textureConfig.wrapS;
              texture.wrapT = textureConfig.wrapT;
              texture.repeat.set(size, size);
              texture.encoding = THREE.sRGBEncoding;
              material.map = texture;
              material.magFilter = THREE.LinearFilter;
              material.minFilter = THREE.LinearMipmapLinearFilter;
              material.needsUpdate = true;
              texture.magFilter = THREE.LinearFilter;
              texture.minFilter = THREE.LinearMipmapLinearFilter;
            }
          }
        }
      });
    }
  }
}

// ============= Смена моделей в объекте Bottom ===============
const itemsLand = document.querySelectorAll('#land .item');
itemsLand.forEach(item => item.addEventListener('click', handleClickModelLand));
function handleClickModelLand(event) {
  itemsLand.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');
  activeLandscape = event.currentTarget.getAttribute('data-model');

  if (scene) {
    const object = scene.getObjectByName("Buttom");
    showFenceForLandscape(object, activeLandscape, activeFenceVariant);
  }
}
const itemsTypeZabor = document.querySelectorAll('#type-zabor .item');
itemsTypeZabor.forEach(item => item.addEventListener('click', handleClickModelTypeZabor));
function handleClickModelTypeZabor(event) {
  itemsTypeZabor.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');
  activeFenceVariant = event.currentTarget.getAttribute('data-model');

  if (scene) {
    const object = scene.getObjectByName("Buttom");
    showFenceForLandscape(object, activeLandscape, activeFenceVariant);
  }
}

// ================ Готовые решения ===========================
const itemsReadySolutions = document.querySelectorAll('#readySolutions .item');
itemsReadySolutions.forEach(item => item.addEventListener('click', function (event) {
  itemsReadySolutions.forEach(item => item.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const object = scene.getObjectByName("Buttom");

  const land = event.currentTarget.getAttribute('data-land');
  const bricks = event.currentTarget.getAttribute('data-bricks');
  const color = event.currentTarget.getAttribute('data-color');
  const paving = event.currentTarget.getAttribute('data-paving');
  const zabor = event.currentTarget.getAttribute('data-zabor');
  const cher = event.currentTarget.getAttribute('data-cher');
  const dado = event.currentTarget.getAttribute('data-dado');

  handleClick(["L-2", "Roof", 'V-2', "Hall", "Garage", "V-h", 'V-g'], ["Roof1", "V-1"])
  showFenceForLandscape(object, land, 1);
  handleClickTexture(bricks, 'wall', 'Home', 0.5);
  changeColor(color, 'stavny')
  changeColor(color, 'stovepipe')
  changeColor(color, 'water')
  handleClickTexture(paving, 'paving', 'Buttom');
  handleClickTexture(zabor, 'zabor', 'Buttom');
  handleClickTexture(cher, 'cherepicza', 'Home');
  handleClickTexture(dado, 'pallet', 'Home');
}));

// ============= Реализация скриншота ===========================
const saveButton = document.getElementById("save-screenshot");
const imagePopup = document.getElementById("image-popup");
const popupImage = document.getElementById("popup-image");
const downloadButton = document.getElementById("download-button");
const cancelButton = document.getElementById("cancel-button");
const closeButton = document.getElementById("close-button");

let imageDataUrl = null; // Для хранения URL изображения

saveButton.addEventListener('click', () => {
  try {
    const strMime = "image/png";
    imageDataUrl = renderer.domElement.toDataURL(strMime);

    // Отображаем изображение во всплывающем окне
    popupImage.src = imageDataUrl;
    imagePopup.classList.add('active')
  } catch (e) {
    console.log(e);
    return;
  }
});
downloadButton.addEventListener('click', () => {
  if (imageDataUrl) {
    // Создаем ссылку для скачивания и инициируем скачивание
    const a = document.createElement('a');
    a.href = imageDataUrl;
    a.download = "screenshot.jpg";
    a.click();
  }
});
cancelButton.addEventListener('click', () => {
  // Закрываем всплывающее окно и очищаем данные изображения
  imagePopup.classList.remove('active')
  popupImage.src = "";
  imageDataUrl = null;
});
closeButton.addEventListener('click', () => {
  // Закрываем всплывающее окно и очищаем данные изображения
  imagePopup.classList.remove('active')
  popupImage.src = "";
  imageDataUrl = null;
});
window.jsPDF = window.jspdf.jsPDF;

const doc = new jsPDF({
  orientation: 'p',
  unit: 'mm',
  format: 'a4',
});;

// ===================== PDF ==============================
document.addEventListener("DOMContentLoaded", function () {

  $('#AKBARS').on('click', '.save-pdf', function () {

    let TypeofBricks = $('.group-items.bricklaying .group-item.active h3').html();
    if ($('.group-items.bricklaying .group-item.active .txt p').html() != null) {
      TypeofBricks = TypeofBricks + "(" + $('.group-items.bricklaying .group-item.active .txt p').html() + ")";
    }
    const FormatofBricks = $('.group-items.format .group-item.active h3').html();
    const SeamSizeBricks = $('.group-items.seam .group-item.active h3').html();
    const SeamColorBricks = $('.group-items.seam-color .group-item.active h3').html();
    const SeamColorImg = $('.group-items.seam-color .group-item.active img').attr('src');

    let BricksNames = [];
    $('#chosen-bricks .chosen-brick.active').each(function () {
      BricksNames.push({
        name: $(this).find("h2").text(),
        procent: $(this).find(".percentage b span").text(),
        img: $(this).data('preview')
      });

    });

    const roofingImg = getBackgroundImageUrl('#cher .item.active');
    const dadoImg = getBackgroundImageUrl('#dado .item.active');
    const drainImg = getBackgroundImageUrl('#water .image-item.active');
    const smokestackImg = getBackgroundImageUrl('#stovepipe .image-item.active');
    const windowsImg = getBackgroundImageUrl('#windows .item.active');

    $('#pdf-roofing .img').css('background-image', 'url(' + roofingImg + ')');
    $('#pdf-dado .img').css('background-image', 'url(' + dadoImg + ')');
    $('#pdf-drain .img').css('background-image', 'url(' + drainImg + ')');
    $('#pdf-smokestack .img').css('background-image', 'url(' + smokestackImg + ')');
    $('#pdf-windows .img').css('background-image', 'url(' + windowsImg + ')');

    //  ===================
    $('#pdf-FormatofBricks').text(FormatofBricks)
    $('#pdf-TypeofBricks').text(TypeofBricks)


    $('#pdf-TypeofBricks').text(TypeofBricks)
    $('#shof-text').text(SeamColorBricks + '(' + SeamSizeBricks + ')')
    $('#Shof .img').css('background-image', 'url(' + SeamColorImg + ')');

    $('#pdf-Bricks').children().not('#Shof').remove();

    for (let i = 0; i < BricksNames.length; i++) {
      const text = BricksNames[i].name + " - " + BricksNames[i].procent + " %";
      const imgSrc = BricksNames[i].img;

      const itemDiv = $('<div>').addClass('generator-pdf__item');
      const img = $('<div>').addClass('img').css('background-image', 'url(' + imgSrc + ')');
      const p = $('<p>').text(text);

      itemDiv.append(img).append(p);

      $('#pdf-Bricks').prepend(itemDiv);
    }

    const strMime = "image/png";
    imageDataUrl = renderer.domElement.toDataURL(strMime);
    $('.generator-pdf__screenshot .img').css('background-image', 'url(' + imageDataUrl + ')');

    createPDF();
  });

  function getBackgroundImageUrl(element) {
    var styleAttribute = $(element).attr('style');

    var styles = styleAttribute.split(';');

    var backgroundImageStyle = styles.find(function (style) {
      return style.includes('background-image');
    });

    // Извлечь URL из стиля
    var backgroundImageUrl = backgroundImageStyle.split('url(')[1].split(')')[0];

    return backgroundImageUrl;
  }

});

function createPDF() {

  // Получаем снимок экрана из HTML
  var element = document.getElementById('yourHtmlElement'); // Замените 'yourHtmlElement' на ID или селектор вашего HTML-элемента

  // Преобразуем снимок экрана в изображение
  html2canvas(element, {
    scale: 5, // Увеличьте разрешение
    logging: false, // Включите логирование, чтобы отслеживать процесс
  }).then(function (canvas) {
    var imgData = canvas.toDataURL('image/jpeg', 1.5); // Преобразуем в изображение
    doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);

    // Сохраняем PDF
    doc.save('Akbarskeramic 3D Configuration.pdf');

  });
}

function saveCanvasImage() {
  // Получите элемент <canvas>
  const canvas = document.getElementById("canvas");

  // Получите данные изображения с <canvas>
  const imageData = canvas.toDataURL("image/png");

  // Создайте элемент <a>
  const link = document.createElement("a");

  // Установите атрибуты элемента <a>
  link.href = imageData;
  link.download = "canvas_image.png";

  // Эмулируйте клик на элементе <a> для сохранения файла
  link.click();
}

function toggleVisibility(elementId) {
  const element = document.getElementById(elementId);
  if (element.style.display === "none" || element.style.display === "") {
    element.style.display = "flex";
  } else {
    element.style.display = "none";
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "4") {
    saveCanvasImage();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "1") {
    toggleVisibility("modes");
    toggleVisibility("modes-social");
    toggleVisibility("modes-export");
    toggleVisibility("app-menu");
  }
});
