// selectores de elementos en HTML y valores por defecto
var objetivo = document.getElementById("objetivo");
var flechas = document.querySelector(".flechas");
var svg = document.querySelector("svg");

var anguloAleatorio = 0;
var punteo = 0;
var flechasIntentos = 10;

// efectos de sonido
const music = new Audio('../audio/centro.mp3');
const music1 = new Audio('../audio/acierto.mp3');
const music2 = new Audio('../audio/fallo.mp3');


// crea un nuevo elemento SVGPoint inicializado en el origen
// (0, 0), no es visible ni es agregado en al DOM
var cursor = svg.createSVGPoint();

// determinar centro de la diana
var target = {
	x: 900,
	y: 249
};

// representa los limites de la diana
var lineaSegmento = {
	x1: 875,
	y1: 280,
	x2: 925,
	y2: 220
};

// punto de rotación del arco
var pivot = {
	x: 100,
	y: 250
};

// coordenadas iniciales del mouse en el svg
apuntar({
	clientX: 320,
	clientY: 300
});


// variables para generar movimiento
var ajuste;
var velocidad = 4;
var reversa = false;

// Se llama a la funcion en un intervalo de tiempo establecido
// por el usuario en base al nivel de dificultad seleccionado
// o tomando el valor por defecto
window.setInterval(velocidadMovimiento, nivel);

// funcion para generar movimiento en la diana
function velocidadMovimiento() {
	if( reversa === false ){
		target.y = target.y - velocidad;
		lineaSegmento.y1 = lineaSegmento.y1 - velocidad;
		lineaSegmento.y2 = lineaSegmento.y2 - velocidad;
		ajuste = target.y - 250;
		objetivo.style.transform = "translateY(" + ajuste + "px)";
			if (target.y < 99) {
			reversa = true;
		} 

	}

	if(reversa === true ){
		target.y = target.y + velocidad;
		lineaSegmento.y1 = lineaSegmento.y1 + velocidad;
		lineaSegmento.y2 = lineaSegmento.y2 + velocidad;
		ajuste = target.y - 250;
		objetivo.style.transform = "translateY(" + ajuste + "px)";
			if (target.y > 250) {
			reversa = false;
		}

	}
}


// inicializar evento para dibujar la linea de referencia
// al hacer clic en pantalla
window.addEventListener("mousedown", dibujarLinea);


// funcion para dibujar linea de referencia
function dibujarLinea(e) {
	// angulo aleatorio por cada lanzamiento
	anguloAleatorio = (Math.random() * Math.PI * 0.03) - 0.015;

	// cambiar opacidad en x segundos
	TweenMax.to(".arrow-angle use", 0.3, {opacity: 1});

	// inicializar eventos para apuntar y lanzar la flecha
	window.addEventListener("mousemove", apuntar);
	window.addEventListener("mouseup", soltarFlecha);
	apuntar(e);
}


// funcion para normalizar la posición del mouse dentro de las
// coordenadas del SVG
function obtenerMouseSVG(e) {
	cursor.x = e.clientX;
	cursor.y = e.clientY;

	// getScreenTCM() retorna la matriz requerida para convertir
	// las coordenadas, inverse() invierte la matriz para hacer la
	// conversion
	return cursor.matrixTransform(svg.getScreenCTM().inverse());
}


// funcion para apuntar
function apuntar(e) {
	// obtener posición del mouse en relación con la posición
	// y la escala del svg
	var punto = obtenerMouseSVG(e);
	punto.x = Math.min(punto.x, pivot.x - 7);
	punto.y = Math.max(punto.y, pivot.y + 7);
	var dx = punto.x - pivot.x;
	var dy = punto.y - pivot.y;

	// valores para dar forma a la linea guia y rotar el arco
	var angle = Math.atan2(dy, dx) + anguloAleatorio;
	var bowAngle = angle - Math.PI;
	var distance = Math.min(Math.sqrt((dx * dx) + (dy * dy)), 50);
	var scale = Math.min(Math.max(distance / 30, 1), 2);

	// aplicar efecto de rotacion al arco
	TweenMax.to("#bow", 0.3, {
		scaleX: scale,
		rotation: bowAngle + "rad",
		transformOrigin: "right center"
	});

	var arrowX = Math.min(pivot.x - ((1 / scale) * distance), 88);

	// aplicar efecto de rotacion a la flecha
	TweenMax.to(".arrow-angle", 0.3, {
		rotation: bowAngle + "rad",
		svgOrigin: "100 250"
	});
	TweenMax.to(".arrow-angle use", 0.3, {
		x: -distance
	});

	// aplicar efecto de elasticidad en la cuerda del arco
	TweenMax.to("#bow polyline", 0.3, {
		attr: {
			points: "88,200 " + Math.min(pivot.x - ((1 / scale) * distance), 88) + ",250 88,300"
		}
	});

	// efectos en la linea guia (curvatura y rotar)
	var radius = distance * 12;
	var offset = {
		x: (Math.cos(bowAngle) * radius),
		y: (Math.sin(bowAngle) * radius)
	};
	var arcWidth = offset.x * 3;

	TweenMax.to("#arc", 0.3, {
		attr: {
			d: "M100,250c" + offset.x + "," + offset.y + "," + (arcWidth - offset.x) + "," + (offset.y + 50) + "," + arcWidth + ",50"
		},
			autoAlpha: distance/60
	});
}


// funcion para lanzar la flecha
function soltarFlecha() {
	// se deja de apuntar mientras la flecha es lanzada
	window.removeEventListener("mousemove", apuntar);

	// se desactiva la funcion hasta que la flecha se libere de nuevo
	window.removeEventListener("mouseup", soltarFlecha);

	// remueve los efectos de elasticidad del arco regresandolo
	// a sus valores por defecto en HTML
	TweenMax.to("#bow", 0.4, {
		scaleX: 1,
		transformOrigin: "right center",
		ease: Elastic.easeOut
	});
	TweenMax.to("#bow polyline", 0.4, {
		attr: {
			points: "88,200 88,250 88,300"
		},
		ease: Elastic.easeOut
	});

	// crear una nueva flecha
	var nuevaFlecha = document.createElementNS("http://www.w3.org/2000/svg", "use");
	nuevaFlecha.setAttributeNS('http://www.w3.org/1999/xlink', 'href', "#arrow");
	flechas.appendChild(nuevaFlecha);


	// borrar flecha x milisegundos despues de ser lanzada
	window.setInterval(borrarflecha, 800);


	// funcion para borrar flechas existentes
	function borrarflecha(){	
		// si existen flechas, las borra
		if (flechas.hasChildNodes()) {
			flechas.removeChild(nuevaFlecha)
			flechasIntentos -= 1;
			document.getElementById("intento").innerHTML = flechasIntentos;
		}

		// si ya no hay intentos disponibles, se detiene el juego
		if (flechasIntentos == 0) {
			window.removeEventListener("mousedown", dibujarLinea);
			punteoFinal();
		}
	}

	// pathDataToBizier() nos permite crear una ruta que seguira
	// un objeto SVG en base a coordenadas, en este caso la linea guia
	var path = MorphSVGPlugin.pathDataToBezier("#arc");

	// agregar animacion de recorrido a la flecha lanzada
	TweenMax.to([nuevaFlecha], velocidadFlecha, {
		force3D: true,
		bezier: {
			type: "cubic",
			// array de coordenadas creadas
			values: path,
			autoRotate: ["x", "y", "rotation"]
		},
		onUpdate: pruebaGolpe,
		onUpdateParams: ["{self}"],
		onComplete: fallo,
		ease: Linear.easeNone
	});

	// desvanecer la linea de referencia luego de lanzar la flecha
	TweenMax.to("#arc", 0.3, {
		opacity: 0
	});

	// desvanecer la flecha que ya fue lanzada en el arco
	TweenMax.set(".arrow-angle use", {
		opacity: 0
	});
}


// Funcion para mostrar el punteo
function puntos(pts){
	document.getElementById("punteo").innerHTML = pts;
}


// funcion que comprueba si hay colisiones con la flecha y el objetivo
// dependiendo del resultado deplegara un mensaje, un sonido y un punteo
function pruebaGolpe(tween) {
	var arrow = tween.target[0];

	// objeto con los valores de transformacion aplicados
	var transformar = arrow._gsTransform;


	var radianes = transformar.rotation * Math.PI / 180;
	var segmentoFlecha = {
		x1: transformar.x,
		y1: transformar.y,
		x2: (Math.cos(radianes) * 60) + transformar.x,
		y2: (Math.sin(radianes) * 60) + transformar.y

	}

	// verificar si acertó la flecha y en donde
	var interseccion = obtenerInterseccion(segmentoFlecha, lineaSegmento);
	if (interseccion.segmento1 && interseccion.segmento2) {
		tween.pause();

		// verificar coordenadas de golpe
		var dx = interseccion.x - target.x;
		var dy = interseccion.y - target.y;
		var distance = Math.sqrt((dx * dx) + (dy * dy));

		var selector = ".pegar";

		// mostrar mensaje dependiendo de donde ha dado la flecha
		if (distance < 7) {
			selector = ".centro"
			// punteo += 25;
			punteo = punteo + puntosNivel[2]
			music.play();
			puntos(punteo);
		} else {
			// punteo += 10;
			punteo = punteo + puntosNivel[1]
			music1.play();
			puntos(punteo);
		}
		mostrarMensaje(selector);
	}
}


// funcion que se despliega si no detecta una colision, si falla el tiro
function fallo() {
	mostrarMensaje(".fallaste");
	music2.play();
	// punteo -= 5;
	punteo = punteo + puntosNivel[0]
	puntos(punteo);
}


// funcion que maneja todas las animaciones de texto proporcionando selector
function mostrarMensaje(selector) {
	TweenMax.killTweensOf(selector);
	TweenMax.killChildTweensOf(selector);
	TweenMax.set(selector, {
		autoAlpha: 1
	});
	TweenMax.staggerFromTo(selector + " path", .5, {
		rotation: -5,
		scale: 0,
		transformOrigin: "center"
	}, {
		scale: 1,
		ease: Back.easeOut
	}, .05);
	TweenMax.staggerTo(selector + " path", .3, {
		delay: 2,
		rotation: 20,
		scale: 0,
		ease: Back.easeIn
	}, .03);
}


// funcion para encontrar el punto de intersección de dos segmentos de línea 
// y si el punto está o no en cualquiera de los segmentos de línea
function obtenerInterseccion(segmento1, segmento2) {
	var dx1 = segmento1.x2 - segmento1.x1;
	var dy1 = segmento1.y2 - segmento1.y1;
	var dx2 = segmento2.x2 - segmento2.x1;
	var dy2 = segmento2.y2 - segmento2.y1;
	var cx = segmento1.x1 - segmento2.x1;
	var cy = segmento1.y1 - segmento2.y1;
	// distancia entre los puntos
	var denominador = dy2 * dx1 - dx2 * dy1;

	// si no le da a la diana
	if (denominador == 0) {
		return null;
	}

	// obtener punto de golpe
	var ua = (dx2 * cy - dy2 * cx) / denominador;
	var ub = (dx1 * cy - dy1 * cx) / denominador;

	// retorna en que parte de la diana acertó
	return {
		x: segmento1.x1 + ua * dx1,
		y: segmento1.y1 + ua * dy1,
		segmento1: ua >= 0 && ua <= 1,
		segmento2: ub >= 0 && ub <= 1
	};
}
