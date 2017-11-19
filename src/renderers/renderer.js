import { gl } from '../init';
import { mat4, vec4 } from 'gl-matrix';
import { loadShaderProgram } from '../utils';
import vsSource from '../shaders/ocean.vert.glsl';
import fsSource from '../shaders/ocean.frag.glsl.js';
import vsSourceTerrain from '../shaders/terrain.vert.glsl';
import fsSourceTerrain from '../shaders/terrain.frag.glsl.js';
import TextureBuffer from './textureBuffer';

const NUM_LIGHTS = 0;

export default class Renderer {
  constructor() {
    // Initialize a shader program. The fragment shader source is compiled based on the number of lights
    this._shaderProgram = loadShaderProgram(vsSourceTerrain, fsSourceTerrain({
      numLights: NUM_LIGHTS,
    }), {
      uniforms: ['u_viewProjectionMatrix', 'u_colmap', 'u_normap', 'u_lightbuffer'],
      attribs: ['a_position', 'a_normal', 'a_uv'],
    });

    this._projectionMatrix = mat4.create();
    this._viewMatrix = mat4.create();
    this._viewProjectionMatrix = mat4.create();
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

    // Use this shader program
    gl.useProgram(this._shaderProgram.glShaderProgram);

    // Upload the camera matrix
    gl.uniformMatrix4fv(this._shaderProgram.u_viewProjectionMatrix, false, this._viewProjectionMatrix);

    // Set the light texture as a uniform input to the shader
    // gl.activeTexture(gl.TEXTURE2);
    // gl.bindTexture(gl.TEXTURE_2D, this._lightTexture.glTexture);
    // gl.uniform1i(this._shaderProgram.u_lightbuffer, 2);

    // Draw the scene. This function takes the shader program so that the model's textures can be bound to the right inputs
    scene.draw(this._shaderProgram);
  }
};
