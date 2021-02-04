// import * as THREE from 'https://unpkg.com/three/build/three.module.js';
var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope) {
  const img = document.getElementById('img');
  var video;
  var model;
  var canvas = document.getElementById("object-detect");
  var overlayVdo = document.getElementById("overlayVdo");
  var container = document.getElementById('threejsContainer');
  var context = canvas.getContext("2d");
  var camera, bg, scene, renderer, videoSprite;
  async function init() {
    video = document.getElementById('object-video');

    await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',

      }
    }).then(stream => {
      video.srcObject = stream;
    });

    video.addEventListener("loadedmetadata", function () {
      var vw = this.videoWidth || this.width; // these are on video element itself
      var vh = this.videoHeight || this.height;
      canvas.width = vw
      canvas.height = vh;
    }, false);

    video.oncanplay = async (e) => {
      video.play();
      // loadFaceMesh();
      initThreeJS()
      initFaceMesh();
    };
  }

  function loadFaceMesh() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    var geometry = new THREE.BoxGeometry(1, 1, 1, 1);
    var material = new THREE.MeshBasicMaterial({
      color: 0x00ff00
    })
    camera.position.z = 200;
    /* var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.campingFactor = true;
    controls.enableZoom = true; */
    var objLoader = new THREE.OBJLoader();
    objLoader.load('models/facemesh.obj', function (obj) {
      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          faceObj = new THREE.Mesh(child.geometry, new THREE.MeshLambertMaterial({
            side: THREE.FrontSide,
            color: 0x0000ff
          }));
          faceObj.renderOrder = 1;
          faceObj.position.z = -110;
          scene.add(faceObj);
        }
      });
    });

    for (let index = 0; index < landmarksLength; index++) {
      const element = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
      marks.push(element);
    }

    const envMap = new THREE.CubeTextureLoader().load([
      path + 'posx' + format, path + 'negx' + format,
      path + 'posy' + format, path + 'negy' + format,
      path + 'posz' + format, path + 'negz' + format
    ]);

    loader = new GLTFLoader();
    loader.load("models/Glasses.glb",
      function (gltf) {

        gltf.scene.traverse(function (child) {
          var scale = 100;
          gltf.scene.scale.set(scale, scale, scale);
          gltf.scene.renderOrder = 1;
          gltfobj = gltf.scene;
          scene.add(gltf.scene);
        });
        gltf.scene.frustumCulled = false;
        gltf.scene.rotateX(0);
        gltf.scene.castShadow = true;

      },
    );

    const animate = function () {
      requestAnimationFrame(animate);

      renderer.render(scene, camera);
    };

    animate();
  }

  function initThreeJS() {
    video = document.getElementById('object-video');
    camera = new THREE.PerspectiveCamera(50, video.videoWidth / video.videoHeight, 1, 5000);
    camera.position.z = video.videoHeight;
    camera.position.x = -video.videoWidth / 2;
    camera.position.y = -video.videoHeight / 2;
    bg = new THREE.Texture(video);
    bg.minFilter = THREE.LinearFilter;
    bg.needsUpdate = true;
    videoSprite = new THREE.Sprite(new THREE.MeshBasicMaterial({
      map: bg,
      depthWrite: false,
      side: THREE.DoubleSide
    }));
    scene = new THREE.Scene();
    // Create lights
    const ambientLight = new THREE.AmbientLight(0x101030);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    scene.add(videoSprite);
    videoSprite.center.set(0.5, 0.5);
    videoSprite.scale.set(-video.videoWidth, video.videoHeight, 1);
    videoSprite.position.copy(camera.position);
    videoSprite.position.z = 0;
    var material = new THREE.MeshPhongMaterial();
    var geometry = new THREE.BoxGeometry(2, 2, 2);
    mesh = new THREE.Mesh(geometry, material.clone());
    mesh.material.color.set(0x0000ff);
    mesh.material.colorWrite = false;
    scene.add(mesh);
    const triGeo = new THREE.Geometry();
    triGeo.vertices.push(new THREE.Vector3(1, 0, 0));
    triGeo.vertices.push(new THREE.Vector3(-1, 0, 0));
    triGeo.vertices.push(new THREE.Vector3(0, 0, 1));

    triGeo.faces.push(new THREE.Face3(0, 1, 2));

    triangle = new THREE.Mesh(triGeo, new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide
    }));
    triangle.visible = true;
    scene.add(triangle);
    var objLoader = new THREE.OBJLoader();
    objLoader.load('models/facemesh.obj', function (obj) {
      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          faceObj = new THREE.Mesh(child.geometry, new THREE.MeshLambertMaterial({
            side: THREE.FrontSide,
            color: 0x0000ff
          }));
          faceObj.renderOrder = 1;
          faceObj.position.z = -10;
          faceObj.position.x = -110;
          faceObj.position.y = -110;
          faceObj.visible=false;
          scene.add(faceObj);
        }
      });
    });

    loader = new THREE.GLTFLoader();
    loader.load("models/glass_1.gltf",
      function (gltf) {
        gltf.scene.traverse(function (child) {
          var scale = 10;
          gltf.scene.scale.set(scale, scale, scale);
          gltf.scene.position.x = -110;
          gltf.scene.position.y = -210;
          gltf.scene.position.z = -10;
          gltf.scene.renderOrder = 1;
          gltfobj = gltf.scene;
          scene.add(gltf.scene);
        });
        gltf.scene.rotateX(5);
      },
    );

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    if (window.innerWidth > window.innerHeight)
      renderer.setSize(window.innerWidth, window.innerWidth * video.videoHeight / video.videoWidth);
    else
      renderer.setSize(window.innerHeight * video.videoWidth / video.videoHeight, window.innerHeight);
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    animate();
  }

  async function initFaceMesh() {
    await tf.setBackend('webgl');
    model = await facemesh.load({
      maxFaces: 1
    });
    facePredictions();
  }

  async function facePredictions() {
    const predictions = await model.estimateFaces(video);
    console.log(predictions);
    if (predictions.length > 0) {
      /* faceObj.visible = true;
      triangle.visible = true;
      gltfobj.visible = true; */
      for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].scaledMesh;
        points = keypoints;
        const v2 = new THREE.Vector3(-keypoints[7][0], -keypoints[7][1], -keypoints[7][2]);
        const v1 = new THREE.Vector3(-keypoints[175][0], -keypoints[175][1], -keypoints[175][2])
        const v3 = new THREE.Vector3(-keypoints[263][0], -keypoints[263][1], -keypoints[263][2])
        const x = v1.x + v2.x + v3.x;
        const y = v1.y + v2.y + v3.y;
        const z = v1.z + v2.z + v3.z;

        triangle.geometry.vertices[0].copy(v1);
        triangle.geometry.vertices[1].copy(v2);
        triangle.geometry.vertices[2].copy(v3);
        triangle.geometry.verticesNeedUpdate = true;
        triangle.geometry.computeFaceNormals();
        const normal = triangle.geometry.faces[0].normal.clone();
        normal.transformDirection(triangle.matrixWorld);
        normal.add(new THREE.Vector3(x / 3, y / 3, z));
        scene.children[6].position.set(x / 3, y / 3, z);
        scene.children[6].lookAt(normal);
        let vector = faceObj.getWorldDirection();
        let theta = Math.atan2(vector.x, vector.z);
        console.log(vector);
        console.log(theta);
        scene.children[6].rotation.y = 0;
        scene.children[6].rotation.x = 5;
        // scene.children[6].rotation.y += -0.01;
        const p3 = new THREE.Vector3(-points[139][0], -points[139][1], -points[139][2]);
            const p4 = new THREE.Vector3(-points[368][0], -points[368][1], -points[368][2]);
            const dist1 = p3.distanceTo(p4);
            const scale2 = dist1 / 120.4 * 10;
            scene.children[6].scale.set(scale2, scale2, scale2);
            for (let i = 0; i < keypoints.length; i++) {
              //console.log('i value'+i);
              const [x, y, z] = keypoints[i];
              /* if (faceObj) {
                  faceObj.geometry.vertices[i].set(-x, -y, -z / 30);
                  faceObj.geometry.verticesNeedUpdate = true;
              } */
          }

      }
      requestAnimationFrame(facePredictions);
    }
  }


  function animate() {
    bg.needsUpdate = true;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  function onWindowResize() {

    camera.aspect = video.videoWidth / video.videoHeight;
    camera.updateProjectionMatrix();

    if (window.innerWidth > window.innerHeight)
      renderer.setSize(window.innerWidth, window.innerWidth * video.videoHeight / video.videoWidth);
    else
      renderer.setSize(window.innerHeight * video.videoWidth / video.videoHeight, window.innerHeight);

  }


  init();









});