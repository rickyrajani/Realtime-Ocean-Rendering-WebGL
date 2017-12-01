#version 300 es
precision highp float;


const float PI = 3.14159265359;
const float g = 9.81;
const vec2 wind = vec2(1.0,1.0);

uniform mat4 u_viewProjectionMatrix;
uniform mat4 u_viewMatrix;

uniform float u_time;
uniform float u_L;
uniform int u_resolution;
uniform float u_V;

in vec3 a_position;

out vec3 v_position;
out vec3 v_normal;
out vec3 v_viewCoords; // Position in model view space
out vec3 v_R;


// taken from http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt = dot(co.xy ,vec2(a,b));
    highp float sn = mod(dt,3.14);
    return fract(sin(sn) * c);
}

vec2 complexExp(float x) {
    return vec2(cos(x), sin(x));
}

vec2 complexProduct(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 getH_0 (vec2 k, float P) {
    float rand1 = rand(vec2(k.x, k.y)) * 2.0 - 1.0;
    float rand2 = rand(vec2((mod(k.y * rand1, 11.0), mod(k.x, 17.0)))) * 2.0 - 1.0;
    return vec2( 1.0 / pow (2.0, 0.5) * rand1 * sqrt(P), 1.0 / sqrt(2.0) * rand2 * pow(P, 0.5));
}

float getHeightField(vec3 pos) {
    float n = pos.x;
    float m = pos.z;
    vec2 k = vec2(2.0 * PI * n / u_L, 2.0 * PI * m / u_L);
    float lengthK = length(k);

    // numeric constant
    float A = 0.01;

    // largest possible waves arising from a continuous wind of speed
    float V = 10.0;
    float L = V * V / g;

    float cosP = length(dot (normalize(k), normalize(wind)));
    float temp = lengthK * L;
    float P = A * exp( -1.0 / (temp * temp)) * pow(lengthK, 4.0) * cosP * cosP;

    float wl = L / 10000.0;
    P *= exp(lengthK * lengthK * (wl * wl));

    vec2 h_0 = getH_0(k, P);
    vec2 h_0_star = getH_0(-k, P);

    float w = sqrt(g * lengthK);

    vec2 h_01 = complexProduct(h_0, complexExp( w * u_time));
    vec2 h_0_star1 = complexProduct(h_0_star, complexExp(-w * u_time));

    vec2 h_t = h_01 + h_0_star1;

    vec2 h_x_t = complexProduct(h_t, complexExp(dot(k, vec2(n,m))));

    return h_x_t.x;
}

void main() {
    vec3 a = a_position;

    float delta = u_L/float(u_resolution);
    float y = getHeightField(a) + 55.0;
    a.y = y;

    vec3 b = vec3(a_position.x + delta, a_position.y, a_position.z);
    b.y = getHeightField(b) + 55.0;

    vec3 c = vec3(a_position.x, a_position.y, a_position.z + delta);		
    c.y = getHeightField(c) + 55.0;	

    vec3 dir = normalize(cross((b - a), (c - a)));
    v_normal = dir;

    v_position = a;
    gl_Position = u_viewProjectionMatrix * vec4(a, 1.0);

    // For reflection
    // vec4 eyeCoords = u_viewMatrix * vec4(a, 1.0);
    // v_viewCoords = eyeCoords.xyz;

    vec4 eyePos = vec4(a, 1.0);
    vec4 NN = u_viewMatrix * vec4(v_normal,1.0);
    vec3 N = normalize(NN.xyz);
    v_R = reflect(eyePos.xyz, N);
}