"use strict"

Physijs.scripts.worker = 'physijs_worker.js';
Physijs.scripts.ammo = 'js/ammo.js';

var container;

var camera, scene, renderer, loader, ball = null;

var flag1 = false, flag2 = false, reset = true;

var bat, swinging, doneSwinging, downSwing;

window.onload = function init() {
		swinging = false;
		container = document.createElement('div');
		document.body.appendChild(container);

		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 100);
		camera.position.set(0, 0, 24);

		scene = new Physijs.Scene();
		scene.setGravity(new THREE.Vector3(0, -30, 0));
		scene.addEventListener('update', function(){
			if (ball !== null) {
				var old = ball.getLinearVelocity();
				//console.log(old);

			scene.simulate(undefined,1);}
		} );
	scene.simulate();

		var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
		scene.add(ambientLight);

		var directionalLight = new THREE.DirectionalLight(0xffffaa, 0.8);
		directionalLight.position.set(1, 1, 1);
		directionalLight.target.position.copy(scene.position)
		directionalLight.castShadow = true;
		scene.add(directionalLight);

	loader = new THREE.TextureLoader();

		var fieldMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({map: loader.load( 'textures/field.png' ) }), 0.5, 0.2);
	fieldMaterial.map.wrapS = fieldMaterial.map.wrapT = THREE.RepeatWrapping;
	fieldMaterial.map.repeat.set(3, 3);

		var floorMesh = new Physijs.BoxMesh( new THREE.BoxGeometry(96,1,96), fieldMaterial, 0, {restitution: 0.2, friction: 0.8});
		//var floorMesh = new THREE.Mesh(floorGeometry,fieldMaterial);
		floorMesh.rotation.x -= 0 * Math.PI * 6.0/12.0;
	//floorMesh.rotation.z -= Math.PI * 0.5;
		floorMesh.position.y -= 1.5;
		floorMesh.position.z -= 24;
		floorMesh.receiveShadow = true;
		scene.add(floorMesh);

		var wallMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial({map: loader.load( 'textures/fence.png') }), 0.5, 0.2);
		var wallMesh1 = new Physijs.BoxMesh( new THREE.BoxGeometry(96,1,12), wallMaterial, 0);
		var wallMesh2 = new Physijs.BoxMesh( new THREE.BoxGeometry(96,1,12), wallMaterial, 0);
		var wallMesh3 = new Physijs.BoxMesh( new THREE.BoxGeometry(96,1,12), wallMaterial, 0);

		wallMesh1.position.z -= 60;
	wallMesh1.position.y -= 0.6;
		scene.add(wallMesh1);

		wallMesh2.position.z -= 53.3;
		wallMesh2.position.x -= 48; //x
		wallMesh2.rotation.y += Math.PI * 1.0 / 3.0;
	wallMesh2.position.y -= 0.6;
		scene.add(wallMesh2);

		wallMesh3.position.z -= 53.3;
		wallMesh3.position.x += 48;
		wallMesh3.rotation.y -= Math.PI * 1.0 / 3.0;
	wallMesh3.position.y -= 0.6;
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

		renderer = new THREE.WebGLRenderer({antialias:true});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x00aaff, 1);
		container.appendChild(renderer.domElement);

		document.addEventListener('mousedown', onClick);
		document.addEventListener('mousemove', onMouseMove, false);

	var materialBall;
	materialBall = Physijs.createMaterial( new THREE.MeshLambertMaterial( { map: loader.load( 'textures/baseball.jpg' ) }), 0.6, 0.3);
	materialBall.map.wrapS = materialBall.map.wrapT = THREE.RepeatWrapping;
	materialBall.map.repeat.set(3, 3);

	ball = new Physijs.SphereMesh( new THREE.SphereGeometry(0.15, 16, 16), materialBall, 1);
	ball.position.set(Math.random() / 4.0 - 0.25, Math.random() / 4.0 - 0.25, -5.0);
				ball.castShadow = true;
	ball.__dirtyPosition = true;
	// ball.setLinearVelocity(new THREE.Vector3(0, 100, 20));
	// ball.addEventListener('
	scene.add( ball );


	flag1 = true;
	animate();
}

function onClick() {
		if(!doneSwinging) {
				swinging = true;
				downSwing = true;
	}
	var materialBall;
	materialBall = Physijs.createMaterial( new THREE.MeshLambertMaterial( { map: loader.load( 'textures/baseball.jpg' ) }), 0.6, 0.3);
	materialBall.map.wrapS = materialBall.map.wrapT = THREE.RepeatWrapping;
	materialBall.map.repeat.set(3, 3);

	if (ball.position.z > 100) {
		if (reset) {
			scene.remove(ball);
			ball = new Physijs.SphereMesh( new THREE.SphereGeometry(0.2, 16, 16), materialBall, 1);
			ball.position.set(Math.random() / 4.0 - 0.25, Math.random() / 4.0 - 0.25, -5.0);
			scene.add( ball );
			ball.setLinearVelocity(new THREE.Vector3(0, 10, 40));
			ball.castShadow = true;

			flag2 = true;
			reset = false;
		}
	}

	//console.log(ball.position);

	flag1 = false;

	if (flag2) {
		flag1 = true;
	}

	//console.log(ball.position.z, flag2);
}

function onMouseMove( event ) {
		if(!doneSwinging && !swinging) {
				bat.position.x = 4 * (( event.clientX ) / window.innerWidth) - 2.75;
				bat.position.y = -2 * (( event.clientY ) / window.innerHeight) + 1;

				//console.log(bat.position.x + " " + bat.position.y);

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

	//console.log(flag1, flag2, "flags");
	if (flag1) {
		// ball.setLinearVelocity(new THREE.Vector3(0, 0, 0));
		if (flag2) {
				//console.log(ball.position);
				//ball.position.set(Math.random() * 2, 0.5, -5.0 + Math.random());
				//ball.position.y = 0.5;
				//ball.position.z = -5.0;
				//console.log(ball.position);
				if (ball.position.z > 100){
					reset = true;
				}
		}
		ball.setLinearVelocity(new THREE.Vector3(0, 10, 40));
		flag1 = false;
	}

		if (ball.getLinearVelocity().z < 0) {
			//console.log(ball.getLinearVelocity().z, "HERE");
			camera.lookAt(ball.position);
		}
		else {
			camera.lookAt(scene.position);
		}
		renderer.render(scene, camera);
}
