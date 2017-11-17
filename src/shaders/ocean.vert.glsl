#version 300 es
precision highp float;

uniform mat4 u_viewProjectionMatrix;

in vec3 a_position;

out vec4 v_position;
out vec4 v_normal;

void main() {
    gl_Position = u_viewProjectionMatrix * vec4(a_position, 1.0);
    v_position = vec4(a_position, 1.0);
    v_normal = vec4(0,1,0,1);
}