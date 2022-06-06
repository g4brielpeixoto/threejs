import * as THREE from "three"
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'; //falar da gambiarra aqui
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect_ratio = SCREEN_WIDTH / SCREEN_HEIGHT;

let camera_perspective, camera_ortho, active_camera, scene, renderer, stats, controls;
let cube_stone, cube_bump_mapping, cube_stone_normal, cube_bump_mapping_normal, spotLight, spotLightHelper;
let material, material_bump;

const params = {
    orthographicCamera: false,
    boxControls: {
        showNormal: false,
        specular: 0xffffff,
        shininess: 30,
    },
    bumpMapping: {
        visible: false,
        scale: 0
    }
};

function init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    camera_perspective = new THREE.PerspectiveCamera(45, aspect_ratio, 0.1, 1000);
    camera_ortho = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);	/* left right top bottom near far */

    active_camera = camera_perspective;
    active_camera.position.set(1, 5, 10);

    let axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    function createStoneBox(){
        const geometry = new THREE.BoxGeometry(5, 5, 5);
        const texture = new THREE.TextureLoader().load('./assets/stone.jpg');
        //material comum
        material = new THREE.MeshPhongMaterial({ map: texture });

        //material com bump mapping
        const mapHeight = new THREE.TextureLoader().load('./assets/stone-bump.jpg');
        material_bump = new THREE.MeshPhongMaterial({ map: texture, bumpMap: mapHeight });

        cube_stone = new THREE.Mesh(geometry, material);

        cube_stone.position.y = 2;
        scene.add(cube_stone);

        cube_stone_normal = new VertexNormalsHelper(cube_stone, 1, 0xffff00, 1); //https://threejs.org/docs/#examples/en/helpers/VertexNormalsHelper
        scene.add(cube_stone_normal);
    }
    function createPlane(){
        const geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        const material = new THREE.MeshBasicMaterial(
            {color: 0xa6f995, wireframe: true, side: THREE.DoubleSide}
            //https://threejs.org/docs/#api/en/materials/Material.side:
            //THREE.DoubleSide renderiza dos dois lados
        );
        const plane = new THREE.Mesh(geometry, material);

        plane.position.x = 0;
        plane.position.y = 0.5;
        plane.position.z = 0;
        plane.rotation.x = Math.PI/2; //90 graus em radianos

        scene.add(plane);
    }

    createStoneBox();
    createPlane();

    function addLight(){
        spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(0, 15, 8);
        spotLight.castShadow = true;
        scene.add(spotLight);

        spotLightHelper = new THREE.SpotLightHelper(spotLight);
        scene.add(spotLightHelper);
    }
    addLight();

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    const gui = new GUI();
    function createGUI(){
        gui.add(params, 'orthographicCamera').name('usar ortho').onChange(function (value){
            controls.dispose();
            createControls(value ? camera_ortho : camera_perspective);
        });

        let boxControls = gui.addFolder('Box');
        boxControls.add(params.boxControls, 'showNormal');
        boxControls.addColor(params.boxControls, 'specular');
        boxControls.add(params.boxControls, 'shininess', 0, 30);
        boxControls.open();

        let bumpControls = gui.addFolder('Bump Mapping');
        bumpControls.add(params.bumpMapping, 'visible');
        bumpControls.add(params.bumpMapping, 'scale', 0, 1);
        bumpControls.open();
    }
    createGUI();

    createControls(camera_perspective);
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    aspect_ratio = SCREEN_WIDTH / SCREEN_HEIGHT;

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    active_camera.aspect = aspect_ratio;
    active_camera.updateProjectionMatrix();
}

function createControls(camera){
    active_camera = camera;
    active_camera.position.set(1, 5, 10);

    controls = new TrackballControls(active_camera, renderer.domElement);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
}

const animate = function () {
    requestAnimationFrame(animate);

    cube_stone.rotation.x += 0.01;
    cube_stone_normal.visible = params.boxControls.showNormal;
    
    console.log(params.bumpMapping.visible);
    if (params.bumpMapping.visible){
        cube_stone.material = material_bump;
        cube_stone.material.bumpScale = params.bumpMapping.scale;
    }else{
        cube_stone.material = material;
    }
    cube_stone.material.shininess = params.boxControls.shininess;
    cube_stone.material.specular = new THREE.Color(params.boxControls.specular);

    spotLightHelper.update();
    cube_stone_normal.update();
    controls.update();
    stats.update();

    renderer.render(scene, active_camera);
};

init();
animate();