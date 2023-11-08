import * as THREE from "three";

//const loader = new GLTFLoader();

class wizard{
    constructor(x, y, z, color, id){
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.id = id;
        /*
        loader.load('models/wizard.glb', function(gltf){
            scene.add(gltf.scene);
        }, undefined, function(error){
            console.error(error);
        });
        //this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: color });
       // this.cube = new THREE.Mesh(this.geometry, this.material);
      //  this.cube.position.set(x,y,z);
        this.scene =scene;
        this.scene.add(this.wizard);*/
    }
}
export default wizard;