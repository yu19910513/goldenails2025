import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const NailAR = () => {
  const videoRef = useRef(null);
  const [nailPositions, setNailPositions] = useState([]);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    hands.onResults((results) => {
      if (results.multiHandLandmarks.length > 0) {
        const nails = results.multiHandLandmarks[0].slice(6, 11); // Fingertips
        setNailPositions(nails.map((point) => [point.x - 0.5, -point.y + 0.5, 0]));
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
    <div>
      <video ref={videoRef} style={{ display: "none" }} autoPlay playsInline></video>
      <Canvas>
        <ambientLight intensity={0.5} />
        {nailPositions.map((pos, index) => (
          <mesh key={index} position={pos}>
            <sphereGeometry args={[0.02, 32, 32]} />
            <meshStandardMaterial color="red" />
          </mesh>
        ))}
      </Canvas>
    </div>
  );
};

export default NailAR;
