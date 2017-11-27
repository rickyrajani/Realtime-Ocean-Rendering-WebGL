import { makeRenderLoop, camera, cameraControls, gui, gl } from './init';
import Renderer from './renderers/renderer';
import Scene from './scene';

const scene = new Scene();

camera.position.set(3, 61, 21);
cameraControls.target.set(0, 60, 21);
// camera.position.set(0,0,0);
// cameraControls.target.set(0,0,-1);
gl.enable(gl.DEPTH_TEST);

const params = {
  noise: 0.25,
  size: 100,
  _renderer: null,
};

params._renderer = new Renderer(scene, params.noise, params.size);

function setPerlinNoise(noise) {
  params.noise = noise;
  params._renderer = new Renderer(scene, params.noise, params.size);
}

function setOceanSize(size) {
  params.size = size;
  params._renderer = new Renderer(scene, params.noise, params.size);
}

gui.add(params, 'noise', [0.15, 0.25, 0.35, 0.50, 0.75]).onChange(setPerlinNoise);
gui.add(params, 'size', [10, 100, 500, 1000]).onChange(setOceanSize);

function render() {
  scene.update();
  params._renderer.render(camera, scene);
}

makeRenderLoop(render)();
