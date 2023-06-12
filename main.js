import './style.css';
import { Color, Matrix4, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, RingGeometry, Scene, Vector2, Vector3, WebGLRenderer } from 'three';
import { createNoise2D } from 'simplex-noise';

const noise2D = createNoise2D();

let rotMult = Math.random() * 2;
let scaleMult = Math.random() * 1;
let rotSpeed = Math.random() * 0.5 + 0.25;

let count = 0;

const res = 800;
const scene = new Scene();
const camera = new OrthographicCamera(-res * 0.5, res * 0.5, res * 0.5, -res * 0.5, 1, 1000);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(res, res);
document.body.appendChild(renderer.domElement);

scene.background = new Color("rgb(34, 30, 27)");

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

function square(level, position, transformMatrix, size, outlined) {

  if ((level > 6 || Math.random() > 0.7) && level !== 0) {

    const scaledMat1 = new Matrix4().copy(transformMatrix);
    scaledMat1.multiplyMatrices(
      new Matrix4().makeScale(size, size, size), 
      scaledMat1
    );

    let leveledScale = 0.9;
    if (level > 3) leveledScale = 0.6;   

    const scaledMat2 = new Matrix4().copy(transformMatrix);
    scaledMat2.multiplyMatrices(
      scaledMat2,
      new Matrix4().makeScale(leveledScale, leveledScale, leveledScale) 
    );
    scaledMat2.multiplyMatrices(
      new Matrix4().makeScale(size, size, size), 
      scaledMat2
    );

    const geometry1 = new PlaneGeometry(1, 1); 
    geometry1.applyMatrix4(scaledMat1);
    geometry1.translate(0, 0, -500 + count * 0.01);

    const geometry2 = new PlaneGeometry(1, 1); 
    geometry2.applyMatrix4(scaledMat2);
    geometry2.translate(0, 0, -500 + count * 0.01 + 0.005);

    const materialIdx = Math.floor(Math.random() * 5);

    const mesh1 = new Mesh( geometry1, 
      outlined ? materials[materialIdx] : bgMaterial
    ); 
    const mesh2 = new Mesh( geometry2, 
      outlined ? bgMaterial : materials[materialIdx]  
    );
    scene.add( mesh1, mesh2 );

    count++;
    return;
  }

  const transformMatCopy = new Matrix4().copy(transformMatrix);

  for (let i = 0; i < 4; i++) {
    const newPosition = new Vector3().copy(position);

    if (i == 0) newPosition.set(-0.5, -0.5, 0);
    if (i == 1) newPosition.set(-0.5, +0.5, 0);
    if (i == 2) newPosition.set(+0.5, -0.5, 0);
    if (i == 3) newPosition.set(+0.5, +0.5, 0);

    const noisePosition = new Vector3(0, 0, 0).applyMatrix4(transformMatrix);
  
    const rotMatrix = new Matrix4().identity();
    rotMatrix.makeRotationAxis(
      new Vector3(0, 0, 1), 
      noise2D(noisePosition.x * rotSpeed, noisePosition.y * rotSpeed) * 0.15 * rotMult,
    );

    const scaleMatrix = new Matrix4().identity();
    const scaleF = 1 + noise2D(noisePosition.x, noisePosition.y) * 0.15 * scaleMult;
    scaleMatrix.makeScale(scaleF, scaleF, scaleF);

    const newTransformMatrix = new Matrix4().identity();
   
    newTransformMatrix.multiplyMatrices(newTransformMatrix, new Matrix4().makeScale(0.5, 0.5, 0.5));
    newTransformMatrix.multiplyMatrices(newTransformMatrix, scaleMatrix);
    newTransformMatrix.multiplyMatrices(
      newTransformMatrix,
      new Matrix4().makeTranslation(newPosition.x, newPosition.y, newPosition.z), 
    );
    newTransformMatrix.multiplyMatrices(newTransformMatrix, rotMatrix);
    newTransformMatrix.multiplyMatrices(transformMatCopy, newTransformMatrix);

    square(level + 1, newPosition, newTransformMatrix, size, Math.random() > 0.8 ? Math.random() > 0.7 : outlined);
  }
}

const transformationMatrix = new Matrix4();

square(0, new Vector3(0, 0, 0), transformationMatrix, 600, false);

renderer.render(scene, camera);
