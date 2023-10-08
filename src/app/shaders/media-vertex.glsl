#define PI 3.1415926535897932384626433832795

attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float uVelocity;
uniform vec2 uViewportRes;

varying vec2 vUv;
varying float vDistortion;

void main(){
  vec3 pos = position;

  pos.y += sin(pos.x  * PI + PI / 2.) * -uVelocity * 2.;

  vec4 newPosition = modelViewMatrix * vec4(pos, 1.);

  float distortion = abs(sin(newPosition.y / uViewportRes.y * PI + PI / 2.) * -uVelocity * 3.);

  newPosition.z += distortion;

  vUv = uv;
  vDistortion = abs(min(distortion * 2., 1.));

  gl_Position = projectionMatrix * newPosition;
}