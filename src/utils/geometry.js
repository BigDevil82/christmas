import * as THREE from 'three';

export const generateTreeParticles = (count = 5000, radius = 2, height = 5) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const y = Math.random() * height; // 0 to height
    const r = (1 - y / height) * radius; // Radius decreases as y increases
    const angle = Math.random() * Math.PI * 2;
    
    // Add some randomness to fill the volume, not just the surface
    const randomR = Math.sqrt(Math.random()) * r; 
    
    const x = Math.cos(angle) * randomR;
    const z = Math.sin(angle) * randomR;
    
    particles.push({
      position: new THREE.Vector3(x, y - height / 2, z),
      color: new THREE.Color().setHSL(0.3 + Math.random() * 0.1, 0.9, 0.6 + Math.random() * 0.3), // Brighter Green/Yellowish
      scale: Math.random() * 0.5 + 0.5,
    });
  }
  return particles;
};

export const generateOrnaments = (count = 300, radius = 2, height = 5) => {
  const ornaments = [];
  const colors = ['#FFD700', '#FF0000', '#00FFFF', '#FF00FF', '#FFFFFF', '#F0F8FF']; 
  
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const y = t * height;
    const r = (1 - y / height) * radius + 0.3; // Slightly outside
    
    // Spiral distribution - Tighter and more rotations
    const angle = t * Math.PI * 10; // 10 rotations
    
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    
    ornaments.push({
      position: new THREE.Vector3(x, y - height / 2, z),
      color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
      scale: Math.random() * 0.3 + 0.2, // Smaller scale for density
    });
  }
  return ornaments;
};

export const generateNebulaLayout = (count = 24, radius = 8) => {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    positions.push({
      position: new THREE.Vector3(x, 0, z),
      rotation: [0, -angle + Math.PI / 2, 0], // Face center
      id: i
    });
  }
  return positions;
};
