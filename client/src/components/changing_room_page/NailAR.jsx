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
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks.length > 0) {
        const hand = results.multiHandLandmarks[0];
        const nailIndices = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky fingertips

        const nails = nailIndices.map((index) => {
          const point = hand[index];
          return [point.x - 0.5, -point.y + 0.5, 0]; // Convert coordinates
        });

        setNailPositions(nails);
      }
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
