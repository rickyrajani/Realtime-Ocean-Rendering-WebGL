export default function(params) {
    return `#version 300 es
    precision highp float;
  
    in vec3 v_position;
    in vec3 v_normal;

    out vec4 v_color;

    void main() {
      vec3 albedo = vec3(0.9, 0.9, 0.9);
      vec3 normal = v_normal;
      vec3 pos = v_position;
  
      vec3 fragColor = vec3(0.0);
  
      vec3 lightDir = normalize(vec3(0, 65, -100) - pos);
      float NdotL = clamp(dot(normal, lightDir), 0.2, 0.7);
      fragColor += albedo * NdotL;
  
      const vec3 ambientLight = vec3(0.25);
      fragColor += albedo * ambientLight;
      v_color = vec4(fragColor, 1.0);
    }
    `;
  }
  