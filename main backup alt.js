import { createNoise2D } from 'simplex-noise';
import './style.css';
import { Color, Matrix4, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, RingGeometry, Scene, Vector2, Vector3, WebGLRenderer } from 'three';

const noise2D = createNoise2D();

let rotMult = 2;
let scaleMult = 1;
let rotSpeed = 0.8;

// if (Math.random() > 0.5) {
//   rotMult = Math.random() * 0.5;
//   scaleMult = Math.random() * 0.5;
//   rotSpeed = Math.random() * 2;
// }

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

  // console.log(drawScale);
  if ((level > 7 || Math.random() > 0.7 || closed) && level !== 0) {
  // if ((level >= 3 ) && level !== 0) {
    const scaledMat1 = new Matrix4().copy(transformMatrix);
    scaledMat1.multiplyMatrices(new Matrix4().makeScale(size, size, size), scaledMat1);

    const scaledMat2 = new Matrix4().copy(transformMatrix);
    scaledMat2.multiplyMatrices(
      scaledMat2,
      new Matrix4().makeScale(0.8, 0.8, 0.8) 
    );
    scaledMat2.multiplyMatrices(
      new Matrix4().makeScale(size, size, size), 
      scaledMat2
    );

    const zOffset = Math.random() * 10;

    // draw cube and return
    const geometry1 = new PlaneGeometry(1, 1); 
    geometry1.applyMatrix4(scaledMat1);
    geometry1.translate(0, 0, -500 - zOffset);

    const geometry2 = new PlaneGeometry(1, 1); 
    geometry2.applyMatrix4(scaledMat2);
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

    // if (i == 0) newPosition.add(new Vector3(-size * 0.25, -size * 0.25, 0));
    // if (i == 1) newPosition.add(new Vector3(-size * 0.25, +size * 0.25, 0));
    // if (i == 2) newPosition.add(new Vector3(+size * 0.25, -size * 0.25, 0));
    // if (i == 3) newPosition.add(new Vector3(+size * 0.25, +size * 0.25, 0));
    
    const m = 1.1;

    if (i == 0) newPosition.set(-0.5 * m, -0.5 * m, 0);
    if (i == 1) newPosition.set(-0.5 * m, +0.5 * m, 0);
    if (i == 2) newPosition.set(+0.5 * m, -0.5 * m, 0);
    if (i == 3) newPosition.set(+0.5 * m, +0.5 * m, 0);

    const rotNoisePosition = new Vector3(0, 0, 0).applyMatrix4(transformMatrix);
  
    const rotMatrix = new Matrix4().identity();
    // rotMatrix.makeRotationAxis(new Vector3(0, 0, 1), Math.random() * 0.03);
    rotMatrix.makeRotationAxis(
      new Vector3(0, 0, 1), 
      noise2D(rotNoisePosition.x * rotSpeed, rotNoisePosition.y * rotSpeed) * 0.15 * rotMult,
    );

    const scaleMatrix = new Matrix4().identity();
    // const scaleF = 1 + (Math.random() * 2 - 1) * 0.0075;
    const scaleF = 1 + noise2D(rotNoisePosition.x, rotNoisePosition.y) * 0.15 * scaleMult;
    scaleMatrix.makeScale(scaleF, scaleF, scaleF);

    const newTransformMatrix = new Matrix4().identity();
    // newTransformMatrix.multiplyMatrices(newTransformMatrix, new Matrix4().makeScale(0.5, 0.5, 0.5));
    // newTransformMatrix.multiplyMatrices(newTransformMatrix, new Matrix4().makeTranslation(newPosition.x, newPosition.y, newPosition.z));
    // newTransformMatrix.multiplyMatrices(transformMatCopy, newTransformMatrix);

    // newTransformMatrix.multiplyMatrices(new Matrix4().makeTranslation(newPosition.x, newPosition.y, newPosition.z), newTransformMatrix);
    // newTransformMatrix.multiplyMatrices(new Matrix4().makeScale(0.5, 0.5, 0.5), newTransformMatrix);
    // newTransformMatrix.multiplyMatrices(newTransformMatrix, transformMatCopy);

    newTransformMatrix.multiplyMatrices(newTransformMatrix, new Matrix4().makeScale(0.5, 0.5, 0.5));
    newTransformMatrix.multiplyMatrices(newTransformMatrix, scaleMatrix);
    newTransformMatrix.multiplyMatrices(
      newTransformMatrix,
      new Matrix4().makeTranslation(newPosition.x, newPosition.y, newPosition.z), 
    );
    newTransformMatrix.multiplyMatrices(newTransformMatrix, rotMatrix);
    newTransformMatrix.multiplyMatrices(transformMatCopy, newTransformMatrix);

    square(level + 1, newPosition, newTransformMatrix, size, false, isRed || Math.random() > 0.975);
  }
}

const transformationMatrix = new Matrix4();

square(0, new Vector3(0, 0, 0), transformationMatrix, 500, false);

renderer.render(scene, camera);
