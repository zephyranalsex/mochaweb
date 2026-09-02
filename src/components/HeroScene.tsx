import { useEffect, useRef } from "react";
import * as THREE from "three";

export type SceneState = { scroll: number; px: number; py: number };

type Props = {
  stateRef: React.MutableRefObject<SceneState>;
  onCopy: () => void;
  textureUrl: string;
};

const VERT = /* glsl */ `
uniform float uTime;
uniform float uWobble;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;
void main(){
  vUv = uv;
  vec3 p = position;
  float w = sin(p.y * 3.0 + uTime * 1.1) * 0.5 + sin(p.x * 4.0 - uTime * 0.7) * 0.5;
  p += normal * w * uWobble;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform float uTime;
uniform float uInvert;
uniform float uHover;
uniform float uHasTex;
uniform vec3 uRed;
uniform vec3 uCyan;
uniform vec3 uCream;
uniform float uLevels;
uniform float uDot;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;
void main(){
  vec2 uv = vUv;
  uv.x += sin(uv.y * 22.0 + uTime * 1.4) * 0.0035 * (0.35 + uHover * 0.9);
  vec3 col;
  if (uHasTex > 0.5) {
    vec4 t = texture2D(uTex, uv);
    vec3 base = t.rgb;
    // keep original hue - critical for user's art (blue eye + red marks)
    float lum = dot(base, vec3(0.299, 0.587, 0.114));
    float lumC = clamp((lum - 0.04) * 1.22, 0.0, 1.0);
    float post = floor(lumC * uLevels) / uLevels;

    // saturation detection - preserve saturated glitches
    float sat = length(base - vec3(lum));
    float preserve = smoothstep(0.10, 0.32, sat);

    // halftone dots - finer now so PANCHIKO text stays readable
    vec2 g = fract(uv * uDot) - 0.5;
    float d = length(g);
    float radius = sqrt(1.0 - post) * 0.54;
    float ink = 1.0 - smoothstep(radius - 0.05, radius, d);

    vec3 inkCol = vec3(0.06, 0.055, 0.052);
    // base blend: mostly original color, slight paper lift in darks
    vec3 paperLift = mix(base, uCream, 0.18);
    vec3 basePaper = mix(paperLift, base, 0.72 + preserve * 0.28);

    // apply halftone as darkening, but much less where saturated
    float halftoneDark = (1.0 - ink) * 0.55 * (1.0 - preserve * 0.65);
    col = mix(basePaper, inkCol, halftoneDark);

    // gentle contrast for xerox feel, not posterize to beige
    col = mix(col, vec3(post), 0.12 * (1.0 - preserve));

    // subtle xerox band - less aggressive
    float band = step(0.988, fract(uv.y * 18.0 - uTime * 0.32));
    col = mix(col, 1.0 - col, band * 0.18 * (1.0 - preserve * 0.5));

    // keep red/cyan pops a touch brighter
    col += base * preserve * 0.12;
  } else {
    col = uCream * 0.12;
  }
  float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.15);
  vec3 rim = mix(uRed, uCyan, 0.5 + 0.5 * sin(uTime * 0.38 + vUv.y * 3.5));
  col += rim * f * (0.48 + uHover * 0.62);
  col += 0.02 * sin(vUv.y * 320.0 + uTime * 6.0);
  col = mix(col, 1.0 - col, clamp(uInvert, 0.0, 1.0) * 0.82);
  gl_FragColor = vec4(col, 1.0);
}
`;

function makeGlow(rgb: string, opacity: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, rgb);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity,
  });
  return new THREE.Sprite(mat);
}

export default function HeroScene({ stateRef, onCopy, textureUrl }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef(onCopy);
  copyRef.current = onCopy;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    camera.position.set(0, 0, 7.35);

    const group = new THREE.Group();
    scene.add(group);

    const uniforms = {
      uTime: { value: 0 },
      uTex: { value: null as THREE.Texture | null },
      uHasTex: { value: 0 },
      uInvert: { value: 0 },
      uHover: { value: 0 },
      uWobble: { value: 0.012 },
      uLevels: { value: 7 }, // more levels = keeps PANCHIKO text readable
      uDot: { value: 72 }, // finer halftone for your linework
      uRed: { value: new THREE.Vector3(0.757, 0.153, 0.176) },
      uCyan: { value: new THREE.Vector3(0.208, 0.776, 0.839) },
      uCream: { value: new THREE.Vector3(0.957, 0.937, 0.894) },
    };

    const drumMat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
    const drum = new THREE.Mesh(new THREE.SphereGeometry(1.34, 80, 80), drumMat);
    group.add(drum);

    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.58, 2),
      new THREE.MeshBasicMaterial({ wireframe: true, color: 0xf4efe4, transparent: true, opacity: 0.07 })
    );
    group.add(wire);

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.82, 0.007, 8, 180),
      new THREE.MeshBasicMaterial({ color: 0xc1272d, transparent: true, opacity: 0.55 })
    );
    ring1.rotation.x = 1.32;
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.12, 0.005, 8, 180),
      new THREE.MeshBasicMaterial({ color: 0x35c6d6, transparent: true, opacity: 0.3 })
    );
    ring2.rotation.x = 1.12;
    ring2.rotation.y = 0.5;
    group.add(ring1, ring2);

    const planeGeo = new THREE.PlaneGeometry(1, 1.28);
    const shards: { mesh: THREE.Mesh; r: number; sp: number; ph: number }[] = [];
    const ejects: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; vel: THREE.Vector3; spin: THREE.Vector3; life: number }[] = [];

    const loader = new THREE.TextureLoader();
    loader.load(textureUrl, (t) => {
      uniforms.uTex.value = t;
      uniforms.uHasTex.value = 1;
      for (let i = 0; i < 5; i++) {
        const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.82, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(planeGeo, m);
        mesh.scale.setScalar(0.25 + Math.random() * 0.16);
        group.add(mesh);
        shards.push({ mesh, r: 1.95 + Math.random() * 0.62, sp: 0.08 + Math.random() * 0.1, ph: Math.random() * Math.PI * 2 });
      }
      ejects.forEach((e) => {
        e.mat.map = t;
        e.mat.needsUpdate = true;
      });
    });

    const ejectGeo = new THREE.PlaneGeometry(0.82, 1.05);
    for (let i = 0; i < 12; i++) {
      const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(ejectGeo, mat);
      mesh.visible = false;
      group.add(mesh);
      ejects.push({ mesh, mat, vel: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0 });
    }

    const N = 240;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 3.2 + Math.random() * 2.4;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
      pos[i * 3 + 2] = r * Math.cos(ph) * 0.6;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: 0xf4efe4, size: 0.022, transparent: true, opacity: 0.45, depthWrite: false })
    );
    scene.add(dust);

    const glowRed = makeGlow("rgba(193,39,45,0.5)", 0.5);
    glowRed.scale.setScalar(5.2);
    glowRed.position.set(0.7, 0.2, -2.6);
    const glowCyan = makeGlow("rgba(53,198,214,0.32)", 0.4);
    glowCyan.scale.setScalar(3.3);
    glowCyan.position.set(-1.8, -1.2, -2.4);
    scene.add(glowRed, glowCyan);

    const setSize = () => {
      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(wrap);

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let hoverTarget = 0;

    const pick = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray.intersectObject(drum, false).length > 0;
    };
    const onMove = (e: PointerEvent) => {
      const hit = pick(e);
      hoverTarget = hit ? 1 : 0;
      wrap.style.cursor = hit ? "pointer" : "";
    };
    const onLeave = () => {
      hoverTarget = 0;
      wrap.style.cursor = "";
    };
    const onDown = (e: PointerEvent) => {
      if (!pick(e)) return;
      uniforms.uInvert.value = 1;
      uniforms.uWobble.value = 0.11;
      let spawned = 0;
      for (const ej of ejects) {
        if (spawned >= 3) break;
        if (ej.life > 0) continue;
        spawned++;
        const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.7 + 0.15, Math.random() - 0.5).normalize();
        ej.mesh.position.copy(dir).multiplyScalar(1.7);
        ej.mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        ej.vel.copy(dir).multiplyScalar(2.1 + Math.random() * 1.4);
        ej.spin.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
        ej.life = 1;
        ej.mesh.visible = true;
      }
      copyRef.current();
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointerdown", onDown);

    const clock = new THREE.Clock();
    let autoY = 0;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const st = stateRef.current;
      const p = THREE.MathUtils.clamp(st.scroll, 0, 1);
      const pe = p * p;
      const k = 1 - Math.exp(-dt * 4.5);

      uniforms.uTime.value = t;
      uniforms.uInvert.value *= Math.exp(-dt * 5);
      uniforms.uWobble.value += (0.016 - uniforms.uWobble.value) * (1 - Math.exp(-dt * 3.5));
      uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * k;

      autoY += dt * 0.14;
      group.rotation.y = autoY + st.px * 0.55 + pe * 1.7;
      group.rotation.x += (st.py * 0.3 + p * 0.9 - group.rotation.x) * k;
      group.position.x += (0.62 + pe * 2.1 - group.position.x) * k;
      group.position.y += (Math.sin(t * 0.6) * 0.07 + p * 1.05 - group.position.y) * k;
      group.scale.setScalar(0.9 - 0.24 * p);

      wire.rotation.y -= dt * 0.06;
      wire.rotation.x += dt * 0.04;
      ring1.rotation.z += dt * 0.22;
      ring2.rotation.z -= dt * 0.16;

      for (const s of shards) {
        const a = t * s.sp + s.ph;
        s.mesh.position.set(Math.cos(a) * s.r, Math.sin(a * 1.3 + s.ph) * 0.6, Math.sin(a) * s.r * 0.55);
        s.mesh.rotation.y = -a + Math.PI / 2;
        s.mesh.rotation.z = Math.sin(t * 0.7 + s.ph) * 0.25;
      }

      for (const ej of ejects) {
        if (ej.life <= 0) continue;
        ej.life -= dt * 0.85;
        ej.mesh.position.addScaledVector(ej.vel, dt);
        ej.vel.y -= dt * 0.7;
        ej.vel.multiplyScalar(Math.exp(-dt * 1.1));
        ej.mesh.rotation.x += ej.spin.x * dt;
        ej.mesh.rotation.y += ej.spin.y * dt;
        ej.mesh.rotation.z += ej.spin.z * dt;
        const l = Math.max(ej.life, 0);
        ej.mat.opacity = l * 0.9;
        ej.mesh.scale.setScalar(0.55 + l * 0.55);
        if (ej.life <= 0) ej.mesh.visible = false;
      }

      dust.rotation.y = t * 0.02;
      dust.position.y = Math.sin(t * 0.25) * 0.15;
      (glowRed.material as THREE.SpriteMaterial).opacity = 0.26 + Math.sin(t * 0.8) * 0.045;
      (glowCyan.material as THREE.SpriteMaterial).opacity = 0.2 + Math.sin(t * 0.6 + 2) * 0.04;

      camera.position.x += (st.px * 0.35 - camera.position.x) * k;
      camera.position.y += (-st.py * 0.22 - camera.position.y) * k;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onDown);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === wrap) wrap.removeChild(renderer.domElement);
    };
  }, [stateRef, textureUrl]);

  return <div className="hero-canvas-wrap" ref={wrapRef} aria-hidden="true" />;
}
