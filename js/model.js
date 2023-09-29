import * as THREE from 'three';

import { OBJLoader } from './three/examples/jsm/loaders/OBJLoader.js';
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

// Сцена, камера и рендерер
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
const initialCameraPosition = new THREE.Vector3(-2.07, -1.94, 3.66); // Начальная позиция камеры
const lookAtPosition = new THREE.Vector3(0, -10, -10); // Позиция, на которую камера смотрит
var renderer = new THREE.WebGLRenderer();

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
  bottomMtlLoader.load('./js/3D-object/module (old).mtl', (materials) => {
    materials.preload();
    bottomLoader.setMaterials(materials);

    bottomLoader.load('./js/3D-object/module (old).obj', function (object) {
      object.position.set(object.position.x, -2, object.position.z);
      object.name = "Buttom";
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
      object.position.set(object.position.x, -2.01, object.position.z);
      object.name = "Home";

      initElementsHome(object, ["L-2", "Roof", "Garage", "Hall"], false)
      initElementsHome(object, ["L-1", "Roof1",], true)

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

      scene.add(object);

      stopBanners()
    });
  });
}


// Инициализация сцены, камеры и контролов
function init() {
  updateLoadingText("Настройка сцены, света и фона...");

  renderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);;
  renderer.setClearColor(0xFFFFFF);

  container.appendChild(renderer.domElement);

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

  camera.position.copy(initialCameraPosition);
  camera.lookAt(lookAtPosition);

  loadModelsAndTextures();

  const controls = new OrbitControls(camera, renderer.domElement);

  controls.minPolarAngle = 0; // Ограничение по углу наклона вверх
  controls.maxPolarAngle = Math.PI / 1.9;  // Ограничение по углу наклона вниз
  controls.minDistance = 3;  // Ограничение по дистанции
  controls.maxDistance = 10;  // Ограничение по дистанции
  controls.enablePan = false; // Отключение перемещения камеры (панорамирования)
  controls.enableDamping = true; // Включение затухания для более плавных движений
  controls.dampingFactor = 0.5; // Включение затухания для более плавных движений
  controls.rotateSpeed = 0.5; // Скорость вращения

  onWindowResize();

  const animate = () => {


    requestAnimationFrame(animate);

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
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
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
              texture.magFilter = THREE.LinearFilter;
              texture.minFilter = THREE.LinearMipmapLinearFilter;
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

// Обработчик для кнопки "Скачать"
downloadButton.addEventListener('click', () => {
  if (imageDataUrl) {
    // Создаем ссылку для скачивания и инициируем скачивание
    const a = document.createElement('a');
    a.href = imageDataUrl;
    a.download = "screenshot.jpg";
    a.click();
  }
});

// Обработчик для кнопки "Отмена"
cancelButton.addEventListener('click', () => {
  // Закрываем всплывающее окно и очищаем данные изображения
  imagePopup.classList.remove('active')
  popupImage.src = "";
  imageDataUrl = null;
});

// Обработчик для кнопки "Закрыть"
closeButton.addEventListener('click', () => {
  // Закрываем всплывающее окно и очищаем данные изображения
  imagePopup.classList.remove('active')
  popupImage.src = "";
  imageDataUrl = null;
});
