"use client";
import React, { useEffect, useState, useRef } from "react";
import * as faceapi from "face-api.js";
import { useRouter } from "next/navigation";

export default function Home() {
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const router = useRouter();
  let interval;

  useEffect(() => {
    const loadModelsAndStartVideo = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);

      startVideo();
    };

    loadModelsAndStartVideo();

    //On Unmount clear the stream and interval
    return () => {
      console.log("UnMount");

      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
        streamRef.current = null;
      }
      clearInterval(interval);
    };
  }, []);

  const startVideo = () => {
    navigator.getUserMedia(
      { video: {} },
      (stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("play", handlePlay);
        }
      },
      (err) => {
        console.error(err);
      }
    );
  };

  const handlePlay = () => {
    const canvasContainer = document.getElementById("container");
    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    canvasContainer.appendChild(canvas);
    const displaySize = {
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight,
    }; // Use video's natural width and height
    faceapi.matchDimensions(canvas, displaySize);

    interval = setInterval(async () => {
      //   if (videoRef.current) {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      if (detections.length === 0) {
        console.log("cant detect");
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        setFaceDetected(false);
        return;
      }
      setFaceDetected(true);

      router.push("/home");

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      //   faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      //   }
    }, 100);
  };

  return (
    <div>
      <h1 className="text-4xl text-center m-5 bg-blue-700 md:w-2/4 mx-auto p-1">
        Face Recognition Auth System in NextJs
      </h1>
      <div id="container">
        <video
          ref={videoRef}
          id="video"
          width="720"
          height="560"
          autoPlay
          muted
        ></video>
      </div>
      {!faceDetected && (
        <p className="text-center text-2xl m-auto bg-red-500 w-2/4 mt-4 p-1">
          No face detected
        </p>
      )}
    </div>
  );
}
