export default function(params) {
  return `#version 300 es
  precision highp float;

  in vec4 v_position;
  in vec4 v_normal;

  out vec4 v_color;

  void main() {
    vec3 albedo = vec3(0,0,1);
    vec3 normal = vec3(v_normal);

    vec3 fragColor = vec3(0.0);

    vec3 sunLight = normalize(vec3(1, 20, -5));
    float NdotL = clamp(dot(normal, sunLight), 0.1, 1.0);
    fragColor += albedo * NdotL;

    const vec3 ambientLight = vec3(0.025);
    fragColor += albedo * ambientLight;
    v_color = vec4(fragColor, 1.0);
  }
  `;
}
