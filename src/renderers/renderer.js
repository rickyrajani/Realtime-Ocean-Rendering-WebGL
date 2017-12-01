import { gl } from '../init';
import { mat3, mat4, vec4 } from 'gl-matrix';
import { loadShaderProgram } from '../utils';
import vsSourceOcean from '../shaders/ocean.vert.glsl';
import fsSourceOcean from '../shaders/ocean.frag.glsl.js';
import vsSourceTerrain from '../shaders/terrain.vert.glsl';
import fsSourceTerrain from '../shaders/terrain.frag.glsl.js';
import vsSourceSkybox from '../shaders/skybox.vert.glsl';
import fsSourceSkybox from '../shaders/skybox.frag.glsl.js';
import TextureBuffer from './textureBuffer';
import { Matrix3 } from 'three';

const NUM_LIGHTS = 0;

export default class Renderer {
  constructor(scene, noise, size) {
    // Initialize a shader program. The fragment shader source is compiled based on the number of lights
    this._shaderProgramTerrain = loadShaderProgram(vsSourceTerrain, fsSourceTerrain({
      numLights: NUM_LIGHTS,
    }), {
      uniforms: ['u_viewProjectionMatrix', 'u_noise'],
      attribs: ['a_position'],
    });

    this._shaderProgramOcean = loadShaderProgram(vsSourceOcean, fsSourceOcean({
      numLights: NUM_LIGHTS,
    }), {
      uniforms: ['u_viewProjectionMatrix', 'u_viewMatrix', 'u_noise', 'u_time', 'u_L', 'u_resolution', 'u_V'],
      attribs: ['a_position'],
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
    
    // Matricesfor reflection
    var normalMat = mat3.create();
    mat3.normalFromMat4(normalMat, this._viewMatrix);
    
    var invViewTrans = mat3.create();
    mat3.fromMat4(invViewTrans, this._viewMatrix);
    mat3.invert(invViewTrans, invViewTrans);

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

    // Draw the terrain
    gl.useProgram(this._shaderProgramTerrain.glShaderProgram);
    gl.uniformMatrix4fv(this._shaderProgramTerrain.u_viewProjectionMatrix, false, this._viewProjectionMatrix);
    gl.uniform1f(this._shaderProgramTerrain.u_noise, this._noise);
    scene.draw(this._shaderProgramTerrain);
    
    // Draw the ocean
    gl.useProgram(this._shaderProgramOcean.glShaderProgram);
    gl.uniformMatrix4fv(this._shaderProgramOcean.u_viewProjectionMatrix, false, this._viewProjectionMatrix);
    gl.uniformMatrix4fv(this._shaderProgramOcean.u_viewMatrix, false, this._viewMatrix);
    gl.uniformMatrix3fv(this._shaderProgramOcean.u_normalMatrix, false, normalMat);
    gl.uniformMatrix3fv(this._shaderProgramOcean.u_invVT, false, invViewTrans);    
    gl.uniform1f(this._shaderProgramOcean.u_time, scene.time * .01);
    gl.uniform1f(this._shaderProgramOcean.u_L, scene.OCEAN_SIZE);
    gl.uniform1i(this._shaderProgramOcean.u_resolution, scene.OCEAN_RESOLUTION);
    scene.loadTexture();
    scene.drawSkybox(this._shaderProgramOcean);
    scene.draw(this._shaderProgramOcean);
  }
};
