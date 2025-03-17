import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const Background3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Check if THREE is available
    if (!THREE) {
      console.error('THREE.js is not available');
      return;
    }

    try {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      let renderer;
      
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch (error) {
        console.error('Error creating WebGLRenderer:', error);
        return;
      }
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0);
      
      // Only append if the ref is available and doesn't already have a canvas
      if (mountRef.current && !mountRef.current.querySelector('canvas')) {
        mountRef.current.appendChild(renderer.domElement);
      } else {
        console.warn('Mount ref is not available or already has a canvas');
        return;
      }
      
      // Position camera
      camera.position.z = 30;
      
      // Create particles
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 1000; // Reduced particle count for better performance
      
      const posArray = new Float32Array(particlesCount * 3);
      const scaleArray = new Float32Array(particlesCount);
      
      // Fill with random positions
      for (let i = 0; i < particlesCount * 3; i += 3) {
        // Create a sphere distribution
        const radius = 50 * Math.random(); // Adjusted radius
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        posArray[i] = radius * Math.sin(phi) * Math.cos(theta); // x
        posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta); // y
        posArray[i + 2] = radius * Math.cos(phi); // z
        
        // Store scale for each particle
        scaleArray[i/3] = Math.random() * 0.5 + 0.3; // Smaller particles
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));
      
      // Create material with custom shader
      const particlesMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          attribute float scale;
          varying vec3 vPosition;
          
          void main() {
            vPosition = position;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = scale * 2.0 * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vPosition;
          
          void main() {
            // Create circular particles
            float r = length(gl_PointCoord - vec2(0.5));
            if (r > 0.5) discard;
            
            // Calculate distance from center for color gradient
            float distFromCenter = length(vPosition) / 50.0;
            
            // Green cybersecurity theme colors - matching reference
            vec3 color1 = vec3(0.3, 0.85, 0.3); // Brighter green
            vec3 color2 = vec3(0.0, 0.4, 0.0); // Dark green
            
            // Mix colors based on distance
            vec3 finalColor = mix(color1, color2, distFromCenter);
            
            // Add glow effect
            float glow = 1.0 - r * 2.0;
            finalColor *= glow;
            
            gl_FragColor = vec4(finalColor, glow * 0.6); // Lower opacity
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);
      
      // Create grid
      const gridSize = 100; // Adjusted grid size
      const gridDivisions = 20; // Fewer divisions
      const gridMaterial = new THREE.LineBasicMaterial({ 
        color: 0x4caf50, 
        transparent: true, 
        opacity: 0.08 // Much lower opacity to match reference
      });
      
      const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x4caf50, 0x4caf50);
      gridHelper.material = gridMaterial;
      gridHelper.position.y = -20;
      gridHelper.rotation.x = Math.PI / 2;
      scene.add(gridHelper);
      
      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Animation
      let frame = 0;
      let animationFrameId;
      
      const animate = () => {
        frame += 0.001; // Very slow animation to match reference
        
        // Rotate particles
        particles.rotation.x = frame * 0.03; // Very slow rotation
        particles.rotation.y = frame * 0.05;
        
        // Pulse effect - only update every few frames for better performance
        if (frame % 0.02 < 0.001) {
          const positions = particlesGeometry.attributes.position.array;
          const scales = particlesGeometry.attributes.scale.array;
          
          for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            const x = positions[i3];
            const y = positions[i3 + 1];
            const z = positions[i3 + 2];
            
            // Calculate distance from center
            const dist = Math.sqrt(x * x + y * y + z * z);
            
            // Pulse based on distance and time
            scales[i] = Math.sin(dist * 0.05 + frame) * 0.4 + 0.6; // Subtle pulse effect
          }
          
          particlesGeometry.attributes.scale.needsUpdate = true;
        }
        
        // Render
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };
      
      animate();
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && renderer.domElement) {
          try {
            mountRef.current.removeChild(renderer.domElement);
          } catch (error) {
            console.error('Error removing renderer from DOM:', error);
          }
        }
        cancelAnimationFrame(animationFrameId);
        scene.remove(particles);
        scene.remove(gridHelper);
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        renderer.dispose();
      };
    } catch (error) {
      console.error('Error in Background3D component:', error);
    }
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at center, rgba(18, 18, 18, 0.92) 0%, rgba(0, 0, 0, 0.98) 100%)' // Adjusted to match reference
      }}
    />
  );
};

export default Background3D;