import { gl } from './init';

// TODO: Edit if you want to change the light initial positions 
export const LIGHT_MIN = [-14, 0, -6];
export const LIGHT_MAX = [14, 20, 6];
export const LIGHT_RADIUS = 5.0;
export const LIGHT_DT = -0.03;

// TODO: This controls the number of lights
export const NUM_LIGHTS = 10;

const OCEAN_SIZE = 100.0;
const OCEAN_RESOLUTION = 256.0;
const FLOAT_SIZE = 4;

class Scene {
  constructor() {
    this.lights = [];
    this.models = [];

    for (let i = 0; i < NUM_LIGHTS; ++i) {
      this.lights.push({
        position: new Float32Array([
          Math.random() * (LIGHT_MAX[0] - LIGHT_MIN[0]) + LIGHT_MIN[0],
          Math.random() * (LIGHT_MAX[1] - LIGHT_MIN[1]) + LIGHT_MIN[1],
          Math.random() * (LIGHT_MAX[2] - LIGHT_MIN[2]) + LIGHT_MIN[2],
        ]),
        color: new Float32Array([
          0.5 + 0.5 * Math.random(),
          0.5 + 0.5 * Math.random(),
          0.5 + Math.random(),
        ]),
        radius: LIGHT_RADIUS,
      });
    }
  
  }

  update() {
    for (let i = 0; i < NUM_LIGHTS; i++) {
      // OPTIONAL TODO: Edit if you want to change how lights move
      this.lights[i].position[1] += LIGHT_DT;
      // wrap lights from bottom to top
      this.lights[i].position[1] = (this.lights[i].position[1] + LIGHT_MAX[1] - LIGHT_MIN[1]) % LIGHT_MAX[1] + LIGHT_MIN[1];
    }
  }

  draw(shaderProgram) {

    var vertices = [];
    for (let z = 0; z < OCEAN_RESOLUTION; z++) {
      for (let x = 0; x < OCEAN_RESOLUTION; x++) {
        vertices.push((x * OCEAN_SIZE)/ (OCEAN_RESOLUTION - 1) - OCEAN_SIZE/2.0);
        vertices.push(0.0);
        vertices.push((z * OCEAN_SIZE)/ (OCEAN_RESOLUTION - 1) - OCEAN_SIZE/2.0);
      }
    }

    var indices = [];
    for (let z = 0; z < OCEAN_RESOLUTION; z++) {
      for (let x = 0; x < OCEAN_RESOLUTION; x++) {
        let UL = z * OCEAN_RESOLUTION + x;
        let UR = UL + 1;
        let BL = UL + OCEAN_RESOLUTION;
        let BR = BL + 1;
        indices.push(UL);
        indices.push(BL);
        indices.push(BR);
        indices.push(BR);
        indices.push(UR);
        indices.push(UL);        
      }
    }

    
    // Ocean water plane
    var vertexBuffer = gl.createBuffer();
    var indicesBuffer = gl.createBuffer();

    // Bind ocean vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(shaderProgram.a_position);
    gl.vertexAttribPointer(shaderProgram.a_position, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0);  

    // Bind ocean vertex indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
   
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  }

}

export default Scene;