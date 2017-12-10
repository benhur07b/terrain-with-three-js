var width  = window.innerWidth,
    height = window.innerHeight;

var scene = new THREE.Scene();

var container, stats;
var camera, scene, renderer, light;
var controls, water, sphere, cubeMap;

var parameters = {
    oceanSide: 2000,
    size: 1.0,
    distortionScale: 3.7,
    alpha: 1.0
};

var waterNormals;

init();
animate();

function init() {

    container = document.getElementById( 'container' );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xEEEEEE);
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2( 0xaabbbb, 0.001 );

    camera = new THREE.PerspectiveCamera( 45, width/height, .1, 10000 );
    camera.position.set( 0, -60, 45 );

    controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 0.33;
    controls.noRotate = true;
    // controls.target.set( 0, 10, 0 );
    // controls.minDistance = 40.0;
    // controls.maxDistance = 200.0;
    // camera.lookAt( controls.target );

    setLighting();
    // setWater();
    // setSkybox();

    var terrainLoader = new THREE.TerrainLoader();
    terrainLoader.load('../../static/media/heights/RegV_Albay_200.bin', function(data) {
       var geometry = new THREE.PlaneGeometry(60, 60, 512, 298);
       for (var i = 0, l = geometry.vertices.length; i < l; i++) {
           geometry.vertices[i].z = data[i] / 65535 * 6;
       };

       var loader = new THREE.TextureLoader();
       loader.load(
           '../../static/media/textures/texture3_200.jpg',
           function(texture){
               var material = new THREE.MeshLambertMaterial({
                   map: texture
               });
               var plane = new THREE.Mesh(geometry, material);
               scene.add(plane);
           }
       );

       geometry.computeFaceNormals();
       geometry.computeVertexNormals();
    });

    stats = new Stats();
    container.appendChild( stats.dom );

    // gui = new dat.GUI();
    // gui.add( parameters, 'distortionScale', 0, 8, 0.1 );
    // gui.add( parameters, 'size', 0.1, 10, 0.1 );
    // gui.add( parameters, 'alpha', 0.9, 1, .001 );

    window.addEventListener( 'resize', onWindowResize, false );

}

function setWater() {

    water = new THREE.Water(
        parameters.oceanSide * 5,
        parameters.oceanSide * 5,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( '../../static/media/textures/waternormals.jpg', function ( texture ) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            alpha: 	parameters.alpha,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: parameters.distortionScale,
            fog: scene.fog != undefined
        }
    );

    water.rotation.x = - Math.PI / 2;
    water.receiveShadow = true;

    scene.add( water );

}

// function setSkybox() {
//
//     cubeMap = new THREE.CubeTexture( [] );
//     cubeMap.format = THREE.RGBFormat;
//
//     var loader = new THREE.ImageLoader();
//     loader.load( '/textures/skyboxsun25degtest.png', function ( image ) {
//
//         var getSide = function ( x, y ) {
//
//             var size = 1024;
//
//             var canvas = document.createElement( 'canvas' );
//             canvas.width = size;
//             canvas.height = size;
//
//             var context = canvas.getContext( '2d' );
//             context.drawImage( image, - x * size, - y * size );
//
//             return canvas;
//
//         };
//
//         cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
//         cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
//         cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
//         cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
//         cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
//         cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
//         cubeMap.needsUpdate = true;
//
//     } );
//
//     var cubeShader = THREE.ShaderLib[ 'cube' ];
//     cubeShader.uniforms[ 'tCube' ].value = cubeMap;
//
//     var skyBoxMaterial = new THREE.ShaderMaterial( {
//         fragmentShader: cubeShader.fragmentShader,
//         vertexShader: cubeShader.vertexShader,
//         uniforms: cubeShader.uniforms,
//         side: THREE.BackSide
//     } );
//
//     var skyBox = new THREE.Mesh(
//         new THREE.BoxGeometry( parameters.oceanSide * 5 + 100, parameters.oceanSide * 5 + 100, parameters.oceanSide * 5 + 100 ),
//         skyBoxMaterial
//     );
//
//     scene.add( skyBox );
//
// }

function setLighting() {

    renderer.shadowMap.enabled = true;

    light = new THREE.DirectionalLight( 0xFFFFDD, 1 );
    light.position.set( 50, -50, 50 );
    light.castShadow = true;
    light.shadow.camera.top = 45;
    light.shadow.camera.right = 40;
    light.shadow.camera.left = light.shadow.camera.bottom = -40;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 200;

    scene.add( light, new THREE.AmbientLight( 0x888888 ) );

}

function onWindowResize() {

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );

}

function animate() {

    requestAnimationFrame( animate );
    render();
    stats.update();

}

function render() {

    // var time = performance.now() * 0.001;
    //
    // water.material.uniforms.time.value += 1.0 / 60.0;
    // water.material.uniforms.size.value = parameters.size;
    // water.material.uniforms.distortionScale.value = parameters.distortionScale;
    // water.material.uniforms.alpha.value = parameters.alpha;
    controls.update();
    renderer.render(scene, camera);

}
