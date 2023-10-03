#define PI 3.1415926535897932384626433832795

attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float uVelocity;
uniform vec2 uViewportRes;


void main(){
  vec3 pos = position;

  pos.z += abs(sin(pos.x * PI + PI / 2.) * -uVelocity * 0.1);

  vec4 newPosition = modelViewMatrix * vec4(pos, 1.);

  newPosition.z += abs(sin(newPosition.y / uViewportRes.y * PI + PI / 2.) * -uVelocity * 0.1);

  gl_Position = projectionMatrix * newPosition;
}