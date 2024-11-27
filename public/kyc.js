let currentStream = null;
let currentDeviceId = null; // Store the currently selected device ID
let videoElement = document.getElementById('video');
let canvas = document.getElementById('canvas');

// Initialize face-api.js
async function setupFaceAPI() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  console.log("Face API models loaded");
}

// Start webcam with the given deviceId
async function startWebcam(deviceId) {
  const constraints = {
    video: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      facingMode: 'user' // Fallback to 'user' if deviceId is not provided
    }
  };

  // Stop any existing video stream before starting a new one
  if (currentStream) {
    stopCamera();
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    currentStream = stream;
  } catch (err) {
    console.error('Error accessing camera:', err);
    handleCameraError(err);
  }
}

// Handle camera errors and provide meaningful feedback
function handleCameraError(err) {
  if (err.name === 'NotAllowedError') {
    alert('Camera access denied. Please check your device settings and grant camera permission.');
  } else if (err.name === 'NotFoundError') {
    alert('No camera found on your device.');
  } else if (err.name === 'NotReadableError') {
    alert('Camera is being used by another application or is malfunctioning.');
  } else {
    alert('Could not access the camera. Please try again.');
  }
}

// Get available video devices and allow the user to select the front or rear camera
async function getAvailableCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    // If there are no video devices (cameras) available
    if (videoDevices.length === 0) {
      alert('No camera found. Please check your device.');
      return;
    }

    // List video devices (to help with debugging)
    console.log('Available video devices:', videoDevices);
    
    // Default to the first video device (usually the front camera)
    let frontCamera = videoDevices.find(device => device.label.toLowerCase().includes('front')) || videoDevices[0];
    let rearCamera = videoDevices.find(device => device.label.toLowerCase().includes('back')) || videoDevices[1];

    // Set front and rear cameras for switching
    currentDeviceId = frontCamera.deviceId;
    startWebcam(currentDeviceId);

    // Store rear camera ID for switching later
    document.rearCamera = rearCamera.deviceId;

  } catch (err) {
    console.error('Error retrieving devices:', err);
    alert('Could not access devices. Please check your permissions.');
  }
}

// Switch between front and rear cameras
async function switchCamera() {
  if (currentDeviceId === document.rearCamera) {
    currentDeviceId = document.frontCamera; // Switch to front camera
  } else {
    currentDeviceId = document.rearCamera; // Switch to rear camera
  }

  await startWebcam(currentDeviceId);
}

// Stop the webcam
function stopCamera() {
  if (currentStream) {
    const tracks = currentStream.getTracks();
    tracks.forEach(track => track.stop());
    videoElement.srcObject = null;
    currentStream = null;
  }
}

// Capture face and extract face descriptor
async function captureFace() {
  const detections = await faceapi.detectAllFaces(videoElement)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (detections.length > 0) {
    // Draw the detections on the canvas
    const dims = faceapi.matchDimensions(canvas, videoElement, true);
    const resizedDetections = faceapi.resizeResults(detections, dims);
    canvas.innerHTML = faceapi.createCanvasFromMedia(videoElement);
    faceapi.draw.drawDetections(canvas, resizedDetections);

    // Save the face descriptor for registration
    const faceDescriptor = detections[0].descriptor;
    document.faceDescriptor = faceDescriptor;  // Store in memory temporarily
    alert("Face captured! You can now register.");
  } else {
    alert("No face detected. Please try again.");
  }
}

// Show the sign-up form
function showSignUp() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('signup-container').style.display = 'block';
  getAvailableCameras(); // Get available cameras and start with the front camera
}

// Show the login form
function showLogin() {
  document.getElementById('login-container').style.display = 'block';
  document.getElementById('signup-container').style.display = 'none';
  stopCamera();
}

// Register the user
async function register() {
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const faceDescriptor = document.faceDescriptor;

  if (!email || !password || !faceDescriptor) {
    alert("Please fill in all fields and capture your face.");
    return;
  }

  const response = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, faceDescriptor })
  });

  const data = await response.json();
  if (data.success) {
    alert("Registration successful! Please log in.");
    showLogin();
  } else {
    alert("Registration failed: " + data.message);
  }
}

// Login the user
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (data.success) {
    alert("Login successful!");
  } else {
    alert("Login failed: " + data.message);
  }
}

// Initialize the face API and start with the front camera (selfie)
setupFaceAPI();
