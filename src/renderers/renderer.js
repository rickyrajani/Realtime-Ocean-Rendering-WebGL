import { gl } from '../init';
import { mat4, vec4 } from 'gl-matrix';
import { loadShaderProgram } from '../utils';
import vsSource from '../shaders/ocean.vert.glsl';
import fsSource from '../shaders/ocean.frag.glsl.js';
import vsSourceTerrain from '../shaders/terrain.vert.glsl';
import fsSourceTerrain from '../shaders/terrain.frag.glsl.js';
import vsSourceSkybox from '../shaders/skybox.vert.glsl';
import fsSourceSkybox from '../shaders/skybox.frag.glsl.js';
import TextureBuffer from './textureBuffer';

const NUM_LIGHTS = 0;

export default class Renderer {
  constructor(scene, noise, size) {
    // Initialize a shader program. The fragment shader source is compiled based on the number of lights
    this._shaderProgram = loadShaderProgram(vsSourceTerrain, fsSourceTerrain({
      numLights: NUM_LIGHTS,
    }), {
      uniforms: ['u_viewProjectionMatrix', 'u_noise', 'u_time', 'u_L', 'u_resolution'],
      attribs: ['a_position', 'a_noise'],
    });

    this._shaderProgramSkybox = loadShaderProgram(vsSourceSkybox, fsSourceSkybox({
      numLights: NUM_LIGHTS,
    }), {
      uniforms: ['u_viewProjectionMatrix'],
      attribs: ['a_coords'],
    });

    this._projectionMatrix = mat4.create();
    this._viewMatrix = mat4.create();
    this._viewProjectionMatrix = mat4.create();

    this._noise = noise;

    scene.OCEAN_SIZE = size;
    // scene.createNoise(this._shaderProgram, noise);
    scene.createBuffers();
  }

  render(camera, scene) {
    // Update the camera matrices
    camera.updateMatrixWorld();
    mat4.invert(this._viewMatrix, camera.matrixWorld.elements);
    mat4.copy(this._projectionMatrix, camera.projectionMatrix.elements);
    mat4.multiply(this._viewProjectionMatrix, this._projectionMatrix, this._viewMatrix);

    // Bind the default null framebuffer which is the screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Render to the whole screen
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Clear the frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the skybox
    gl.useProgram(this._shaderProgramSkybox.glShaderProgram);
    gl.uniformMatrix4fv(this._shaderProgramSkybox.u_viewProjectionMatrix, false, this._viewProjectionMatrix);
    scene.loadTexture();
    scene.drawSkybox(this._shaderProgramSkybox);
    
    // Draw the terrain and ocean
    gl.useProgram(this._shaderProgram.glShaderProgram);
    gl.uniformMatrix4fv(this._shaderProgram.u_viewProjectionMatrix, false, this._viewProjectionMatrix);
    gl.uniform1f(this._shaderProgram.u_noise, this._noise);
    gl.uniform1f(this._shaderProgram.u_time, scene.time);
    gl.uniform1f(this._shaderProgram.u_L, scene.OCEAN_SIZE);
    gl.uniform1i(this._shaderProgram.u_resolution, scene.OCEAN_RESOLUTION);
    scene.draw(this._shaderProgram);
  }
};
