"use client"

import { Suspense, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls, Html, Float } from "@react-three/drei"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout } from "lucide-react"
import * as THREE from "three"

function Stem({ height = 2, color = "#4a7c59" }: { height?: number; color?: string }) {
  return (
    <mesh position={[0, height / 2, 0]}>
      <cylinderGeometry args={[0.05, 0.08, height, 8]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  )
}

function Leaf({
  position,
  rotation,
  scale = 1,
  color = "#5a9c59",
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  scale?: number
  color?: string
}) {
  const leafRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (leafRef.current) {
      leafRef.current.rotation.z =
        rotation[2] + Math.sin(state.clock.elapsedTime * 1.5 + position[1]) * 0.05
    }
  })

  return (
    <mesh ref={leafRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[0.8, 0.3, 8, 4]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.6} />
    </mesh>
  )
}

function CornPlant() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02
  })
  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      <Stem height={2.5} />
      <Leaf position={[0.3, 0.7, 0]} rotation={[0, 0, -0.5]} />
      <Leaf position={[-0.3, 1.2, 0]} rotation={[0, Math.PI, 0.5]} />
      <Leaf position={[0.35, 1.8, 0]} rotation={[0, 0, -0.3]} />
      <mesh position={[0.2, 1.3, 0.1]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.08, 0.12, 0.4, 8]} />
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
    </group>
  )
}

function RicePlant() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.03
  })
  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      <Stem height={1.8} color="#6b8f4e" />
      {[0.4, 0.8, 1.2, 1.5].map((y, i) => (
        <Leaf
          key={i}
          position={[0.25 * (i % 2 === 0 ? 1 : -1), y, 0]}
          rotation={[0, i % 2 === 0 ? 0 : Math.PI, i % 2 === 0 ? -0.6 : 0.6]}
          color="#7cb342"
          scale={0.7}
        />
      ))}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[Math.sin(i) * 0.08, 1.7 + i * 0.03, Math.cos(i) * 0.08]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#c9b896" />
        </mesh>
      ))}
    </group>
  )
}

function WheatPlant() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.02
  })
  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      <Stem height={2} color="#b8860b" />
      <Leaf position={[0.2, 0.6, 0]} rotation={[0, 0, -0.4]} color="#daa520" scale={0.5} />
      <Leaf position={[-0.2, 0.9, 0]} rotation={[0, Math.PI, 0.4]} color="#daa520" scale={0.5} />
      <mesh position={[0, 1.9, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.35, 6]} />
        <meshStandardMaterial color="#d4a84b" />
      </mesh>
    </group>
  )
}

function GenericPlant() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02
  })
  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      <Stem height={1.6} color="#3d6b4f" />
      <Leaf position={[0.25, 0.5, 0]} rotation={[0, 0, -0.5]} />
      <Leaf position={[-0.25, 0.8, 0]} rotation={[0, Math.PI, 0.5]} />
      <Leaf position={[0.2, 1.1, 0]} rotation={[0, 0, -0.3]} color="#6aaf6a" />
    </group>
  )
}

const CROP_PLANTS: Record<string, React.ComponentType> = {
  corn: CornPlant,
  rice: RicePlant,
  wheat: WheatPlant,
  cotton: GenericPlant,
  sugarcane: GenericPlant,
  mustard: WheatPlant,
  groundnut: GenericPlant,
  millet: WheatPlant,
  soybean: GenericPlant,
  tomato: GenericPlant,
  chickpea: GenericPlant,
  moong: GenericPlant,
  potato: GenericPlant,
}

const CROP_LABELS: Record<string, string> = {
  corn: "Maize — vegetative stage",
  rice: "Paddy — tillering",
  wheat: "Wheat — stem elongation",
  default: "Crop growth preview",
}

function Scene({ cropId }: { cropId: string }) {
  const PlantComponent = CROP_PLANTS[cropId] ?? GenericPlant
  const label = CROP_LABELS[cropId] ?? CROP_LABELS.default

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 3]} intensity={1.1} castShadow />
      <pointLight position={[-3, 2, -3]} intensity={0.25} color="#fff5e1" />
      <PlantComponent />
      <Float speed={1.5} floatIntensity={0.3}>
        <Html position={[1.1, 0.8, 0]} center distanceFactor={8}>
          <div className="pointer-events-none rounded-md bg-card/95 px-2 py-1 text-xs shadow-lg backdrop-blur-sm max-w-[120px]">
            <p className="font-medium text-primary">{label}</p>
            <p className="text-muted-foreground text-[10px]">Rotate to inspect</p>
          </div>
        </Html>
      </Float>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial color="#3d2817" roughness={1} />
      </mesh>
      <Environment preset="sunset" />
      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading 3D crop...</p>
      </div>
    </Html>
  )
}

interface Plant3DViewerProps {
  cropId?: string | null
  cropName?: string
}

export function Plant3DViewer({ cropId, cropName }: Plant3DViewerProps) {
  const id = cropId ?? "corn"
  const title = cropName ? `3D — ${cropName}` : "3D Crop Preview"

  const canvasKey = useMemo(() => id, [id])

  return (
    <Card className="flex h-full min-h-[200px] flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Sprout className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-2 min-h-[180px]">
        <div className="h-full min-h-[160px] w-full overflow-hidden rounded-lg bg-gradient-to-b from-sky-100/40 to-emerald-100/50 dark:from-sky-900/20 dark:to-emerald-900/20">
          <Canvas key={canvasKey} camera={{ position: [3, 2, 4], fov: 45 }} shadows gl={{ antialias: true }}>
            <Suspense fallback={<LoadingFallback />}>
              <Scene cropId={id} />
            </Suspense>
          </Canvas>
        </div>
      </CardContent>
    </Card>
  )
}
