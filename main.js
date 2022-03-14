import * as THREE from 'three';
import WebGL from './js/WebGL.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const app = {};

app.init = () => {

  app.scene = new THREE.Scene();

  // using perspective camera - first attribute field of view (degrees), second is aspect ratio, third/fourth is near and far clipping plane (content outside these frames won't be rendered)
  app.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  // set the size at which to render, in this case width and height of browser window
  // note on performance: you can  For performance intensive apps, you can also give setSize smaller values, like window.innerWidth/2 and window.innerHeight/2, which will make the app render at quarter size. If you wish to keep the size of your app but render it at a lower resolution, you can do so by calling setSize with false as updateStyle (the third argument). For example, setSize(window.innerWidth/2, window.innerHeight/2, false) will render your app at half resolution, given that your <canvas> has 100% width and height.
  app.renderer = new THREE.WebGLRenderer();
  app.renderer.setSize( window.innerWidth, window.innerHeight );

  // add the renderer element to our HTML document. This is a <canvas> element the renderer uses to display the scene to us.
  document.body.appendChild( app.renderer.domElement );

  // A loader for glTF 2.0 resources
  const loader = new GLTFLoader();

  // import tardis model
  loader.load( '/assets/TARDIS-2/TARDIS-2.gltf', function ( gltf ) {
    const tardisScene = gltf;
    const tardis = gltf.scene.children[0];
    tardis.scale.set(0.5,0.5,0.5);
    app.scene.add( gltf.scene );
    return tardisScene;
  }, undefined, function ( error ) {
    console.error( error );
  } ); // end .load

  // create cube with material, color
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const cube = new THREE.Mesh( geometry, material );
  
  // cube added to scene at coordinates (0,0,0)
  // app.scene.add( cube );
  
  // add lighting
  app.ambientLight = new THREE.AmbientLight( 0x404040 );
  app.scene.add( app.ambientLight );

  // add spotlight
  app.spotLight = new THREE.SpotLight( 0xffffff );
  app.spotLight.position.set(50,50,50);
  app.spotLight.shadow.mapSize.width = 1024;
  app.spotLight.shadow.mapSize.height = 1024;
  app.scene.add( app.spotLight );

  // renders a sphere to visualize a light probe in the scene
  const helper = new THREE.SpotLightHelper(app.spotLight);
  app.scene.add( helper );

  // Use mouse to control camera 
  app.mouseControls = new OrbitControls(
  app.camera, app.renderer.domElement
  );

  // set camera position
  app.camera.position.set(70,70,70)
  app.camera.lookAt(new THREE.Vector3(0,0,0))
  
  // create a loop that causes the renderer to draw the scene every time the screen is refreshed (on a typical screen this means 60 times per second)
  // requestAnimationFrame pauses when the user navigates to another browser tab, hence not wasting processing power and battery life
  app.animate = () => {
      requestAnimationFrame(app.animate);
      
      app.tardisScene.rotation.x += 0.01;
      app.tardisScene.rotation.y += 0.01;
      
      // Unless you need post-processing in linear colorspace, always configure WebGLRenderer as follows when using glTF
      app.renderer.outputEncoding = THREE.sRGBEncoding;
      app.renderer.render( app.scene, app.camera );
  } // animate();
  
  // check is user's browser has WebGL available
  if (WebGL.isWebGLAvailable() ) {
      // Initiate function or other initializations here
      app.animate();
  } else {
      // do something if user does not have WebGL
      const warning = WebGL.getWebGLErrorMessage();
      document.getElementById( 'container' ).appendChild( warning );
  } // if WebGL available
}; // app.init

window.onload = app.init;
