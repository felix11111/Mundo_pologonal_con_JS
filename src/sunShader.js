// src/sunShader.js
const SunShader = {
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
            vec2 uv = vUv * 2.0 - 1.0;
            float dist = length(uv);
            float brightness = 1.0 - smoothstep(0.3, 0.8, dist);
            vec3 color = vec3(1.0, 0.8, 0.4) * brightness * 2.0; // More orange/warm and brighter
            gl_FragColor = vec4(color, brightness);
        }
    `,
    uniforms: {
        time: { value: 0 }
    }
};