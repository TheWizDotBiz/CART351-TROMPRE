import * as THREE from "three";

class cube{
    constructor(x, y, z, color, scene){
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: color });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.cube.position.set(x,y,z);
        this.scene =scene;
        this.scene.add(this.cube);
    }
}
export default cube;