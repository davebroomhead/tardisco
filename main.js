import * as THREE from 'three';
import WebGL from './js/WebGL.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// check is user's browser has WebGL available
if (!WebGL.isWebGLAvailable() ) {
  // do something if user does not have WebGL
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById( 'container' ).appendChild( warning );
  throw new Error('WebGL not available.')
} // if WebGL available

init();
const app = {};

const scene = new THREE.Scene();
window.scene = scene;

// using perspective camera - first attribute field of view (degrees), second is aspect ratio, third/fourth is near and far clipping plane (content outside these frames won't be rendered)
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );

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

function init(){
  document.addEventListener( 'mousemove', onMouseMove, false );
  document.addEventListener( 'wheel', onMouseWheel, false );
  window.addEventListener( 'resize', onResize, false );
}; // init()

function onMouseMove( event ) {
	mouse.x = ( event.clientX - windowHalf.x );
	mouse.y = ( event.clientY - windowHalf.x );
}

function onMouseWheel( event ) {
  camera.position.z += event.deltaY * 0.1; // move camera along z-axis
}

function onResize( event ) {
	const width = window.innerWidth;
	const height = window.innerHeight;
  
  windowHalf.set( width / 2, height / 2 );
	
  camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize( width, height );
}

// import tardis model
loader.load( '/assets/TARDIS-2/TARDIS-2.gltf', function ( gltf ) {
  app.tardis = gltf.scene // .children[0];
  app.tardis.children[0].scale.set(0.5,0.5,0.5);
  scene.add( app.tardis );
  animate();
}, undefined, function ( error ) {
  console.error( error );
} ); // end .load

// import tardis model
loader.load( '/assets/DALEK/dalek.gltf', function ( gltf ) {
  const dalek = gltf.scene.children[0];
  dalek.scale.set(0.5,0.5,0.5);
  scene.add( gltf.scene );
}, undefined, function ( error ) {
  console.error( error );
} ); // end .load





function createParticleSystem() {

  const distrib = 200;

  const particles = new THREE.BufferGeometry();

  const positions = [];

  for( let i = 0; i < 500 ; i++ ){
    positions.push(
        THREE.Math.randInt(-distrib, distrib), // x
        THREE.Math.randInt(-distrib, distrib), // y
        THREE.Math.randInt(-distrib, distrib), // z
    );
  } // for each particle

  particles.setAttribute('position', new THREE.Float32BufferAttribute( positions, 3 ) );

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 6,
    map: THREE.ImageUtils.loadTexture('assets/star.png'),
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

// add ambient lighting
// const ambientLight = new THREE.AmbientLight( 0x404040 );
// scene.add( ambientLight );

// add directional light
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set(500,200,-100)
// const directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, 5 );
// scene.add(directionalLightHelper);
// directionalLight.target = tardis;  // would be good to get this working if needed, directional light will track tardis
scene.add( directionalLight );

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

// set camera position
camera.position.set(0,50,120)
// TODO: link this to mouseX and mouseY
// camera.lookAt(new THREE.Vector3(0,0,0))

window.camera = camera;

// create a loop that causes the renderer to draw the scene every time the screen is refreshed (on a typical screen this means 60 times per second)
// requestAnimationFrame pauses when the user navigates to another browser tab, hence not wasting processing power and battery life
function animate () {
  
  target.x = ( 1 - mouse.x ) * 0.0005;
  target.y = ( 1 - mouse.y ) * 0.0005;
  
  camera.rotation.x += 0.05 * ( target.y - camera.rotation.x );
  camera.rotation.y += 0.05 * ( target.x - camera.rotation.y );

  
  requestAnimationFrame(animate);
    
    // t stuck at 0
    // var t = scrollY / (5000 - innerHeight);
    // camera.position.z = 0.2 + 5 * t;

    // app.tardis.rotation.x += 0.01;
    app.tardis.rotation.y += 0.025;

    // Unless you need post-processing in linear colorspace, always configure WebGLRenderer as follows when using glTF
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.render( scene, camera );
} // animate();
