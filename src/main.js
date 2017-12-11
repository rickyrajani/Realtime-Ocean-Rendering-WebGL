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
  size: 300,
  amplitude: 0.0001,
  wind: 10.0,
  speed: 0.1,
  choppiness: 1.0,
  wireframe: false,
  _renderer: null,
};

params._renderer = new Renderer(scene, params);

function updateRenderer() {
  params._renderer = new Renderer(scene, params);
}

// gui.add(params, 'noise', 0.0, 0.3).onChange(setPerlinNoise);
// gui.add(params, 'size', 1, 1000).onChange(setOceanSize);
gui.add(params, 'amplitude', .0001, .0009).onChange(updateRenderer);
gui.add(params, 'wind', 1, 100).onChange(updateRenderer);
gui.add(params, 'speed', 0.001, 0.3).onChange(updateRenderer);
gui.add(params, 'choppiness', 0.01, 2).onChange(updateRenderer);
gui.add(params, 'wireframe').onChange(updateRenderer);

function render() {
  scene.update();
  params._renderer.render(camera, scene);
}

makeRenderLoop(render)();
