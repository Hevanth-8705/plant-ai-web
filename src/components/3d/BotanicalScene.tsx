import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SceneFallback } from './SceneFallback.tsx';

interface BotanicalSceneProps {
  interactive?: boolean;
}

export const BotanicalScene: React.FC<BotanicalSceneProps> = ({ interactive = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGlError, setHasWebGlError] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let cleanupFn: (() => void) | undefined;

    try {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Detect software WebGL guard
      const isSoftwareGl = (() => {
        try {
          const testCanvas = document.createElement('canvas');
          const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
          if (!gl) return true;
          const ext = gl.getExtension('WEBGL_debug_renderer_info');
          const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
          const gpu = String(gl.getParameter(param));
          gl.getExtension('WEBGL_lose_context')?.loseContext();
          return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
        } catch {
          return false;
        }
      })();

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: !isSoftwareGl,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch (e) {
        console.warn('WebGL initialization failed, falling back to 2D botanical canvas:', e);
        setHasWebGlError(true);
        return;
      }

      const width = container.clientWidth || 600;
      const height = container.clientHeight || 800;

      renderer.setSize(width, height);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.appendChild(renderer.domElement);

      // Scene & Camera
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0e241c, 0.045);

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
      camera.position.set(0, 1.4, 4.6);

      // Studio Environment Lighting
      try {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
        pmremGenerator.dispose();
      } catch {
        // Fallback lighting when PMREM fails
      }

      // Studio 3-Point Lighting Rig
      const ambientLight = new THREE.AmbientLight(0x234433, 1.2);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xdaf2da, 0x11281d, 1.4);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xfff7e6, 2.4);
      keyLight.position.set(3.5, 5, 3);
      keyLight.castShadow = !isSoftwareGl;
      if (keyLight.shadow) {
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.bias = -0.0005;
        keyLight.shadow.normalBias = 0.02;
      }
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xc5e86c, 1.6);
      rimLight.position.set(-3, 3, -2.5);
      scene.add(rimLight);

      // Main Plant Rig Group
      const plantGroup = new THREE.Group();
      plantGroup.position.set(0, -0.9, 0);
      scene.add(plantGroup);

      // Ceramic Sculpted Pot
      const ceramicMaterial = new THREE.MeshStandardMaterial({
        color: 0xf3efe4,
        roughness: 0.28,
        metalness: 0.08,
      });

      const potBodyGeo = new THREE.CylinderGeometry(0.82, 0.62, 1.15, 32);
      const potBody = new THREE.Mesh(potBodyGeo, ceramicMaterial);
      potBody.position.y = 0.575;
      potBody.castShadow = !isSoftwareGl;
      potBody.receiveShadow = !isSoftwareGl;
      plantGroup.add(potBody);

      // Pot Rim
      const rimGeo = new THREE.TorusGeometry(0.84, 0.05, 16, 32);
      rimGeo.rotateX(Math.PI / 2);
      const potRim = new THREE.Mesh(rimGeo, ceramicMaterial);
      potRim.position.y = 1.15;
      potRim.castShadow = !isSoftwareGl;
      plantGroup.add(potRim);

      // Pot Base Pedestal
      const baseGeo = new THREE.CylinderGeometry(0.64, 0.64, 0.06, 32);
      const potBase = new THREE.Mesh(baseGeo, ceramicMaterial);
      potBase.position.y = 0.03;
      potBase.receiveShadow = !isSoftwareGl;
      plantGroup.add(potBase);

      // Potting Soil Disc
      const soilGeo = new THREE.CylinderGeometry(0.79, 0.79, 0.1, 32);
      const soilMaterial = new THREE.MeshStandardMaterial({
        color: 0x241917,
        roughness: 0.96,
        metalness: 0.02,
      });
      const soil = new THREE.Mesh(soilGeo, soilMaterial);
      soil.position.y = 1.1;
      soil.receiveShadow = !isSoftwareGl;
      plantGroup.add(soil);

      // Ground Contact Shadow Disk
      const contactShadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
      const contactShadowMat = new THREE.MeshBasicMaterial({
        color: 0x07150f,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      });
      const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
      contactShadow.rotation.x = -Math.PI / 2;
      contactShadow.position.y = 0.002;
      plantGroup.add(contactShadow);

      // Stems and Sculptural Tropical Leaves
      const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x226b42,
        roughness: 0.45,
        metalness: 0.05,
      });

      function createLeafGeometry(scaleX = 1, scaleY = 1): THREE.BufferGeometry {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.bezierCurveTo(0.35 * scaleX, 0.25 * scaleY, 0.65 * scaleX, 0.7 * scaleY, 0.5 * scaleX, 1.2 * scaleY);
        shape.bezierCurveTo(0.4 * scaleX, 1.6 * scaleY, 0.15 * scaleX, 1.9 * scaleY, 0, 2.2 * scaleY);
        shape.bezierCurveTo(-0.15 * scaleX, 1.9 * scaleY, -0.4 * scaleX, 1.6 * scaleY, -0.5 * scaleX, 1.2 * scaleY);
        shape.bezierCurveTo(-0.65 * scaleX, 0.7 * scaleY, -0.35 * scaleX, 0.25 * scaleY, 0, 0);

        const extrudeSettings = {
          steps: 1,
          depth: 0.018,
          bevelEnabled: true,
          bevelThickness: 0.012,
          bevelSize: 0.012,
          bevelSegments: 2,
        };

        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.center();
        return geo;
      }

      const leafShades = [0x1e613b, 0x267a4b, 0x1b5433, 0x2d8a54, 0x1f663f, 0x237045, 0x194d2e];
      const leafNodes: Array<{ group: THREE.Group; initialRotation: THREE.Euler; swaySpeed: number; swayPhase: number }> = [];

      const leafConfigs = [
        { angle: 0.2, length: 1.5, droop: 0.65, size: 0.95, height: 1.15, leafRotZ: -0.2 },
        { angle: 1.1, length: 1.7, droop: 0.72, size: 1.05, height: 1.25, leafRotZ: -0.4 },
        { angle: 2.1, length: 1.4, droop: 0.68, size: 0.9, height: 1.18, leafRotZ: 0.3 },
        { angle: 3.2, length: 1.85, droop: 0.8, size: 1.15, height: 1.35, leafRotZ: 0.4 },
        { angle: 4.2, length: 1.6, droop: 0.75, size: 1.0, height: 1.22, leafRotZ: -0.35 },
        { angle: 5.1, length: 1.45, droop: 0.62, size: 0.88, height: 1.16, leafRotZ: 0.25 },
        { angle: 5.9, length: 1.9, droop: 0.82, size: 1.18, height: 1.38, leafRotZ: -0.15 },
      ];

      leafConfigs.forEach((cfg, idx) => {
        const branchGroup = new THREE.Group();
        branchGroup.position.set(0, cfg.height, 0);
        branchGroup.rotation.y = cfg.angle;

        const stemCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(cfg.length * 0.4, cfg.length * 0.35, 0),
          new THREE.Vector3(cfg.length * 0.85, -cfg.droop * 0.4, 0)
        );
        const stemGeo = new THREE.TubeGeometry(stemCurve, 16, 0.028, 8, false);
        const stemMesh = new THREE.Mesh(stemGeo, stemMaterial);
        stemMesh.castShadow = !isSoftwareGl;
        branchGroup.add(stemMesh);

        const leafGeo = createLeafGeometry(cfg.size * 0.7, cfg.size * 0.8);
        const leafMat = new THREE.MeshStandardMaterial({
          color: leafShades[idx % leafShades.length],
          roughness: 0.26,
          metalness: 0.04,
          side: THREE.DoubleSide,
        });

        const leafMesh = new THREE.Mesh(leafGeo, leafMat);
        leafMesh.position.set(cfg.length * 0.85, -cfg.droop * 0.4, 0);
        leafMesh.rotation.z = -Math.PI / 3 + cfg.leafRotZ;
        leafMesh.rotation.y = Math.PI / 4;
        leafMesh.rotation.x = 0.25;
        leafMesh.scale.set(0.75, 0.75, 0.75);
        leafMesh.castShadow = !isSoftwareGl;
        leafMesh.receiveShadow = !isSoftwareGl;
        branchGroup.add(leafMesh);

        plantGroup.add(branchGroup);

        leafNodes.push({
          group: branchGroup,
          initialRotation: branchGroup.rotation.clone(),
          swaySpeed: 0.8 + idx * 0.15,
          swayPhase: idx * 0.9,
        });
      });

      // Ambient Floating Spores / Pollen Particles
      const particleCount = isSoftwareGl ? 20 : 55;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const particleSpeeds: number[] = [];

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 4.5;
        positions[i * 3 + 1] = Math.random() * 3.5 - 0.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
        particleSpeeds.push(0.3 + Math.random() * 0.6);
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMat = new THREE.PointsMaterial({
        color: 0xc5e86c,
        size: 0.04,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Pointer Interaction & Parallax
      let pointerX = 0;
      let pointerY = 0;
      let targetPlantRotY = 0;
      let targetPlantRotX = 0;

      const handlePointerMove = (e: MouseEvent) => {
        if (!interactive || prefersReducedMotion) return;
        const rect = container.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        pointerX = x;
        pointerY = y;
        targetPlantRotY = x * 0.5;
        targetPlantRotX = y * 0.2;
      };

      window.addEventListener('mousemove', handlePointerMove);

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth || 600;
        const h = container.clientHeight || 800;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      // Animation Render Loop
      let animationFrameId: number;
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        if (!prefersReducedMotion) {
          plantGroup.rotation.y = THREE.MathUtils.damp(plantGroup.rotation.y, targetPlantRotY, 3.5, delta);
          plantGroup.rotation.x = THREE.MathUtils.damp(plantGroup.rotation.x, targetPlantRotX, 3.5, delta);

          leafNodes.forEach((node) => {
            const sway = Math.sin(elapsed * node.swaySpeed + node.swayPhase) * 0.025;
            node.group.rotation.z = node.initialRotation.z + sway;
          });

          const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < particleCount; i++) {
            let y = posAttr.getY(i);
            y += particleSpeeds[i] * delta * 0.2;
            if (y > 3.0) y = -0.5;
            posAttr.setY(i, y);

            let x = posAttr.getX(i);
            x += Math.sin(elapsed + i) * 0.001;
            posAttr.setX(i, x);
          }
          posAttr.needsUpdate = true;
        }

        renderer.render(scene, camera);
      };

      animate();

      cleanupFn = () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('resize', handleResize);

        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }

        renderer.dispose();
        potBodyGeo.dispose();
        rimGeo.dispose();
        baseGeo.dispose();
        soilGeo.dispose();
        contactShadowGeo.dispose();
        particleGeo.dispose();
        ceramicMaterial.dispose();
        soilMaterial.dispose();
        contactShadowMat.dispose();
        particleMat.dispose();
        stemMaterial.dispose();
      };
    } catch (err) {
      console.warn('Botanical 3D scene fallback activated:', err);
      setHasWebGlError(true);
    }

    return () => {
      cleanupFn?.();
    };
  }, [interactive]);

  if (hasWebGlError) {
    return <SceneFallback reason="WebGL unavailable" />;
  }

  return (
    <div className="relative w-full h-full min-h-[450px] overflow-hidden bg-gradient-to-br from-[#102A20] via-[#143327] to-[#0A1B14] select-none">
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-lime-300/10 via-transparent to-black/40" />

      <div className="absolute top-8 left-8 z-10 space-y-1 pointer-events-none max-w-sm">
        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-300/80 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">
          Live Botanical Space
        </span>
        <h2 className="text-2xl font-bold font-serif text-[#F7F5EC] tracking-tight">
          Every great garden starts with you.
        </h2>
        <p className="text-xs text-stone-300/80 leading-relaxed pt-1">
          Your personal sanctuary to nurture plants, track growth milestones, and live greener every day.
        </p>
      </div>

      <div className="absolute bottom-6 left-8 z-10 pointer-events-none hidden sm:block">
        <p className="text-[11px] text-emerald-200/60 italic font-serif">
          “Small seeds grow into beautiful beginnings.”
        </p>
      </div>
    </div>
  );
};
