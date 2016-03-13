/* jshint node: true */
/* jslint browser: true */
/* jslint asi: true */
'use strict'

var glClear = require('gl-clear')
var createContext = require('gl-context')
var fit = require('canvas-fit')
var Geom = require('gl-geometry')
var asyncImageLoad = require('async-image-loader')
var teapot = require('teapot')
var glslify = require('glslify')
var glShader = require('gl-shader')
var mat4 = require('gl-mat4')
var mat3 = require('gl-mat3')
var vec3 = require('gl-vec3')
var turntableCamera = require('turntable-camera')
var normals = require('normals')
var TextureCube = require('gl-texture-cube')

// Find user widgets
var diffuseMixSlider = document.getElementById('diffuseMixSlider')
var specularMixSlider = document.getElementById('specularMixSlider')

// Start loading cube map images now
var images = [ 'assets/location_4_1_diffuse_c00.jpg', 'assets/location_4_1_diffuse_c02.jpg', 'assets/location_4_1_diffuse_c04.jpg',
               'assets/location_4_1_diffuse_c01.jpg', 'assets/location_4_1_diffuse_c03.jpg', 'assets/location_4_1_diffuse_c05.jpg',
               'assets/location_4_1_specular_c00.jpg', 'assets/location_4_1_specular_c02.jpg', 'assets/location_4_1_specular_c04.jpg',
               'assets/location_4_1_specular_c01.jpg', 'assets/location_4_1_specular_c03.jpg', 'assets/location_4_1_specular_c05.jpg',
               'assets/location_4_1_reflection_c00.jpg', 'assets/location_4_1_reflection_c02.jpg', 'assets/location_4_1_reflection_c04.jpg',
               'assets/location_4_1_reflection_c01.jpg', 'assets/location_4_1_reflection_c03.jpg', 'assets/location_4_1_reflection_c05.jpg' ]
asyncImageLoad(images, onImages)

// Canvas & WebGL setup
var canvas = document.body.appendChild(document.createElement('canvas'))
window.addEventListener('resize', fit(canvas), false)
var gl = createContext(canvas, render)
var clear = glClear({color: [ 0, 0, 0, 1 ], depth: true})
gl.enable(gl.DEPTH_TEST)

// Set up model
var norms = normals.vertexNormals(teapot.cells, teapot.positions)
var model = Geom(gl).attr('MCVertex', teapot.positions).attr('MCNormal', norms).faces(teapot.cells)

// Environment mapping shader
var shader = glShader(gl, glslify('./ibl.vs'), glslify('./ibl.fs'))

// Projection and camera setup
var PMatrix = mat4.create()
var camera = turntableCamera()
camera.downwards = Math.PI * 0.2

// Cube map setup
var diffuseMap, specularMap, reflectionMap
function onImages (images) {
  var diffuseTextures = {
    pos: {
      x: images[0], y: images[1], z: images[2]
    },
    neg: {
      x: images[3], y: images[4], z: images[5]
    }
  }
  diffuseMap = TextureCube(gl, diffuseTextures)

  var specularTextures = {
    pos: {
      x: images[6], y: images[7], z: images[8]
    },
    neg: {
      x: images[9], y: images[10], z: images[11]
    }
  }
  specularMap = TextureCube(gl, specularTextures)

  var reflectionTextures = {
    pos: {
      x: images[12], y: images[13], z: images[14]
    },
    neg: {
      x: images[15], y: images[16], z: images[17]
    }
  }
  reflectionMap = TextureCube(gl, reflectionTextures)
}

// Main loop
function render () {
  var width = canvas.width
  var height = canvas.height

  gl.viewport(0, 0, width, height)
  clear(gl)

  // Process user input
  var diffuseMixRatio = diffuseMixSlider.value / 100
  var specularMixRatio = specularMixSlider.value / 100
  var reflectionMixRatio = reflectionMixSlider.value / 100

  if (!diffuseMap || !specularMap || !reflectionMap) {
    return
  }

  mat4.perspective(PMatrix, Math.PI / 4, width / height, 0.001, 1000)

  // Update camera rotation angle
  camera.rotation = Date.now() * 0.0002

  // Model matrix is ID here
  var VMatrix = camera.view()
  var MVMatrix = VMatrix // * ID
  var MVPMatrix = mat4.create()
  mat4.multiply(MVPMatrix, PMatrix, MVMatrix)

  model.bind(shader)
  shader.uniforms.MVMatrix = MVMatrix
  shader.uniforms.MVPMatrix = MVPMatrix
  shader.uniforms.NormalMatrix = computeNormalMatrix(MVMatrix)
  shader.uniforms.BaseColor = vec3.fromValues(1.0, 1.0, 1.0)
  shader.uniforms.DiffusePercent = diffuseMixRatio
  shader.uniforms.SpecularPercent = specularMixRatio
  shader.uniforms.ReflectionPercent = reflectionMixRatio
  shader.uniforms.DiffuseEnvMap = diffuseMap.bind(0)
  shader.uniforms.SpecularEnvMap = specularMap.bind(0)
  shader.uniforms.ReflectionEnvMap = reflectionMap.bind(0)
  model.draw()
}

function computeNormalMatrix (MVMatrix) {
  var topLeft = mat3.create()
  mat3.fromMat4(topLeft, MVMatrix)

  var inv = mat3.create()
  mat3.invert(inv, topLeft)

  var normalMatrix = mat3.create()
  mat3.transpose(normalMatrix, inv)
  return normalMatrix
}
