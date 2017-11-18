#version 300 es
precision highp float;

uniform mat4 u_viewProjectionMatrix;

in vec3 a_position;

out vec3 v_position;
out vec3 v_normal;

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
    int n = 6;
    float max = 1.4;

    for (int i = 0; i < n; i++) {
        float frequency = pow(2.0, float(i));
        float amplitude = pow(p, float(i));

        total = total + InterpolateNoise(float(x) * frequency, float(y) * frequency) * amplitude;
    }
    return (total/max);
}

void main() {
    float amplitude = 0.25;
    float y = PerlinNoise(a_position.x, a_position.z, amplitude) * 50.0;
    vec3 a = a_position;

    if (y < 35.0) {
        y = 35.0;
        v_normal = vec3(0.0,1.0,0.0);
        a.y = y;
    } else {
        float delta = 0.1;
        a.y = y;
        vec3 b = vec3(a_position.x + delta, a_position.y, a_position.z);
        b.y = PerlinNoise(b.x, b.z, amplitude) * 50.0;
        vec3 c = vec3(a_position.x, a_position.y, a_position.z + delta);
        c.y = PerlinNoise(c.x, c.z, amplitude) * 50.0;
        
        vec3 dir = normalize(cross((b - a), (c - a)));
        v_normal = dir;
    }

    v_position = a;
    gl_Position = u_viewProjectionMatrix * vec4(a, 1.0);
}