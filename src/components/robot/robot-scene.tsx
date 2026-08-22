import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Grid,
  Html,
  MeshReflectorMaterial,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import {
  CAMERA_PRESETS,
  HOTSPOTS,
  MODEL_URL,
  type CameraPresetId,
  type Hotspot,
  type ViewMode,
} from "@/lib/robot-twin";

const PRIMARY = "#35a9e0";
const ACCENT = "#38d39f";

type SceneProps = {
  viewMode: ViewMode;
  preset: CameraPresetId;
  scanning: boolean;
  cinematic?: boolean;
  active: boolean;
  activeHotspot: string | null;
  onHotspot: (id: string | null) => void;
  onScanDone: () => void;
};

/* ------------------------------------------------------------------ model */

function Model({
  viewMode,
  scanning,
  scanY,
  onAnchors,
}: {
  viewMode: ViewMode;
  scanning: boolean;
  scanY: React.MutableRefObject<number>;
  onAnchors: (a: Record<string, THREE.Vector3>) => void;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);

  const model = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z) / 2 || 1;
    const scale = 1 / radius;

    root.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    root.scale.setScalar(scale);

    // Resolve hotspot anchors: prefer a named GLB node, fall back to bbox ratios.
    const anchors: Record<string, THREE.Vector3> = {};
    for (const h of HOTSPOTS) {
      const node = h.node ? root.getObjectByName(h.node) : null;
      if (node) {
        anchors[h.id] = node.getWorldPosition(new THREE.Vector3());
      } else {
        const p = new THREE.Vector3(
          box.min.x + h.u[0] * size.x,
          box.min.y + h.u[1] * size.y,
          box.min.z + h.u[2] * size.z,
        );
        anchors[h.id] = p.sub(center).multiplyScalar(scale);
      }
    }

    const meshes: THREE.Mesh[] = [];
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      m.userData["origMat"] = m.material;
      m.userData["origPos"] = m.position.clone();
      meshes.push(m);
    });

    return { root, meshes, anchors };
  }, [scene]);

  useEffect(() => onAnchors(model.anchors), [model, onAnchors]);

  // View modes
  useEffect(() => {
    for (const m of model.meshes) {
      const base = m.userData["origMat"] as THREE.Material | THREE.Material[];
      const src = (Array.isArray(base) ? base[0] : base) as THREE.MeshStandardMaterial;
      let mat: THREE.Material;
      switch (viewMode) {
        case "transparent":
          mat = new THREE.MeshPhysicalMaterial({
            color: src.color ?? new THREE.Color("#9fd8f2"),
            transparent: true,
            opacity: 0.32,
            roughness: 0.15,
            metalness: 0.2,
            transmission: 0.6,
            side: THREE.DoubleSide,
          });
          break;
        case "wireframe":
          mat = new THREE.MeshBasicMaterial({ color: PRIMARY, wireframe: true });
          break;
        case "engineering":
          mat = new THREE.MeshStandardMaterial({
            color: "#0f1720",
            emissive: new THREE.Color(PRIMARY),
            emissiveIntensity: 0.28,
            roughness: 0.35,
            metalness: 0.85,
            wireframe: false,
          });
          break;
        case "xray":
          mat = new THREE.MeshBasicMaterial({
            color: PRIMARY,
            transparent: true,
            opacity: 0.22,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          break;
        default:
          mat = base as THREE.Material;
      }
      m.material = mat;
    }
  }, [viewMode, model]);

  // Exploded view + idle float
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.position.y = Math.sin(t * 0.6) * 0.035;

    const exploded = viewMode === "exploded";
    for (const m of model.meshes) {
      const orig = m.userData["origPos"] as THREE.Vector3;
      const dir = orig.clone().normalize();
      if (dir.lengthSq() === 0) dir.set(0, 1, 0);
      const target = exploded ? orig.clone().add(dir.multiplyScalar(0.35)) : orig;
      m.position.lerp(target, Math.min(1, dt * 4));
    }

    // Scan sweep highlight
    if (scanning) {
      for (const m of model.meshes) {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat && "emissive" in mat && mat.emissive) {
          const d = Math.abs(scanY.current);
          mat.emissiveIntensity = THREE.MathUtils.lerp(
            mat.emissiveIntensity ?? 0,
            d < 1.2 ? 0.5 : 0.1,
            0.1,
          );
        }
      }
    }
  });

  return (
    <group ref={group}>
      <primitive object={model.root} />
    </group>
  );
}

/* --------------------------------------------------------------- hotspots */

function HotspotMarker({
  hotspot,
  position,
  active,
  onSelect,
}: {
  hotspot: Hotspot;
  position: THREE.Vector3;
  active: boolean;
  onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    if (!ring.current) return;
    const p = 1 + Math.sin(s.clock.elapsedTime * 2.4) * 0.18;
    const k = (hover || active ? 1.45 : 1) * p;
    ring.current.scale.setScalar(k);
  });

  return (
    <group position={position}>
      <mesh
        ref={ring}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.035, 20, 20]} />
        <meshBasicMaterial color={active ? ACCENT : PRIMARY} transparent opacity={0.95} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.06, 20, 20]} />
        <meshBasicMaterial
          color={active ? ACCENT : PRIMARY}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {(hover || active) && (
        <Html center distanceFactor={6} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-md border border-primary/40 bg-background/85 px-2 py-1 text-[11px] font-medium text-foreground backdrop-blur">
            {hotspot.label}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------ scan effect */

function ScanWave({
  scanning,
  scanY,
  onDone,
}: {
  scanning: boolean;
  scanY: React.MutableRefObject<number>;
  onDone: () => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const y = useRef(-1.2);

  useEffect(() => {
    if (scanning) y.current = -1.2;
  }, [scanning]);

  useFrame((_, dt) => {
    if (!scanning || !mesh.current) return;
    y.current += dt * 0.9;
    scanY.current = y.current;
    mesh.current.position.y = y.current;
    if (y.current > 1.3) onDone();
  });

  if (!scanning) return null;
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.05, 1.35, 64]} />
      <meshBasicMaterial
        color={PRIMARY}
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------- particles */

function Particles({ count = 260 }: { count?: number }) {
  const pts = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 9;
      a[i * 3 + 1] = Math.random() * 4 - 1;
      a[i * 3 + 2] = (Math.random() - 0.5) * 9;
    }
    return a;
  }, [count]);

  useFrame((s) => {
    if (pts.current) pts.current.rotation.y = s.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color={PRIMARY}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------ camera rig */

function CameraRig({
  preset,
  cinematic,
  controls,
}: {
  preset: CameraPresetId;
  cinematic: boolean;
  controls: React.MutableRefObject<any>;
}) {
  const { camera } = useThree();
  const target = useMemo(() => {
    const p = (CAMERA_PRESETS.find((c) => c.id === preset) ?? CAMERA_PRESETS[0])!;
    return {
      pos: new THREE.Vector3(...p.pos),
      look: new THREE.Vector3(...p.target),
    };
  }, [preset]);

  useFrame((s, dt) => {
    const k = Math.min(1, dt * 2.2);
    const drift = cinematic
      ? new THREE.Vector3(
          Math.sin(s.clock.elapsedTime * 0.18) * 0.35,
          Math.sin(s.clock.elapsedTime * 0.13) * 0.18,
          Math.cos(s.clock.elapsedTime * 0.18) * 0.35,
        )
      : new THREE.Vector3();
    camera.position.lerp(target.pos.clone().add(drift), k);
    if (controls.current) {
      controls.current.target.lerp(target.look, k);
      controls.current.update();
    }
  });
  return null;
}

/* -------------------------------------------------------------- lighting */

function Lighting() {
  const key = useRef<THREE.DirectionalLight>(null);
  useFrame((s) => {
    if (key.current) key.current.intensity = 2.1 + Math.sin(s.clock.elapsedTime * 0.5) * 0.18;
  });
  return (
    <>
      <ambientLight intensity={0.45} color="#bfe6ff" />
      <directionalLight
        position={[3.5, 5, 2.5]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <pointLight position={[-3, 1.4, -2]} intensity={12} color={PRIMARY} distance={12} />
      <pointLight position={[2.6, 0.4, 2.6]} intensity={9} color={ACCENT} distance={10} />
      <spotLight position={[0, 5, 0]} angle={0.6} penumbra={1} intensity={14} color="#ffffff" />
    </>
  );
}

function FrameDriver({ active }: { active: boolean }) {
  useFrame((state) => {
    if (active) state.invalidate();
  });
  return null;
}

/* ------------------------------------------------------------------ scene */

export default function RobotScene({
  viewMode,
  preset,
  scanning,
  cinematic = false,
  active,
  activeHotspot,
  onHotspot,
  onScanDone,
}: SceneProps) {
  const controls = useRef<any>(null);
  const scanY = useRef(-1.2);
  const [anchors, setAnchors] = useState<Record<string, THREE.Vector3>>({});
  const [interacting, setInteracting] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pause = () => {
    setInteracting(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setInteracting(false), 4000);
  };

  useEffect(() => () => { if (idleTimer.current) clearTimeout(idleTimer.current); }, []);

  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 1.25]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [2.1, 1.15, 3.0], fov: 42 }}
      onPointerMissed={() => onHotspot(null)}
      className="!absolute inset-0"
    >
      <color attach="background" args={["#060b12"]} />
      <fog attach="fog" args={["#060b12", 5, 14]} />

      <FrameDriver active={active} />
      <Lighting />
      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={0.55} />
        <Model viewMode={viewMode} scanning={scanning} scanY={scanY} onAnchors={setAnchors} />
        {HOTSPOTS.map((h) =>
          anchors[h.id] ? (
            <HotspotMarker
              key={h.id}
              hotspot={h}
              position={anchors[h.id]!}
              active={activeHotspot === h.id}
              onSelect={() => onHotspot(activeHotspot === h.id ? null : h.id)}
            />
          ) : null,
        )}
      </Suspense>

      <ScanWave scanning={scanning} scanY={scanY} onDone={onScanDone} />
      <Particles />

      {/* Glass floor + digital grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <MeshReflectorMaterial
          blur={[320, 90]}
          resolution={720}
          mixBlur={1}
          mixStrength={28}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#070d15"
          metalness={0.75}
          mirror={0}
        />
      </mesh>
      <Grid
        position={[0, -1.04, 0]}
        args={[26, 26]}
        cellSize={0.4}
        cellThickness={0.5}
        cellColor={PRIMARY}
        sectionSize={2}
        sectionThickness={1}
        sectionColor={ACCENT}
        fadeDistance={16}
        fadeStrength={1.4}
        infiniteGrid
      />
      <ContactShadows position={[0, -1.03, 0]} opacity={0.5} scale={9} blur={2.6} far={3} />

      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        dampingFactor={0.07}
        enablePan
        autoRotate={!interacting && !scanning}
        autoRotateSpeed={0.55}
        minDistance={1.4}
        maxDistance={8}
        maxPolarAngle={Math.PI / 1.9}
        onStart={pause}
        onEnd={pause}
      />
      <CameraRig preset={preset} cinematic={cinematic} controls={controls} />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.65} luminanceSmoothing={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.24} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
}
