#version 100
precision highp float;

uniform mat4 u_viewProjectionMatrix;

attribute vec3 a_position;

varying vec3 v_position;
varying vec3 v_normal;

void main() {
    gl_Position = u_viewProjectionMatrix * vec4(a_position, 1.0);
    v_position = a_position;
    v_normal = vec3(0,1,0);
}