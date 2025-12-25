import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import useStore from '../store';

const PhotoGallery = () => {
  const { phase, setPhase, activePhotoIndex, setActivePhotoIndex } = useStore();
  const groupRef = useRef();
  const { viewport, camera } = useThree();
  
  // Load textures - you can easily modify this array to add/remove photos
  const textureUrls = useMemo(() => {
    // Simply list your image files here - add or remove as needed
    const imageFiles = [
      '/imgs/1.jpg', '/imgs/2.jpg', '/imgs/3.jpg', '/imgs/4.jpg',
      '/imgs/5.jpg', '/imgs/6.jpg', '/imgs/7.jpg', '/imgs/8.jpg',
      '/imgs/9.jpg', '/imgs/10.jpg', '/imgs/11.jpg', '/imgs/12.jpg',
      '/imgs/13.jpg'
      // Add more image paths here as needed
      // '/imgs/14.jpg', '/imgs/15.jpg', etc.
    ];
    return imageFiles;
  }, []);
  
  const textures = useTexture(textureUrls);
  const photoCount = textureUrls.length;

  // State for drag interaction
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const isDragGesture = useRef(false);

  // Initialize active photo index if not set
  useEffect(() => {
    if (activePhotoIndex === null) setActivePhotoIndex(0);
  }, [activePhotoIndex, setActivePhotoIndex]);

  // Reset Camera on Blooming/Nebula Entry
  useEffect(() => {
    if (phase === 'blooming' || phase === 'nebula') {
      // Kill any existing tweens to prevent conflict
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(camera.rotation);
      
      gsap.to(camera.position, {
        x: 0, y: 0, z: 10,
        duration: 1.5,
        ease: "power2.inOut"
      });
      gsap.to(camera.rotation, {
        x: 0, y: 0, z: 0,
        duration: 1.5,
        ease: "power2.inOut"
      });
    }
  }, [phase, camera]);

  // Calculate Tree Positions (Spiral)
  const treePositions = useMemo(() => {
    const positions = [];
    const count = photoCount;
    const height = 3.5; // Slightly reduced height
    const radiusBottom = 2.0; // Reduced bottom radius
    const radiusTop = 0.5;
    
    if (count === 0) return positions;
    
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1); // Handle single photo case
      const angle = t * Math.PI * 3; // 2 rotations
      
      // Spiral from bottom to top, shifted up slightly
      const y = -height / 2 - 0.5 + 0.5 + t * height; 
      
      // Radius decreases as we go up
      const r = THREE.MathUtils.lerp(radiusBottom, radiusTop, t);
      
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      
      positions.push({
        pos: new THREE.Vector3(x, y, z),
        rot: new THREE.Euler(0, -angle, 0), // Face outwards roughly
        scale: 1 - t * 0.5 // Get smaller at top (1 -> 0.5)
      });
    }
    return positions;
  }, [photoCount]);

  // Calculate aspect ratios
  const aspectRatios = useMemo(() => {
    return textures.map(texture => {
        if (texture.image) {
            return texture.image.width / texture.image.height;
        }
        return 1;
    });
  }, [textures]);

  // Refs for individual photo meshes to animate them
  const photoRefs = useRef([]);

  // Handle Click to Explode (Debugging/Alternative)
  const handleClick = (index) => {
    if (isDragGesture.current) return; // Ignore clicks if dragging

    if (phase === 'tree') {
      setActivePhotoIndex(index);
      setPhase('blooming');
    } else if (phase === 'nebula') {
        // If clicking a side photo, switch to it
        let d = index - activePhotoIndex;
        const halfCount = Math.floor(photoCount / 2);
        if (d > halfCount) d -= photoCount;
        if (d < -halfCount) d += photoCount;
        if (d !== 0) setActivePhotoIndex(index);
    }
  };

  // Handle Swipe/Drag for Gallery
  const handlePointerDown = (e) => {
    if (phase !== 'nebula') return;
    e.stopPropagation(); // Prevent OrbitControls from messing with us
    setIsDragging(true);
    setStartX(e.clientX);
    isDragGesture.current = false;
  };

  const handlePointerUp = (e) => {
    if (phase !== 'nebula' || !isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    const diff = e.clientX - startX;
    const threshold = 30; // Lower threshold for mobile

    if (Math.abs(diff) > threshold) {
      isDragGesture.current = true; // Mark as drag
      if (diff > 0) {
        // Swipe Right -> Previous Photo
        setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photoCount - 1));
      } else {
        // Swipe Left -> Next Photo
        setActivePhotoIndex((prev) => (prev < photoCount - 1 ? prev + 1 : 0));
      }
    }
  };

  useFrame((state, delta) => {
    photoRefs.current.forEach((ref, i) => {
      if (!ref) return;

      let targetPos = new THREE.Vector3();
      let targetRot = new THREE.Euler();
      let targetScale = 1;

      if (phase === 'tree') {
        // Follow tree spiral
        const data = treePositions[i];
        targetPos.copy(data.pos);
        
        // Float slightly
        targetPos.y += Math.sin(state.clock.elapsedTime + i) * 0.05;
        
        // Look away from center
        const lookAtPos = new THREE.Vector3(0, targetPos.y, 0);
        ref.lookAt(lookAtPos);
        ref.rotateY(Math.PI); // Flip to face out
        
        targetScale = 0.3 * data.scale; // Base scale * spiral scale
      } else if (phase === 'nebula' || phase === 'blooming') {
        // Gallery Layout - Flat Strip
        let d = i - activePhotoIndex;
        const halfCount = Math.floor(photoCount / 2);
        if (d > halfCount) d -= photoCount;
        if (d < -halfCount) d += photoCount;

        // Mobile adjustment
        const isMobile = viewport.width < 5;
        const baseScale = isMobile ? 0.5 : 1.0; // Slightly smaller base scale for mobile
        
        // Overlap settings
        // We want neighbors to be behind and overlapping
        const spacing = isMobile ? 0.7 : 1.8; // Increased spacing slightly for mobile to prevent too much overlap
        
        targetPos.set(d * spacing, 0, 6);
        targetRot.set(0, 0, 0);

        if (d === 0) {
            targetScale = 1.5 * baseScale;
            targetPos.z = 7; // Front
        } else {
            targetScale = 1.0 * baseScale;
            // Push back based on distance to create depth stack
            targetPos.z = 7 - Math.abs(d) * 0.5; 
        }
      } else if (phase === 'collapsing') {
         const data = treePositions[i];
         targetPos.copy(data.pos);
         targetScale = 0.3 * data.scale;
      }

      // Smooth interpolation
      ref.position.lerp(targetPos, 0.1);
      
      // Rotation interpolation
      if (phase === 'tree') {
          // In tree phase, we set rotation via lookAt above. 
      } else {
          // Manual lerp for gallery
          ref.rotation.x = THREE.MathUtils.lerp(ref.rotation.x, targetRot.x, 0.1);
          ref.rotation.y = THREE.MathUtils.lerp(ref.rotation.y, targetRot.y, 0.1);
          ref.rotation.z = THREE.MathUtils.lerp(ref.rotation.z, targetRot.z, 0.1);
      }
      
      // Apply aspect ratio to scale with mobile-friendly constraints
      const aspect = aspectRatios[i] || 1;
      
      // Max Width/Height Constraints for mobile
      const isMobile = viewport.width < 5;
      const maxWidth = isMobile ? 1.2 : 4.0; // Reduced max width for mobile
      const maxHeight = isMobile ? 1.6 : 3.0; // Max height constraint
      
      let finalScaleX, finalScaleY;
      
      if (aspect >= 1) {
        // Horizontal or square images: prioritize fitting width
        finalScaleX = targetScale;
        finalScaleY = targetScale / aspect;
        
        // Ensure width doesn't exceed max
        if (finalScaleX > maxWidth) {
          const ratio = maxWidth / finalScaleX;
          finalScaleX *= ratio;
          finalScaleY *= ratio;
        }
      } else {
        // Vertical images: prioritize fitting height  
        finalScaleX = targetScale * aspect;
        finalScaleY = targetScale;
        
        // Ensure height doesn't exceed max
        if (finalScaleY > maxHeight) {
          const ratio = maxHeight / finalScaleY;
          finalScaleX *= ratio;
          finalScaleY *= ratio;
        }
        
        // Also check width constraint for very wide vertical images
        if (finalScaleX > maxWidth) {
          const ratio = maxWidth / finalScaleX;
          finalScaleX *= ratio;
          finalScaleY *= ratio;
        }
      }

      ref.scale.set(
          THREE.MathUtils.lerp(ref.scale.x, finalScaleX, 0.1),
          THREE.MathUtils.lerp(ref.scale.y, finalScaleY, 0.1),
          THREE.MathUtils.lerp(ref.scale.z, targetScale, 0.1)
      );
    });
  });

  return (
    <group 
      ref={groupRef} 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={(e) => isDragging && e.stopPropagation()} 
    >
      {/* Invisible Plane for Hit Testing */}
      {phase === 'nebula' && (
        <mesh position={[0, 0, 5]} visible={false}>
            <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
            <meshBasicMaterial />
        </mesh>
      )}

      {textures.map((texture, i) => (
        <group 
            key={i} 
            ref={(el) => (photoRefs.current[i] = el)}
            onClick={(e) => {
                e.stopPropagation();
                handleClick(i);
            }}
        >
          {/* Polaroid Frame - Adjusted for aspect ratio */}
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[1.2, 1.2, 0.05]} /> 
            <meshStandardMaterial color="#f0f0f0" roughness={0.5} metalness={0.1} />
          </mesh>
          {/* Photo */}
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default PhotoGallery;
