
import { updateWallTexture } from './model.js';
$(document).ready(function () {

});

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

	$('#AKBARS').on('click', '.tab-menu', function () {
		if ($(this).hasClass("chosen")) {
			$(this).removeClass("chosen");
		} else {
			$('.app-menu-item').removeClass("chosen");
			$(this).addClass("chosen");
		}
		openMenuChapter($(this).data("chapter"), 'opened');
	});

	$('#AKBARS').on('click', '.tab-menu-dop', function () {
		if ($(this).hasClass("active")) {
			$(this).removeClass("active");
		} else {
			$('.tab-menu-dop').removeClass("active");
			$(this).addClass("active");
		}
		openMenuChapterDop($(this).data("chapter"), 'opened-dop');
	});

	function openMenuChapterDop(chapter, active) {
		if ($('#' + chapter).hasClass("active") == true) {
			$('#app-menu').removeClass(active);
			$('.app-chapter-dop').removeClass("active");
		} else {
			$('#app-menu').addClass(active);
			$('.app-chapter-dop').removeClass("active");
			$('#' + chapter).addClass("active");
		}
	}
	function openMenuChapter(chapter, active) {
		$('#app-menu').removeClass('opened-dop');
		if ($('#' + chapter).hasClass("active") == true) {
			$('#app-menu').removeClass(active);
			$('.app-chapter').removeClass("active");
		} else {
			$('#app-menu').addClass(active);
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


$('#layout-3d-three').on('click', function (event) {
	// Проверяем, был ли клик вне элемента #app-menu
	if (!$(event.target).closest('#app-menu').length) {
		// Закрываем все меню и убираем активные классы
		$('.app-menu-item').removeClass("chosen");
		$('.tab-menu-dop').removeClass("active");
		$('.app-chapter').removeClass("active");
		$('#app-menu').removeClass('opened');
		$('#app-menu').removeClass('opened-dop');
	}
});

$('#AKBARS').on('click', '.close-button', function () {
	// Закрываем все меню и убираем активные классы
	$('.app-menu-item').removeClass("chosen");
	$('.tab-menu-dop').removeClass("active");
	$('.app-chapter').removeClass("active");
	$('#app-menu').removeClass('opened');
	$('#app-menu').removeClass('opened-dop');
});
