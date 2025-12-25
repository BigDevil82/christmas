import { Float } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import useStore from '../store';
import { generateNebulaLayout, generateOrnaments, generateTreeParticles } from '../utils/geometry';

const ChristmasTree = () => {
  const { phase, setPhase, handGesture, setActivePhotoIndex } = useStore();
  const meshRef = useRef();
  const groupRef = useRef();
  const { viewport } = useThree();
  
  // Generate data with mobile optimization
  const isMobile = viewport.width < 5; // Detect mobile
  const count = isMobile ? 1500 : 5000; // Reduce particles for mobile
  const ornamentCount = isMobile ? 100 : 300; // Reduce ornaments for mobile
  
  const particleData = useMemo(() => generateTreeParticles(count), [count]);
  const ornamentData = useMemo(() => generateOrnaments(ornamentCount), [ornamentCount]);
  const nebulaLayout = useMemo(() => generateNebulaLayout(24), []);
  
  // Animation state
  const progress = useRef({ value: 0 }); // 0 = tree, 1 = exploded
  
  // Pre-calculate vectors
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArray = useMemo(() => {
    const array = new Float32Array(count * 3);
    particleData.forEach((p, i) => {
      p.color.toArray(array, i * 3);
    });
    return array;
  }, [particleData]);

  const targetPositions = useMemo(() => {
    const array = new Float32Array(count * 3);
    particleData.forEach((p, i) => {
      // Explode outwards
      const dir = p.position.clone().normalize().multiplyScalar(15 + Math.random() * 15);
      // Flatten slightly for nebula ring effect
      dir.y *= 0.2; 
      array[i * 3] = dir.x;
      array[i * 3 + 1] = dir.y;
      array[i * 3 + 2] = dir.z;
    });
    return array;
  }, [particleData]);

  // Gesture Control Logic
  useEffect(() => {
    if (phase === 'tree' && handGesture === 'Open_Palm') {
      setPhase('blooming');
    } else if (phase === 'nebula' && handGesture === 'Closed_Fist') {
      setPhase('collapsing');
    }
  }, [handGesture, phase, setPhase]);

  // Animation Transitions
  useEffect(() => {
    if (phase === 'blooming') {
      gsap.to(progress.current, {
        value: 1,
        duration: 2,
        ease: "power2.out",
        onComplete: () => setPhase('nebula')
      });
    } else if (phase === 'collapsing') {
      gsap.to(progress.current, {
        value: 0,
        duration: 2,
        ease: "power2.inOut",
        onComplete: () => setPhase('tree')
      });
    }
  }, [phase, setPhase]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const t = progress.current.value;
    
    if (meshRef.current) {
      particleData.forEach((p, i) => {
        const ox = p.position.x;
        const oy = p.position.y;
        const oz = p.position.z;
        
        const tx = targetPositions[i * 3];
        const ty = targetPositions[i * 3 + 1];
        const tz = targetPositions[i * 3 + 2];
        
        // Interpolate
        let x = THREE.MathUtils.lerp(ox, tx, t);
        let y = THREE.MathUtils.lerp(oy, ty, t);
        let z = THREE.MathUtils.lerp(oz, tz, t);
        
        // Tree Phase Effects
        if (t < 0.1) {
            // Floating
            y += Math.sin(time + i) * 0.02;
            
            // Mouse Repulsion
            const mouse = state.pointer;
            const dx = mouse.x * viewport.width / 2 - x;
            const dy = mouse.y * viewport.height / 2 - y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 2) {
                const force = (2 - dist) * 0.5;
                x -= dx * force;
                y -= dy * force;
            }
        } 
        // Nebula Phase Effects
        else if (t > 0.9) {
             // Orbit rotation
             const angle = time * 0.05;
             const rx = x * Math.cos(angle) - z * Math.sin(angle);
             const rz = x * Math.sin(angle) + z * Math.cos(angle);
             x = rx;
             z = rz;
        }

        dummy.position.set(x, y, z);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Star Shape for Top
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 0.5;
    const innerRadius = 0.2;
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  return (
    <group ref={groupRef} scale={0.8} position={[0, -0.3, 0]}>
      {/* Particles - Fragments */}
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        {isMobile ? (
          // Simpler geometry for mobile
          <boxGeometry args={[0.02, 0.02, 0.02]}>
            <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
          </boxGeometry>
        ) : (
          // Complex geometry for desktop
          <tetrahedronGeometry args={[0.02, 0]}>
            <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
          </tetrahedronGeometry>
        )}
        <meshStandardMaterial 
          vertexColors 
          roughness={isMobile ? 0.5 : 0.2} 
          metalness={isMobile ? 0.5 : 0.8} 
          emissive="#111" 
          emissiveIntensity={isMobile ? 0.2 : 0.5} 
        />
      </instancedMesh>

      {/* Ornaments - Only visible in Tree phase or exploding */}
      {(phase === 'tree' || phase === 'blooming' || phase === 'collapsing') && (
         <group>
            {ornamentData.map((data, i) => (
                <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1}>
                    <mesh 
                        position={[
                            THREE.MathUtils.lerp(data.position.x, data.position.x * 5, progress.current.value),
                            THREE.MathUtils.lerp(data.position.y, data.position.y * 5, progress.current.value),
                            THREE.MathUtils.lerp(data.position.z, data.position.z * 5, progress.current.value)
                        ]} 
                        scale={(1 - progress.current.value) * data.scale * 0.2}
                    >
                        <sphereGeometry args={[1, 32, 32]} />
                        <meshStandardMaterial color={data.color} metalness={0.9} roughness={0.1} emissive={data.color} emissiveIntensity={0.2} />
                    </mesh>
                </Float>
            ))}
            {/* Top Star */}
            <Float 
                position={[0, THREE.MathUtils.lerp(2.8, 10, progress.current.value), 0]} 
                scale={1 - progress.current.value}
                speed={3} 
                rotationIntensity={2}
            >
                <mesh rotation={[0, 0, Math.PI / 10]}>
                    <extrudeGeometry args={[starShape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }]} />
                    <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} metalness={1} roughness={0} />
                </mesh>
            </Float>
         </group>
      )}

      {/* Nebula Photos - REMOVED (Handled by PhotoGallery.jsx) */}

    </group>
  );
};

export default ChristmasTree;
