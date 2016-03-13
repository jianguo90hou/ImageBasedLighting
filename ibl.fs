precision mediump float;

uniform vec3 BaseColor;
uniform float SpecularPercent;
uniform float DiffusePercent;

uniform samplerCube SpecularEnvMap;
uniform samplerCube DiffuseEnvMap;

varying vec3 ReflectDir;
varying vec3 Normal;

void main() {

    // Look up environment map values in convoluted cube maps
    vec3 diffuseColor = vec3(textureCube(DiffuseEnvMap, normalize(Normal)));
    vec3 specularColor = vec3(textureCube(SpecularEnvMap, normalize(ReflectDir)));
    
    // Add lighting to base color and mix
    vec3 color = mix(BaseColor, diffuseColor*BaseColor, DiffusePercent);
    color = mix(color, specularColor + color, SpecularPercent);

    gl_FragColor = vec4(color, 1.0);
}