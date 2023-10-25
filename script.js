//THREE.js nonsense

//Creates a scene and camera, as well as a WebGL renderer (Three.js is based off of WebGL)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Creates a cube, and adds it to the scene
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
//Camera position foward ig
camera.position.z = 5;

document.addEventListener("keypress", Keyinput);
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
    inputList.push(INPUT);
}

//actually does stuff, put keys as cases in the switch statement, link em to a function.
function handleInput(){
    console.log(inputList);
    for(var i = 0; i < inputList.length ; i++){
        switch(inputList[i]){
            case "w":
                cube.position.x += 0.1;
            break;
            default:
                console.log("no handleInput case for key " + inputList[i]);
            break;
        }
    }
    inputList = [];
}




