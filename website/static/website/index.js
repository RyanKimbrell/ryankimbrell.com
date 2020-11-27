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

    const minimum = Math.ceil(min);
    const maximum = Math.floor(max);
    return Math.floor(Math.random() * (maximum - minimum + 1) + minimum);

  }

  /* The three functions below courtesy of Codrops [© Codrops 2018](http://www.codrops.com) */

  // returns a random value between a value and it's negative counterpart
  function getRandomBetween(value) {
    const floor = -value;
    return floor + Math.random() * value * 2;
  }
  
  // adds a little noise to each component of an array
  function getArrayWithNoise(array, noise) {
    return array.map(item => item + getRandomBetween(noise));
  }
  
  // returns a random vlaue from the array passed in
  function getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  }



  // =======================================================================
  // GEOMETRY/MESH/WIREFRAME DEFINITIONS

  function makeIcosahedron(radius, detail, opacity, x, y, z) {

    const icosaRadius = radius;
    const icosaDetail = detail;
    const icosaGeometry = new THREE.IcosahedronBufferGeometry(icosaRadius, icosaDetail);
    
    const icosahedron = makeWireframe(icosaGeometry, opacity, x, y ,z);

    return icosahedron;

  }

  // Takes in a gemoetry, opacity setting and x, y ,z
  // makes a wireframe, adds it to the scene and returns it
  function makeWireframe(geometry, opacity, x, y, z) {

    const wireframeGeometry = new THREE.WireframeGeometry(geometry);

    const wireframe = new THREE.LineSegments(wireframeGeometry);

    wireframe.material.depthTest = false;
    wireframe.material.opacity = opacity;
    wireframe.material.transparent = false;

    scene.add(wireframe);

    wireframe.position.x = x;
    wireframe.position.y = y;
    wireframe.position.z = z;


    return wireframe;
  }
  // =======================================================================
  // MESH ARRAYS


  // ICOSAHEDRONS
  const icosahedrons = [

    makeIcosahedron(1, 0, 0.75, -2, -2, -10),
    makeIcosahedron(2, 0, 0.1, 0, -2, -5),
    makeIcosahedron(1, 0, 0.25, 2, -2, 0),
    makeIcosahedron(2, 0, 0.8, -2, 0, -2),
    makeIcosahedron(1, 0, 0.5, -2, 2, -6),
    makeIcosahedron(1, 0, 0.35, 0, 0, -14),
    makeIcosahedron(1, 0, 0.6, 0, 2, -5),
    makeIcosahedron(1, 0, 0.9, 2, 0, -4),
    makeIcosahedron(2, 0, 0.24, 2, -2, -8),
    makeIcosahedron(2, 0, 0.69, 2, 2, -10),
    makeIcosahedron(1, 0, 0.4, 2, 2, -10),

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


    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  // =======================================================================
  // ANIMATION FUNCTIONS
  function updateCamera(ev) {
    const div1 = document.getElementById("div1");
    camera.position.x = -1.5 + window.scrollY / 250.0;
    camera.position.y = -1.5 + window.scrollY / 700.0;
  }

  function rotateLine(ev) {
    icosahedrons.forEach((line, ndx) => {
      //const speed = 0.1 + ndx * .1;
      //const rot = time * speed;
      line.rotation.x = ndx + window.scrollY / 250.0;
      line.rotation.y = (ndx * 0.1) + window.scrollY / 250.0;
    });
  }

  // =======================================================================
  // EVENT LISTENERS FOR INTERACTIVE ANIMATION
  window.addEventListener("scroll", updateCamera);
  window.addEventListener("scroll", rotateLine);


}

main();