//THREE.js nonsense
//imports addons from up somewhere, the URl for the files are in the index.html file
//import * as THREE from "three"; //was "three"
//import { THREE } from "three";
//const { AmmoPhysics, PhysicsLoader } = ENABLE3D; 
//import { Project, Scene3D, PhysicsLoader, ExtendedObject3D, ExtendedMesh } from 'enable3d';
const { AmmoPhysics, PhysicsLoader } = ENABLE3D;
import { GLTFLoader } from "three/addons/GLTFLoader.js";
import { OrbitControls } from "three/addons/OrbitControls.js";
import { FirstPersonControls } from "three/addons/FirstPersonControls.js";
//import { PhysicsLoader } from "enable3d";
//import { Scene3D } from "enable3d/dist/scene3d.js";

//import objects
import cube from "./obj/cube.js";
import wizard from "./obj/wizard.js";
//gltf stuff to import models
const loader = new GLTFLoader();
const wizardModel = await loader.loadAsync('models/wizard.glb');
//import { Scene3D } from "enable3d";
//import { Socket } from "socket.io";
//import e from "express";


//disables default key use with browser, ie arrowkeys wont move the scrollbar;
window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

//Networking
let io_socket = io();
let clientSocket = io_socket.connect('http://localhost:4200');
let socketId = -1;
let localPlayerList = [];
let wizardList = []; //holds the wizard objects for players.

clientSocket.on("connect", function(data){
    console.log("connected");
    //put code here that should only execute once the client is connected
    clientSocket.emit("join", "msg:: client joined");
    // handler for receiving client id
  clientSocket.on("joinedClientId", function (data) {
    socketId = data.id;
    clientSocket.emit("updateWizardList", data.id);

    console.log("myId " + socketId);

    
    // ADD::
    runOnceConnected();
  });

})

function runOnceConnected(){
   // console.log("car");1
    clientSocket.on("updateWizardCount", function(data){
         //nuke currently existing wizards; //might have to find a way to remove models before splicing, idk
    for(var n = 0; n < wizardList.length; n++){
        scene.remove(wizardList[n]);
    }
    wizardList.splice(0, wizardList.length);

    //draw wizards based on localPlayerList;
    for(var i = 0; i < data.length; i++){
        console.log("comparing " + data[i].id + " to " + socketId);
        if(data[i].id != socketId){
            loadWizard(data[i]);
        }
    }

    })

   clientSocket.on("updatePlayerFromServer", function(data){
      //  localPlayerList = data;
     // console.log("running updatePlayerFromServer");
      //console.log("data length is " + data.length + " wizardList length is " + wizardList.length);  
      //movement
      for(var i = 0; i < data.length; i++){
        var exists = false;
        for(var j = 0 ; j < wizardList.length; j++){
            if(wizardList[j].name == data[i].id){
                exists = true;
              //  console.log("moving wizard " + wizardList[j].name + " to " + data[i].x + " " + data[i].y + data[i].z);
                wizardList[j].position.x = data[i].x;
                wizardList[j].position.y = data[i].y;
                wizardList[j].position.z = data[i].z;
                wizardList[j].rotation.y = data[i].r;
            }
        }
        if(exists == false && data[i].id != socketId){
            loadWizard(data[i]);
        }
      }

      //make self invis
     for(var l = 0; l < wizardList.length; l++){
        if(wizardList[l].name == socketId){
         //   console.log("you should now be invis!");
            wizardList[l].visible = false;
            l = wizardList.length;
        }
     }

      //cleanup
      /*
      for(var n = 0; n < wizardList.length; n++){
        var exists = false;
        for(var k = 0; k < data.length; k++){
            if(wizardList[n].name == data[k].id){
                exists = true;
            }
        }
        if(exists == false){
            console.log("wizard " + wizardList[n].name + " is deprecated");
            scene.remove(wizardList[n]);
            wizardList.splice(n, 1);
        }
      }
        */
     //   drawPlayers();
    })

    clientSocket.on('killWizard', function(id){
        for(var i = 0; i < wizardList.length; i++){
            if(id == wizardList[i].name){
                scene.remove(wizardList[i]);
                wizardList.splice(i, 1);
            }
        }
    })
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;
camera.position.y = 2;
let cameraPos = [camera.position.x, camera.position.y, camera.position.z, camera.rotation.y];
const raycaster = new THREE.Raycaster();
raycaster.camera = camera;
let raycastDistance = 2; //use this for setting raycaster.far
raycaster.far = raycastDistance;
//raycaster.far = 1; //determines ray length? check for THREE.js docs not enable3d
let falling = false; //used for raycast-based physics
let room;

function loadWizard(wizard){ //wizard should come from localPLayerList
    console.log("loading a wizard");
    loader.load('models/wizard.glb', function(gltf){
        //thisWizard.add(gltf.scene);

        var obj = gltf.scene;
       // console.log(gltf.scene.children[0]);
        scene.add(obj);
        obj.position.x = wizard.x;
        obj.position.y = wizard.y;
        obj.position.z = wizard.z;
        obj.rotation.y = wizard.r;
        obj.name = wizard.id;
        obj.disableRaycast = true;
        obj.layers.set(1);
        wizardList.push(obj);
        console.log("new wizard with id " + obj.name);
        //gltf.scene.mesh[0].position.x = wizard.x;

    }, undefined, function(error){
        console.error(error);
    })

}

//necessary for physics stuff and enable3d whatnots.
const MainScene = () => {
//Creates a scene and camera, as well as a WebGL renderer (Three.js is based off of WebGL)

const clock = new THREE.Clock();

//Add light, doesnt seem to work for some reason
scene.add(new THREE.AmbientLight(0xffffff));
//add physics. Courtesy of Ammo.js?
const physics = new AmmoPhysics(scene);
physics.debug.enable(true);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


//a box to contain the player, camera will be appended as child.
//const playerCol = physics.add.box({x: camera.position.x, y: camera.position.y, z: camera.position.z, width: 2, height: 0.1, depth: 2, collisionFlags: 0}, {lambert: {color: 'red', transparent: true, opacity: 0.5}});
//playerCol.add(camera);
camera.position.z = 5;
camera.position.y = 2;
let cameraPos = [camera.position.x, camera.position.y, camera.position.z, camera.rotation.y];

room = loader.load('models/room.glb', function(gltf){
    scene.add(gltf.scene);
    physics.add.existing(gltf.scene, { shape: 'convex'});
    gltf.scene.body.setCollisionFlags(1); //set to kinematic
    //after this is completed, the level should have collion, you may then add physics and collision to the camera
    
}, undefined, function(error){
    console.error(error);
});



function drawPlayers(){

    //nuke currently existing wizards; //might have to find a way to remove models before splicing, idk
    for(var n = 0; n < wizardList.length; n++){
        scene.remove(wizardList[n]);
    }
    wizardList.splice(0, wizardList.length);

    //draw wizards based on localPlayerList;
    for(var i = 0; i < localPlayerList.length; i++){
        loadWizard(localPlayerList[i]);
    }

}


/*
//Creates a cube, and adds it to the scene
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
*/
const TestCube = new cube(1, 1, 1, "#F28C28", scene);
//test add physics to cube
//this.physics.add.existing(TestCube);

//test wizard

//loadWizard(new wizard(1, 1, 1, "#F28C28", 1));
//loadWizard(new wizard(2, 1, 1, "#F28C28", 2));

/*
const testWizard = new wizard(1, 1, 1, "#F28C28", 1);
const testWizardTwo = new wizard(2, 2, 2, "#008272", 2);
loadWizard(testWizard);
loadWizard(testWizardTwo);
*/

/*
const closest = () => {
    var returnValue = false;
    const raycaster = physics.add.raycaster('closest');
    raycaster.setRayFromWorld(camera.position.x, camera.position.y, camera.position.z);
    var FORWARD = camera.getWorldDirection;
    console.log("FORWARD : " + FORWARD);
    raycaster.setRayToWorld(FORWARD);
    raycaster.rayTest();
    if(raycaster.hasHit()){
        console.log("HIT SOMETHING!");
        returnValue = true;
    }
    console.log("racyastfront " + returnValue);
    return returnValue;
    raycaster.destroy();
}*/
/*
const closest = () => {
    const rc = this.physics.add.raycaster('closest');

    rc.setRayFromWorld(camera.position);
    var pos = new THREE.Vector3;
    pos.x = 0;
    pos.y = 0;
    pos.z = raycastDistance;
    rc.setRayToWorld(camera.position - pos);
    rc.rayTest();

    rc.destroy();
}*/

function animate() {
    //rotato cube
        requestAnimationFrame( animate ); //this requests the animate() function to be ran next frame, this is why you always call it first at the beginning of animate(), so animate is ran again.
        //if you need time apparently JS has a builtin date() function which can return stuff like seconds and milliseconds, could be used for a timer
        //theres deffo gotta be a better alternative tho.
        //cube.rotation.x += 0.01;
        //cube.rotation.y += 0.01;
        physics.update(clock.getDelta() * 1000);
        physics.updateDebugger();
        handleInput();
        handleGravity();
        
        renderer.render( scene, camera );
    }
    animate();

} //MainScene end

PhysicsLoader('lib/ammo/kripken', () => MainScene());


document.addEventListener("keydown", Keyinput);
document.addEventListener("keyup", keyUp);
let inputList = new Array(); 


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
       // console.log(inputList[i]);
        switch(inputList[i]){
            case "w":
            case "ArrowUp":
                //cube.position.x += 0.1;
               // camera.position.z -= 0.1;
                if(!altRaycastCheck(0)){ //was !raycastCheck(true)
                    camera.translateZ(-0.1);
                }
                
            break;

            case "s":
            case "ArrowDown":
                //camera.position.z += 0.1;
                if(!altRaycastCheck(1)){ //was !raycastCheck(false)
                    camera.translateZ(0.1);
                }
                
            break;

            case "a":
            case "ArrowLeft":
                if(inputList.includes("Alt")){ //scuffed as shit due to how browsers work but technically works
                    if(!altRaycastCheck(3)){
                        camera.translateX(-0.1);
                    }
                }else{
                    camera.rotation.y += 0.05;
                }
            break;

            case "d":
            case "ArrowRight":
                if(inputList.includes("Alt")){
                    if(!altRaycastCheck(2)){
                        camera.translateX(0.1);
                    }
                }else{
                    camera.rotation.y -= 0.05;
                }
            break;
            default:
                console.log("no handleInput case for key " + inputList[i]);
            break;
        }
    }
    //inputList = [];
    checkCameraDifference();
}

function raycastCheckBackwards(){
    var returnValue = false;
    var BACK = new THREE.Vector3(0, 0, -1);
    raycaster.set(camera.position.copy, BACK);
    const intersects = raycaster.intersectObjects(scene.children);
    console.log(intersects);
    if(intersects.length){
        returnValue = true;
    }
    return returnValue;
}

function raycastCheck(isForward){
    var returnValue = false;

    //witchcraft from the three.js discord
    
    var q = new THREE.Quaternion();
    camera.getWorldQuaternion(q);
    var forward = new THREE.Vector3(0,0,-1).applyQuaternion(q) ;
    //forward.y = 0 ;
    forward.normalize();

    var backward = new THREE.Vector3(0,0,1).applyQuaternion(q);
    //backward.y = 0;
    backward.normalize();

    
    //raycaster.set(camera.position, camera.getWorldDirection);
   // var targetpos = camera.position.copy;
   // targetpos.z -= 1;
    var zero = new THREE.Vector2();
    zero.x = 0;
    zero.y = 0;
    raycaster.setFromCamera(zero, camera);
    raycaster.far = raycastDistance;
    if(!isForward){
       // var oldDir = raycaster.ray.direction;
        raycaster.ray.direction.z *= -2;
      //  raycaster.ray.origin.z = backward;
       // raycaster.far = raycastDistance * 1; //can't tell if this is necessary
       // raycaster.ray.origin.x += zero.x;
        
    }else{
        raycaster.far = raycastDistance;
       // raycaster.ray.origin.z = forward;
    }
    //console.log(camera.getWorldDirection);
  //  raycaster.set(camera.position.copy, camera.getWorldDirection);
    const intersects = raycaster.intersectObjects(scene.children);
    console.log(intersects);
    if(intersects.length > 0){
        returnValue = true;
    }
    return returnValue;
}

function altRaycastCheck(callDir){
    let returnValue = false;
    let q = new THREE.Quaternion();
    camera.getWorldQuaternion(q);
    let p = new THREE.Vector3();
    camera.getWorldPosition(p);
    switch(callDir){
        case 0: //forward
        let forward = new THREE.Vector3(0,0,-1).applyQuaternion(q);
        forward.normalize();
        raycaster.set(p, forward);
        break;
        case 1: //backwards
        let backward = new THREE.Vector3(0,0,1).applyQuaternion(q);
        backward.normalize();
        raycaster.set(p, backward);
        break;
        case 2: //right
        let right = new THREE.Vector3(1,0,0).applyQuaternion(q);
        raycaster.set(p, right);
        break;
        case 3: //left
        let left = new THREE.Vector3(-1,0,0).applyQuaternion(q);
        raycaster.set(p, left);
        break;
        case 4: //below
        let below = new THREE.Vector3(0, -1, 0).applyQuaternion(q);
        raycaster.set(p, below);
        break;
    }

    //return all scene children that lack the disableRaycast property into an array to be raycasted
    //see here https://stackoverflow.com/questions/54293528/three-object3d-how-to-disable-raycast-for-object-not-material
    /*
    let raycastList = [];
    scene.traverse(c =>{
        if(c.isMesh && !c.disableRaycast){
            raycastList.push(c);
        }else{
            console.log(c.name + " disableRaycast is " + c.disableRaycast);
        }
    })*/
    raycaster.layers.set(0); //FIX THIS!!!
    var intersects = raycaster.intersectObjects(scene.children); //was scene.children
    //var intersects = raycaster.raycastObjects(raycastList);
    
    console.log(intersects);
    if(intersects.length > 0){
        returnValue = true;
    }

    return returnValue;
}

function checkCameraDifference(){
    //console.log("running checkCameraDifference");
   // console.log(cameraPos + " " + camera.position);
   //console.log("ROTATION Y " + camera.rotation.y);
   let thisCamPos = [camera.position.x, camera.position.y, camera.position.z, camera.rotation.y];
   var change = false;
   for(var i = 0; i < cameraPos.length; i++){
        if(cameraPos[i] != thisCamPos[i]){
            change = true;
        }
   }

    if(change){
      //  console.log("cameras are different!");
      if(!altRaycastCheck(4)){
        falling = true;
      }
        clientSocket.emit("updatePlayerPosServer", camera.position.x, camera.position.y - 1.75, camera.position.z, socketId, camera.rotation.y + 1.55);
    }

    cameraPos = thisCamPos;
}

function handleGravity(){ //this only manages local player's gravity.
    if(falling){
        if(!altRaycastCheck(4)){
            camera.translateY(-0.1);
        }else{
            falling = false;
        }
    }
    
}


