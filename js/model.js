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
const showMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5, color: customColor });

// Сцена, камера и рендерер
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
const renderer = new THREE.WebGLRenderer();

// Переменные для сохранения оригинальных материалов
let l2OriginalMaterial = null;
let roofOriginalMaterial = null;
let roof1OriginalMaterial = null;
let hallOriginalMaterial = null;
let garageOriginalMaterial = null;

// Переменная для отслеживания состояния второго этажа
let isL2Enabled = false;
let isL3Enabled = false;
let isL4Enabled = false;

// Функция для создания текстуры из canvas
function createTextureFromCanvas(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = textureConfig.wrapS;
  texture.wrapT = textureConfig.wrapT;
  texture.repeat.set(textureConfig.repeat.x, textureConfig.repeat.y);
  return texture;
}

// Функция для скрытия объекта
function hideObject(object) {
  if (object) {
    object.visible = false;
  }
}

// Функция для показа объекта с выбранным материалом
function showObjectWithMaterial(object, material) {
  if (object) {
    object.material = material;
    object.visible = true;
  }
}

// Функция для начальной настройки баннеров
function startBanners() {
  loadingBanner.style.display = "flex";
  loadingText.innerText = "Загрузка 3D объектов";
}

// Функция для отключения баннеров
function stopBanners() {
  loadingBanner.style.display = "none";
}

// Функция для обновления положения камеры
function updateCameraPosition() {
  const minCameraY = -1;
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

// Инициализация сцены, камеры и контролов
function init() {
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
      stopBanners();
    });
  });

  // Загрузка модели "Home"
  const homeLoader = new OBJLoader();
  const homeMtlLoader = new MTLLoader();
  homeMtlLoader.load('./js/3D-object/home.mtl', (materials) => {
    materials.preload();
    homeLoader.setMaterials(materials);

    homeLoader.load('./js/3D-object/home.obj', function (object) {
      object.position.set(object.position.x, -2, object.position.z);
      object.name = "Home";

      // Скрываем элементы
      const l2 = object.getObjectByName("L-2");
      const roff = object.getObjectByName("Roof");
      const roff1 = object.getObjectByName("Roof1");
      const garage = object.getObjectByName("Garage");
      const hall = object.getObjectByName("Hall");

      if (l2) {
        l2.visible = false;
        l2OriginalMaterial = l2.material;
      }

      if (roff) {
        roff.visible = false;
        roofOriginalMaterial = roff.material;
      }
      if (roff1) {
        roof1OriginalMaterial = roff1.material;
      }

      if (garage) {
        garage.visible = false;
        garageOriginalMaterial = garage.material;
      }

      if (hall) {
        hall.visible = false;
        hallOriginalMaterial = hall.material;
      }

      scene.add(object);
    });
  });

  camera.position.z = 8;
  camera.position.x = 2;
  camera.position.y = 2;

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
  controls.minDistance = 3;
  controls.maxDistance = 10;
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




const l2Button = document.getElementById("l111");
l2Button.addEventListener('mouseover', handleMouseOver);
l2Button.addEventListener('mouseout', handleMouseOut);
l2Button.addEventListener('click', handleClick);


function handleMouseOver() {
  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      const l2 = homeObject.getObjectByName("L-2");
      const roof1 = homeObject.getObjectByName("Roof1");
      const roof = homeObject.getObjectByName("Roof");

      // Показываем элементы только если второй этаж не включен
      if (!isL2Enabled) {
        // Сохраняем оригинальные материалы при показе элементов
        if (l2 && !l2OriginalMaterial) {
          l2OriginalMaterial = l2.material;
        }
        if (roof1 && !roof1OriginalMaterial) {
          roof1OriginalMaterial = roof1.material;
        }
        if (roof && !roofOriginalMaterial) {
          roofOriginalMaterial = roof.material;
        }

        // Скрыть "Roof1"
        hideObject(roof1);

        // Показать "L-2" и "Roof" с выбранным материалом
        showObjectWithMaterial(l2, showMaterial);
        showObjectWithMaterial(roof, showMaterial);
      }
    }
  }
}

// Обработчик события при убирании курсора с кнопки L-2
function handleMouseOut() {
  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      const l2 = homeObject.getObjectByName("L-2");
      const roof1 = homeObject.getObjectByName("Roof1");
      const roof = homeObject.getObjectByName("Roof");

      // Выполняем действия только если второй этаж не включен
      if (!isL2Enabled) {
        // Восстанавливаем оригинальные материалы при убирании курсора
        if (l2OriginalMaterial) {
          l2.material = l2OriginalMaterial;
        }
        if (roof1OriginalMaterial) {
          roof1.material = roof1OriginalMaterial;
        }
        if (roofOriginalMaterial) {
          roof.material = roofOriginalMaterial;
        }

        // Скрываем "L-2" и "Roof" при убирании курсора
        hideObject(l2);
        hideObject(roof);

        // Показываем "Roof1"
        showObjectWithMaterial(roof1, roof1OriginalMaterial);
      }
    }
  }
}

// Обработчик события клика по кнопке L-2
function handleClick() {
  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      const l2 = homeObject.getObjectByName("L-2");
      const roof = homeObject.getObjectByName("Roof");
      const roof1 = homeObject.getObjectByName("Roof1");

      // Переключаем состояние второго этажа
      if (isL2Enabled) {
        hideObject(l2);
        hideObject(roof);
        showObjectWithMaterial(roof1, roof1OriginalMaterial);
      } else {
        // Если второй этаж выключен, восстанавливаем оригинальные материалы
        showObjectWithMaterial(l2, l2OriginalMaterial);
        showObjectWithMaterial(roof, roofOriginalMaterial);
      }
      isL2Enabled = !isL2Enabled;
    }
  }
}

const l3Button = document.getElementById("l222");
l3Button.addEventListener('mouseover', handleMouseOver2);
l3Button.addEventListener('mouseout', handleMouseOut2);
l3Button.addEventListener('click', handleClick2);


// Обработчик события клика по кнопке L-2
function handleClick2() {
  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      const hall = homeObject.getObjectByName("Hall");

      // Переключаем состояние второго этажа
      if (isL3Enabled) {
        handleClick()
        hideObject(hall);
      } else {
        handleClick()
        showObjectWithMaterial(hall, hallOriginalMaterial);
      }
      isL3Enabled = !isL3Enabled;
    }
  }
}

function handleMouseOver2() {
  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      const hall = homeObject.getObjectByName("Hall");

      // Показываем элементы только если второй этаж не включен
      if (!isL3Enabled) {
        // Сохраняем оригинальные материалы при показе элементов
        if (hall && !hallOriginalMaterial) {
          hallOriginalMaterial = hall.material;
        }

        handleMouseOver()
        showObjectWithMaterial(hall, showMaterial);
      }
    }
  }
}

// Обработчик события при убирании курсора с кнопки L-2
function handleMouseOut2() {
  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      const hall = homeObject.getObjectByName("Hall");

      // Выполняем действия только если второй этаж не включен
      if (!isL3Enabled) {
        // Сохраняем оригинальные материалы при показе элементов
        if (hall && !hallOriginalMaterial) {
          hallOriginalMaterial = hall.material;
        }

        handleMouseOut()
        hideObject(hall);
      }
    }
  }
}

const l4Button = document.getElementById("l333");
l4Button.addEventListener('mouseover', handleMouseOver3);
l4Button.addEventListener('mouseout', handleMouseOut3);
l4Button.addEventListener('click', handleClick3);


// Обработчик события клика по кнопке L-2
function handleClick3() {
  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      const garage = homeObject.getObjectByName("Garage");

      // Переключаем состояние второго этажа
      if (isL4Enabled) {
        handleClick()
        hideObject(garage);
      } else {
        handleClick2()
        showObjectWithMaterial(garage, garageOriginalMaterial);
      }
      isL4Enabled = !isL4Enabled;
    }
  }
}

function handleMouseOver3() {
  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      const garage = homeObject.getObjectByName("Garage");

      // Показываем элементы только если второй этаж не включен
      if (!isL4Enabled) {
        // Сохраняем оригинальные материалы при показе элементов
        if (garage && !garageOriginalMaterial) {
          garageOriginalMaterial = garage.material;
        }

        handleMouseOver2()
        showObjectWithMaterial(garage, showMaterial);
      }
    }
  }
}

// Обработчик события при убирании курсора с кнопки L-2
function handleMouseOut3() {
  if (scene) {
    const homeObject = scene.getObjectByName("Home");

    if (homeObject) {
      const garage = homeObject.getObjectByName("Garage");

      // Выполняем действия только если второй этаж не включен
      if (!isL4Enabled) {
        // Сохраняем оригинальные материалы при показе элементов
        if (garage && !garageOriginalMaterial) {
          garageOriginalMaterial = garage.material;
        }

        handleMouseOut2()
        hideObject(garage);
      }
    }
  }
}
