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
  renderer.setClearColor(0x000000);

  // =======================================================================
  // SCENE
  const scene = new THREE.Scene();

  // =======================================================================
  // PERSPECTIVE CAMERA
  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 100;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  const camXOffset = 0;
  const camYOffset = 20
  const camZOffset = 20;


  camera.position.z = camZOffset;
  camera.position.x = camXOffset + window.scrollY / 250.0;
  camera.position.y = camYOffset + window.scrollY / 250.0;

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
  // GRID HELPERS

  const gridSize = 10;
  const gridDivisions = 10;
  const gridHelper = new THREE.GridHelper(gridSize, gridDivisions);

  const polarGridRadius = 10;
  const polarGridRadials = 16;
  const polarGridCircles = 8;
  const polarGridDivisions = 64;
  const polarGridHelper = new THREE.PolarGridHelper(polarGridRadius, polarGridRadials, polarGridCircles, polarGridDivisions)

  const gridShow = false;
  const polar = false;
  if (gridShow) {
    if (polar) {
      scene.add(polarGridHelper);
    } else {
      scene.add(gridHelper);
    }
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

  /*
  // ICOSAHEDRONS
  const icosahedrons = [

    makeIcosahedron(1, 0, 0.75, -8, -2, -10),
    makeIcosahedron(2, 0, 0.1, 0, -6, -5),
    makeIcosahedron(1, 0, 0.25, 2, -7, 0),
    makeIcosahedron(2, 0, 0.8, -2, 0, -2),
    makeIcosahedron(1, 0, 0.5, -6, 8, -6),
    makeIcosahedron(1, 0, 0.35, 5, 6, -14),
    makeIcosahedron(1, 0, 0.6, 10, 2, -5),
    makeIcosahedron(1, 0, 0.9, 2, -6, -4),
    makeIcosahedron(2, 0, 0.24, 4, -2, -8),
    makeIcosahedron(2, 0, 0.69, 2, 3, -10),
    makeIcosahedron(1, 0, 0.4, -5, 7, -10),

  ]
  */

  // SPIRAL OF ICOSAHEDRONS
  const radius = 10;
  const turns = 3;
  const objPerTurn = 30;

  const angleStep = (Math.PI * 2) / objPerTurn;
  const heightStep = 0.5;

  const icoRadius = 1;
  const icoDetail = 0;

  const geom = new THREE.IcosahedronBufferGeometry(icoRadius, icoDetail);
  const wire = new THREE.WireframeGeometry(geom)

  const icos = []

  for (let i = 0; i < turns * objPerTurn; i++) {
    let plane = new THREE.LineSegments(wire)

    // position
    plane.position.set(
      Math.cos(angleStep * i) * radius,
      heightStep * i,
      Math.sin(angleStep * i) * radius
    );

    // rotation
    plane.rotation.y = -angleStep * i;

    scene.add(plane);
    icos.push(plane);

  }
  

  // =======================================================================
  // RENDER FUNCTION

  function render() {
   
    

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }


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

  // Camera moving based on scrollY location
  function updateCamera(ev) {
    const div1 = document.getElementById("div1");
    // camera.position.x = camXOffset + window.scrollY / 250.0;
    camera.position.y = camYOffset + window.scrollY / 700.0;
    // camera.position.z = camYOffset + window.scrollY / 700.0
  }


  // wireframe rotation based on scrollY location
  function rotateLine(ev) {
    icos.forEach((wireframe, ndx) => {
      //const speed = 0.1 + ndx * .1;
      //const rot = time * speed;
      wireframe.rotation.x = ndx + window.scrollY / 250.0;
      wireframe.rotation.y = (ndx * 0.1) + window.scrollY / 250.0;
    });
  }

  function spinMesh(wireframe, time) {
    
    time *= 0.001; //convert to seconds
    const speed = 0.2;
    const rot = time * speed;
    wireframe.rotation.x = rot;
    wireframe.rotation.y = rot;
    wireframe.rotation.z = rot;

  }

  // =======================================================================
  // EVENT LISTENERS FOR INTERACTIVE ANIMATION
  window.addEventListener("scroll", updateCamera);
  window.addEventListener("scroll", rotateLine);


}

main();