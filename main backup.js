import { createNoise2D } from 'simplex-noise';
import './style.css';
import { Color, Matrix4, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, RingGeometry, Scene, Vector2, Vector3, WebGLRenderer } from 'three';

const noise2D = createNoise2D();

let rotMult = Math.random() * 4;
let scaleMult = Math.random() * 2;
let rotSpeed = Math.pow(Math.random(), 1.5) * 3.6;

if (Math.random() > 0.5) {
  rotMult = Math.random() * 0.5;
  scaleMult = Math.random() * 0.5;
  rotSpeed = Math.random() * 2;
}

const res = 800;
const scene = new Scene();
const camera = new OrthographicCamera(-res * 0.5, res * 0.5, res * 0.5, -res * 0.5, 1, 1000);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(res, res);
document.body.appendChild(renderer.domElement);

scene.background = new Color("rgb(34, 30, 27)");

const redMaterial = new MeshBasicMaterial({
  color: "rgb(255, 120, 85)",
});

const materials = [
  new MeshBasicMaterial({ color: new Color("rgb(241, 231, 222)").multiplyScalar(0.075) }),
  new MeshBasicMaterial({ color: new Color("rgb(241, 231, 222)").multiplyScalar(0.2) }),
  new MeshBasicMaterial({ color: new Color("rgb(241, 231, 222)").multiplyScalar(0.35) }),
  new MeshBasicMaterial({ color: new Color("rgb(241, 231, 222)").multiplyScalar(0.75) }),
  new MeshBasicMaterial({ color: new Color("rgb(241, 231, 222)").multiplyScalar(1.0) }),
];

const bgMaterial = new MeshBasicMaterial({ 
  color: new Color().copy(scene.background), 
});

function square(level, position, transformMatrix, size, closed, isRed) {
  if ((level > 7 || Math.random() > 0.7 || closed) && level !== 0) {
    const innerSize = Math.max(size * 0.8 - 3, 0);
    const outerSize = Math.max(size - 3, 1);

    const zOffset = Math.random() * 10;

    // draw cube and return
    const geometry1 = new PlaneGeometry(outerSize, outerSize); 
    geometry1.translate(position.x, position.y, position.z);
    geometry1.applyMatrix4(transformMatrix);
    geometry1.translate(0, 0, -500 - zOffset);
    
    const geometry2 = new PlaneGeometry(innerSize, innerSize); 
    geometry2.translate(position.x, position.y, position.z);
    geometry2.applyMatrix4(transformMatrix);
    geometry2.translate(0, 0, -500 - zOffset);
    
    const materialIdx = Math.floor(Math.random() * 5);

    const mesh1 = new Mesh( geometry1, 
      isRed ? redMaterial : materials[materialIdx] 
    ); 
    const mesh2 = new Mesh( geometry2, bgMaterial ); 
    scene.add( mesh1, mesh2 );

    return;
  }

  const transformMatCopy = new Matrix4().copy(transformMatrix);

  for (let i = 0; i < 4; i++) {
    const newPosition = new Vector3().copy(position);

    if (i == 0) newPosition.add(new Vector3(-size * 0.25, -size * 0.25, 0));
    if (i == 1) newPosition.add(new Vector3(-size * 0.25, +size * 0.25, 0));
    if (i == 2) newPosition.add(new Vector3(+size * 0.25, -size * 0.25, 0));
    if (i == 3) newPosition.add(new Vector3(+size * 0.25, +size * 0.25, 0));
  
    const rotMatrix = new Matrix4().identity();
    // rotMatrix.makeRotationAxis(new Vector3(0, 0, 1), Math.random() * 0.03);
    rotMatrix.makeRotationAxis(
      new Vector3(0, 0, 1), 
      noise2D(newPosition.x * rotSpeed, newPosition.y * rotSpeed) * 0.06 * rotMult,
    );

    const scaleMatrix = new Matrix4().identity();
    // const scaleF = 1 + (Math.random() * 2 - 1) * 0.0075;
    const scaleF = 1 + noise2D(newPosition.x, newPosition.y) * 0.05 * scaleMult;
    scaleMatrix.makeScale(scaleF, scaleF, scaleF);

    const newTransformMatrix = new Matrix4().identity();
    newTransformMatrix.multiplyMatrices(transformMatCopy, rotMatrix);
    newTransformMatrix.multiplyMatrices(newTransformMatrix, scaleMatrix);

    square(level + 1, newPosition, newTransformMatrix, size * 0.5, false, isRed || Math.random() > 0.975);
  }
}

const transformationMatrix = new Matrix4();
transformationMatrix.makeTranslation(0, 0, 0);

square(0, new Vector3(0, 0, 0), transformationMatrix, 600, false);

renderer.render(scene, camera);
