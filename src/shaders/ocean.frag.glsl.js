export default function(params) {
  return `#version 300 es
  precision highp float;

  in vec3 v_position;
  in vec3 v_normal;
  in vec3 v_viewCoords;

  out vec4 v_color;

  uniform samplerCube skybox;
  uniform mat3 u_normalMatrix;
  uniform mat3 u_invVT;

  void main() {
    vec3 albedo = vec3(25.0/255.0, 140.0/255.0 , 190.0/255.0);    
    vec3 normal = v_normal;
    vec3 pos = v_position;
    
    vec3 fragColor = vec3(0.0);

    vec3 sunLight = vec3(1, 75, -5);
    vec3 lightDir = normalize(sunLight - pos);
    float NdotL = clamp(dot(normal, lightDir), 0.1, 1.0);
    fragColor += albedo * NdotL;

    const vec3 ambientLight = vec3(0.25);
    fragColor += albedo * ambientLight;
    // v_color = vec4(fragColor, 1.0);
    // v_color = vec4(normal, 1.0);

    vec3 N = u_normalMatrix * v_normal;
    vec3 V = - v_viewCoords;
    vec3 R = 2.0 * dot(V, N) * N - V;
    R = u_invVT * R;
    v_color = texture(skybox, v_position);

  }
  `;
}
