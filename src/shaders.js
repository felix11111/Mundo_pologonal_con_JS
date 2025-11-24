// src/shaders.js
const Shaders = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform vec3 color;
        uniform sampler2D map;
        uniform bool useTexture;
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            vec3 light = normalize(vec3(0.5, 1.0, 0.8));
            float dProd = max(0.0, dot(vNormal, light));
            
            // Add ambient light component
            float ambient = 0.3;
            float lightIntensity = ambient + (1.0 - ambient) * dProd;

            vec3 baseColor = useTexture ? texture2D(map, vUv).rgb : color;
            vec3 finalColor = baseColor * lightIntensity;

            // Aplicar niebla
            float depth = length(vPosition);
            float fogFactor = smoothstep(fogNear, fogFar, depth);
            finalColor = mix(finalColor, fogColor, fogFactor);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,

    uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        map: { value: null },
        useTexture: { value: false },
        fogColor: { value: new THREE.Color(0xcccccc) },
        fogNear: { value: 50 },  // Aumentado para reducir la niebla cercana
        fogFar: { value: 300 }   // Aumentado para extender la niebla más lejos
    }
};