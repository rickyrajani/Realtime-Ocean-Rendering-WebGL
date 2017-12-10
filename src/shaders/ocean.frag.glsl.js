export default function(params) {
  return `#version 300 es
  precision highp float;

  in vec3 v_position;
  in vec3 v_normal;
  in vec3 v_viewCoords;
  in vec3 v_R;
  in float v_random;

  out vec4 v_color;

  uniform samplerCube skybox;
  uniform mat4 u_viewMatrix;

  void main() {
    vec3 albedo = vec3(0.6, 0.6, 0.6);
    vec3 normal = v_normal;
    vec3 pos = v_position;
    
    vec3 fragColor = vec3(0.0);

    vec3 lightDir = normalize(vec3(0, 75, 5) - pos);
    float NdotL = clamp(dot(normal, lightDir), 0.1, 1.0);

    mat4 invViewMatrix = inverse(u_viewMatrix);
    vec4 cameraWorldPos = invViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec3 V = normalize(cameraWorldPos.xyz - v_position);
    vec3 H = normalize(lightDir + V);
    float NdotH = max(dot(H, normal), 0.0);
    float specular = pow(NdotH, 50.0);
    fragColor += (albedo + vec3(specular)) * NdotL;

    vec3 darkBlue = vec3(27.0/255.0, 56.0/255.0, 81.0/255.0);

    // Refraction
    float rIndex = 1.5;
    float R_0 = pow((1.0 - rIndex) / (1.0 + rIndex), 2.0); // Reflective index
	  float dot = abs(dot(normal, lightDir));
    float fresnel = R_0 + (1.0 - R_0) * pow(1.0 - dot, 5.0);
    
    fragColor += (fresnel + 0.1) * vec3(texture(skybox, v_R)) + (1.0 - fresnel) * darkBlue;
    v_color = vec4(fragColor, 0.90);
  }
  `;
}
