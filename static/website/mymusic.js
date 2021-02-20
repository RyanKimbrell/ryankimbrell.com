import * as THREE from './node_modules/three/build/three.module.js'
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js'
import * as dat from './node_modules/dat.gui/build/dat.gui.module.js'
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import gsap from './node_moduldes/gsap/gsap-core.gsap'


//====================================================================

/**
 * Loaders
 */

const loadingBarElement = document.querySelector('.loading-bar');

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        gsap.delayedCall(0.5, () => {
            gsap.to(overlayMaterial.uniforms.uAlpha, {duration: 3, value: 0})
            loadingBarElement.classList.add('ended');
            loadingBarElement.style.transform = '';
        })
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal;
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }
);

const gltfLoader = new GLTFLoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);

const fontLoader = new THREE.FontLoader(loadingManager);

//====================================================================

/**
 * Base
 */

// Debug
const gui = new dat.GUI();
dat.GUI.toggleHide();

/**
 * Canvases
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Desk Spectrogram canvas
const spectrogramCanvas = document.querySelector('canvas.spectrogram');

const spectrogramWidth = spectrogramCanvas.width;
const spectrogramHeight = spectrogramCanvas.height;

const spectrogramCanvasContext = spectrogramCanvas.getContext('2d');
spectrogramCanvasContext.clearRect(0, 0, spectrogramWidth, spectrogramHeight);

// Big Spectrogram 3D canvas
const spectrogram3DCanvas = document.querySelector('canvas.spectrogram3D');

const spectrogram3DWidth = spectrogram3DCanvas.width;
const spectrogram3DHeight = spectrogram3DCanvas.height;

const spectrogram3DCanvasContext = spectrogram3DCanvas.getContext('2d');
spectrogram3DCanvasContext.clearRect(0, 0, spectrogram3DWidth, spectrogram3DHeight);

/**
 * Scenes
 */
// Scene
const scene = new THREE.Scene();

// Debug Object (for dat gui)
const debugObject = {};

//====================================================================

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms:
    {
        uAlpha: {value: 1}
    },
    vertexShader: `
    void main()
    {
        gl_Position = vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    uniform float uAlpha;
    void main()
    {
        gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }
    `
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

//====================================================================

/**
 * Textures
 */

// Pet Picture
const petPicture = textureLoader.load('./textures/petPicture.png');

// Matcaps
const matcapRainbow = textureLoader.load('./textures/matcaps/rainbow.png');


//====================================================================

/**
 * Sounds
 */

const audioContext = new AudioContext;

document.body.addEventListener('click', () => {
    audioContext.resume();
 })

let trackIsPlaying = false;

// TRACKS

const spaceBeat = new Audio('./sounds/space_beat_1.mp3');
const whenIMetYou = new Audio('./sounds/when_i_met_you_again.mp3');
const threeAM = new Audio('./sounds/3am_at_hi.mp3');
const butterflies = new Audio('./sounds/butterflies.mp3');
const galaxyTrip = new Audio('./sounds/galaxy_trip.mp3');


// Audio Context
const spaceBeatContext = audioContext.createMediaElementSource(spaceBeat);
const whenIMetYouContext = audioContext.createMediaElementSource(whenIMetYou);
const threeAMContext = audioContext.createMediaElementSource(threeAM);
const butterfliesContext = audioContext.createMediaElementSource(butterflies);
const galaxyTripContext = audioContext.createMediaElementSource(galaxyTrip);

// Analyser
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
console.log(bufferLength);
let fftArray = new Uint8Array(bufferLength);

// Analyser Connection
spaceBeatContext.connect(analyser);
whenIMetYouContext.connect(analyser);
threeAMContext.connect(analyser);
butterfliesContext.connect(analyser);
galaxyTripContext.connect(analyser);

// Destination connection
analyser.connect(audioContext.destination);


const tracks = [spaceBeat, whenIMetYou, threeAM, butterflies, galaxyTrip];

let currentTrackCount = 0;
let currentTrack = tracks[currentTrackCount];

const playTrack = (track) => {
    audioContext.resume();
    track.play();
    trackIsPlaying = true;
}
const pauseTrack = (track) => {
    track.pause();
    trackIsPlaying = false;
}
const stopTrack = (track) => {
    track.pause();
    track.currentTime = 0;
    trackIsPlaying = false;
}
const nextTrack = () => {
    currentTrack.pause();
    currentTrack.currentTime = 0;
    trackNameMeshes[currentTrackCount].visible = false;
    currentTrackCount = (currentTrackCount + 1) % tracks.length;
    currentTrack = tracks[currentTrackCount];
    trackNameMeshes[currentTrackCount].visible = true;
    playTrack(currentTrack);
}
const prevTrack = () => {
    if (currentTrack.currentTime >= 1.0) {
        currentTrack.pause();
        currentTrack.currentTime = 0;
        playTrack(currentTrack);
    } else if (currentTrack.currentTime < 1.0) {
        currentTrack.pause();
        currentTrack.currentTime = 0;
        trackNameMeshes[currentTrackCount].visible = false;
        if (currentTrackCount === 0) {
            currentTrackCount = tracks.length - 1;
        } else {
        currentTrackCount = (currentTrackCount - 1)
        }
        currentTrack = tracks[currentTrackCount];
        trackNameMeshes[currentTrackCount].visible = true;
        playTrack(currentTrack);
    }
    
}

//====================================================================

/**
 * MODELS & OBJECTS
 */

// Array for raycasting intersections
const objectsToTest = []

// Matcap Material
const matcapMaterial = new THREE.MeshMatcapMaterial();
matcapMaterial.matcap = matcapRainbow;

/**
 * Currently Playing Track
 */

// Currently Playing Sign
fontLoader.load('./fonts/GoodGirl_Regular.json', (font) => {

    const currentlyPlayingGeometry = new THREE.TextGeometry( 'Curently Playing:', {
		font: font,
		size: 0.5,
		height: 0.5,
		curveSegments: 5
	} );

    const currentlyPlayingMesh = new THREE.Mesh(
        currentlyPlayingGeometry,
        new THREE.MeshMatcapMaterial({matcap: matcapRainbow})
    );

    currentlyPlayingMesh.position.set(-13, 4, -10);
    currentlyPlayingMesh.rotation.y = Math.PI / 4;
    scene.add(currentlyPlayingMesh);

});

/**
 * Track Names
 */

const trackNameMeshes = [];

const trackNameMeshesFolder = gui.addFolder('trackNameMeshes');

// Space Beat
fontLoader.load('./fonts/GoodGirl_Regular.json', (font) => {

    const spaceBeatGeometry = new THREE.TextGeometry( 'Space Beat', {
		font: font,
		size: 0.5,
		height: 0.5,
		curveSegments: 5
	} );

    const spaceBeatMesh = new THREE.Mesh(
        spaceBeatGeometry,
        new THREE.MeshMatcapMaterial({matcap: matcapRainbow})
    );

    spaceBeatMesh.position.set(7, 3.8, -13);
    spaceBeatMesh.rotation.y = -0.6;
    scene.add(spaceBeatMesh);
    const spaceBeatMeshFolder = trackNameMeshesFolder.addFolder('spaceBeatMesh');
    spaceBeatMeshFolder.add(spaceBeatMesh.position, 'x').min(0).max(10).step(0.001).name('posX');
    spaceBeatMeshFolder.add(spaceBeatMesh.position, 'y').min(0).max(10).step(0.001).name('posY');
    spaceBeatMeshFolder.add(spaceBeatMesh.position, 'z').min(-20).max(0).step(0.001).name('posZ');
    spaceBeatMeshFolder.add(spaceBeatMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotY');
    spaceBeatMeshFolder.add(spaceBeatMesh, 'visible');
    trackNameMeshes.push(spaceBeatMesh)

    spaceBeatMesh.visible = true;

});

// When I Met You Again
fontLoader.load('./fonts/GoodGirl_Regular.json', (font) => {

    const whenIMetYouGeometry = new THREE.TextGeometry( 'When I Met You Again', {
		font: font,
		size: 0.4,
		height: 0.4,
		curveSegments: 5
	} );

    const whenIMetYouMesh = new THREE.Mesh(
        whenIMetYouGeometry,
        new THREE.MeshMatcapMaterial({matcap: matcapRainbow})
    );

    whenIMetYouMesh.position.set(6, 3.8, -13.5);
    whenIMetYouMesh.rotation.y = -0.6;
    scene.add(whenIMetYouMesh);
    const whenIMetYouMeshFolder = trackNameMeshesFolder.addFolder('whenIMetYouMesh');
    whenIMetYouMeshFolder.add(whenIMetYouMesh.position, 'x').min(0).max(10).step(0.001).name('posX');
    whenIMetYouMeshFolder.add(whenIMetYouMesh.position, 'y').min(0).max(10).step(0.001).name('posY');
    whenIMetYouMeshFolder.add(whenIMetYouMesh.position, 'z').min(-20).max(0).step(0.001).name('posZ');
    whenIMetYouMeshFolder.add(whenIMetYouMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotY');
    whenIMetYouMeshFolder.add(whenIMetYouMesh, 'visible');
    trackNameMeshes.push(whenIMetYouMesh);

    whenIMetYouMesh.visible = false;

});

// 3AM at Hï
fontLoader.load('./fonts/GoodGirl_Regular.json', (font) => {

    const threeAMGeometry = new THREE.TextGeometry( '3AM At Hi', {
		font: font,
		size: 0.5,
		height: 0.5,
		curveSegments: 5
	} );

    const threeAMMesh = new THREE.Mesh(
        threeAMGeometry,
        new THREE.MeshMatcapMaterial({matcap: matcapRainbow})
    );

    threeAMMesh.position.set(7, 3.8, -13);
    threeAMMesh.rotation.y = -0.6;
    scene.add(threeAMMesh);
    const threeAMMeshFolder = trackNameMeshesFolder.addFolder('threeAMMesh');
    threeAMMeshFolder.add(threeAMMesh.position, 'x').min(0).max(10).step(0.001).name('posX');
    threeAMMeshFolder.add(threeAMMesh.position, 'y').min(0).max(10).step(0.001).name('posY');
    threeAMMeshFolder.add(threeAMMesh.position, 'z').min(-20).max(0).step(0.001).name('posZ');
    threeAMMeshFolder.add(threeAMMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotY');
    threeAMMeshFolder.add(threeAMMesh, 'visible');
    trackNameMeshes.push(threeAMMesh);

    threeAMMesh.visible = false;

});

// Butterflies

fontLoader.load('./fonts/GoodGirl_Regular.json', (font) => {

    const butterfliesGeometry = new THREE.TextGeometry( 'Butterflies', {
		font: font,
		size: 0.5,
		height: 0.5,
		curveSegments: 5
	} );

    const butterfliesMesh = new THREE.Mesh(
        butterfliesGeometry,
        new THREE.MeshMatcapMaterial({matcap: matcapRainbow})
    );

    butterfliesMesh.position.set(7, 3.8, -13);
    butterfliesMesh.rotation.y = -0.6;
    scene.add(butterfliesMesh);
    const butterfliesMeshFolder = trackNameMeshesFolder.addFolder('butterfliesMesh');
    butterfliesMeshFolder.add(butterfliesMesh.position, 'x').min(0).max(10).step(0.001).name('posX');
    butterfliesMeshFolder.add(butterfliesMesh.position, 'y').min(0).max(10).step(0.001).name('posY');
    butterfliesMeshFolder.add(butterfliesMesh.position, 'z').min(-20).max(0).step(0.001).name('posZ');
    butterfliesMeshFolder.add(butterfliesMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotY');
    butterfliesMeshFolder.add(butterfliesMesh, 'visible');
    trackNameMeshes.push(butterfliesMesh);

    butterfliesMesh.visible = false;

});

// Galaxy Trip

fontLoader.load('./fonts/GoodGirl_Regular.json', (font) => {

    const galaxyTripGeometry = new THREE.TextGeometry( 'Galaxy Trip', {
		font: font,
		size: 0.5,
		height: 0.5,
		curveSegments: 5
	} );

    const galaxyTripMesh = new THREE.Mesh(
        galaxyTripGeometry,
        new THREE.MeshMatcapMaterial({matcap: matcapRainbow})
    );

    galaxyTripMesh.position.set(7, 3.8, -13);
    galaxyTripMesh.rotation.y = -0.6;
    scene.add(galaxyTripMesh);
    const galaxyTripMeshFolder = trackNameMeshesFolder.addFolder('galaxyTripMesh');
    galaxyTripMeshFolder.add(galaxyTripMesh.position, 'x').min(0).max(10).step(0.001).name('posX');
    galaxyTripMeshFolder.add(galaxyTripMesh.position, 'y').min(0).max(10).step(0.001).name('posY');
    galaxyTripMeshFolder.add(galaxyTripMesh.position, 'z').min(-20).max(0).step(0.001).name('posZ');
    galaxyTripMeshFolder.add(galaxyTripMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotY');
    galaxyTripMeshFolder.add(galaxyTripMesh, 'visible');
    trackNameMeshes.push(galaxyTripMesh);

    galaxyTripMesh.visible = false;

});
/**
 * Floor
 */
const floorGeometry = new THREE.PlaneGeometry(20, 10);
// for ambient occlusion
floorGeometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floorGeometry.attributes.uv.array, 2));

const floorMaterial = matcapMaterial;
const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

// position and rotation
floorMesh.rotation.x = - Math.PI / 2;
floorMesh.position.z = -3;
floorMesh.position.y = -2.15;

const floorFolder = gui.addFolder('floorControls');
floorFolder.add(floorMesh.position, 'y').min(-3).max(2).step(0.001).name('floorPosY');

scene.add(floorMesh);


/**
 * Desk
 */
gltfLoader.load(
    './models/Desk/glTF/desk.gltf',
    (gltf) => {

        // convert to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial;
            }
        })

        // model scaling (this one is huge lol)
        gltf.scene.children[0].scale.set(3, 3, 3);

        // model positioning
        gltf.scene.children[0].position.set(0, 0, 0);

        // model rotation
        gltf.scene.children[0].rotation.set(0, 0, 0);

        // console.log('DESK');
        // console.log(gltf.scene);
        scene.add(gltf.scene);
        // objectsToTest.push(gltf.scene);

    }
)

/**
 * BIG SPECTROGRAMn
 */

//Spectrogram Color
debugObject.lowColor = '#ff0bff'
debugObject.highColor = '#00ffd1'

const spectrogram3DTexture = new THREE.CanvasTexture(spectrogram3DCanvasContext.canvas);


const spectroShader = new THREE.ShaderMaterial({
    uniforms:
    {
        uSpectroTexture: {value: spectrogram3DTexture},
        uLowColor: {value: new THREE.Color(debugObject.lowColor)},
        uHighColor: {value: new THREE.Color(debugObject.highColor)},
        uColorOffset: {value: 0.08},
        uColorMultiplier: {value: 1.5}

    },
    vertexShader: `
        uniform sampler2D uSpectroTexture;

        varying vec2 vUv;

        void main()
        {
            // Mesh Position
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);

            vec4 textureColor = texture2D(uSpectroTexture, uv);

            modelPosition.z += textureColor.r;

            // Camera (View) Position
            vec4 viewPosition = viewMatrix * modelPosition;

            // Projection Matrix Position
            vec4 projectedPosition = projectionMatrix * viewPosition;

            gl_Position = projectedPosition;

            // varyings
            vUv = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D uSpectroTexture;
        uniform vec3 uLowColor;
        uniform vec3 uHighColor;
        uniform float uColorOffset;
        uniform float uColorMultiplier;
        
        varying vec2 vUv;
        
        void main()
        {
            vec4 fragmentTextureColor = texture2D(uSpectroTexture, vUv);
        
            float mixStrength = (fragmentTextureColor.r + uColorOffset) * uColorMultiplier;
        
            vec3 color = mix(uLowColor, uHighColor, mixStrength);
        
        
            gl_FragColor = vec4(color, 1.0);
        }
    `
});

const bigSpectrogram3dLength = 7.5;

const bigSpectrogram3d = new THREE.Mesh(
    new THREE.PlaneGeometry(bigSpectrogram3dLength, bigSpectrogram3dLength, bufferLength, bufferLength),
    // new THREE.MeshBasicMaterial({
    //     map: spectrogram3DTexture
    // })
    spectroShader
)
scene.add(bigSpectrogram3d);
bigSpectrogram3d.position.set(0, 0, -10);
//bigSpectrogram3d.rotation.set(-Math.PI / 4, 0, 0);

// debug panel
const bigSpectrogramFolder = gui.addFolder('bigSpectrogram');
bigSpectrogramFolder.addColor(debugObject, 'lowColor').name('lowColor').onChange(() => {
    spectroShader.uniforms.uLowColor.value.set(debugObject.lowColor)
});
bigSpectrogramFolder.addColor(debugObject, 'highColor').name('highColor').onChange(() => {
    spectroShader.uniforms.uHighColor.value.set(debugObject.highColor)
});
bigSpectrogramFolder.add(spectroShader.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset');
bigSpectrogramFolder.add(spectroShader.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier');


/**
 * Desk Screen (Spectrogram)
 */

const spectrogramTexture = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(spectrogramCanvasContext.canvas)
});

const deskScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 1.25),
    spectrogramTexture
);
deskScreen.rotation.x = - Math.PI / 2;
deskScreen.position.set(0, 0.02, 0);
scene.add(deskScreen);

const deskScreenFolder = gui.addFolder('deskScreen');
deskScreenFolder.add(deskScreen.position, 'x').min(-3).max(3).step(0.001).name('deskScreenX');
deskScreenFolder.add(deskScreen.position, 'y').min(-3).max(3).step(0.001).name('deskScreenY');
deskScreenFolder.add(deskScreen.position, 'z').min(-3).max(3).step(0.001).name('deskScreenZ');

/**
 * "CLICK" Text
 */
fontLoader.load('./fonts/GoodGirl_Regular.json', (font) => {

    const clickHereGeometry = new THREE.TextGeometry( 'CLICK THE CUBES', {
		font: font,
		size: 0.15,
		height: 0.15,
		curveSegments: 3
	} );

    const clickHereMesh = new THREE.Mesh(
        clickHereGeometry,
        new THREE.MeshMatcapMaterial({matcap: matcapRainbow})
    );

    clickHereMesh.position.set(-2.5, 0.1, 0.45);
    clickHereMesh.rotation.y = 0.8;
    scene.add(clickHereMesh);
    const clickHereTextFolder = gui.addFolder('clickHereText');
    clickHereTextFolder.add(clickHereMesh.position, 'x').min(-5).max(5).step(0.001).name('posX');
    clickHereTextFolder.add(clickHereMesh.position, 'y').min(-5).max(5).step(0.001).name('posy');
    clickHereTextFolder.add(clickHereMesh.position, 'z').min(-5).max(5).step(0.001).name('posZ');
    clickHereTextFolder.add(clickHereMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotY');

});

/**
 * Camera Instructions
 */

const camInstructionsMeshFolder = gui.addFolder('camInstructions');


//Rotate Camera
fontLoader.load('./fonts/GoodGirl_Regular.json', (font) => {

    const camInstructionsRotateGeometry = new THREE.TextGeometry( 'Rotate Camera: Click + Drag', {
		font: font,
		size: 0.15,
		height: 0.15,
		curveSegments: 3
	} );

    const camInstructionsRotateMesh = new THREE.Mesh(
        camInstructionsRotateGeometry,
        new THREE.MeshMatcapMaterial({matcap: matcapRainbow})
    );

    camInstructionsRotateMesh.position.set(-1.75, -0.8, 0);
    camInstructionsRotateMesh.rotation.y = 0;
    scene.add(camInstructionsRotateMesh);
    const camInstructionsRotateTextFolder = camInstructionsMeshFolder.addFolder('Rotate');
    camInstructionsRotateTextFolder.add(camInstructionsRotateMesh.position, 'x').min(-5).max(5).step(0.001).name('posX');
    camInstructionsRotateTextFolder.add(camInstructionsRotateMesh.position, 'y').min(-5).max(5).step(0.001).name('posy');
    camInstructionsRotateTextFolder.add(camInstructionsRotateMesh.position, 'z').min(-5).max(5).step(0.001).name('posZ');
    camInstructionsRotateTextFolder.add(camInstructionsRotateMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotY');

});


// Pan Camera
fontLoader.load('./fonts/GoodGirl_Regular.json', (font) => {

    const camInstructionsPanGeometry = new THREE.TextGeometry( 'Pan Camera: Shift + Click + Drag', {
		font: font,
		size: 0.15,
		height: 0.15,
		curveSegments: 3
	} );

    const camInstructionsPanMesh = new THREE.Mesh(
        camInstructionsPanGeometry,
        new THREE.MeshMatcapMaterial({matcap: matcapRainbow})
    );

    camInstructionsPanMesh.position.set(-2, -1.2, 0);
    camInstructionsPanMesh.rotation.y = 0;
    scene.add(camInstructionsPanMesh);
    const camInstructionsPanTextFolder = camInstructionsMeshFolder.addFolder('Panning');
    camInstructionsPanTextFolder.add(camInstructionsPanMesh.position, 'x').min(-5).max(5).step(0.001).name('posX');
    camInstructionsPanTextFolder.add(camInstructionsPanMesh.position, 'y').min(-5).max(5).step(0.001).name('posy');
    camInstructionsPanTextFolder.add(camInstructionsPanMesh.position, 'z').min(-5).max(5).step(0.001).name('posZ');
    camInstructionsPanTextFolder.add(camInstructionsPanMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotY');

});

// Zoom Camera
fontLoader.load('./fonts/GoodGirl_Regular.json', (font) => {

    const camInstructionsZoomGeometry = new THREE.TextGeometry( 'Zoom Camera: Scroll', {
		font: font,
		size: 0.15,
		height: 0.15,
		curveSegments: 3
	} );

    const camInstructionsZoomMesh = new THREE.Mesh(
        camInstructionsZoomGeometry,
        new THREE.MeshMatcapMaterial({matcap: matcapRainbow})
    );

    camInstructionsZoomMesh.position.set(-1.4, -1.6, 0);
    camInstructionsZoomMesh.rotation.y = 0;
    scene.add(camInstructionsZoomMesh);
    const camInstructionsZoomTextFolder = camInstructionsMeshFolder.addFolder('Zoom');
    camInstructionsZoomTextFolder.add(camInstructionsZoomMesh.position, 'x').min(-5).max(5).step(0.001).name('posX');
    camInstructionsZoomTextFolder.add(camInstructionsZoomMesh.position, 'y').min(-5).max(5).step(0.001).name('posy');
    camInstructionsZoomTextFolder.add(camInstructionsZoomMesh.position, 'z').min(-5).max(5).step(0.001).name('posZ');
    camInstructionsZoomTextFolder.add(camInstructionsZoomMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotY');

});


/**
 * Footer
 */
fontLoader.load('./fonts/GoodGirl_Regular.json', (font) => {

    const footerGeometry = new THREE.TextGeometry( 'MUSIC AND VISUAL DESIGN BY RYAN KIMBRELL', {
		font: font,
		size: 0.15,
		height: 0.15,
		curveSegments: 3
	} );

    const footerMesh = new THREE.Mesh(
        footerGeometry,
        new THREE.MeshMatcapMaterial({matcap: matcapRainbow})
    );

    footerMesh.position.set(-2.4, -1.8, 2.6);
    footerMesh.rotation.x = -0.9;
    scene.add(footerMesh);
    const footerTextFolder = gui.addFolder('footerText');
    footerTextFolder.add(footerMesh.position, 'x').min(-5).max(5).step(0.001).name('posX');
    footerTextFolder.add(footerMesh.position, 'y').min(-5).max(5).step(0.001).name('posy');
    footerTextFolder.add(footerMesh.position, 'z').min(-5).max(5).step(0.001).name('posZ');
    footerTextFolder.add(footerMesh.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.001).name('rotX');

});


/**
 * D E S K  C U B E S
 */

const deskCubesFolder = gui.addFolder('deskCubes')

// PLAY/PAUSE
gltfLoader.load(
    './models/PlayPauseButton/glTF/play_pause_button.gltf',
    (gltf) => {

        // convert to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial;
            }
        })

        // model scaling if necessary
        // gltf.scene.scale.set(5, 5, 5)

        // model rotation
        gltf.scene.rotation.set(0, 4.73, 0);

        const playCubeFolder = deskCubesFolder.addFolder('playCubeControls');
        playCubeFolder.add(gltf.scene.rotation, 'y').min(0).max(2 * Math.PI).step(0.01).name('RotY');
        playCubeFolder.add(gltf.scene.position, 'x').min(-5).max(5).step(0.001).name('posX');
        playCubeFolder.add(gltf.scene.position, 'y').min(-5).max(5).step(0.001).name('posY');
        playCubeFolder.add(gltf.scene.position, 'z').min(-5).max(5).step(0.001).name('posZ');


        // model positioning
        gltf.scene.position.set(-.33, 0.18690180778503418, -1);


        // console.log('PLAY/PAUSE CUBE')
        // console.log(gltf.scene.children[0]);

        scene.add(gltf.scene);
        objectsToTest.push(gltf.scene.children[0]);
    }
);

// STOP
gltfLoader.load(
    './models/StopButton/glTF/stop_button.gltf',
    (gltf) => {

        // convert to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial;
            }
        })

        // model scaling if necessary
        // gltf.scene.scale.set(5, 5, 5)

        // model rotation
        gltf.scene.rotation.set(0, 4.73, 0);

        const stopCubeFolder = deskCubesFolder.addFolder('stopCubeControls');
        stopCubeFolder.add(gltf.scene.rotation, 'y').min(0).max(2 * Math.PI).step(0.01).name('RotY');
        stopCubeFolder.add(gltf.scene.position, 'x').min(-5).max(5).step(0.001).name('posX');
        stopCubeFolder.add(gltf.scene.position, 'y').min(-5).max(5).step(0.001).name('posY');
        stopCubeFolder.add(gltf.scene.position, 'z').min(-5).max(5).step(0.001).name('posZ');


        // model positioning
        gltf.scene.position.set(0.33, 0.18690180778503418, -1);


        // console.log('STOP CUBE')
        // console.log(gltf.scene.children[0]);

        scene.add(gltf.scene);
        objectsToTest.push(gltf.scene.children[0]);
    }
);

// NEXT TRACK (FORWARD BUTTON)
gltfLoader.load(
    './models/ForwardBackButton/glTF/forward_back_button.gltf',
    (gltf) => {

        // convert to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial;
            }
        })

        // model scaling if necessary
        // gltf.scene.scale.set(5, 5, 5)

        // model rotation
        gltf.scene.rotation.set(0, 4.73, 0);

        const forwardCubeFolder = deskCubesFolder.addFolder('forwardCubeControls');
        forwardCubeFolder.add(gltf.scene.rotation, 'y').min(0).max(2 * Math.PI).step(0.01).name('RotY');
        forwardCubeFolder.add(gltf.scene.position, 'x').min(-5).max(5).step(0.001).name('posX');
        forwardCubeFolder.add(gltf.scene.position, 'y').min(-5).max(5).step(0.001).name('posY');
        forwardCubeFolder.add(gltf.scene.position, 'z').min(-5).max(5).step(0.001).name('posZ');


        // model positioning
        gltf.scene.position.set(1, 0.18690180778503418, -1);


        // console.log('FORWARD CUBE')
        // console.log(gltf.scene.children[0]);

        scene.add(gltf.scene);
        objectsToTest.push(gltf.scene.children[0]);
    }
);

// LAST TRACK or TRACK RESTART (BACK BUTTON)
gltfLoader.load(
    './models/ForwardBackButton/glTF/forward_back_button.gltf',
    (gltf) => {

        // convert to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial;
            }
        })

        // model scaling if necessary
        // gltf.scene.scale.set(5, 5, 5)

        // model rotation
        gltf.scene.rotation.set(0, 1.6, Math.PI);

        const backCubeFolder = deskCubesFolder.addFolder('backCubeControls');
        backCubeFolder.add(gltf.scene.rotation, 'y').min(0).max(2 * Math.PI).step(0.01).name('RotY');
        backCubeFolder.add(gltf.scene.position, 'x').min(-5).max(5).step(0.001).name('posX');
        backCubeFolder.add(gltf.scene.position, 'y').min(-5).max(5).step(0.001).name('posY');
        backCubeFolder.add(gltf.scene.position, 'z').min(-5).max(5).step(0.001).name('posZ');


        // model positioning
        gltf.scene.position.set(-1, 0.18690180778503418, -1);


        // console.log('BACKWARD CUBE')
        // console.log(gltf.scene.children[0]);

        scene.add(gltf.scene);
        objectsToTest.push(gltf.scene.children[0]);
    }
);

// Picture Frame
gltfLoader.load(
    './models/Photoframe/Photoframe.gltf',
    (gltf) => {

        // convert to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial;
            }
        })

        // model scaling if necessary
        gltf.scene.scale.set(0.1, 0.1, 0.1);

        // model rotation and position
        gltf.scene.position.set(2.5, 0.055, -1);

        const photoFrameFolder = deskCubesFolder.addFolder('photoFrame');
        photoFrameFolder.add(gltf.scene.rotation, 'y').min(0).max(2 * Math.PI).step(0.01).name('RotY');
        photoFrameFolder.add(gltf.scene.position, 'x').min(-5).max(5).step(0.001).name('posX');
        photoFrameFolder.add(gltf.scene.position, 'y').min(-5).max(5).step(0.001).name('posY');
        photoFrameFolder.add(gltf.scene.position, 'z').min(-5).max(5).step(0.001).name('posZ');


        // console.log('PhotoFrame')
        // console.log(gltf.scene.children[0]);

        scene.add(gltf.scene);
        objectsToTest.push(gltf.scene.children[0]);
    }
);

// Pet Picture :D
const petPictureGeometry = new THREE.PlaneGeometry(3.77, 4.62);
const petPictureMaterial = new THREE.MeshBasicMaterial({map: petPicture});
const petPictureMesh = new THREE.Mesh(petPictureGeometry, petPictureMaterial)
petPictureMesh.scale.set(0.1, 0.1, 0.1);
petPictureMesh.position.set(1.7, 0.45, -1.06);
petPictureMesh.rotation.x = -0.2;
scene.add(petPictureMesh);

const petPictureFolder = deskCubesFolder.addFolder('petPicture');
petPictureFolder.add(petPictureMesh.position, 'x').min(-3).max(6).step(0.001).name('posX');
petPictureFolder.add(petPictureMesh.position, 'y').min(-3).max(6).step(0.001).name('posY');
petPictureFolder.add(petPictureMesh.position, 'z').min(-3).max(6).step(0.001).name('posZ');
petPictureFolder.add(petPictureMesh.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.001).name('rotX');
petPictureFolder.add(petPictureMesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotY');


/**
 * PLANTS
 */

// Desk Plants
const deskPlantsFolder = gui.addFolder('deskPlants');

 // Cactus 1
gltfLoader.load(
    './models/Plants/cacti/cactus1.gltf',
    (gltf) => {

        // convert material to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial
            }
        });

        // scaling, positioning, rotation
        gltf.scene.children[0].position.set(-2.2, 0.1, -1);

        // console.log('CACTUS 1');
        // console.log(gltf.scene.children[0]);

        const cactus1Folder = deskPlantsFolder.addFolder('cactus1');
        cactus1Folder.add(gltf.scene.children[0].position, 'x').min(-5).max(5).step(0.001).name('posX');
        cactus1Folder.add(gltf.scene.children[0].position, 'y').min(-5).max(5).step(0.001).name('posY');
        cactus1Folder.add(gltf.scene.children[0].position, 'z').min(-5).max(5).step(0.001).name('posZ');


        scene.add(gltf.scene);

    }
);

// Cactus 2
gltfLoader.load(
    './models/Plants/cacti/cactus2.gltf',
    (gltf) => {

        // convert material to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial
            }
        });

        // scaling, positioning, rotation
        gltf.scene.children[0].position.set(-1.6, 0.33, -1);

        // console.log('CACTUS 2');
        // console.log(gltf.scene.children[0]);

        const cactus2Folder = deskPlantsFolder.addFolder('cactus2');
        cactus2Folder.add(gltf.scene.children[0].position, 'x').min(-5).max(5).step(0.001).name('posX');
        cactus2Folder.add(gltf.scene.children[0].position, 'y').min(-5).max(5).step(0.001).name('posY');
        cactus2Folder.add(gltf.scene.children[0].position, 'z').min(-5).max(5).step(0.001).name('posZ');


        scene.add(gltf.scene);

    }
);

// Plant
gltfLoader.load(
    './models/Plants/plant/plant.gltf',
    (gltf) => {

        // convert material to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial
            }
        });

        // scaling, positioning, rotation
        gltf.scene.children[0].position.set(2.4, -0.02, -1);

        // console.log('DESK PLANT');
        // console.log(gltf.scene.children[0]);

        const plantFolder = deskPlantsFolder.addFolder('deskPlant');
        plantFolder.add(gltf.scene.children[0].position, 'x').min(-5).max(5).step(0.001).name('posX');
        plantFolder.add(gltf.scene.children[0].position, 'y').min(-5).max(5).step(0.001).name('posY');
        plantFolder.add(gltf.scene.children[0].position, 'z').min(-5).max(5).step(0.001).name('posZ');


        scene.add(gltf.scene);

    }
);

// Floor Plants
const floorPlantsFolder = gui.addFolder('floorPlants');

// Areca Palm
gltfLoader.load(
    './models/Plants/areca_palm/areca_palm.gltf',
    (gltf) => {

        // convert material to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial
            }
        });

        // scaling, positioning, rotation
        gltf.scene.children[0].position.set(8.2, -2.2, -6.6);

        // console.log('ARECA PALM');
        // console.log(gltf.scene.children[0]);

        const arecaPalmFolder = floorPlantsFolder.addFolder('arecaPalm');
        arecaPalmFolder.add(gltf.scene.children[0].position, 'x').min(-10).max(10).step(0.001).name('posX');
        arecaPalmFolder.add(gltf.scene.children[0].position, 'y').min(-10).max(10).step(0.001).name('posY');
        arecaPalmFolder.add(gltf.scene.children[0].position, 'z').min(-10).max(5).step(0.001).name('posZ');


        scene.add(gltf.scene);

    }
);

// Corn Plant
gltfLoader.load(
    './models/Plants/corn_plant/corn_plant.gltf',
    (gltf) => {

        // convert material to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial
            }
        });

        // scaling, positioning, rotation
        gltf.scene.children[0].position.set(-8.8, 0, -6.6);

        // console.log('CORN PLANT');
        // console.log(gltf.scene.children[0]);

        const cornPlantFolder = floorPlantsFolder.addFolder('cornPlant');
        cornPlantFolder.add(gltf.scene.children[0].position, 'x').min(-10).max(10).step(0.001).name('posX');
        cornPlantFolder.add(gltf.scene.children[0].position, 'y').min(-10).max(10).step(0.001).name('posY');
        cornPlantFolder.add(gltf.scene.children[0].position, 'z').min(-10).max(5).step(0.001).name('posZ');


        scene.add(gltf.scene);

    }
);

// Dracaena
gltfLoader.load(
    './models/Plants/dracaena/dracaena_sanderiana.gltf',
    (gltf) => {

        // convert material to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial
            }
        });

        // scaling, positioning, rotation
        gltf.scene.scale.set(4, 4, 4);
        gltf.scene.children[0].position.set(-2.1, -0.5, -1.25);

        // console.log('DRACAENA');
        // console.log(gltf.scene.children[0]);

        const dracaenaFolder = floorPlantsFolder.addFolder('dracaena');
        dracaenaFolder.add(gltf.scene.children[0].position, 'x').min(-10).max(10).step(0.001).name('posX');
        dracaenaFolder.add(gltf.scene.children[0].position, 'y').min(-10).max(10).step(0.001).name('posY');
        dracaenaFolder.add(gltf.scene.children[0].position, 'z').min(-10).max(5).step(0.001).name('posZ');


        scene.add(gltf.scene);

    }
);

// Orchid
gltfLoader.load(
    './models/Plants/orchid/orchid.gltf',
    (gltf) => {

        // convert material to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial
            }
        });

        // scaling, positioning, rotation
        gltf.scene.children[0].position.set(8.85, -2.8, -4.6);

        // console.log('ORCHID');
        // console.log(gltf.scene.children[0]);

        const orchidFolder = floorPlantsFolder.addFolder('orchid');
        orchidFolder.add(gltf.scene.children[0].position, 'x').min(-10).max(10).step(0.001).name('posX');
        orchidFolder.add(gltf.scene.children[0].position, 'y').min(-10).max(10).step(0.001).name('posY');
        orchidFolder.add(gltf.scene.children[0].position, 'z').min(-10).max(5).step(0.001).name('posZ');


        scene.add(gltf.scene);

    }
);

/**
 * C U T E  P E T S
 */
const cutePetsFolder = gui.addFolder('cutePets');

// Doggy
gltfLoader.load(
    './models/Doggy/doggy.gltf',
    (gltf) => {

        // convert material to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial
            }
        });

        // scaling, positioning, rotation
        gltf.scene.children[2].position.set(-6.5, -2.25, -4.78);
        gltf.scene.children[2].rotation.y = Math.PI / 4;

        // console.log('DOGGY');
        // console.log(gltf.scene);

        const doggyFolder = cutePetsFolder.addFolder('doggy');
        doggyFolder.add(gltf.scene.children[2].position, 'x').min(-10).max(10).step(0.001).name('posX');
        doggyFolder.add(gltf.scene.children[2].position, 'y').min(-10).max(10).step(0.001).name('posY');
        doggyFolder.add(gltf.scene.children[2].position, 'z').min(-10).max(5).step(0.001).name('posZ');


        scene.add(gltf.scene.children[2]);

    }
);

// Puppy
gltfLoader.load(
    './models/Puppy/puppy.gltf',
    (gltf) => {

        // convert material to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial
            }
        });

        // scaling, positioning, rotation
        gltf.scene.children[2].scale.set(0.015, 0.015, 0.015);
        gltf.scene.children[2].position.set(-6.6, -2.15, -1.75);
        gltf.scene.children[2].rotation.z = - Math.PI / 4;

        // console.log('PUPPY');
        // console.log(gltf.scene);

        const puppyFolder = cutePetsFolder.addFolder('puppy');
        puppyFolder.add(gltf.scene.children[2].position, 'x').min(-10).max(10).step(0.001).name('posX');
        puppyFolder.add(gltf.scene.children[2].position, 'y').min(-10).max(10).step(0.001).name('posY');
        puppyFolder.add(gltf.scene.children[2].position, 'z').min(-10).max(5).step(0.001).name('posZ');


        scene.add(gltf.scene.children[2]);

    }
);

// Kitty
gltfLoader.load(
    './models/Kitty/kitty.gltf',
    (gltf) => {

        // convert material to matcap material
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial
            }
        });

        // scaling, positioning, rotation
        //gltf.scene.children[2].scale.set(0.025, 0.025, 0.025);
        gltf.scene.children[2].position.set(6.4, 11.35, -3.3);
        gltf.scene.children[2].rotation.z = Math.PI;

        // console.log('KITTY');
        // console.log(gltf.scene);

        const kittyFolder = cutePetsFolder.addFolder('kitty');
        kittyFolder.add(gltf.scene.children[2].position, 'x').min(-10).max(10).step(0.001).name('posX');
        kittyFolder.add(gltf.scene.children[2].position, 'y').min(8).max(20).step(0.001).name('posY');
        kittyFolder.add(gltf.scene.children[2].position, 'z').min(-10).max(5).step(0.001).name('posZ');


        scene.add(gltf.scene.children[2]);

    }
);

//====================================================================

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

/**
 * Mouse
 */
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1;
    mouse.y = - event.clientY / sizes.height * 2 + 1;
})

//====================================================================


/**
 * DESK TRANSPORT CUBE BUTTONS
 */
// Click functionality for the cube
window.addEventListener('click', () => {

    if (currentIntersect) {

        // PLAY/PAUSE BUTTON
        if(currentIntersect.object === objectsToTest[0]) {
            
            if (trackIsPlaying === true) {
                pauseTrack(currentTrack);
            } else if (trackIsPlaying === false) {
                playTrack(currentTrack);
            }

        }

        // STOP BUTTON
        if(currentIntersect.object === objectsToTest[1]) {

            if (trackIsPlaying === false) {
                currentTrack.currentTime = 0;
            }
            else if(trackIsPlaying === true) {
                stopTrack(currentTrack);
            }
        }

        // NEXT BUTTON
        if (currentIntersect.object === objectsToTest[2]) {
            nextTrack();
        }

        // BACK BUTTON
        if (currentIntersect.object === objectsToTest[3]) {
            prevTrack();
        }

    }
})


// End of track, play next track
currentTrack.addEventListener('ended', () => {
    nextTrack();
}, false);

//====================================================================

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//====================================================================

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 2.56, 5.0);
// y used to be 2.56

camera.rotation.y = Math.PI /2
scene.add(camera);


// const cameraControlsFolder = gui.addFolder('cameraControls')

// cameraControlsFolder.add(camera.position, 'x').min(-10).max(10).step(0.01).name('camX');
// cameraControlsFolder.add(camera.position, 'y').min(-10).max(10).step(0.01).name('camY');
// cameraControlsFolder.add(camera.position, 'z').min(-10).max(10).step(0.01).name('camZ');
// cameraControlsFolder.add(camera.rotation, 'x').min(-10).max(10).step(0.01).name('rotX');
// cameraControlsFolder.add(camera.rotation, 'y').min(-10).max(10).step(0.01).name('rotY');
// cameraControlsFolder.add(camera.rotation, 'z').min(-10).max(10).step(0.01).name('rotZ');



/**
 * Orbit Controls
 */

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//====================================================================

/**
 * Renderers
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//====================================================================

/**
 * Animate
 */
const clock = new THREE.Clock();


/**
 * Witness Variable
 */

console.log(bigSpectrogram3d.material)


let spectrogramTimeArray = new Uint8Array(bufferLength * spectrogram3DWidth).fill(0);
let currentIntersect = null;
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

   
    if (trackIsPlaying) {

        // Spectrogram Analysis
        analyser.getByteFrequencyData(fftArray);
        const specArraySlice = spectrogramTimeArray.slice(bufferLength);
        spectrogramTimeArray.set(specArraySlice);
        spectrogramTimeArray.set(fftArray, specArraySlice.length);

        //Spectrogram Drawing
        spectrogramCanvasContext.fillStyle = 'rgb(0,0,0)';
        spectrogramCanvasContext.fillRect(0, 0, spectrogramWidth, spectrogramHeight);
        const barWidth = (spectrogramWidth / bufferLength) * 2.5;
        let barHeight = null;
        let x = 0;

        for (let i = 0; i < bufferLength; i++)
        {
            barHeight = fftArray[i];
            spectrogramCanvasContext.fillStyle = `rgb(${barHeight+100}, 0, 200)`;
            spectrogramCanvasContext.fillRect(x, spectrogramHeight - (barHeight / 2), barWidth, barHeight / 2);
            x += barWidth + 1;
        }
    

        // Big Spectrogram Drawing
        spectrogram3DCanvasContext.fillStyle = 'rgb(0,0,0)';
        spectrogram3DCanvasContext.fillRect(0, 0, spectrogram3DWidth, spectrogram3DHeight);
        let freqStrength = null;
        const barWidth3D = (spectrogram3DWidth / bufferLength);
        const barHeight3D = (spectrogram3DHeight / bufferLength);

        for (let i = 0; i < spectrogramTimeArray.length; i++) {
            freqStrength = spectrogramTimeArray[i]
            spectrogram3DCanvasContext.fillStyle = `rgb(${freqStrength}, ${freqStrength}, ${freqStrength})`;
            spectrogram3DCanvasContext.fillRect(Math.floor(i / bufferLength), (i % bufferLength), barWidth3D, barHeight3D + bigSpectrogram3dLength);
        }


        // Update Spectrogram planes
        deskScreen.material.map.needsUpdate = true;
        //bigSpectrogram3d.material.map.needsUpdate = true;
        spectrogram3DTexture.needsUpdate = true;
        spectroShader.uniforms.uSpectroTexture.value = spectrogram3DTexture;

   }
   
    

    //Ray casting intersection
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objectsToTest);


    // MOUSE ENTERING AND LEAVING OBJECTS FUNCTIONALITY
    if(intersects.length)
    {
        // if(currentIntersect === null) {
        //     console.log('mouse enter');
        // }
        currentIntersect = intersects[0];
    } else {
        if (currentIntersect) {
        }
        currentIntersect = null;
    }

    // While track is playing functionality
    // if (trackIsPlaying === true) {

    //     if (Math.floor((elapsedTime - Math.floor(elapsedTime)) * 10) % 2 === 0)
    //     cubeMaterial.color.setHex(Math.random() * 0xffffff);
    // }


    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick();