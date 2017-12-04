import { makeRenderLoop, camera, cameraControls, gui, gl } from './init';
import Renderer from './renderers/renderer';
import Scene from './scene';
import { Vector3 } from 'three';

const scene = new Scene();

camera.position.set(3, 61, 21);
cameraControls.target.set(0, 60, 21);
// camera.position.set(0,0,0);
// cameraControls.target.set(0,0,-1);
gl.enable(gl.DEPTH_TEST);
gl.enable( gl.BLEND );
gl.blendEquation( gl.FUNC_ADD );
gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

const params = {
  noise: 0.15,
  size: 200,
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

gui.add(params, 'noise', 0.0, 1.0).onChange(setPerlinNoise);
gui.add(params, 'size', 1, 1000).onChange(setOceanSize);

function render() {
  scene.update();
  params._renderer.render(camera, scene);
}

makeRenderLoop(render)();
