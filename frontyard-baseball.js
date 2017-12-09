"use strict"

var container;

var camera, scene, renderer;

var bat, swinging, doneSwinging, downSwing;

window.onload = function init() {
    swinging = false;
    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 100);
    camera.position.set(0, 0, 24);

    scene = new THREE.Scene();

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffaa, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    var fieldMaterial = new THREE.MeshBasicMaterial({color: 0x55dd55});

    var floorGeometry = new THREE.PlaneBufferGeometry(96,96);
    var floorMesh = new THREE.Mesh(floorGeometry,fieldMaterial);
    floorMesh.rotation.x -= Math.PI * 6.0/12.0;
    floorMesh.position.y -= 1.5;
    floorMesh.position.z -= 24;
    scene.add(floorMesh);

    var wallMaterial = new THREE.MeshPhongMaterial({color: 0x444488});
    var wallGeometry = new THREE.PlaneBufferGeometry(96,12);

    var wallMesh1 = new THREE.Mesh(wallGeometry,wallMaterial);
    wallMesh1.position.z -= 72;
    scene.add(wallMesh1);

    var wallMesh2 = new THREE.Mesh(wallGeometry,wallMaterial);
    wallMesh2.position.z -= 64;
    wallMesh2.position.x -= 48;
    wallMesh2.rotation.y += Math.PI * 1.0 / 3.0;
    scene.add(wallMesh2);

    var wallMesh3 = new THREE.Mesh(wallGeometry,wallMaterial);
    wallMesh3.position.z -= 64;
    wallMesh3.position.x += 48;
    wallMesh3.rotation.y -= Math.PI * 1.0 / 3.0;
    scene.add(wallMesh3);

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
            
            object.position.y = 0.25;
            object.position.z = 21;
            object.position.x = -1;
            object.scale.divideScalar(scale);
            object.rotation.z = Math.PI * -1.0/3.0
            object.rotation.y = Math.PI * -5.0/6.0

            bat = object;
            scene.add(object);

        }, onProgress, onError);

    });

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x00aaff, 1);
    container.appendChild(renderer.domElement);

    document.addEventListener('mousedown', onClick);
    document.addEventListener('mousemove', onMouseMove, false);
    
    animate();    
}

function onClick() {
    if(!doneSwinging) {
        swinging = true;
        downSwing = true;
    }
}

function onMouseMove( event ) {
    if(!doneSwinging && !swinging) {
        bat.position.x = 4 * (( event.clientX ) / window.innerWidth) - 2.75;
        bat.position.y = -2 * (( event.clientY ) / window.innerHeight) + 1;

        console.log(bat.position.x + " " + bat.position.y);
    }
}

function animate() {
    requestAnimationFrame(animate);

    if(swinging) {
        if(bat.rotation.y < Math.PI * 3.0/6.0) {
            if(downSwing && bat.rotation.z > Math.PI * -2.0/3.0) {
                bat.rotation.z -= Math.PI * 1.0/36.0;
            }
            else {
                downSwing = false;
                bat.rotation.z += Math.PI * 1.0/36.0;
            }
            bat.rotation.y += Math.PI * 1.0/18.0;
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
            bat.rotation.z = Math.PI * -1.0/3.0
        }
    }

    render();
}

function render() {
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}
