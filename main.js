import * as THREE from 'three';
import WebGL from './js/WebGL.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RectAreaLightUniformsLib } from '../tardisco/node_modules/three/examples/jsm/lights/RectAreaLightUniformsLib';
import { RectAreaLightHelper } from '../tardisco/node_modules/three/examples/jsm/helpers/RectAreaLightHelper';
import { FontLoader } from './node_modules/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from './node_modules/three/examples/jsm/geometries/TextGeometry.js';
import 'animate.css';
import { Lensflare, LensflareElement } from './node_modules/three/examples/jsm/objects/Lensflare.js';

// ? causing error 'require is not defined'
// const TWEEN = require('@tweenjs/tween.js')

// check is user's browser has WebGL available
if (!WebGL.isWebGLAvailable() ) {
  // do something if user does not have WebGL
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById( 'container' ).appendChild( warning );
  throw new Error('WebGL not available.')
} // if WebGL available

init();
const app = {};

// SCENE

const scene = new THREE.Scene();
window.scene = scene;

// CAMERA

// using perspective camera - first attribute field of view (degrees), second is aspect ratio, third/fourth is near and far clipping plane (content outside these frames won't be rendered)
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );

// set camera position
camera.position.set(0,70,300)
// camera.lookAt(new THREE.Vector3(0,0,0))

window.camera = camera;

// RENDERER

// set the size at which to render, in this case width and height of browser window
// note on performance: you can  For performance intensive apps, you can also give setSize smaller values, like window.innerWidth/2 and window.innerHeight/2, which will make the app render at quarter size. If you wish to keep the size of your app but render it at a lower resolution, you can do so by calling setSize with false as updateStyle (the third argument). For example, setSize(window.innerWidth/2, window.innerHeight/2, false) will render your app at half resolution, given that your <canvas> has 100% width and height.
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

// add the renderer element to our HTML document. This is a <canvas> element the renderer uses to display the scene to us.
document.body.appendChild( renderer.domElement );

// A loader for glTF 2.0 resources
const loader = new GLTFLoader();

const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2 );

// INITIALISE

function init(){
  document.addEventListener( 'mousemove', onMouseMove, false );
  document.addEventListener( 'wheel', onMouseWheel, false );
  window.addEventListener( 'resize', onResize, false );

  RectAreaLightUniformsLib.init();
}; // init()

function onMouseMove( event ) {
	mouse.x = ( event.clientX - windowHalf.x );
	mouse.y = ( event.clientY - windowHalf.x );
}

function onMouseWheel( event ) {
  camera.position.z += event.deltaY * 0.1; // move camera along z-axis

  // contact us div drops down onto screen when user zooms out past 900
  const contactDiv = document.querySelector('.contact');
  if(camera.position.z > 900){
    contactDiv.style.display = 'block';
    contactDiv.classList.remove('animate__fadeOutUpBig')
  }else{
    contactDiv.classList.add('animate__fadeOutUpBig')
  } // if camera.position.z > 500
} // onMouseWheel()

function onResize( event ) {
	const width = window.innerWidth;
	const height = window.innerHeight;
  
  windowHalf.set( width / 2, height / 2 );
	
  camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize( width, height );
}

let normalVelocities = [];

// IMPORT 3D MODELS

// import tardis model
loader.load( '/assets/TARDIS-2/TARDIS-2.gltf', function ( gltf ) {
  app.tardis = gltf.scene // .children[0];
  app.tardis.children[0].scale.set(0.5,0.5,0.5);
  // scene.add( app.tardis );
  animate();
}, undefined, function ( error ) {
  console.error( error );
} ); // end .load

// import dalek model
// loader.load( '/assets/DALEK/dalek.gltf', function ( gltf ) {
//   const dalek = gltf.scene.children[0];
//   dalek.scale.set(0.5,0.5,0.5);
//   scene.add( gltf.scene );
// }, undefined, function ( error ) {
//   console.error( error );
// } ); // end .load

// import satellite
loader.load( '/assets/satellite/satellite.gltf', function ( gltf ) {
  app.satellite = gltf.scene;
  app.satellite.children[0].scale.set(300,300,300);
  app.satellite.children[0].rotateX(180);
  app.satellite.children[0].rotateY(-100);
  app.satellite.children[0].rotateZ(1);
  app.satellite.children[0].position.set(-200,800,0)
  scene.add( app.satellite );
}, undefined, function ( error ) {
  console.error( error );
} ); // end .load

// 3D TEXT HEADING 'TARDISCO'

const fontLoader = new FontLoader();
const textMat = new THREE.MeshStandardMaterial( { color: 0xC71E3D, roughness: 0, metalness: 0 } );

fontLoader.load( './node_modules/three/examples/fonts/droid/droid_serif_bold.typeface.json', function ( font ) {

	const textGeo = new TextGeometry( 'Tardisco', {
		font: font,
    size: 120,
    height: 300,
  });
  const textMesh = new THREE.Mesh( textGeo, textMat );

  textGeo.computeBoundingBox();
  const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

  textMesh.position.set(centerOffset,450,-700);
  textMesh.lookAt(centerOffset,100,200);
  scene.add( textMesh);
});

// wormhole cylinder

const wormholeGeo = new THREE.CylinderGeometry( 100, 30, 600, 40, 40, true);
const wormholeMat = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  map: new THREE.TextureLoader().load('assets/nebula.jpeg'),
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.5,
  depthTest: true
  // TODO: double sided
});

const wormhole = new THREE.Mesh( wormholeGeo, wormholeMat );
wormhole.position.set(0,50,-300);
wormhole.rotation.x = Math.PI / 2;
scene.add( wormhole );
app.wormhole = wormhole;

// const meshFloor = new THREE.Mesh(
// 	new THREE.PlaneGeometry(116, 116, 1, 1),
// 	new THREE.MeshPhongMaterial({
// 		color:0xFFFFFF,
// 		shininess:10,
// 		wireframe:false
// 		})
// );
// meshFloor.receiveShadow = true;
// scene.add(meshFloor);
// meshFloor.position.set(0,0,0);

// CELLESTIAL SYSTEM

function createParticleSystem() {

  const numParticles = 2000;
  const distrib = 2000;
  const particles = new THREE.BufferGeometry();
  const positions = [];

  for( let i = 0; i < numParticles ; i++ ){
    positions.push(
        THREE.Math.randInt(-distrib, distrib), // x
        THREE.Math.randInt(-distrib, distrib), // y
        THREE.Math.randInt(-distrib, distrib), // z
    );
    normalVelocities.push(
      0,0,0.25
    );
  } // for each particle

  particles.setAttribute('position', new THREE.Float32BufferAttribute( positions, 3 ) );
  particles.setAttribute('velocity', new THREE.Float32BufferAttribute( normalVelocities , 3) );

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 6,
    map: new THREE.TextureLoader().load('assets/star.png'),
    blending: THREE.AdditiveBlending, 
    transparent: true,
    alphaTest: 0.5
  });

  const particleSystem = new THREE.Points( particles, particleMaterial );

  return particleSystem;

}; //createParticleSystem()

const particleSystem = createParticleSystem();
scene.add( particleSystem );

// create cube with material, color
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );

// cube added to scene at coordinates (0,0,0)
// scene.add( cube );

// LIGHTS

// green hemisphere light

// const hemisphereLight = new THREE.HemisphereLight( 0x605C7F, 0x261E1E, 0.1 );
// scene.add( hemisphereLight );

// add ambient lighting
// const ambientLight = new THREE.AmbientLight( 0x404040 );
// scene.add( ambientLight );

// add directional light
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set(500,200,150)
// const directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, 5 );
// scene.add(directionalLightHelper);
// directionalLight.target = tardis;  // would be good to get this working if needed, directional light will track tardis
scene.add( directionalLight );

const tardiscoTextRectLight = new THREE.RectAreaLight( 0xBF1D3A, 10, 500, 150 );
tardiscoTextRectLight.position.set( 0, 225, 0);
tardiscoTextRectLight.lookAt( -180, 400, -600 );
scene.add( tardiscoTextRectLight );
// scene.add( new RectAreaLightHelper( tardiscoTextRectLight ) );

const greenTardisRectLight = new THREE.RectAreaLight( 0x11FF00, 4, 50, 50 );
greenTardisRectLight.position.set( 0, 100, 10);
greenTardisRectLight.lookAt( 0, 0, 0 );
scene.add( greenTardisRectLight );
// scene.add( new RectAreaLightHelper( greenTardisRectLight ) );

const wormholeStar = new THREE.PointLight( 0xFFFF00, 0.1, 0, 2 );
wormholeStar.castShadow = false;
// wormholeStar.intensity = 20;
// wormholeStar.angle = 0.5;
// wormholeStar.decay = 0;
wormholeStar.position.set( 0, 0, -1000 );
scene.add( wormholeStar );
// const wormholeStarHelper = new THREE.PointLightHelper( wormholeStar )
// scene.add (wormholeStarHelper)

// insert lensflare here
const textureLoader = new THREE.TextureLoader();
const textureFlare0 = textureLoader.load( 'assets/lensflare0.png' );
const textureFlare3 = textureLoader.load( 'assets/lensflare3.png' );

console.log(textureFlare0);
// textureFlare0.image.setSize(1000,1000,1);

const lensflare = new Lensflare();
lensflare.addElement( new LensflareElement( textureFlare0, 400, 0, wormholeStar.color ) );
lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.6 ) );
lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.7 ) );

wormholeStar.add( lensflare );

// var L1_core = new THREE.PointLight(0xFFFFFF, 2.0, 0, 2.0);
// L1_core.castShadow = false;
// scene.add(L1_core);
// L1_core.position.set(-2.20, 0, 0.0050);

// add spotlight
// const spotLight = new THREE.SpotLight( 0xffffff );
// spotLight.position.set(50,50,50);
// spotLight.shadow.mapSize.width = 1024;
// spotLight.shadow.mapSize.height = 1024;
// scene.add( spotLight );

// renders a sphere to visualize a light probe in the scene
// const helper = new THREE.SpotLightHelper(spotLight);
// scene.add( helper );

// Use mouse to control camera 
// const mouseControls = new OrbitControls(camera, renderer.domElement);
// add event listener to mouseControls
// mouseControls.addEventListener('change',() => {
  // const distanceToOrigin = camera.position.distanceTo(scene.position);
  // console.log("camera changed", distanceToOrigin);
// });



function animateParticles() {

  const positions = particleSystem.geometry.attributes.position.array;
  const velocities = particleSystem.geometry.attributes.velocity.array;
  const particles = particleSystem.geometry;
  const particleDistribution = 2000;
  const wormholeVelocities = []
  
  // console.log('in animateParticles(), velocities = ', velocities);

  // if the user zooms in closer than 200
  if (camera.position.z < 200){
    for( let i = 0; i < 2000 ; i++ ){
      wormholeVelocities.push(
        0, // x
        0, // y
        // camera position is mapped between -200 and 200 to give z velocity between 0.25 (slow) and 2 (fast)
        THREE.Math.mapLinear( camera.position.z, 200, -200, 0.25, 50 ) // z
        );
      } // for each particle
      particles.setAttribute('velocity', new THREE.Float32BufferAttribute( wormholeVelocities , 3) );
  // else velocity is default speed of 0.25 
  }else{
    particles.setAttribute('velocity', new THREE.Float32BufferAttribute( normalVelocities , 3) );
  }; // animateParticles()

  for( let i = 0; i < 2000; i++ ){

    const xIndex = i * 3 + 0; // x
    const yIndex = i * 3 + 1; // y
    const zIndex = i * 3 + 2; // z

    // repopulate stars
    if( positions[zIndex] > particleDistribution ){
    // set z-position to -1000
      positions[zIndex] = -particleDistribution;
    }

    // Use the unique xyz velocity of each star to update its xyz position
    positions[xIndex] += velocities[xIndex];
    positions[yIndex] += velocities[yIndex];
    positions[zIndex] += velocities[zIndex];
  } // for loop

  // Tell THREE.js that something has changed about the particle system
  particleSystem.geometry.attributes.position.needsUpdate = true;

}; // animateParticles()



// create a loop that causes the renderer to draw the scene every time the screen is refreshed (on a typical screen this means 60 times per second)
// requestAnimationFrame pauses when the user navigates to another browser tab, hence not wasting processing power and battery life
function animate () {
  
  target.x = ( 1 - mouse.x ) * 0.0015;
  target.y = ( 1 - mouse.y ) * 0.0015;
  
  camera.rotation.x += 0.005 * ( target.y - camera.rotation.x );
  camera.rotation.y += 0.005 * ( target.x - camera.rotation.y );

  animateParticles();
  
  requestAnimationFrame(animate);
    
    // t stuck at 0
    // var t = scrollY / (5000 - innerHeight);
    // camera.position.z = 0.2 + 5 * t;

    // app.tardis.rotation.x += 0.01;
    app.tardis.rotation.y += 0.025;
    app.satellite.rotation.y += 0.0003;
    app.wormhole.rotation.y += 0.01;

    // Unless you need post-processing in linear colorspace, always configure WebGLRenderer as follows when using glTF
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.render( scene, camera );
} // animate();
