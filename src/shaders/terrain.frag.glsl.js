export default function(params) {
    return `#version 300 es
    precision highp float;
  
    in vec3 v_position;
    in vec3 v_normal;

    out vec4 v_color;
  
    void main() {
      vec3 albedo = vec3(107.0/255.0, 180.0/255.0, 69.0/255.0);
      vec3 normal = v_normal;
      vec3 pos = v_position;
      
      if (v_position.y <= 55.0) {
        albedo = vec3(25.0/255.0, 140.0/255.0 , 190.0/255.0);
        normal = vec3(0,1,0);
        pos.y = 55.0;
      }
  
      vec3 fragColor = vec3(0.0);
  
      vec3 sunLight = vec3(1, 75, -5);
      vec3 lightDir = normalize(sunLight - pos);
      float NdotL = clamp(dot(normal, lightDir), 0.1, 1.0);
      fragColor += albedo * NdotL;
  
      const vec3 ambientLight = vec3(0.25);
      fragColor += albedo * ambientLight;
      v_color = vec4(fragColor, 1.0);
    }
    `;
  }
  