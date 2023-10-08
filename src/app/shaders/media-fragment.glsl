precision mediump float;

uniform sampler2D uTexture;
uniform float uAlpha;
uniform float uColor;
uniform vec2 uPlaneRes;
uniform vec2 uImageRes;

varying vec2 vUv;
varying float vDistortion;

vec3 adjustSaturation(vec3 color, float value) {
  const vec3 luminosityFactor = vec3(0.2126, 0.7152, 0.0722);
  vec3 grayscale = vec3(dot(color, luminosityFactor));

  return mix(grayscale, color, 1.0 + value);
}

vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st;
  return u * s / st + o;
}

void main(){
  vec2 uv = CoverUV(vUv, uPlaneRes, uImageRes);

  vec4 texture = texture2D(uTexture, uv);

  vec3 saturatedColor = adjustSaturation(texture.rgb, -1. + uColor);
  // vec3 saturatedColor = adjustSaturation(texture.rgb, -1. + min(uColor + vDistortion, 1.));

  gl_FragColor = vec4(saturatedColor, uAlpha);
  // gl_FragColor = vec4(saturatedColor, min(uAlpha + vDistortion, 1.));
}