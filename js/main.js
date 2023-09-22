import fontBase64Data from '../pdf/GTWalsheimPro-Regular-normal.js';
import { updateWallTexture } from './model.js';

$(document).ready(function () {
	window.site = "";
	window.versio = "v1.0";
	$('#canvas').width = window.width;
	$('#canvas').height = window.height;
	var seam_folder = site + "seams/";
	let canvas = $('#canvas').get(0), ctx = canvas.getContext("2d"), seam_size, seam_color, brick_height_parameter = $('.group-items.format .group-item.active').data("value"), bias_type, seams = [], imgs = [];
	let brick_width = $('#AKBARS').width() / 20, brick_height = brick_width * brick_height_parameter, brick_texture = 0, i, bias, row, col, cols = 50, rows = 60;

	function setCanvasViewport() {
		$('#canvas').attr("width", $('#AKBARS').width() + "px");
		$('#canvas').attr("height", $('#AKBARS').height() + "px");
	}
	setCanvasViewport();
	function checkBrickAmount() {
		if ($('#canvas').width() <= 600) {
			cols = 40; rows = 40;
			brick_width = $('#AKBARS').width() / 5;
			brick_height = brick_width * brick_height_parameter;
		}
		else if ($('#canvas').width() <= 1920) {
			cols = 70; rows = 80;
			brick_width = $('#AKBARS').width() / 20;
			brick_height = brick_width * brick_height_parameter;
		}
		else {
			cols = 110; rows = 100;
			brick_width = $('#AKBARS').width() / 20;
			brick_height = brick_width * brick_height_parameter;
		}
	}

	checkBrickAmount();

	$(window).resize(function () {
		setCanvasViewport();
		resizeCanvas();
		checkBrickAmount();
		drawBricks();
	});

	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}

	function getTextures() {
		imgs = [];
		$('#chosen-bricks .chosen-brick.active').each(function () {
			let img = new Image();
			img.onload = start;
			img.src = $(this).find("img").attr("src");
			let percent = parseInt($(this).find(".percent-line").val());
			for (let i = 0; i < percent; i++) {
				imgs.push(img);
			}
		});
		shuffleTextures();
	}

	function shuffleTextures() {
		imgs = shuffle(imgs);
	}

	function start() {
		drawBricks();
	}

	function defaultBrickShow() {
		imgs = [];
		let img = new Image(), percent = 100;
		img.onload = start;
		img.src = "bricks/bricks/" + $('.brick-item.active').data("value") + ".png";
		for (let i = 0; i < percent; i++) { imgs.push(img); }
		shuffleTextures();
		clearCanvas();
		getCurrentSettings();
		setSeams();
		singleBrickOrder('spoon', 2);

		updateWallTexture();
	}

	function drawBricks() {
		clearCanvas();
		getCurrentSettings();
		setSeams();

		switch (bias_type) {
			case 'spoon': singleBrickOrder('spoon', 2); break;
			case 'spoon1': singleBrickOrder('spoon1', 4); break;
			case 'spoon2': singleBrickOrder('spoon2', 4); break;
			case 'chain': chainBrickOrder(4); break;
			case 'chaotic': chaoticBrickOrder(4); break;
		}

		getBricksFromCanvas();
		updateWallTexture();
	}

	function singleBrickOrder(type, bias_value) {
		for (col = 0; col < cols; col++) {
			if ($.inArray(type, ["spoon", "spoon1"]) > -1) {
				if (col % 2 == 0) { bias = 0; } else { bias = -1 * brick_width / bias_value; }
			} else {
				bias = col * (-1 * brick_width / bias_value);
			}
			for (row = 0; row < rows; row++) {
				shuffleTextures();


				drawImageWithGradient();
				getBrickShadow();
			}
		}
	}


	function drawImageWithGradient() {
		ctx.save();

		const x = row * brick_width + row * seam_size + bias;
		const y = col * brick_height + col * seam_size;

		const gradient = ctx.createLinearGradient(x + brick_width, y, x, y);
		gradient.addColorStop(0, "rgba(0, 0, 0, 0.1)");
		gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

		ctx.fillStyle = gradient;
		ctx.globalCompositeOperation = "source-atop";

		ctx.drawImage(imgs[row], x, y, brick_width, brick_height);

		ctx.fillRect(x, y, brick_width, brick_height);

		ctx.restore();

	}

	function getBrickShadow() {
		ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
		ctx.shadowBlur = 4;
		ctx.shadowOffsetX = 2;
		ctx.shadowOffsetY = 2;
	}

	function chainBrickOrder(bias_value) {
		var devider = 0, devider_bias = 0;
		for (col = 0; col < cols; col++) {
			if (col % 2 == 0) { bias = 0; } else { bias = -1 * brick_width / bias_value - brick_width; }
			for (row = 0; row < rows; row++) {
				if (row % 3 == 0) { devider = 2; } else { devider = 1; }
				if (row % 3 == 1) { devider_bias = Math.round(row / 3) * brick_width / 2; }
				shuffleTextures();
				drawImageWithGradient();
				getBrickShadow();
			}
		}
	}

	function chaoticBrickOrder(bias_value) {
		var devider = 0, devider_bias = 0;
		for (col = 0; col < cols; col++) {
			if (col % 2 == 0) { bias = 0; } else { bias = -1 * brick_width / bias_value - brick_width; }
			devider_bias = 0;
			for (row = 0; row < rows; row++) {
				shuffleTextures();
				devider = Math.floor((Math.random() * 2) + 1);
				drawImageWithGradient();
				if (devider == 2) { devider_bias -= brick_width / 2; }
				getBrickShadow();
			}
		}
	}

	$('#AKBARS').on('click', '.app-menu-item', function () {
		if ($(this).hasClass("chosen")) {
			$(this).removeClass("chosen");
		} else {
			$('.app-menu-item').removeClass("chosen");
			$(this).addClass("chosen");
		}
		openMenuChapter($(this).data("chapter"));
	});

	function openMenuChapter(chapter) {
		if ($('#' + chapter).hasClass("active") == true) {
			$('#app-menu').removeClass("opened");
			$('.app-chapter').removeClass("active");
		} else {
			$('#app-menu').addClass("opened");
			$('.app-chapter').removeClass("active");
			$('#' + chapter).addClass("active");
		}
	}
	$('#AKBARS').on('click', '.group-item', function () {
		var settings = $(this).closest(".group-items").data("settings"), value = $(this).data("value");
		$(this).closest(".group-items").find(".group-item").removeClass("active");
		$(this).addClass("active");
		drawBricks();
	});

	$('#AKBARS').on('click', '#mode-2d', function () {
		$(this).addClass("active");
		$('#mode-3d').removeClass("active");
		$('#mode-3d-three').removeClass("active");
		$('#house').hide();
		$('#layout-3d-three').hide();
	});
	$('#AKBARS').on('click', '#mode-3d', function () {
		$(this).addClass("active");
		$('#mode-2d').removeClass("active");
		$('#mode-3d-three').removeClass("active");
		$('#house').show();
		$('#layout-3d-three').hide();

	});
	$('#AKBARS').on('click', '#mode-3d-three', function () {
		$(this).addClass("active");
		$('#layout-3d-three').show();

		$('#mode-2d').removeClass("active");
		$('#mode-3d').removeClass("active");
		$('#house').hide();
	});

	$('#AKBARS').on('click', '#canvas, #house', function () { $('#app-menu').removeClass("opened"); $('.app-chapter').removeClass("active"); $('.app-menu-item').removeClass("chosen"); });

	function getBricksFromCanvas() {
		createTexture();
		const imgFromCanvas = dataUrl;
		const blob = base64ToBlob(imgFromCanvas, 'image/jpeg');
		const reader = new FileReader();
		reader.onloadend = function () {
			const base64Jpg = reader.result;
			$('.house .face-textures').css("background-image", "url('" + base64Jpg + "')");
		}
		reader.readAsDataURL(blob);
	}

	function getCurrentSettings() {
		seam_size = $('.group-items.seam .group-item.active').data("value");
		seam_color = $('.group-items.seam-color .group-item.active').index();
		bias_type = $('.group-items.bricklaying .group-item.active').data("value");
		brick_height_parameter = $('.group-items.format .group-item.active').data("value");
		brick_height = brick_width * brick_height_parameter;
	}

	getCurrentSettings();

	function clearCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	function getSeams() {
		$('.group-items.seam-color .group-item').each(function () {
			var color = $(this).data("value");
			let img = new Image();
			img.onload = imgLoaded;
			img.src = seam_folder + color + ".jpg";
			seams.push(img);
		});
	}
	getSeams();

	function setSeams() {
		for (let i = 0; i < canvas.width; i += 512) {
			for (let j = 0; j < canvas.height; j += 512) {
				ctx.drawImage(seams[seam_color], i, j);
			}
		}
	}

	function imgLoaded() {/*something*/ }
	let dataUrl;
	function createTexture() {
		dataUrl = canvas.toDataURL();
		let img = new Image();
		img.width = canvas.width;
		img.height = canvas.height;
		img.src = dataUrl;
	}



	function generatePDF() {
		let TypeofBricks = $('.group-items.bricklaying .group-item.active h3').html();
		if ($('.group-items.bricklaying .group-item.active .txt p').html() != null) {
			TypeofBricks = TypeofBricks + "(" + $('.group-items.bricklaying .group-item.active .txt p').html() + ")";
		}
		const FormatofBricks = $('.group-items.format .group-item.active h3').html();
		const SeamSizeBricks = $('.group-items.seam .group-item.active h3').html();
		const SeamColorBricks = $('.group-items.seam-color .group-item.active h3').html();

		let BricksNames = [];
		let BricksPercentages = [];
		$('#chosen-bricks .chosen-brick.active').each(function () {
			BricksNames.push($(this).find("h2").text());
			BricksPercentages.push($(this).find(".percentage b span").text());
		});

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

		doc.text(10, 35, "Вы выбрали следующую кладку на нашем сайте:");

		createTexture();
		const imgFromCanvas = dataUrl;
		const blob = base64ToBlob(imgFromCanvas, 'image/jpeg');
		const reader = new FileReader();

		reader.onloadend = function () {
			const base64Jpg = reader.result;
			doc.addImage(base64Jpg, 'JPEG', 10, 40, canvasWidthPDF, Math.round(canvasWidthPDF * canvas.height / canvas.width));


			doc.text(10, 140, "Формат кирпичей: " + FormatofBricks);
			doc.text(10, 145, "Размер шва: " + SeamSizeBricks);
			doc.text(10, 150, "Цвет шва: " + SeamColorBricks);
			doc.text(10, 155, "Перевязка: " + TypeofBricks);
			doc.text(10, 165, "Выбранная кладка: ");
			for (let i = 0; i < BricksNames.length; i++) {
				const text = BricksNames[i] + " - " + BricksPercentages[i] + " %";
				const x = 10;
				const y = 175 + i * 5;
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

	$('#AKBARS').on('click', '.save-pdf', function () {
		generatePDF();
	});

	$('#AKBARS').on('click', '.brick-item', function () {
		var img = "bricks/bricks/" + $(this).data("value") + ".png", title = $(this).find("h2").html();
		if ($('#chosen-bricks .chosen-brick.active').length == 5) {

		} else {
			if ($('#chosen-bricks .no-bricks').length == 1) { $('#chosen-bricks .no-bricks').remove(); }
			$(this).hide();
			$('#chosen-bricks').append('<div class="chosen-brick active"><img src="' + img + '"><div class="info"><div class="title"><h2>' + title + '</h2><i class="fa fa-times" data-brick="' + $(this).data("value") + '"></i></div><div class="percentage"><input class="percent-line" type="range" min="0" value="0" max="100" step="1" list="values"><b><span></span>%</b></div></div></div>');
			setPercentage();
			getTextures();
			drawBricks();
		}
	});

	function setPercentage() {
		var amount = $('#chosen-bricks .chosen-brick.active').length, carriage = 0, disabled = true;
		switch (amount) {
			case 1: carriage = 100; disabled = true; break;
			case 2: carriage = 50; disabled = false; break;
			case 3: carriage = 34; disabled = false; break;
			case 4: carriage = 25; disabled = false; break;
			case 5: carriage = 20; disabled = false; break;
		}
		$('#chosen-bricks .chosen-brick.active .percentage .percent-line').val(carriage).attr("disabled", disabled);
		$('#chosen-bricks .chosen-brick.active .percentage span').html(Math.round(100 / amount, 2));
	}

	$('#AKBARS').on('click', '.chosen-brick.active i.fa-times', function () {
		var brick = $(this).data("brick");
		$(this).closest(".chosen-brick").remove();
		$('.brick-item.' + brick).show();
		if ($('#chosen-bricks .chosen-brick').length == 0) {
			$('#chosen-bricks').html('<div class="no-bricks flex-center">Выберите кладку кирпичей</div>');
		} else {
			setPercentage();
			getTextures();
			drawBricks();
		}
	});

	function renewPercentage() {
		$('#chosen-bricks .chosen-brick.active .percent-line').each(function () {
			var value = $(this).val();
			$(this).closest(".chosen-brick.active").find("span").html(value);
		});
	}

	function updatePercents() {
		var totalUsed = 0;
		$(".percent-line").each(function () {
			totalUsed += parseInt($(this).val(), 10);
		});
		var remainingValue = 100 - totalUsed;

		$(".percent-line").each(function () {
			var newVal = parseInt($(this).val(), 10) + (remainingValue / $(".percent-line").length);
			$(this).val(newVal.toFixed(2));
		});
		checkTotalPercentage();
	}

	function checkTotalPercentage() {
		var totalPercent = 0, max = -1000, elemIndex = 0;
		$(".percent-line").each(function () {
			if ($(this).val() > max) { max = $(this).val(); elemIndex = $(this).closest(".chosen-brick").index(); }
			totalPercent += parseInt($(this).val());
		});
		var difference = 100 - totalPercent, maxLine = $(".chosen-brick").eq(elemIndex).find(".percent-line");
		maxLine.val(parseInt(maxLine.val()) + difference);
	}

	$('#AKBARS').on('input', '.chosen-brick.active .percent-line', function () {
		updatePercents();
		renewPercentage();
		getTextures();
		drawBricks();
	});


	function resizeCanvas() {
		var container3D = $('.container-3d'), container = $(window), width, height, proportion = 1.7778;

		if (container.innerWidth() >= container.innerHeight()) {
			if (parseInt(container.innerHeight() * proportion) <= container.innerWidth()) {
				width = parseInt(container.innerHeight() * proportion);
				height = container.innerHeight();
			} else {
				width = container.innerWidth();
				height = width / proportion;
			}
		} else {
			if (parseInt(container.innerWidth() * proportion) <= container.innerWidth()) {
				width = parseInt(container.innerWidth() * proportion);
				height = container.innerWidth();
			} else {
				width = container.innerWidth();
				height = width / proportion;
			}
		}
		container3D.css("height", height + "px").css("width", width + "px");
	}
	resizeCanvas();

	defaultBrickShow();
});
