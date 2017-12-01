export default function(params) {
  return `#version 300 es
  precision highp float;

  in vec3 v_position;
  in vec3 v_normal;
  in vec3 v_viewCoords;
  in vec3 v_R;

  out vec4 v_color;

  uniform samplerCube skybox;
  uniform mat3 u_normalMatrix;
  uniform mat3 u_invVT;
  uniform mat4 u_viewMatrix;

  void main() {
    // vec3 albedo = vec3(25.0/255.0, 140.0/255.0 , 190.0/255.0);    
    vec3 albedo = vec3(0.6, 0.6, 0.6);
    vec3 normal = v_normal;
    vec3 pos = v_position;
    
    vec3 fragColor = vec3(0.0);

    vec3 sunLight = vec3(1, 75, -5);
    vec3 lightDir = normalize(sunLight - pos);
    float NdotL = clamp(dot(normal, lightDir), 0.1, 1.0);
    // fragColor += albedo * NdotL;

    mat4 invViewMatrix = inverse(u_viewMatrix);
    vec4 cameraWorldPos = invViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec3 V = normalize(cameraWorldPos.xyz - v_position);
    vec3 H = normalize(lightDir + V);
    float NdotH = max(dot(H, normal), 0.0);
    float specular = pow(NdotH, 100.0);
    fragColor += (albedo + vec3(specular)) * NdotL;

    const vec3 ambientLight = vec3(0.25);
    // fragColor += albedo * ambientLight;
    // v_color = vec4(fragColor, 1.0);
    // v_color = vec4(normal, 1.0);

    vec3 darkBlue = vec3(39.0/255.0, 41.0/255.0, 145.0/255.0);

    // Refraction
    float rIndex = 1.5;
    float R_0 = pow((1.0 - rIndex) / (1.0 + rIndex), 2.0); // Reflective index
	  float dot = abs(dot(normal, lightDir));
    float fresnel = R_0 + (1.0 - R_0) * pow(1.0 - dot, 5.0);
    

    fragColor += (fresnel + 0.1) * vec3(texture(skybox, v_R)) + (1.0 - fresnel) * darkBlue;

    v_color = vec4(fragColor, 1.0);
  }
  `;
}
