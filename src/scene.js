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
    this.OCEAN_SIZE = 200.0
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
      var modelData = this.skybox(500);
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
      if (this._texID) {
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

      gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
  }

}

export default Scene;