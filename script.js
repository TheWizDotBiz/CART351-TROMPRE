//THREE.js nonsense
//imports addons from up somewhere, the URl for the files are in the index.html file
import { GLTFLoader } from "three/addons/GLTFLoader.js";
import { OrbitControls } from "three/addons/OrbitControls.js";
import { FirstPersonControls } from "three/addons/FirstPersonControls.js";



//Creates a scene and camera, as well as a WebGL renderer (Three.js is based off of WebGL)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//gltf stuff to import models
const loader = new GLTFLoader();

loader.load('models/room.glb', function(gltf){
    scene.add(gltf.scene);
}, undefined, function(error){
    console.error(error);
});


//Creates a cube, and adds it to the scene
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
//Camera position foward ig
camera.position.z = 5;

document.addEventListener("keydown", Keyinput);
document.addEventListener("keyup", keyUp);
let inputList = new Array();
//This does the rendering   
function animate() {
//rotato cube
    requestAnimationFrame( animate ); //this requests the animate() function to be ran next frame, this is why you always call it first at the beginning of animate(), so animate is ran again.
    //if you need time apparently JS has a builtin date() function which can return stuff like seconds and milliseconds, could be used for a timer
    //theres deffo gotta be a better alternative tho.
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
	handleInput();
	renderer.render( scene, camera );
}
animate();

//TAKES in the iput by reading keys
function Keyinput(event){
    var INPUT = event.key
    //check if inputList already contains key
    var contains = false;
    for(var i = 0; i < inputList.length; i++){
        if(inputList[i] == event.key){
            contains = true;
        }
        
    }

    if(!contains){
        inputList.push(INPUT);
    }
   /*if(event.key){
    cube.position.x += 0.1;
   }*/
}

function keyUp(event){
    for(var i = 0; i < inputList.length; i++){
        if(inputList[i] == event.key){
            inputList.splice(i, 1);
        }
    }
}

//actually does stuff, put keys as cases in the switch statement, link em to a function.
function handleInput(){
    // console.log(inputList);
    for(var i = 0; i < inputList.length ; i++){
        switch(inputList[i]){
            case "w":
                cube.position.x += 0.1;
                camera.position.y += 0.1;
            break;
            default:
                console.log("no handleInput case for key " + inputList[i]);
            break;
        }
    }
    //inputList = [];
}




