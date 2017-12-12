"use strict"

var container;
var raycaster;

// three.js
var camera, scene, renderer, loader;
var batMesh, ballMesh, swinging, doneSwinging, downSwing, canHit, hudMesh, targetMesh;
var tracker, num = 0, devMesh, menuBool, startMesh, howMesh, skip = false;


// cannon.js
var world, ball, bat, batter, walls, start, how = [];

window.onload = function init() {
    initCannon();

    menuBool = true;
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
        console.log(e);
        if (e.body == ball && canHit) {
            ball.velocity.x = (ball.position.z - bat.position.z) * 50;
            ball.velocity.y = (ball.position.y - bat.position.y) * 100;
            ball.velocity.z = Math.cos(Math.PI*(ball.position.x-bat.position.x))*-75;
        }

        if (e.body == start) {
            start.velocity.x = (start.position.z - bat.position.z) * 50;
            start.velocity.y = (start.position.y - bat.position.y) * 100;
            start.velocity.z = Math.cos(Math.PI*(start.position.x-bat.position.x))*-75;
            menuBool = false;
        }
        if (e.body == how) {
            how.velocity.x = (how.position.z - bat.position.z) * 50;
            how.velocity.y = (how.position.y - bat.position.y) * 100;
            how.velocity.z = Math.cos(Math.PI*(how.position.x-bat.position.x))*-75;
            menuBool = false;
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
    //world.addBody(ball);
    //scene.add(ballMesh);


    var hudGeometry = new THREE.BoxGeometry(1, 1, 0.1);
    var hudMaterial = new THREE.MeshLambertMaterial({
        map: loader.load('textures/hud.png'),
        transparent: true,
        opacity: 0.5 });
    hudMesh = new THREE.Mesh( hudGeometry, hudMaterial );
    hudMesh.position.z = 21.4;
    hudMesh.collisionResponse = 0;
    scene.add(hudMesh);

    var targetGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.02);
    var targetMaterial = new THREE.MeshLambertMaterial({
        map: loader.load('textures/target.png'),
        transparent: true,
        opacity: 0.6 });
    targetMesh = new THREE.Mesh( targetGeometry, targetMaterial );
    targetMesh.position.z = 21.5;
    scene.add(targetMesh);

    var devGeometry = new THREE.BoxGeometry(2, 0.5, 0.001);
    var devMaterial = new THREE.MeshLambertMaterial({map: loader.load('textures/dev-info.png'), transparent: true, opacity: 0.9});
    devMesh = new THREE.Mesh( devGeometry, devMaterial );
    devMesh.position.z = 18.5;
    devMesh.position.y += 1.8;
    scene.add(devMesh);


    var startShape = new CANNON.Box( new CANNON.Vec3(2.04, 0.51, 0.5));
    start = new CANNON.Body({ mass: 1  });
    start.addShape(startShape);
    start.velocity.set(0,0,0);
    //start.rotation.z = Math.PI * Math.random()/2 - 0.25;
    start.velocity.set(0,0,0);
    start.position.set(0, 2, 20);
    //world.add(start);

    var startGeometry = new THREE.BoxGeometry(2.04, 1, 0.5);
    var startMaterial = new THREE.MeshPhongMaterial({ map: loader.load('textures/menuitem_start_large_trimmed.png') });
    startMesh = new THREE.Mesh( startGeometry, startMaterial );
    world.addBody(start);
    startMesh.position.z = 20;
    scene.add(startMesh);


    var howShape = new CANNON.Box( new CANNON.Vec3(2.04, 0.5, 0.5));
    how = new CANNON.Body({ mass: 1 });
    how.addShape(howShape);
    how.velocity.set(0,0,0);
    //how.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), Math.PI * Math.random()/2 - 0.25);
    how.velocity.set(0,0,0);
    how.position.set(0, 0.5, 20);
    //world.add(how);

    var howGeometry = new THREE.BoxGeometry(2.04, 1, 0.5);
    var howMaterial = new THREE.MeshPhongMaterial({ map: loader.load('textures/menuitem_howto_large.png') });
    howMesh = new THREE.Mesh( howGeometry, howMaterial );
    world.addBody(how);
    howMesh.position.z = 20;
    scene.add(howMesh);

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

function startGame() {

    if (!skip && !menuBool) {
      world.addBody(ball);
      scene.add(ballMesh);

      if (!menuBool && !ball) {
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
      }

      skip = true;
    }
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

function onClick( event ) {
    if(!swinging && !doneSwinging) {
        swinging = true;
        downSwing = true;
    }

    if (menuBool) {

        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX/renderer.domElement.clientWidth)*2-1;
        mouse.y = (event.clientY/renderer.domElement.clientHeight)*-2+1;
        raycaster.setFromCamera(mouse,camera);

        var intersects = raycaster.intersectObject(hudMesh);

        if(intersects.length > 0) {
            menuBool = false;
            start.position.set(0,0,40);
            how.position.set(0,0,40);
        }
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



    startMesh.position.copy(start.position);
    howMesh.position.copy(how.position);
    if (ballMesh && ball) {
        ballMesh.position.copy(ball.position);
    }
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

    /*wallMesh1.position.y = 0 ;
    wallMesh2.position.y = 0 ;
    wallMesh3.position.y = 0 ;
    hudMesh.position.y = 0;*/
    //hudMesh.position.y = 0;

    if (!menuBool) {
        startGame();
    }


    if (menuBool) {
        startGame();

        //hudMesh.position.y = -100;
        /*wallMesh1.position.y = -100 ;
        wallMesh2.position.y = -100 ;
        wallMesh3.position.y = -100 ;
        hudMesh.position.y = -100;*/
    }

    renderer.render(scene, camera);
}
