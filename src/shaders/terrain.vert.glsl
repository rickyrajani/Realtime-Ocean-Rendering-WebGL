#version 300 es
precision highp float;


const float PI = 3.14159265359;
const float g = 9.81;
const vec2 wind = vec2(1.0,1.0);

uniform mat4 u_viewProjectionMatrix;

uniform float u_noise;

uniform float u_time;
uniform float u_L;
uniform int u_resolution;
uniform float u_V;

in vec3 a_position;
in vec3 a_noise;

out vec3 v_position;
out vec3 v_normal;


// taken from http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

vec2 complexExp(float x) {
    return vec2(cos(x), sin(x));
}

vec2 complexProduct(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float Noise(float x, float y) {
    int n = int(x) + int(y) * 57;
    n = (n<<13) ^ n;
    float noise = float( 1 - ( (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824);
    noise = (noise + 1.0) / 2.0;
    return noise;
}

float LinearInterpolate(float a, float b, float x) {
    return  (a * (1.0 - x)) + b * x;
}

float SmoothNoise(float x, float y) {
    float corners = (Noise(x - 1.0, y - 1.0) + Noise(x + 1.0, y - 1.0) + Noise(x - 1.0, y + 1.0) + Noise(x + 1.0, y + 1.0)) / 16.0;
    float sides = (Noise(x - 1.0, y) + Noise(x + 1.0, y) + Noise(x, y - 1.0) + Noise(x, y + 1.0)) / 8.0;
    float center = Noise(x, y) / 4.0;
    return corners + sides + center;
}

float InterpolateNoise(float x, float y) {
    int integer_X = int(x);
    float fractional_X = abs(x - float(integer_X));
    int integer_Y = int(y);
    float fractional_Y = abs(y - float(integer_Y));

    float v1 = SmoothNoise(float(integer_X), float(integer_Y));
    float v2 = SmoothNoise(float(integer_X) + 1.0, float(integer_Y));
    float v3 = SmoothNoise(float(integer_X), float(integer_Y) + 1.0);
    float v4 = SmoothNoise(float(integer_X) + 1.0, float(integer_Y) + 1.0);

    float i1 = LinearInterpolate(v1, v2, fractional_X);
    float i2 = LinearInterpolate(v3, v4, fractional_X);

    return LinearInterpolate(i1, i2, fractional_Y);
}

float PerlinNoise(float x, float y, float c) {
    x = x * c;
    y = y * c;
    float total = 0.0;
    float p = 0.5;
    // number of octaves
    int n = 8;
    float max = 1.4;

    for (int i = 0; i < n; i++) {
        float frequency = pow(2.0, float(i));
        float amplitude = pow(p, float(i));

        total = total + InterpolateNoise(float(x) * frequency, float(y) * frequency) * amplitude;
    }
    return (total/max);
}

vec2 getH_0 (vec2 k, float P) {
    float rand1 = rand(vec2(k.x, k.y));
    float rand2 = rand(vec2(k.y * rand1, k.x));
    return vec2( 1.0 / pow (2.0, 0.5) * rand1 * sqrt(P), 1.0 / sqrt(2.0) * rand2 * pow(P, 0.5));
}

float getHeightField(vec3 pos) {
    float n = pos.x;
    float m = pos.z;
    vec2 k = vec2(2.0 * PI * n / u_L, 2.0 * PI * m / u_L);

    // numeric constant
    float A = 0.0000001;

    // largest possible waves arising from a continuous wind of speed
    float L = 1.0 * 1.0 / g;

    float cosP = length(dot (normalize(k), normalize(wind)));
    float temp = length(k) * L;
    float P = A * exp( -1.0 / (temp*temp)) * pow(length(k), 4.0) * cosP * cosP;

    vec2 h_0 = getH_0(k, P);
    vec2 h_0_star = getH_0(-k, P);

    float w = sqrt(g * length(k));

    vec2 h_01 = complexProduct(h_0, complexExp( w * u_time));
    vec2 h_0_star1 = complexProduct(h_0_star, complexExp(-w * u_time));

    vec2 h_t = h_01 + h_0_star1;

    vec2 h_x_t = complexProduct(h_t, complexExp(dot(k, vec2(n,m))));

    return h_x_t.x;
}

void main() {
    float amplitude = u_noise;
    float y = PerlinNoise(a_position.x, a_position.z, amplitude) * 50.0;
    //float y = a_noise.x;
    vec3 a = a_position;

    if (y <= 55.0) {
        y = getHeightField(a) + 50.0;	
        v_normal = vec3(0.0,1.0,0.0);
        a.y = y;
    } else {
        float delta = 0.1;		
        a.y = y;		
        vec3 b = vec3(a_position.x + delta, a_position.y, a_position.z);
        b.y = PerlinNoise(b.x, b.z, amplitude) * 50.0;		
        // b.y = a_noise.y;
        vec3 c = vec3(a_position.x, a_position.y, a_position.z + delta);		
        c.y = PerlinNoise(c.x, c.z, amplitude) * 50.0;		
        // c.y = a_noise.z;

        vec3 dir = normalize(cross((b - a), (c - a)));		
        v_normal = dir;		
    }
    /*
    float delta = 0.1;
    
    vec3 a = a_position;
    a.y = a_noise.x;
    vec3 b = vec3(a_position.x + delta, a_noise.y, a_position.z);
    vec3 c = vec3(a_position.x, a_noise.y, a_position.z + delta);

    vec3 dir = normalize(cross((b - a), (c - a)));
    v_normal = dir;
    */

    v_position = a;
    gl_Position = u_viewProjectionMatrix * vec4(a, 1.0);
}