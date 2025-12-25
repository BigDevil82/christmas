import { Environment, OrbitControls, Sparkles, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { Suspense } from 'react';
import useStore from '../store';
import ChristmasTree from './ChristmasTree';
import PhotoGallery from './PhotoGallery';

const Scene = () => {
  const phase = useStore((state) => state.phase);

  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#ffaa00" /> {/* Warm */}
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00aaff" /> {/* Cool */}
          <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} castShadow />
          
          {/* Environment */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          {/* Main Sparkles */}
          <Sparkles count={200} scale={12} size={8} speed={0.4} opacity={0.5} color="#fff" />
          {/* Background Sequins/Snowflakes */}
          <Sparkles count={500} scale={20} size={5} speed={0.2} opacity={0.3} color="#87CEEB" />
          <Sparkles count={300} scale={15} size={6} speed={0.6} opacity={0.4} color="#FFD700" />
          <Environment preset="city" />

          {/* Main Content */}
          <ChristmasTree />
          <PhotoGallery />

          {/* Controls */}
          <OrbitControls 
            enableZoom={phase === 'nebula'} 
            enablePan={false} 
            enabled={phase !== 'nebula'}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
            autoRotate={phase === 'tree'}
            autoRotateSpeed={0.5}
          />

          {/* Post Processing */}
          <EffectComposer>
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
