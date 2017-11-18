import { makeRenderLoop, camera, cameraControls, gui, gl } from './init';
import Renderer from './renderers/renderer';
import Scene from './scene';

const renderer = new Renderer();

const scene = new Scene();

camera.position.set(0, 50, 0);
cameraControls.target.set(0, 45, -1);
gl.enable(gl.DEPTH_TEST);

function render() {
  scene.update();
  renderer.render(camera, scene);
}

makeRenderLoop(render)();