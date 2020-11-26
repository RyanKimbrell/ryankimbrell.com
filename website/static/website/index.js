import * as THREE from './node_modules/three/build/three.module.js';


function main() {


  // =======================================================================
  // CANVAS & RENDERER 

  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    premultipliedAlpha: false,
    antialias: true,
  });
  renderer.setClearColor(0x162B34, 0.5);

  // =======================================================================
  // PERSPECTIVE CAMERA
  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 20;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;
  camera.position.x = -1.5 + window.scrollY / 250.0;
  camera.position.y = -1.5 + window.scrollY / 250.0;

  // =======================================================================
  // SCENE
  const scene = new THREE.Scene();

  // =======================================================================
  // LIGHTING

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  // =======================================================================
  // UTILITY FUNCTIONS

  // Resizes the renderer to the display size if necessary.
  // Returns true is resized, false if not
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  // Updates the position of the camera based on how far you've scrolled.
  function updateCamera(ev) {
    const div1 = document.getElementById("div1");
    camera.position.x = -1.5 + window.scrollY / 250.0;
    camera.position.y = -1.5 + window.scrollY / 500.0;
  }

  // Rotates the wireframe geometry based on how far you've scrolled.
  function rotateLine(ev) {
    icosahedrons.forEach((line, ndx) => {
      //const speed = 0.1 + ndx * .1;
      //const rot = time * speed;
      line.rotation.x = window.scrollY / 250.0;
      line.rotation.y = window.scrollY / 250.0;
    });
  }

  // returns a random float between 0 and 1 
  // (also adds 0.1 if it's 0.0 to avoid div by 0 error)
  function randomFloat() {

    const float = Math.random();
    if (float == 0.0) {
      float += 0.1;
    }
    return float;

  }

  // returns a random int between the min and max inclusive
  function randomInt(min, max) {

    const min = Math.ceil(min);
    const max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);

  }

  // =======================================================================
  // GEOMETRY/WIREFRAME/MESH DEFINITION

  const radius =  1;
  const detail = 1;
  const geometry = new THREE.IcosahedronBufferGeometry(radius, detail);
  const cubeWireframe = new THREE.WireframeGeometry(geometry);

  function makeInstance(wireframe, opacity, x, y, z) {

    const line = new THREE.LineSegments(wireframe);

    line.material.depthTest = false;
    line.material.opacity = opacity;
    line.material.transparent = false;

    scene.add(line);

    line.position.x = x;
    line.position.y = y;
    line.position.z = z;


    return line;
  }
  // =======================================================================
  // MESH ARRAYS


  // ICOSAHEDRONS
  const icosahedrons = [

    makeInstance(cubeWireframe, 0.75, -2, -2, -10),
    makeInstance(cubeWireframe, 0.1, 0, -2, -5),
    makeInstance(cubeWireframe, 0.25, 2, -2, 0),
    makeInstance(cubeWireframe, 0.8, -2, 0, -2),
    makeInstance(cubeWireframe, 0.5, -2, 2, -6),
    makeInstance(cubeWireframe, 0.35, 0, 0, -14),
    makeInstance(cubeWireframe, 0.6, 0, 2, -5),
    makeInstance(cubeWireframe, 0.9, 2, 0, -4),
    makeInstance(cubeWireframe, 0.24, 2, -2, -8),
    makeInstance(cubeWireframe, 0.69, 2, 2, -10),
    makeInstance(cubeWireframe, 0.4, 2, 2, -10),

  ]



  // =======================================================================
  // RENDER FUNCTION

  function render(time) {
   
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    /*
    cubes.forEach((cube, ndx) => {
      const speed = 0.1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });
    */


    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  // =======================================================================
  // EVENT LISTENERS FOR INTERACTIVE ANIMATION
  window.addEventListener("scroll", updateCamera);
  window.addEventListener("scroll", rotateLine);


}

main();