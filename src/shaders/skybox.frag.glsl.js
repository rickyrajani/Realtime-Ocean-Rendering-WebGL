export default function(params) {
    return `#version 300 es
    precision highp float;

    uniform samplerCube skybox;
    
    in vec3 v_coords;

    out vec4 v_color;
  
    void main() {
      v_color = texture(skybox, v_coords);
    }
    `;
  }
  