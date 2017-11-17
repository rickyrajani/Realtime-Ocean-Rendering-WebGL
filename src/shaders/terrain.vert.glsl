#version 130
precision highp float;

uniform mat4 u_viewProjectionMatrix;

attribute vec3 a_position;

varying vec3 v_position;
varying vec3 v_normal;

float Noise(float x, float y) {
    int n = int(x) + int(y) * 57;
    n = (n<<13) ^ n;
    float noise = ( 1.0 - ( (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
    noise = (noise + 1.0) / 2.0;
    return noise;
}

float LinearInterpolate(float a, float b, float x) {
    return  (a * (1.0 - x)) + b * x;
}

float SmoothNoise(float x, float y) {
    float corners = (Noise(x - 1, y - 1) + Noise(x + 1, y - 1) + Noise(x - 1, y + 1) + Noise(x + 1, y + 1)) / 16.0;
    float sides = (Noise(x - 1, y) + Noise(x + 1, y) + Noise(x, y - 1) + Noise(x, y + 1)) / 8.0;
    float center = Noise(x, y) / 4.0;
    return corners + sides + center;
}

float InterpolateNoise(float x, float y) {
    int integer_X = int(x);
    float fractional_X = glm::abs(x - float(integer_X));
    int integer_Y = int(y);
    float fractional_Y = glm::abs(y - float(integer_Y));

    float v1 = SmoothNoise(integer_X, integer_Y);
    float v2 = SmoothNoise(integer_X + 1.0, integer_Y);
    float v3 = SmoothNoise(integer_X, integer_Y + 1.0);
    float v4 = SmoothNoise(integer_X + 1.0, integer_Y + 1.0);

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
    int n = 6;
    float max = 1.4;

    for (int i = 0; i < n; i++) {
        float frequency = glm::pow(2.0, float(i));
        float amplitude = glm::pow(p, float(i));

        total = total + InterpolateNoise(float(x) * frequency, float(y) * frequency) * amplitude;
    }
    return (total/max);
}

void main() {
    float amplitude = 0.25;
    a_position.y = PerlinNoise(a_position.x, a_position.z, amplitude);
    gl_Position = u_viewProjectionMatrix * vec4(a_position, 1.0);
    v_position = a_position;

    float delta = 0.25;
    vec3 a = a_position;
    vec3 b = vec3(a_position.x + delta, a_position.y, a_position.z);
    b.y = PerlinNoise(b.x, b.z, amplitude);
    vec3 c = vec3(a_position.x, a_position.y, a_position.z + delta);
    c.y = PerlinNoise(c.x, c.z, amplitude);
    
    vec3 dir = normalize(cross((b - a), (c - a));
    v_normal = dir;
}