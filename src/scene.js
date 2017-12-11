import { gl } from './init';
import { Vector3, Vector2 } from 'three';

const FLOAT_SIZE = 4;
const g = 9.81;

var texId;

class Scene {
  constructor() {
    this.aCoords_Skybox;
    this.uProjection_Skybox;  
    this.uModelview_Skybox;
    this._texID;
    this.cube;
    
    this.noise = [];
    this.time = 0;
    this.wind = new Vector2(1.0, 1.0);
    this.amplitude = 0.00001;

    this.OCEAN_RESOLUTION = 512.0;
    this.vertices = [];
    this.indices = [];
    this.heightMap = [];
    this.w = [];
    
    this.TERRAIN_RESOLUTION = 256.0;
    this.terrainVertices = [];
    this.terrainIndices = [];

    this.OCEAN_LOW_RES = 128.0;
    this.verticesLowRes = [];
    this.indicesLowRes = [];
    this.heightMapLowRes = [];
    this.wLowRes = [];
  }

  update() {
    this.time += 1;
  }

  createTerrainBuffers() {
    this.terrainVertices = [];
    for (let z = 0; z < this.TERRAIN_RESOLUTION; z++) {
      for (let x = 0; x < this.TERRAIN_RESOLUTION; x++) {
        this.terrainVertices.push((x * this.OCEAN_SIZE)/ (this.TERRAIN_RESOLUTION - 1) - this.OCEAN_SIZE/2.0);
        this.terrainVertices.push(0.0)
        this.terrainVertices.push((z * this.OCEAN_SIZE)/ (this.TERRAIN_RESOLUTION - 1) - this.OCEAN_SIZE/2.0);
      }
    }

    this.terrainIndices = [];
    for (let z = 0; z < this.TERRAIN_RESOLUTION - 1; z++) {
      for (let x = 0; x < this.TERRAIN_RESOLUTION - 1; x++) {
        let UL = z * this.TERRAIN_RESOLUTION + x;
        let UR = UL + 1;
        let BL = UL + this.TERRAIN_RESOLUTION;
        let BR = BL + 1;
        this.terrainIndices.push(UL);
        this.terrainIndices.push(BL);
        this.terrainIndices.push(BR);
        this.terrainIndices.push(BR);
        this.terrainIndices.push(UR);                
        this.terrainIndices.push(UL);
      }
    }
  }
  
  createBuffers() {
    this.vertices = [];
    for (let z = 0; z < this.OCEAN_RESOLUTION; z++) {
      for (let x = 0; x < this.OCEAN_RESOLUTION; x++) {
        this.vertices.push((x * this.OCEAN_SIZE)/ (this.OCEAN_RESOLUTION - 1) - this.OCEAN_SIZE/2.0);
        this.vertices.push(0.0)
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

  createPatchBuffers() {
    this.verticesLowRes = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let z = 0; z < this.OCEAN_LOW_RES; z++) {
          for (let x = 0; x < this.OCEAN_LOW_RES; x++) {
            this.verticesLowRes.push((x * this.OCEAN_SIZE)/ (this.OCEAN_LOW_RES - 1) 
              - this.OCEAN_SIZE/2.0 + (i - 1) * this.OCEAN_SIZE);
            this.verticesLowRes.push(0.0)
            this.verticesLowRes.push((z * this.OCEAN_SIZE)/ (this.OCEAN_LOW_RES - 1) 
              - this.OCEAN_SIZE/2.0 + (j - 1) * this.OCEAN_SIZE);
          }
        }
      }
    }

    this.indicesLowRes = [];
    for (let z = 0; z < this.OCEAN_LOW_RES - 1; z++) {
      for (let x = 0; x < this.OCEAN_LOW_RES - 1; x++) {
        let UL = z * this.OCEAN_LOW_RES + x;
        let UR = UL + 1;
        let BL = UL + this.OCEAN_LOW_RES;
        let BR = BL + 1;
        this.indicesLowRes.push(UL);
        this.indicesLowRes.push(BL);
        this.indicesLowRes.push(BR);
        this.indicesLowRes.push(BR);
        this.indicesLowRes.push(UR);                
        this.indicesLowRes.push(UL);
      }
    }
  }

  createHeightMapBuffers() {
    this.heightMap = [];
    this.w = [];
    for (let z = 0; z < this.OCEAN_RESOLUTION; z++) {
      for (let x = 0; x < this.OCEAN_RESOLUTION; x++) {
        var xPos = (x * this.OCEAN_SIZE)/ (this.OCEAN_RESOLUTION - 1) - this.OCEAN_SIZE/2.0;
        var zPos = (z * this.OCEAN_SIZE)/ (this.OCEAN_RESOLUTION - 1) - this.OCEAN_SIZE/2.0;
        
        var u_L = this.OCEAN_SIZE;
        var u_V = 10.0;
        var u_A = this.amplitude;

        var n = xPos;// + this.OCEAN_SIZE/2.0;
        var m = zPos;// + this.OCEAN_SIZE/2.0;
        var k = new Vector2(2.0 * Math.PI * n / u_L, 2.0 * Math.PI * m / u_L);
        var lengthK = k.length();
    
        // largest possible waves arising from a continuous wind of speed
        var L = u_V * u_V / g;
        var k_Nor = k.normalize();
        var kDotWind = k_Nor.dot(this.wind.normalize());
        var cosP = kDotWind;
        var temp = L * lengthK;
        var P = u_A * Math.exp( -1.0 / (temp * temp)) * Math.pow(lengthK, -4.0) * cosP * cosP;
    
        var wl = L / 10000.0;
        P *= Math.exp(lengthK * lengthK *  (wl* wl));
    
        var h_0 = this.getH_0(k, P);
        var h_0_star = this.getH_0(-k, P);
        var w = Math.sqrt(g * lengthK);
        this.heightMap.push(h_0.x);
        this.heightMap.push(h_0.y);
        this.heightMap.push(h_0_star.x);
        this.heightMap.push(h_0_star.y);
        this.w.push(w);              
      }
    }
  }

  createHeightMapLowResBuffers() {
    this.heightMapLowRes = [];
    this.wLowRes = [];
    for (let z = 0; z < this.OCEAN_LOW_RES; z++) {
      for (let x = 0; x < this.OCEAN_LOW_RES; x++) {
        var xPos = (x * this.OCEAN_SIZE)/ (this.OCEAN_LOW_RES - 1) - this.OCEAN_SIZE/2.0;
        var zPos = (z * this.OCEAN_SIZE)/ (this.OCEAN_LOW_RES - 1) - this.OCEAN_SIZE/2.0;
        var u_L = this.OCEAN_SIZE;
        var u_V = 10.0;
        var u_A = this.amplitude;

        var n = xPos + this.OCEAN_SIZE/2.0;
        var m = zPos + this.OCEAN_SIZE/2.0;
        var k = new Vector2(2.0 * Math.PI * n / u_L, 2.0 * Math.PI * m / u_L);
        var lengthK = k.length();
    
        // largest possible waves arising from a continuous wind of speed
        var L = u_V * u_V / g;
        var k_Nor = k.normalize();
        var kDotWind = k_Nor.dot(this.wind.normalize());
        var cosP = kDotWind;
        var temp = L * lengthK;
        var P = u_A * Math.exp( -1.0 / (temp * temp)) * Math.pow(lengthK, -4.0) * cosP * cosP;
    
        var wl = L / 10000.0;
        P *= Math.exp(lengthK * lengthK *  (wl* wl));
    
        var h_0 = this.getH_0(k, P);
        var h_0_star = this.getH_0(-k, P);
        var w = Math.sqrt(g * lengthK);
        this.heightMapLowRes.push(h_0.x);
        this.heightMapLowRes.push(h_0.y);
        this.heightMapLowRes.push(h_0_star.x);
        this.heightMapLowRes.push(h_0_star.y);
        this.wLowRes.push(w);              
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
      require("../img/cloudtop_ft.jpg"), require("../img/cloudtop_bk.jpg"), 
      require("../img/cloudtop_up.jpg"), require("../img/cloudtop_dn.jpg"), 
      require("../img/cloudtop_rt.jpg"), require("../img/cloudtop_lf.jpg")
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

// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
// Standard Normal variate using Box-Muller transform.
  gausRand() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  }

  getH_0(k, P) {
    var rand1 = this.gausRand();
    var rand2 = this.gausRand();
    return new Vector2( 1.0 / Math.pow (2.0, 0.5) * rand1 * Math.sqrt(P), 
      1.0 / Math.sqrt(2.0) * rand2 * Math.pow(P, 0.5));
  }

  getHeightMap(x, z) {
    var n = x;
    var m = z;
    var k = new Vector2(2.0 * PI * n / u_L, 2.0 * Math.PI * m / u_L);
    var lengthK = Math.length(k);

    // largest possible waves arising from a continuous wind of speed
    var L = u_V * u_V / g;

    var cosP = Math.length(Math.dot (Math.normalize(k), Math.normalize(this.wind)));
    var temp = lengthK * L;
    var P = u_A * Math.exp( -1.0 / (temp * temp)) * Math.pow(lengthK, -4.0) * cosP * cosP;

    var wl = L / 10000.0;
    P *= Math.exp(lengthK * lengthK * (wl * wl));

    var h_0 = getH_0(k, P);
    var h_0_star = getH_0(-k, P);
    var w = Math.sqrt(g * lengthK);
    
    return new Vector3(h_0, h_0_star, w);
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

  drawOcean(shaderProgram) {
    if (this._texID) {
      // Ocean water plane
      var vertexBuffer = gl.createBuffer();
      var indicesBuffer = gl.createBuffer();
      var heightMapBuffer = gl.createBuffer();
      var wBuffer = gl.createBuffer();

      // Bind ocean vertex positions
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(shaderProgram.a_position);
      gl.vertexAttribPointer(shaderProgram.a_position, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0);  

      // // bind heightMap
      // gl.bindBuffer(gl.ARRAY_BUFFER, heightMapBuffer);
      // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.heightMap), gl.STATIC_DRAW);
      // gl.enableVertexAttribArray(shaderProgram.a_heightMap);
      // gl.vertexAttribPointer(shaderProgram.a_heightMap, 4, gl.FLOAT, false, 4 * FLOAT_SIZE, 0);  

      // // bind w?
      // gl.bindBuffer(gl.ARRAY_BUFFER, wBuffer);
      // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.w), gl.STATIC_DRAW);
      // gl.enableVertexAttribArray(shaderProgram.a_w);
      // gl.vertexAttribPointer(shaderProgram.a_w, 1, gl.FLOAT, false, FLOAT_SIZE, 0);  

      // Bind ocean vertex indices
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), gl.STATIC_DRAW);

      var mode = gl.TRIANGLES;
      if(this.wireframe) {
        mode = gl.LINES
      }
      gl.drawElements(mode, this.indices.length, gl.UNSIGNED_INT, 0);
    }
  }

  drawOceanLowRes(shaderProgram, count) {
    var vertexBuffer = gl.createBuffer();
    
    let start = this.OCEAN_LOW_RES * this.OCEAN_LOW_RES * 3 * count;
    let end = start + (this.OCEAN_LOW_RES * this.OCEAN_LOW_RES * 3);
    let verticesPatch = this.verticesLowRes.slice(start, end);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesPatch), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(shaderProgram.a_position);
    gl.vertexAttribPointer(shaderProgram.a_position, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0);
    
    var mode = gl.TRIANGLES;
    if(this.wireframe) {
      mode = gl.LINES
    }
    gl.drawElements(mode, this.indicesLowRes.length, gl.UNSIGNED_INT, 0);
  }

  bindOceanLowResBuffers(shaderProgram) {
    if (this._texID) {
      // Ocean water plane
      var indicesBuffer = gl.createBuffer();
      var heightMapBuffer = gl.createBuffer();
      var wBuffer = gl.createBuffer();

      // // bind heightMap
      // gl.bindBuffer(gl.ARRAY_BUFFER, heightMapBuffer);
      // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.heightMapLowRes), gl.STATIC_DRAW);
      // gl.enableVertexAttribArray(shaderProgram.a_heightMap);
      // gl.vertexAttribPointer(shaderProgram.a_heightMap, 4, gl.FLOAT, false, 4 * FLOAT_SIZE, 0);  

      // // bind w?
      // gl.bindBuffer(gl.ARRAY_BUFFER, wBuffer);
      // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.wLowRes), gl.STATIC_DRAW);
      // gl.enableVertexAttribArray(shaderProgram.a_w);
      // gl.vertexAttribPointer(shaderProgram.a_w, 1, gl.FLOAT, false, FLOAT_SIZE, 0);  

      // Bind ocean vertex indices
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indicesLowRes), gl.STATIC_DRAW);
    }
  }

  drawTerrain(shaderProgram) {
    if (this._texID) {
    // Terrain plane
    var vertexBuffer = gl.createBuffer();
    var indicesBuffer = gl.createBuffer();

    // Bind vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.terrainVertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(shaderProgram.a_position);
    gl.vertexAttribPointer(shaderProgram.a_position, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0);  

    // Bind indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.terrainIndices), gl.STATIC_DRAW);

    var mode = gl.TRIANGLES;
    if(this.wireframe) {
      mode = gl.LINES
    }
    gl.drawElements(mode, this.terrainIndices.length, gl.UNSIGNED_INT, 0);
  }
}

}

export default Scene;