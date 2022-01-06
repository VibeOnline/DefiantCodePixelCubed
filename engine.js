// Get viewport data
const canvas = document.querySelector("canvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);

var action = "build";

// Maintain an index of all voxels
const voxels = {};
function removeVox(id) {
    if (voxels[id] != null) {
        voxels[id].dispose();
    }
}
function colorVox(id, r, g, b) {
    if (voxels[id] != null) {
        voxels[id].material.diffuseColor = new BABYLON.Color3(r, g, b);
    }
}
function newVox(x, y, z, r, g, b) {
    voxels[x + ":" + y + ":" + z] = new BABYLON.MeshBuilder.CreateBox(x + ":" + y + ":" + z, { size: 0.5 }, scene);
    voxels[x + ":" + y + ":" + z].position = new BABYLON.Vector3(x * 0.5, y * 0.5, z * 0.5);
    
    let mat = new BABYLON.StandardMaterial(scene);
    mat.diffuseColor = new BABYLON.Color3(r, g, b);
    
    voxels[x + ":" + y + ":" + z].material = mat;
}
var plane = new BABYLON.MeshBuilder.CreatePlane("plane", {
    width: 100,
    height: 100
}, scene);
plane.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
plane.visibility = false;

// Set camera
const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, -4), scene);
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 0.75, 0.5), scene);

let myPoints = [];
let x = -100;
let z = -100;
for (i = 40401; i > 0; i--) {
    if (Math.sqrt(x * x + z * z) < 100) {
        myPoints.push(new BABYLON.Vector3(x * 0.5 + 0.25, -0.25, z * 0.5 + 0.25));
        myPoints.push(new BABYLON.Vector3((x + 1) * 0.5 + 0.25, -0.25, z * 0.5 + 0.25));
        myPoints.push(new BABYLON.Vector3((x + 1) * 0.5 + 0.25, -0.25, (z + 1) * 0.5 + 0.25));
    }
    
    x++;
    if (x > 100) {
        z++;
        x = -100;
    }
}

const options = {
    points: myPoints, //vec3 array,
    updatable: false
}

let lines = BABYLON.MeshBuilder.CreateLines("lines", options, scene);
lines.color = new BABYLON.Color3(0.2, 0.2, 0.2);

options.instance = lines;
lines = BABYLON.MeshBuilder.CreateLines("lines", options);

// Input
scene.onPointerDown = function (event, pickResult) {
    if (event.which == 1 && event.type == "pointerdown") {
        switch (action) {
            case "remove":
                removeVox(pickResult.pickedMesh.id);
                break;
            case "build":
                let col = document.querySelector("input[type=color]").value;
                
                let red = parseInt(col[1] + col[2], 16) / 256;
                let green = parseInt(col[3] + col[4], 16) / 256;
                let blue = parseInt(col[5] + col[6], 16) / 256;
                
                newVox(Math.round(pickResult.pickedPoint.x * 2), Math.round(pickResult.pickedPoint.y * 2), Math.round(pickResult.pickedPoint.z * 2), red, green, blue);
                break;
            case "color":
                let color = document.querySelector("input[type=color]").value;
                
                let r = parseInt(color[1] + color[2], 16) / 256;
                let g = parseInt(color[3] + color[4], 16) / 256;
                let b = parseInt(color[5] + color[6], 16) / 256;
                
                colorVox(pickResult.pickedMesh.id, r, g, b);
                break;
        }
    }
}

// Render
engine.runRenderLoop(() => {
    scene.render();
    
    lines.position = new BABYLON.Vector3(~~(camera.position.x * 0.5) * 2, 0, ~~(camera.position.z * 0.5) * 2);
});