export default function(params) {
    return `
    #version 130
    precision highp float;
  
    varying vec3 v_position;
    varying vec3 v_normal;
  
    void main() {
      vec3 albedo = vec3(0,1,0);
      vec3 normal = v_normal;
  
      vec3 fragColor = vec3(0.0);
  
      vec3 sunLight = normalize(vec3(1, 20, -5));
      float NdotL = clamp(dot(normal, sunLight), 0.1, 1.0);
      fragColor += albedo * NdotL;
  
      const vec3 ambientLight = vec3(0.025);
      fragColor += albedo * ambientLight;
  
      gl_FragColor = vec4(fragColor, 1.0);
    }
    `;
  }
  