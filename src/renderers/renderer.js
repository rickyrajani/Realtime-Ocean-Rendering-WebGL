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

export default class Renderer {
  constructor(scene, params) {
    // Initialize a shader program. The fragment shader source is compiled based on the number of lights
    this._shaderProgramTerrain = loadShaderProgram(vsSourceTerrain, fsSourceTerrain(), {
      uniforms: ['u_viewProjectionMatrix', 'u_noise'],
      attribs: ['a_position'],
    });

    this._shaderProgramOcean = loadShaderProgram(vsSourceOcean, fsSourceOcean(), {
      uniforms: ['u_viewProjectionMatrix', 'u_viewMatrix', 'u_noise', 'u_time', 'u_L', 'u_resolution', 'u_cameraPos', 'u_A', 'u_V', 'u_choppiness'],
      attribs: ['a_position', 'a_heightMap', 'a_w'],
    });

    this._shaderProgramSkybox = loadShaderProgram(vsSourceSkybox, fsSourceSkybox(), {
      uniforms: ['u_viewProjectionMatrix'],
      attribs: ['a_coords'],
    });

    this._projectionMatrix = mat4.create();
    this._viewMatrix = mat4.create();
    this._viewProjectionMatrix = mat4.create();

    this._noise = params.noise;
    this._wind = params.wind;
    this._speed = params.speed;
    this._choppiness = params.choppiness;
    this._terrain = params.terrain;

    scene.wireframe = params.wireframe;
    scene.OCEAN_SIZE = params.size;
    scene.amplitude = params.amplitude;
    scene.createBuffers();
    scene.createPatchBuffers();    
    //scene.createHeightMapBuffers();
    //scene.createHeightMapLowResBuffers();
    scene.createTerrainBuffers();
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

    // Draw the terrain
    if(this._terrain) {
      gl.useProgram(this._shaderProgramTerrain.glShaderProgram);
      gl.uniformMatrix4fv(this._shaderProgramTerrain.u_viewProjectionMatrix, false, this._viewProjectionMatrix);
      gl.uniform1f(this._shaderProgramTerrain.u_noise, this._noise);
      scene.drawTerrain(this._shaderProgramTerrain);
    }

    // Draw the ocean
    gl.useProgram(this._shaderProgramOcean.glShaderProgram);
    gl.uniformMatrix4fv(this._shaderProgramOcean.u_viewProjectionMatrix, false, this._viewProjectionMatrix);
    gl.uniformMatrix4fv(this._shaderProgramOcean.u_viewMatrix, false, this._viewMatrix);
    gl.uniform3f(this._shaderProgramOcean.u_cameraPos, camera.position.x, camera.position.y, camera.position.z);
    gl.uniform1f(this._shaderProgramOcean.u_time, scene.time * this._speed);
    gl.uniform1f(this._shaderProgramOcean.u_L, scene.OCEAN_SIZE);
    gl.uniform1i(this._shaderProgramOcean.u_resolution, scene.OCEAN_RESOLUTION);
    gl.uniform1f(this._shaderProgramOcean.u_A, scene.amplitude);
    gl.uniform1f(this._shaderProgramOcean.u_V, this._wind);
    gl.uniform1f(this._shaderProgramOcean.u_choppiness, this._choppiness);
    scene.loadTexture();
    scene.drawOcean(this._shaderProgramOcean);

    gl.uniform1i(this._shaderProgramOcean.u_resolution, scene.OCEAN_LOW_RES);
    scene.bindOceanLowResBuffers(this._shaderProgramOcean);
    for(let i = 0; i < 9; i++) {
      if (i == 4) {
        continue;
      }
      scene.drawOceanLowRes(this._shaderProgramOcean, i);
    }
  }
};
