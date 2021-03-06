#version 300 es
precision highp float;

const float PI = 3.14159265359;
const float g = 9.81;
const vec2 wind = vec2(1.0, 1.0);

uniform mat4 u_viewProjectionMatrix;
uniform mat4 u_viewMatrix;

uniform float u_time;
uniform float u_L;
uniform float u_A;
uniform float u_V;
uniform int u_resolution;
uniform vec3 u_cameraPos;
uniform float u_choppiness;

in vec3 a_position;
// in vec4 a_heightMap;
// in float a_w;

out vec3 v_position;
out vec3 v_normal;
out vec3 v_R;
out float v_random;

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

float gausRand(float r1, float r2) {
    return sqrt(-2.0 * log(r1)) * cos(2.0 * PI * r2);
}

vec2 getH_0 (vec2 k, float P) {
    float r1 = rand(vec2(k.x, k.y)) * 2.0 - 1.0;
    float r2 = rand(vec2((mod(k.y * r1, 11.0), mod(k.x, 17.0)))) * 2.0 - 1.0;

    return vec2( 1.0 / pow (2.0, 0.5) * r1 * sqrt(P), 1.0 / sqrt(2.0) * r2 * pow(P, 0.5));
}

// first value is heightfield, second is x displacement
vec2 getHeightField(vec3 pos) {
    float n = pos.x;
    float m = pos.z;
    vec2 k = vec2(2.0 * PI * n / u_L, 2.0 * PI * m / u_L);
    float lengthK = length(k);

    // largest possible waves arising from a continuous wind of speed
    float L = u_V * u_V / g;

    float cosP = length(dot (normalize(k), normalize(wind)));
    float temp = lengthK * L;
    float P = u_A * exp( -1.0 / (temp * temp)) * pow(lengthK, -4.0) * cosP * cosP;

    float wl = L / 10000.0;
    P *= exp(lengthK * lengthK * (wl * wl));

    vec2 h_0 = getH_0(k, P);
    vec2 h_0_star = getH_0(-k, P);

    float w = sqrt(g * lengthK);

    vec2 h_01 = complexProduct(h_0, complexExp( w * u_time));
    vec2 h_0_star1 = complexProduct(h_0_star, complexExp(-w * u_time));

    // h(k, t)
    vec2 h_t = h_01 + h_0_star1;

    vec2 h_x_t = complexProduct(h_t, complexExp(dot(k, vec2(n,m))));

    vec2 k_normalized = normalize(k);

    float lambda = u_choppiness;
    vec2 d_x_t = lambda * clamp( complexProduct(-k_normalized, vec2(h_x_t.y, h_x_t.x)), 0.0,0.3);

    return vec2(h_x_t.x, d_x_t.x);
}

void main() {
    vec3 a = a_position;
    float scale = 10.0;
    float random = rand(vec2(a.x, a.z * u_time));
    float waveDisplacement = 1.5 * sin(0.07*(a.x + 10.0 * u_time)) * cos(0.06*(a.z + u_time));
    
    float delta = u_L/float(u_resolution);
    vec2 a_delta = getHeightField(a);
    float y = clamp(a_delta.x, 0.0, 0.3) + 55.0;
    a.y = y + waveDisplacement;
    a.x += a_delta.y;

    vec3 b = vec3(a_position.x + delta, a_position.y, a_position.z);
    vec2 b_delta = getHeightField(b);
    b.y = b_delta.x + 55.0 + waveDisplacement;
    b.x += b_delta.y;

    vec3 c = vec3(a_position.x, a_position.y, a_position.z + delta);		
    vec2 c_delta = getHeightField(c);
    c.y = c_delta.x + 55.0 + waveDisplacement;
    c.x += c_delta.y;

    vec3 dir = normalize(cross((b - a), (c - a)));
    v_normal = dir;

    v_position = a;
    gl_Position = u_viewProjectionMatrix * vec4(a, 1.0);

    // Reflection
    vec3 eyePos = normalize(a - u_cameraPos);
    vec4 NN = u_viewMatrix * vec4(v_normal, 1.0);
    vec3 N = normalize(NN.xyz);
    v_R = reflect(eyePos, v_normal); 

    // v_random = rand(vec2(a.x, a.z));

    // gl_Position = u_viewProjectionMatrix * vec4(a, 1.0);
}