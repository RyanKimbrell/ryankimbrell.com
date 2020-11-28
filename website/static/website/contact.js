import * as THREE from './node_modules/three/build/three.module.js';


function main() {


    // =======================================================================
    // CANVAS & RENDERER 
    const canvas = document.getElementById('c');
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
    // UTILITY FUNCTIONS
    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }


    // =======================================================================
    // RESIZING TO DISPLAY SIZE IF NECESSARY
    function resizeRendererToDisplaySize(renderer) {

        const canvas = renderer.domElement()

    }

    function render(time) {


        requestAnimationFrame(render);
    }

requestAnimationFrame(render);

}

main();