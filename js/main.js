// pestañas menu (inicio, fondo)
var seleccionado = "inicio";
var mostrar = "contenido-inicio";

function mostrarOpcion(a, b) {
  // oculta menu seleccionado anteriormente
  document.getElementById(seleccionado).style.backgroundColor = "#16273a";
  document.getElementById(mostrar).style.display = "none";

  // muestra menu seleccionado
  document.getElementById(a).style.backgroundColor = "#203955";
  document.getElementById(b).style.display = "block";

  // intercambia los valores del menu que se muestra actualmente
  seleccionado = a;
  mostrar = b;
}


// borde dinamico al escoger fondo y cambiar de fondo
function fondo(a, b, c, d) {
  var opcion = a;
  let video = document.getElementById('video');

  // borde dinamico
  document.getElementById(opcion).style.border = "solid 3px #ddd";
  document.getElementById(b).style.border = "none";
  document.getElementById(c).style.border = "none";
  document.getElementById(d).style.border = "none";

  // cambio de fondo
  if (opcion === 'f1') {
    video.src = '../videos/bosque.mp4';
  } else if (opcion === 'f2') {
    video.src = '../videos/atardecer.mp4';
  } else if (opcion === 'f3') {
    video.src = '../videos/chispas.mp4';
  } else {
    video.src = '../videos/nieve.mp4';
  }
}


// muestra el menu de niveles o instrucciones, o muestra el juego
function mostrarMenu(elemento) {
  document.getElementById(elemento).style.display = 'flex';
}


// cierra menu de niveles o instrucciones, o el juego
function cerrarMenu(elemento) {
  document.getElementById(elemento).style.display = 'none';
}


// dificultad

var nivel = 70
var velocidadFlecha = 0.7

// modificaciones
var puntosNivel = [-5, 10, 25]


function dificultad(opcion) {
  switch (opcion) {
    case 'medio':
      nivel = 40;
      velocidadFlecha = 1.3
      puntosNivel = [-10, 20, 50]
      break;
    case 'avanzado':
      nivel = 15;
      velocidadFlecha = 2;
      puntosNivel = [-15, 30, 75]
      break;
    default:
      // default son los valores por defecto - nivel facil
      break;
  }
}


// mostrar juego

function juego() {
  // mostrar ventana de juego y ocultar menu
  document.getElementById('game').style.display = 'block';
  document.getElementById('puntos').style.display = 'block';
  document.getElementById('intentos').style.display = 'block';
  cerrarMenu('menu')

  // llamada a archivo del juego para poder cargarlo
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'js/script.js';
  script.id = 'temporal';
  document.getElementsByTagName('body')[0].appendChild(script);

  window.addEventListener("mousedown", dibujarLinea);
}


// reiniciar el juego

function reiniciar() {
  location.reload();
}


// mostrar puntaje final

function punteoFinal() {
  document.getElementById('final').innerHTML = punteo;
  mostrarMenu('score')
}
