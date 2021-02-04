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
  var camera, bg, scene, renderer,videoSprite;
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

    video.oncanplay = async(e) => {
      video.play();
      overlayVdo.play();
        var interface =  {
            label: "lite_mobilenet_v2 " 
          }
        model = await cocoSsd.load(interface);
        draw();
    //   initThreeJS()
    //  /*  cocoSsd.load().then(mdl => {
    //     model = mdl;
    //   }); */
    //   renderPredeciton();
        renderer();
    };
  }

  function initThreeJS() {
    video = document.getElementById('object-video');
    camera = new THREE.PerspectiveCamera(40, video.videoWidth / video.videoHeight, 1, 5000);
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

  async function renderPredeciton() {
    var predictions = await model.detect(video);
    var _overlayVdo = new THREE.Texture(overlayVdo);
    var material = new THREE.MeshLambertMaterial({
      map: _overlayVdo
    });
    console.log(predictions);
    for (var i = 0; i < predictions.length; i++) {
      if (predictions[i].class == "suitcase" || predictions[i].class == "cell phone") {
        var geometry = new THREE.PlaneGeometry(predictions[i].bbox[2], predictions[i].bbox[3] * .75);
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(predictions[i].bbox[0], predictions[i].bbox[1],0)
        scene.add(mesh);
        var light = new THREE.PointLight( 0xffffff, 1, 0 );
        light.position.set(1, 1, 100 );
        scene.add(light)
        // context.drawImage(overlayVdo, predictions[i].bbox[0], predictions[i].bbox[1], predictions[i].bbox[2], predictions[i].bbox[3]);
      }
    }
    // requestAnimationFrame(renderPredeciton);
  }

  function renderer() {

    model.detect(video).then(predictions => {
      console.log('Predictions: ', predictions);
    });

    // requestAnimationFrame(renderer);
  }

  function animate() {
     bg.needsUpdate = true;
     renderPredeciton();
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


  function draw() {
    if (video.paused || video.ended) {
      return;
    }
    if (model) {
      model.detect(video).then(predictions => {
        console.log('Predictions: ', predictions);
        for (var i = 0; i < predictions.length; i++) {
          if (predictions[i].class == "suitcase" || predictions[i].class == "cell phone") {
            context.drawImage(overlayVdo, predictions[i].bbox[0], predictions[i].bbox[1], predictions[i].bbox[2], predictions[i].bbox[3]);
          }
        }
      });
    }
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    requestAnimationFrame(draw);
  }

  init();









});