import { gl } from './init';

const FLOAT_SIZE = 4;

var texId;

class Scene {
  constructor() {
    this.aCoords_Skybox;
    this.uProjection_Skybox;  
    this.uModelview_Skybox;
    this._texID;
    this.cube;
    this.OCEAN_SIZE = 100.0
    this.vertices = [];
    this.indices = [];
    this.noise = [];
    this.time = 0;
    this.OCEAN_RESOLUTION = 256.0;
  }

  update() {
    // TODO: implement this
    this.time += 1;
  }
  
  createBuffers() {
    this.vertices = [];
    for (let z = 0; z < this.OCEAN_RESOLUTION; z++) {
      for (let x = 0; x < this.OCEAN_RESOLUTION; x++) {
        this.vertices.push((x * this.OCEAN_SIZE)/ (this.OCEAN_RESOLUTION - 1) - this.OCEAN_SIZE/2.0);
        this.vertices.push(0.0);
        this.vertices.push((z * this.OCEAN_SIZE)/ (this.OCEAN_RESOLUTION - 1) - this.OCEAN_SIZE/2.0);
      }
    }

    this.indices = [];
    for (let z = 0; z < this.OCEAN_RESOLUTION - 1; z++) {
      for (let x = 0; x < this.OCEAN_RESOLUTION - 1; x++) {
        let UL = z * this.OCEAN_RESOLUTION + x;
        let UR = UL + 1;
        let BL = UL + this.OCEAN_RESOLUTION;
        let BR = BL + 1;
        this.indices.push(UL);
        this.indices.push(BL);
        this.indices.push(BR);
        this.indices.push(BR);
        this.indices.push(UR);                
        this.indices.push(UL);
      }
    }
  }

  Noise(x, y) {
      var n = parseInt(x) + parseInt(y) * 57;
      n = (n<<13) ^ n;
      var noise = parseFloat( 1 - ( (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824);
      noise = (noise + 1.0) / 2.0;
      return noise;
  }

  LinearInterpolate(a, b, x) {
      return  (a * (1.0 - x)) + b * x;
  }

  SmoothNoise(x, y) {
      var corners = (this.Noise(x - 1.0, y - 1.0) + this.Noise(x + 1.0, y - 1.0) + this.Noise(x - 1.0, y + 1.0) + this.Noise(x + 1.0, y + 1.0)) / 16.0;
      var sides = (this.Noise(x - 1.0, y) + this.Noise(x + 1.0, y) + this.Noise(x, y - 1.0) + this.Noise(x, y + 1.0)) / 8.0;
      var center = this.Noise(x, y) / 4.0;
      return corners + sides + center;
  }

  InterpolateNoise(x, y) {
      var integer_X = parseInt(x);
      var fractional_X = Math.abs(x - parseFloat(integer_X));
      var integer_Y = parseInt(y);
      var fractional_Y = Math.abs(y - parseFloat(integer_Y));

      var v1 = this.SmoothNoise(parseFloat(integer_X), parseFloat(integer_Y));
      var v2 = this.SmoothNoise(parseFloat(integer_X) + 1.0, parseFloat(integer_Y));
      var v3 = this.SmoothNoise(parseFloat(integer_X), parseFloat(integer_Y) + 1.0);
      var v4 = this.SmoothNoise(parseFloat(integer_X) + 1.0, parseFloat(integer_Y) + 1.0);

      var i1 = this.LinearInterpolate(v1, v2, fractional_X);
      var i2 = this.LinearInterpolate(v3, v4, fractional_X);

      return this.LinearInterpolate(i1, i2, fractional_Y);
  }

  PerlinNoise(x, y, c) {
      x = x * c;
      y = y * c;
      var total = 0.0;
      var p = 0.5;
      // number of octaves
      var n = 6;
      var max = 1.4;

      for (let i = 0; i < n; i++) {
          let frequency = Math.pow(2.0, parseFloat(i));
          let amplitude = Math.pow(p, parseFloat(i));

          total = total + this.InterpolateNoise(parseFloat(x) * frequency, parseFloat(y) * frequency) * amplitude;
      }
      return (total/max);
  }

  createNoise(shaderProgram, amplitude) {
    var delta = 0.1;
    var h = 50.0;
    
    this.noise = [];
    for (let z = 0; z < this.OCEAN_RESOLUTION; z++) {
      for (let x = 0; x < this.OCEAN_RESOLUTION; x++) {
        var x_vert = (x * this.OCEAN_SIZE) / (this.OCEAN_RESOLUTION - 1) - this.OCEAN_SIZE/2.0;
        var z_vert = (z * this.OCEAN_SIZE) / (this.OCEAN_RESOLUTION - 1) - this.OCEAN_SIZE/2.0;

        var a = this.PerlinNoise(x_vert, z_vert, amplitude) * h;
        var b = this.PerlinNoise(x_vert + delta, z_vert, amplitude) * h;
        var c = this.PerlinNoise(x_vert, z_vert + delta, amplitude) * h;
        this.noise.push(a);
        this.noise.push(b);
        this.noise.push(c);
      }
    }
  }

  skybox(side) {
    var s = (side || 1)/2;
    var coords = [];
    var normals = [];
    var texCoords = [];
    var indices = [];
    function face(xyz, nrm) {
       var start = coords.length/3;
       var i;
       for (i = 0; i < 12; i++) {
          coords.push(xyz[i]);
       }
       for (i = 0; i < 4; i++) {
          normals.push(nrm[0], nrm[1], nrm[2]);
       }
       texCoords.push(0, 0, 1, 0, 1, 1, 0, 1);
       indices.push(start + 3, start + 2, start, start + 2, start + 1, start);       
      }
    face( [-s,-s, s, s,-s, s, s, s, s, -s, s, s], [0, 0, 1] );
    face( [-s,-s,-s, -s, s,-s, s, s,-s, s,-s,-s], [0, 0, -1] );
    face( [-s, s, -s, -s, s, s, s, s, s, s, s,-s], [0, 1, 0] );
    face( [-s, -s, -s, s, -s, -s, s, -s, s, -s, -s, s], [0, -1, 0] );
    face( [s, -s, -s, s, s, -s, s, s, s, s,-s, s], [1, 0, 0] );
    face( [-s, -s, -s, -s, -s, s, -s, s, s, -s, s, -s], [-1, 0, 0] );
    return {
       vertexPositions: new Float32Array(coords),
       vertexNormals: new Float32Array(normals),
       vertexTextureCoords: new Float32Array(texCoords),
       indices: new Uint16Array(indices)
    }
  }
  
  loadTexture() {
    var count = 0;
    var img = new Array(6);
    var urls = [
      "../img/cloudtop_rt.jpg", "../img/cloudtop_lf.jpg", 
      "../img/cloudtop_up.jpg", "../img/cloudtop_dn.jpg", 
      "../img/cloudtop_bk.jpg", "../img/cloudtop_ft.jpg"
    ];
    for (var i = 0; i < 6; i++) {
        img[i] = new Image();
        img[i].onload = function() {
            count++;
            if (count == 6) {
                texId = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texId);
                var targets = [
                   gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
                   gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
                   gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
                ];
                for (var j = 0; j < 6; j++) {
                    gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            }
        }
        this._texID = texId;
        img[i].src = urls[i];
    }
  }

  drawSkybox(shaderProgram) {
    if(this._texID) {
      var modelData = this.skybox(1000);
      var model = {};
      model.coordsBuffer = gl.createBuffer();
      model.indexBuffer = gl.createBuffer();
      model.count = modelData.indices.length;
      
      gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexPositions), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(shaderProgram.a_coords);
      gl.vertexAttribPointer(shaderProgram.a_coords, 3, gl.FLOAT, false, 0, 0);
      
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelData.indices), gl.STATIC_DRAW);
  
      gl.drawElements(gl.TRIANGLES, model.count, gl.UNSIGNED_SHORT, 0);
    }
  }

  draw(shaderProgram) {
    // Ocean water plane
    var vertexBuffer = gl.createBuffer();
    var indicesBuffer = gl.createBuffer();

    // Bind ocean vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(shaderProgram.a_position);
    gl.vertexAttribPointer(shaderProgram.a_position, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0);  

    // Bind ocean vertex indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

    // var noiseBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, noiseBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.noise), gl.STATIC_DRAW);
    // gl.enableVertexAttribArray(shaderProgram.a_noise);
    // gl.vertexAttribPointer(shaderProgram.a_noise, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }

}

export default Scene;