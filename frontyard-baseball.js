"use strict"

var container;

var camera, scene, renderer;

var bat, swinging, doneSwinging;

window.onload = function init() {
    swinging = false;
    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 100);
    camera.position.set(0, 0, 8);

    scene = new THREE.Scene();

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    var floorMaterial = new THREE.MeshLambertMaterial( {side: THREE.DoubleSide });

    var floorGeometry = new THREE.PlaneBufferGeometry(12,12);
    var floorMesh = new THREE.Mesh(floorGeometry,floorMaterial);
    floorMesh.rotation.x -= Math.PI * 0.5;
    floorMesh.position.y -= 1.5;
    scene.add(floorMesh);

    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };

    var onError = function(xhr) {};

    THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('obj/bat/');
    mtlLoader.load('DolHomeRunBat.mtl', function(materials) {
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('obj/bat/');
        objLoader.load('DolHomeRunBat.obj', function(object) {

            var scale = 10.0;
            
            object.position.y = 0;
            object.scale.divideScalar(scale);
            object.rotation.z = Math.PI * -2.0/3.0
            object.rotation.y = Math.PI * -5.0/6.0

            bat = object;
            scene.add(object);

        }, onProgress, onError);

    });

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x00ffff, 1);
    container.appendChild(renderer.domElement);

    window.addEventListener('click', onClick);
    
    animate();    
}

function onClick() {
    swinging = true;
}

function animate() {
    requestAnimationFrame(animate);

    if(swinging) {
        if(bat.rotation.y < Math.PI * 3.0/6.0) {
            bat.rotation.y += Math.PI * 1.0/15.0;
        }
        else {
            swinging = false;
            doneSwinging = true;
        }
    }

    if(doneSwinging) {
        if(bat.rotation.y > Math.PI * -5.0/6.0) {
            bat.rotation.y -= Math.PI * 1.0/30.0;
        }
        else {
            doneSwinging = false;
        }
    }

    render();
}

function render() {
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}
