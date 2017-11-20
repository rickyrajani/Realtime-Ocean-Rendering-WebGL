#version 300 es
precision highp float;

uniform mat4 u_viewProjectionMatrix;

in vec3 a_coords;

out vec3 v_coords;

void main() {
    gl_Position = u_viewProjectionMatrix * vec4(a_coords, 1.0);
    v_coords = a_coords;
}