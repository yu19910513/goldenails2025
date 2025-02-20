import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const NailAR = () => {
  const videoRef = useRef(null);
  const [nailPositions, setNailPositions] = useState([]);
  const [selectedColor, setSelectedColor] = useState("red");

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`,
    });
  
    hands.setOptions({
      maxNumHands: 2, // Allow two hands
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });
  
    hands.onResults((results) => {
      const allNailPositions = [];
  
      // Process each hand if detected
      results.multiHandLandmarks.forEach((hand, handIndex) => {
        const nailIndices = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
  
        const nails = nailIndices.map((index) => {
          const point = hand[index];
          return [
            (point.x * 2 - 1),  // Convert to WebGL space ([-1, 1])
            -(point.y * 2 - 1), // Convert to WebGL space ([-1, 1])
            0,                   // Keep Z-axis at 0
          ];
        });
  
        // Optionally, you can adjust the position to differentiate between the hands
        // For example, adding an offset to each hand's position
        const offset = handIndex === 0 ? [0, 0, 0] : [0.2, 0, 0]; // Offset for second hand
        allNailPositions.push(...nails.map(nail => [
          nail[0] + offset[0], 
          nail[1] + offset[1], 
          nail[2] + offset[2]
        ]));
      });
  
      setNailPositions(allNailPositions);
    });
  
    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);
  

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* Video Stream */}
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        autoPlay
        playsInline
      ></video>

      {/* AR Overlay */}
      <Canvas style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
        <ambientLight intensity={0.5} />
        {nailPositions.map((pos, index) => (
          <mesh key={index} position={pos}>
            <sphereGeometry args={[0.02, 32, 32]} />
            <meshStandardMaterial color={selectedColor} />
          </mesh>
        ))}
      </Canvas>

      {/* Color Selection */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "10px",
          background: "rgba(0, 0, 0, 0.5)",
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        {["red", "blue", "green", "purple", "pink", "gold"].map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: color,
              border: "2px solid white",
            }}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default NailAR;
