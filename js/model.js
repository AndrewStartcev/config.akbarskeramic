import fontBase64Data from '../pdf/GTWalsheimPro-Regular-normal.js';
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
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.8, 1000);
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

      initElementsHome(object, ["L-2", "Roof", "Garage", "Hall", 'V-h', 'V-g', 'V-2'], false)
      initElementsHome(object, ["L-1", "Roof1", 'V-1'], true)

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
  controls.minDistance = 3.2//3.3;  // Ограничение по дистанции
  controls.maxDistance = 10;  // Ограничение по дистанции
  controls.enablePan = false; // Отключение перемещения камеры (панорамирования)
  controls.enableDamping = true; // Включение затухания для более плавных движений
  controls.dampingFactor = 0.5; // Включение затухания для более плавных движений
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
  'V-1': { visible: false },
  'V-2': { visible: false },
  'V-h': { visible: false },
  'V-g': { visible: false },
};

const buttons = [
  { buttonId: "layout-type-1", elementsToShow: ["L-1", "Roof1", "V-1"], elementsToHide: ["L-2", "Roof", "Hall", "Garage", 'V-h', 'V-g', 'V-2'] },
  { buttonId: "layout-type-2", elementsToShow: ["L-2", "Roof", 'V-2'], elementsToHide: ["Roof1", "Hall", "Garage", "V-1", 'V-h', 'V-g',] },
  { buttonId: "layout-type-3", elementsToShow: ["L-2", "Roof", 'V-2', "Hall", "V-h"], elementsToHide: ["Roof1", "Garage", "V-1", 'V-g',] },
  { buttonId: "layout-type-4", elementsToShow: ["L-2", "Roof", 'V-2', "Hall", "Garage", "V-h", 'V-g'], elementsToHide: ["Roof1", "V-1"] },
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

    console.log(homeObject)

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
window.jsPDF = window.jspdf.jsPDF;
const doc = new jsPDF({
  orientation: 'p',
  unit: 'mm',
  format: 'a4',
});;
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
    let BricksPercentages = [];
    $('#chosen-bricks .chosen-brick.active').each(function () {
      BricksNames.push({
        name: $(this).find("h2").text(),
        procent: $(this).find(".percentage b span").text(),
        img: $(this).find("img").attr('src')
      });

    });


    //  ===================
    $('#pdf-FormatofBricks').text(FormatofBricks)
    $('#pdf-TypeofBricks').text(TypeofBricks)

    // doc.text(10, 175, "Размер шва: " + SeamSizeBricks);
    // doc.text(10, 180, "Цвет шва: " + SeamColorBricks);
    // doc.text(10, 190, "Выбранная кладка: ");

    $('#pdf-TypeofBricks').text(TypeofBricks)
    $('#shof-text').text(SeamColorBricks + '(' + SeamSizeBricks + ')')
    $('#Shof .img').css(SeamColorImg)

    for (let i = 0; i < BricksNames.length; i++) {
      const text = BricksNames[i].name + " - " + BricksPercentages[i].procent + " %";
      const imgSrc = BricksNames[i].img;

      // Создаем новый элемент div и задаем ему класс
      const itemDiv = $('<div>').addClass('generator-pdf__item');

      // Создаем изображение и устанавливаем атрибут src
      const img = $('<div class="img">').css(imgSrc);

      // Создаем абзац и устанавливаем в него текст
      const p = $('<p>').text(text);

      // Добавляем изображение и абзац в элемент div
      itemDiv.append(img).append(p);

      // Добавляем элемент div в начало контейнера с ID "pdf-Bricks"
      $('#pdf-Bricks').prepend(itemDiv);
    }

    const strMime = "image/png";
    imageDataUrl = renderer.domElement.toDataURL(strMime);
    $('.generator-pdf__screenshot .img').css('background-image', 'url(' + imageDataUrl + ')');

    createPDF();
  });
});


// Функция для загрузки HTML-контента и добавления его в PDF
function createPDF() {



  // Получаем снимок экрана из HTML
  var element = document.getElementById('yourHtmlElement'); // Замените 'yourHtmlElement' на ID или селектор вашего HTML-элемента

  // Преобразуем снимок экрана в изображение
  html2canvas(element, {
    scale: 5, // Увеличьте разрешение
    logging: true, // Включите логирование, чтобы отслеживать процесс
  }).then(function (canvas) {
    var imgData = canvas.toDataURL('image/jpeg', 1.5); // Преобразуем в изображение
    doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);

    // Сохраняем PDF
    doc.save('отчет.pdf');
  });
}


function generatePDF() {


  window.jsPDF = window.jspdf.jsPDF;
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });
  const canvasWidthPDF = doc.internal.pageSize.getWidth() - 20;

  doc.addFileToVFS('customFont.ttf', fontBase64Data);
  doc.addFont('customFont.ttf', 'custom', 'normal');
  doc.setFont('custom');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);

  const akbarslogo = new Image();
  const akbarslogobottom = new Image();
  const akbarsvk = new Image();
  const akbarstg = new Image();
  const akbarsmail = new Image();

  akbarsmail.src = '../pdf/akbarsmail.png';
  akbarslogo.src = '../pdf/logoakbarspdf.jpg';
  akbarsvk.src = '../pdf/akbarsvk.png';
  akbarstg.src = '../pdf/akbarstg.png';
  akbarslogobottom.src = '../pdf/logoakbarspng.png';


  doc.addImage(akbarslogo, 'JPEG', 10, 10, 100, 19);
  doc.link(10, 10, 100, 19, { url: 'https://akbarskeramic.ru/' });

  doc.text(10, 35, "3D Конфигуратор дома:");

  let imageDataUrl = null; // Для хранения URL изображения

  const strMime = "image/png";
  imageDataUrl = renderer.domElement.toDataURL(strMime);

  const imgFromCanvas = imageDataUrl;
  const blob = base64ToBlob(imgFromCanvas, 'image/png');
  const reader = new FileReader();

  reader.onloadend = function () {
    const base64Jpg = reader.result;
    doc.addImage(base64Jpg, 'JPEG', 0, 40, canvasWidthPDF + 20, (canvasWidthPDF * canvas.height / canvas.width));

    doc.text(10, 170, "Формат кирпичей: " + FormatofBricks);
    doc.text(10, 175, "Размер шва: " + SeamSizeBricks);
    doc.text(10, 180, "Цвет шва: " + SeamColorBricks);
    doc.text(10, 185, "Перевязка: " + TypeofBricks);
    doc.text(10, 190, "Выбранная кладка: ");
    for (let i = 0; i < BricksNames.length; i++) {
      const text = BricksNames[i] + " - " + BricksPercentages[i] + " %";
      const x = 10;
      const y = 190 + i * 5;
      doc.text(x, y, text);
    }



    doc.setFillColor(89, 68, 184); // Purple
    doc.rect(0, 250, 210, 50, 'F'); // 'F' for filled rectangle
    doc.addImage(akbarslogobottom, 'PNG', 10, 260, 100, 19);
    doc.link(10, 260, 100, 19, { url: 'https://akbarskeramic.ru/' });

    doc.addImage(akbarsvk, 'PNG', 10, 280, 10, 10);
    doc.link(10, 280, 10, 10, { url: 'https://vk.com/abceramic' });

    doc.addImage(akbarstg, 'PNG', 25, 280, 10, 10);
    doc.link(25, 280, 10, 10, { url: 'https://t.me/akbarskeraramik' });

    doc.addImage(akbarsmail, 'PNG', 40, 280, 10, 10);
    doc.link(40, 280, 10, 10, { url: 'mailto:info-kirpich@akbarskeramic.ru' });


    doc.setTextColor(256, 256, 256);
    doc.text(60, 284, "8 (800) 511-81-06");
    doc.link(60, 279, 50, 5, { url: 'tel:+78005118106' });
    doc.text(60, 289, "akbarskeramic.ru");
    doc.link(60, 284, 50, 5, { url: 'https://akbarskeramic.ru/' });


    doc.save('example.pdf');
  };
  reader.readAsDataURL(blob);
}


function base64ToBlob(base64Data, contentType) {
  const sliceSize = 512;
  const byteCharacters = atob(base64Data.split(',')[1]);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}
