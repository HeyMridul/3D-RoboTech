/**
 * Generates public/models/demo-rover.glb — a placeholder inspection model so
 * the project component viewer can be exercised before real CAD exports exist.
 *
 * Mesh names matter: the viewer derives its component list from them.
 * Usage: node scripts/make-demo-model.mjs
 */
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mkdirSync, writeFileSync } from "node:fs";

/**
 * GLTFExporter targets the browser and reaches for FileReader while packing
 * the binary chunk. Node has Blob but not FileReader, so provide just the
 * arrayBuffer path the exporter uses.
 */
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class {
    constructor() {
      this.result = null;
      this.onloadend = null;
      this.onerror = null;
    }
    readAsArrayBuffer(blob) {
      blob
        .arrayBuffer()
        .then((buffer) => {
          this.result = buffer;
          this.onloadend?.();
        })
        .catch((error) => this.onerror?.(error));
    }
    readAsDataURL(blob) {
      blob
        .arrayBuffer()
        .then((buffer) => {
          this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString("base64")}`;
          this.onloadend?.();
        })
        .catch((error) => this.onerror?.(error));
    }
  };
}

const scene = new THREE.Scene();
scene.name = "AgriRover";

const materials = {
  chassis: new THREE.MeshStandardMaterial({
    color: 0x2a3542,
    metalness: 0.9,
    roughness: 0.35,
  }),
  dark: new THREE.MeshStandardMaterial({
    color: 0x14191f,
    metalness: 0.6,
    roughness: 0.6,
  }),
  board: new THREE.MeshStandardMaterial({
    color: 0x0f5132,
    metalness: 0.3,
    roughness: 0.7,
  }),
  accent: new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    metalness: 0.4,
    roughness: 0.3,
    emissive: 0x0e7490,
  }),
  battery: new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.4,
    roughness: 0.5,
  }),
};

function add(name, geometry, material, position, rotation) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  scene.add(mesh);
  return mesh;
}

// Body
add("Chassis", new THREE.BoxGeometry(2.2, 0.28, 1.4), materials.chassis, [0, 0, 0]);

// Wheels
const wheel = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 20);
const corners = [
  ["Wheel_FL", 0.75, 0.62],
  ["Wheel_FR", 0.75, -0.62],
  ["Wheel_RL", -0.75, 0.62],
  ["Wheel_RR", -0.75, -0.62],
];
for (const [name, x, z] of corners) {
  add(name, wheel, materials.dark, [x, -0.2, z], [Math.PI / 2, 0, 0]);
}

// Electronics
add("ControlBoard", new THREE.BoxGeometry(0.7, 0.06, 0.5), materials.board, [0, 0.19, 0]);
add("ESP32", new THREE.BoxGeometry(0.26, 0.05, 0.16), materials.board, [-0.55, 0.19, 0.3]);
add("Battery", new THREE.BoxGeometry(0.6, 0.22, 0.42), materials.battery, [-0.45, 0.27, -0.25]);

// Sensing
add("Camera", new THREE.BoxGeometry(0.2, 0.16, 0.16), materials.accent, [0.95, 0.36, 0]);
add("CameraMast", new THREE.CylinderGeometry(0.04, 0.04, 0.5, 10), materials.chassis, [0.95, 0.15, 0]);
add("LidarSensor", new THREE.CylinderGeometry(0.16, 0.16, 0.14, 18), materials.accent, [0.2, 0.35, 0]);
add("SoilProbe", new THREE.CylinderGeometry(0.035, 0.02, 0.7, 10), materials.dark, [-1.0, -0.2, 0]);

// Drive
add("DriveMotor", new THREE.CylinderGeometry(0.13, 0.13, 0.3, 16), materials.dark, [0, -0.05, 0.55], [0, 0, Math.PI / 2]);
add("SolarPanel", new THREE.BoxGeometry(1.3, 0.03, 0.9), materials.chassis, [0, 0.45, 0]);

new GLTFExporter().parse(
  scene,
  (result) => {
    mkdirSync("public/models", { recursive: true });
    writeFileSync("public/models/demo-rover.glb", Buffer.from(result));
    const names = scene.children.map((c) => c.name);
    console.log(`wrote public/models/demo-rover.glb (${names.length} parts)`);
    console.log(names.join(", "));
  },
  (error) => {
    console.error("export failed", error);
    process.exit(1);
  },
  { binary: true },
);
