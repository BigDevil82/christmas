import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';
import useStore from '../store';

const HandTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const setHandGesture = useStore((state) => state.setHandGesture);
  const isVisible = useStore((state) => state.isHandTrackerVisible);
  const handLandmarkerRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    const createHandLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });
    };
    createHandLandmarker();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const enableCam = async () => {
    if (!handLandmarkerRef.current) {
      console.log("Wait! handLandmarker not loaded yet.");
      return;
    }

    if (webcamRunning) {
      setWebcamRunning(false);
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setHandGesture('None');
      return;
    }

    setWebcamRunning(true);
    
    const constraints = { video: true };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", predictWebcam);
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const predictWebcam = async () => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      let startTimeMs = performance.now();
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
      
      if (results.gestures.length > 0) {
        const gesture = results.gestures[0][0].categoryName;
        setHandGesture(gesture);
        // console.log("Detected Gesture:", gesture);
      } else {
        setHandGesture('None');
      }
    }
    if (webcamRunning) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  };

  useEffect(() => {
    if (!webcamRunning && requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, [webcamRunning]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-32 right-4 md:top-12 md:right-8 z-50 flex flex-col items-end pointer-events-auto">
      {/* Hidden Video Element */}
      <div className="relative w-0 h-0 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover transform scale-x-[-1]"
          autoPlay
          playsInline
        ></video>
      </div>
      
      <button
        onClick={enableCam}
        className={`px-3 py-1.5 rounded-full backdrop-blur-sm border transition-all text-xs font-medium flex items-center gap-2 ${
            webcamRunning 
            ? 'bg-green-500/20 border-green-500/50 text-green-200 hover:bg-green-500/30' 
            : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${webcamRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
        {webcamRunning ? 'OPEN' : 'CAMERA'}
      </button>
    </div>
  );
};

export default HandTracker;
