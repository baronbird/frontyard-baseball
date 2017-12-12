"use strict"

var container;
var raycaster;

// three.js
var camera, scene, renderer, loader;
var batMesh, ballMesh, swinging, doneSwinging, downSwing, canHit, hudMesh, targetMesh;
var tracker, num = 0;


// cannon.js
var world, ball, bat, batter, walls = [];

window.onload = function init() {
    initCannon();

    swinging = false;
    canHit = false;

    // create container for canvas
    container = document.createElement('div');
    document.body.appendChild(container);

    tracker = document.createElement('p');
    tracker.setAttribute("style", "position: absolute; left: 0; top: 0; z-index: 1; font-size: 30pt;");
    tracker.innerHTML = "Home runs: " + num.toString();
    container.appendChild(tracker);

    loader = new THREE.TextureLoader();

    // create camera
    camera = new THREE.PerspectiveCamera(45,
            window.innerWidth / window.innerHeight, .1, 100);
    camera.position.set(0, 0, 24);

    // create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x00aaff );

    // add lights
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    var directionalLight = new THREE.PointLight(0xffffaa, 2.0);
    directionalLight.position.set(0, 100, 225);
    scene.add(directionalLight);

    // create field

    // CANNON
    var fieldShape = new CANNON.Plane();
    var fieldBody = new CANNON.Body({ mass: 0 });
    fieldBody.addShape(fieldShape);
    fieldBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    fieldBody.position.set(0,-1.5,0);
    world.addBody(fieldBody);

    // THREE
    var fieldMaterial = new THREE.MeshLambertMaterial({map: loader.load('textures/field.png'),
        side: THREE.DoubleSide });
    var fieldGeometry = new THREE.PlaneBufferGeometry(96,96);
    var fieldMesh = new THREE.Mesh(fieldGeometry,fieldMaterial);
    fieldMesh.rotation.x -= Math.PI * 6.0/12.0;
    fieldMesh.position.y -= 1.5;
    fieldMesh.position.z -= 24;
    scene.add(fieldMesh);

    // create the three outfield walls
    var wallMaterial = new THREE.MeshLambertMaterial({color: 0x222266});
    var wallGeometry = new THREE.PlaneBufferGeometry(96,12);

    var wallShape = new CANNON.Plane();
    var wallBody = new CANNON.Body({ mass: 0 });
    fieldBody.addShape(wallShape);
    fieldBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    fieldBody.position.set(0,-1.5,0);
    world.addBody(fieldBody);

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


    // add bat
    var objLoader = new THREE.OBJLoader();
    objLoader.load('obj/bat/baseball_bat.obj', function(object) {
        var scale = 10.0;

        var batMaterial = new THREE.MeshPhongMaterial({color: 0xccaa55});

        object.traverse(function(child) {
            if(child instanceof THREE.Mesh) {
                child.material = batMaterial
            };
        });

        object.position.y = 0.25;
        object.position.z = 21;
        object.position.x = -1;
        object.scale.divideScalar(scale);
        object.rotation.z = Math.PI * -1.0/6.0;
        object.rotation.y = Math.PI * -2.0/3.0;

        // add to scene
        batMesh = object;
        batMesh.scale.set(0.25,0.175,0.25);
        scene.add(object);

    });

    var batShape = new CANNON.Cylinder(0.1,0.1,0.75,30);
    bat = new CANNON.Body({mass: 0});
    bat.addShape(batShape);
    bat.velocity.set(0,7.5,-21);
    bat.position.set(0,0.125,21);
    bat.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), Math.PI * -0.5);
    bat.collisionResponse = 0;
    world.addBody(bat);

    bat.addEventListener("collide", function(e) {
        if(e.body = ball && canHit) {
            ball.velocity.x = (ball.position.z - bat.position.z) * 50;
            ball.velocity.y = (ball.position.y - bat.position.y) * 100;
            ball.velocity.z = Math.cos(Math.PI*(ball.position.x-bat.position.x))*-75;
        }
    });



    // add ball

    // CANNON
    var ballShape = new CANNON.Sphere(0.075);
    ball = new CANNON.Body({ mass: 0.001 });
    ball.addShape(ballShape);
    ball.velocity.set(0,5,22);
    ball.position.set(0, 3, -10);

    // THREE
    var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
    var ballMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
    ballMesh = new THREE.Mesh( ballGeometry, ballMaterial );
    world.addBody(ball);
    scene.add(ballMesh);

    var hudGeometry = new THREE.BoxGeometry(1, 1, 0.1);
    var hudMaterial = new THREE.MeshLambertMaterial({
        map: loader.load('textures/hud.png'),
        transparent: true,
        opacity: 0.5 });
    hudMesh = new THREE.Mesh( hudGeometry, hudMaterial );
    hudMesh.position.z = 21.4;
    scene.add(hudMesh);

    var targetGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.02);
    var targetMaterial = new THREE.MeshLambertMaterial({
        map: loader.load('textures/target.png'),
        transparent: true,
        opacity: 0.6 });
    targetMesh = new THREE.Mesh( targetGeometry, targetMaterial );
    targetMesh.position.z = 21.5;
    scene.add(targetMesh);

    // create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // create raycaster
    raycaster = new THREE.Raycaster();

    // add event listeners
    document.addEventListener('mousedown', onClick);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('resize', onWindowResize, false);

    animate();
}

function initCannon() {
    // create world
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    // set default contact material properties
    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    // set gravity
    world.gravity.set(0,-10,0);

    // create and add a contact material to the world
    var physicsMaterial = new CANNON.Material("slipperyMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                            physicsMaterial,
                                                            0.0,
                                                            0.3);
    world.addContactMaterial(physicsContactMaterial);
}

function onClick() {
    if(!swinging && !doneSwinging) {
        swinging = true;
        downSwing = true;
    }
}

function onMouseMove( event ) {
    var mouse = new THREE.Vector2();

    if(!swinging) {
        mouse.x = (event.clientX/renderer.domElement.clientWidth)*2-1;
        mouse.y = (event.clientY/renderer.domElement.clientHeight)*-2+1;
        raycaster.setFromCamera(mouse,camera);

        var intersects = raycaster.intersectObject(hudMesh);

        if(intersects.length > 0) {
            targetMesh.position.copy(intersects[0].point);
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    world.step(1.0/60.0);

    ballMesh.position.copy(ball.position);
    bat.position.copy(targetMesh.position);
    bat.position.y -= 0.1;
    batMesh.position.set(bat.position.x - 1.1125,
            bat.position.y + 0.05,
            bat.position.z);

    if(swinging) {
        if(batMesh.rotation.y < Math.PI * 3.0/6.0) {
            if(downSwing && batMesh.rotation.z > Math.PI * -7.0/12.0) {
                batMesh.rotation.z -= Math.PI * 1.0/30.0;
            }
            else {
                downSwing = false;
                batMesh.rotation.z += Math.PI * 1.0/30.0;
            }
            batMesh.rotation.y += Math.PI * 1.0/18.0;
            if(batMesh.rotation.y < Math.PI * 1.0/3.0
                    && batMesh.rotation.y > Math.PI * -1.0/3.0) {
                canHit = true;
            }
            else {
                canHit = false;
            }
        }
        else {
            swinging = false;
            doneSwinging = true;
        }
    }

    if(doneSwinging) {
        if(batMesh.rotation.y > Math.PI * -2.0/3.0) {
            batMesh.rotation.y -= Math.PI * 1.0/30.0;
        }
        else {
            doneSwinging = false;
            batMesh.rotation.z = Math.PI * -1.0/6.0
        }
    }

    if (ballMesh.position.z < -64 && ballMesh.position.y > 8) {
      num = 1;
      tracker.innerHTML = "Home runs: " + num.toString();
    }

    render();
}

function render() {
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}
