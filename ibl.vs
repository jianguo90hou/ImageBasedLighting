precision mediump float;

attribute vec4 MCVertex;
attribute vec3 MCNormal;

uniform mat4 MVMatrix;
uniform mat4 MVPMatrix;
uniform mat3 NormalMatrix;

varying vec3 ReflectDir;
varying vec3 Normal;

void main() {    
    gl_Position = MVPMatrix * MCVertex;
    Normal = normalize(NormalMatrix * MCNormal);

    vec3 eyeDir = vec3(MVMatrix * MCVertex);
    ReflectDir = reflect(eyeDir, Normal);
}
