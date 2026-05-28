"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    Grid,
    Environment,
    GizmoHelper,
    GizmoViewport,
    Center,
} from "@react-three/drei";
import {
    Suspense,
    useEffect,
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
} from "react";
import * as THREE from "three";
import SceneStats from "./SceneStats";

interface Stats {
    polys: number;
    verts: number;
    materials: number;
}

/* ── Demo torus knot shown when no model is loaded ── */
function DemoMesh() {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((_, dt) => {
        if (ref.current) {
            ref.current.rotation.y += dt * 0.3;
            ref.current.rotation.x += dt * 0.1;
        }
    });
    return (
        <mesh ref={ref}>
            <torusKnotGeometry args={[1, 0.35, 160, 32]} />
            <meshStandardMaterial
                color="#00FF66"
                metalness={0.7}
                roughness={0.15}
                envMapIntensity={1.2}
            />
        </mesh>
    );
}

/* ── Loads the actual model inside the Canvas ── */
function ModelScene({
    url,
    ext,
    onLoad,
}: {
    url: string;
    ext: string;
    onLoad: (obj: THREE.Object3D, stats: Stats) => void;
}) {
    const [object, setObject] = useState<THREE.Object3D | null>(null);
    const { scene: threeScene } = useThree();

    useEffect(() => {
        let cancelled = false;

        async function load() {
            let obj: THREE.Object3D | null = null;

            try {
                if (ext === "glb" || ext === "gltf") {
                    const { GLTFLoader } = await import(
                        "three/examples/jsm/loaders/GLTFLoader.js"
                    );
                    const { DRACOLoader } = await import(
                        "three/examples/jsm/loaders/DRACOLoader.js"
                    );
                    const loader = new GLTFLoader();
                    const draco = new DRACOLoader();
                    draco.setDecoderPath(
                        "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
                    );
                    loader.setDRACOLoader(draco);
                    const gltf = await loader.loadAsync(url);
                    obj = gltf.scene;
                } else if (ext === "obj") {
                    const { OBJLoader } = await import(
                        "three/examples/jsm/loaders/OBJLoader.js"
                    );
                    obj = await new OBJLoader().loadAsync(url);
                } else if (ext === "stl") {
                    const { STLLoader } = await import(
                        "three/examples/jsm/loaders/STLLoader.js"
                    );
                    const geo = await new STLLoader().loadAsync(url);
                    geo.computeVertexNormals();
                    obj = new THREE.Mesh(
                        geo,
                        new THREE.MeshStandardMaterial({
                            color: 0x00ff66,
                            metalness: 0.3,
                            roughness: 0.4,
                        })
                    );
                } else if (ext === "fbx") {
                    const { FBXLoader } = await import(
                        "three/examples/jsm/loaders/FBXLoader.js"
                    );
                    obj = await new FBXLoader().loadAsync(url);
                }
            } catch (err) {
                console.error("Model load error:", err);
                return;
            }

            if (cancelled || !obj) return;

            /* Centre + normalise to fit in a 2-unit bounding box */
            const box = new THREE.Box3().setFromObject(obj);
            const centre = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = 2 / maxDim;
            obj.position.copy(centre.multiplyScalar(-scale));
            obj.scale.setScalar(scale);

            /* Collect stats */
            let polys = 0,
                verts = 0;
            const mats = new Set<THREE.Material>();
            obj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const geo = child.geometry as THREE.BufferGeometry;
                    const pos = geo.attributes.position;
                    verts += pos?.count ?? 0;
                    polys += geo.index
                        ? geo.index.count / 3
                        : (pos?.count ?? 0) / 3;
                    const m = child.material;
                    if (Array.isArray(m)) m.forEach((x) => mats.add(x));
                    else mats.add(m);
                }
            });

            setObject(obj);
            onLoad(obj, {
                polys: Math.round(polys),
                verts,
                materials: mats.size,
            });
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [url, ext, onLoad, threeScene]);

    if (!object) return null;
    return <primitive object={object} />;
}

/* ── Loading spinner that lives inside the Canvas ── */
function Spinner() {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((_, dt) => {
        if (ref.current) ref.current.rotation.y += dt * 2;
    });
    return (
        <mesh ref={ref}>
            <torusGeometry args={[0.6, 0.08, 16, 60]} />
            <meshStandardMaterial color="#00FF66" wireframe />
        </mesh>
    );
}

/* ── Public API exposed via forwardRef ── */
export interface ModelViewerHandle {
    getScene: () => THREE.Object3D | null;
}

interface ModelViewerProps {
    url?: string | null;
    ext?: string | null;
    onSceneLoad?: (scene: THREE.Object3D) => void;
    className?: string;
}

const ModelViewer = forwardRef<ModelViewerHandle, ModelViewerProps>(
    function ModelViewer({ url, ext, onSceneLoad, className }, ref) {
        const [stats, setStats] = useState<Stats | null>(null);
        const [loading, setLoading] = useState(false);
        const sceneRef = useRef<THREE.Object3D | null>(null);

        useImperativeHandle(ref, () => ({
            getScene: () => sceneRef.current,
        }));

        const handleLoad = (obj: THREE.Object3D, s: Stats) => {
            sceneRef.current = obj;
            setStats(s);
            setLoading(false);
            onSceneLoad?.(obj);
        };

        useEffect(() => {
            if (url) {
                setLoading(true);
                setStats(null);
            }
        }, [url]);

        return (
            <div className={`relative ${className ?? "w-full h-full"}`}>
                <Canvas
                    camera={{ position: [3.5, 2.5, 3.5], fov: 45 }}
                    gl={{ antialias: true, alpha: false }}
                    style={{ background: "#050A14" }}
                    shadows
                >
                    <ambientLight intensity={0.5} />
                    <directionalLight
                        position={[5, 10, 5]}
                        intensity={1.5}
                        castShadow
                        shadow-mapSize={[2048, 2048]}
                    />
                    <directionalLight position={[-5, -3, -5]} intensity={0.4} />

                    <Suspense fallback={<Spinner />}>
                        {url && ext ? (
                            <Center>
                                <ModelScene url={url} ext={ext} onLoad={handleLoad} />
                            </Center>
                        ) : (
                            <DemoMesh />
                        )}
                        <Environment preset="studio" />
                    </Suspense>

                    <Grid
                        args={[30, 30]}
                        cellColor="#1E2D4A"
                        sectionColor="#243452"
                        fadeDistance={20}
                        position={[0, -1.6, 0]}
                    />

                    <OrbitControls
                        makeDefault
                        enableDamping
                        dampingFactor={0.06}
                        minDistance={0.5}
                        maxDistance={30}
                    />

                    <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                        <GizmoViewport
                            axisColors={["#FF4D6D", "#00FF88", "#00FF66"]}
                            labelColor="white"
                        />
                    </GizmoHelper>
                </Canvas>

                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-omni-bg/60 backdrop-blur-sm pointer-events-none">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-omni-accent border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-omni-muted">Loading model…</p>
                        </div>
                    </div>
                )}

                {/* Scene stats badge */}
                {stats && !loading && <SceneStats stats={stats} />}

                {/* No-model hint */}
                {!url && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
                        <span className="badge-green text-xs px-3 py-1">Demo scene — upload a model to view it</span>
                    </div>
                )}
            </div>
        );
    }
);

export default ModelViewer;
