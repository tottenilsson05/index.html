import * as faceapi from 'face-api.js';

const imageUpload = document.getElementById('imageUpload');
const originalImage = document.getElementById('originalImage');
const outputCanvas = document.getElementById('outputCanvas');
const gingerifyButton = document.getElementById('gingerifyButton');
const statusDiv = document.getElementById('status');

let modelsLoaded = false;
let currentImage = null;

// --- Model Loading ---
async function loadModels() {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';
    statusDiv.textContent = 'Loading face detection models...';
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            // faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL) // Not strictly needed for this task
        ]);
        modelsLoaded = true;
        statusDiv.textContent = 'Models loaded. Upload an image.';
        console.log("Models loaded successfully");
    } catch (error) {
        console.error("Error loading models:", error);
        statusDiv.textContent = 'Error loading models. Please refresh.';
    }
}

// --- Image Handling ---
imageUpload.addEventListener('change', async () => {
    if (imageUpload.files.length > 0) {
        const file = imageUpload.files[0];
        const imageUrl = URL.createObjectURL(file);
        originalImage.src = imageUrl;
        originalImage.style.display = 'block';
        outputCanvas.getContext('2d').clearRect(0, 0, outputCanvas.width, outputCanvas.height); // Clear previous result
        gingerifyButton.disabled = true; // Disable until image is loaded and processed
        statusDiv.textContent = 'Loading image...';

        originalImage.onload = () => {
            currentImage = originalImage;
            if (modelsLoaded) {
                 gingerifyButton.disabled = false;
                 statusDiv.textContent = 'Image loaded. Ready to Gingerify!';
            } else {
                 statusDiv.textContent = 'Image loaded, but models are still loading...';
            }
            // Match canvas size to image display size (optional, could resize later)
             // outputCanvas.width = originalImage.clientWidth;
             // outputCanvas.height = originalImage.clientHeight;
        };
        originalImage.onerror = () => {
            statusDiv.textContent = 'Error loading image.';
            currentImage = null;
        };
    }
});

// --- Gingerification Logic ---
gingerifyButton.addEventListener('click', async () => {
    if (!currentImage || !modelsLoaded) {
        statusDiv.textContent = 'Please upload an image first.';
        return;
    }

    statusDiv.textContent = 'Detecting face and processing...';
    gingerifyButton.disabled = true;

    try {
        // Set canvas dimensions based on the *natural* image size for processing
        outputCanvas.width = currentImage.naturalWidth;
        outputCanvas.height = currentImage.naturalHeight;
        const ctx = outputCanvas.getContext('2d', { willReadFrequently: true }); // Optimization hint
        ctx.drawImage(currentImage, 0, 0, outputCanvas.width, outputCanvas.height);

        // Detect face and landmarks
        const detections = await faceapi.detectAllFaces(
            outputCanvas, // Use canvas as input for detection
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks();

        if (detections.length === 0) {
            statusDiv.textContent = 'No face detected. Cannot gingerify.';
            gingerifyButton.disabled = false; // Re-enable if they want to try again maybe?
            return;
        }

        statusDiv.textContent = `Processing ${detections.length} face(s)...`;

        // Process the first detected face (can be extended for multiple faces)
        const detection = detections[0];
        const landmarks = detection.landmarks;
        const jawOutline = landmarks.getJawOutline();
        const leftEyebrow = landmarks.getLeftEyebrow();
        const rightEyebrow = landmarks.getRightEyebrow();

        // --- Simple Hair Area Estimation ---
        // Find the top-most point of the eyebrows and jawline
        const faceBox = detection.detection.box;
        const topMostEyebrowY = Math.min(...leftEyebrow.map(p => p.y), ...rightEyebrow.map(p => p.y));
        // Define hair region roughly above the eyebrows within the face box width
        const hairRegion = {
            x: faceBox.x,
            y: faceBox.y, // Start from top of detection box
            width: faceBox.width,
            height: Math.max(0, topMostEyebrowY - faceBox.y) * 1.2 // Area above eyebrows, maybe slightly more
        };

        // Clamp region to canvas bounds
        hairRegion.x = Math.max(0, hairRegion.x);
        hairRegion.y = Math.max(0, hairRegion.y);
        hairRegion.width = Math.min(outputCanvas.width - hairRegion.x, hairRegion.width);
        hairRegion.height = Math.min(outputCanvas.height - hairRegion.y, hairRegion.height);

        // Get image data for the estimated hair region
        if (hairRegion.width <= 0 || hairRegion.height <= 0) {
             console.warn("Calculated hair region has zero size.");
             statusDiv.textContent = 'Could not estimate hair region effectively.';
             gingerifyButton.disabled = false;
             return;
        }

        const imageData = ctx.getImageData(hairRegion.x, hairRegion.y, hairRegion.width, hairRegion.height);
        const data = imageData.data;

        // --- Pixel Manipulation (Basic Hair Coloring) ---
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // const a = data[i + 3]; // Alpha - usually keep as is

            // Simple heuristic: Target darker pixels (likely hair)
            // This is VERY basic and will color other dark areas too!
            const brightness = (r + g + b) / 3;
            if (brightness < 100) { // Adjust this threshold
                // Shift towards orange/red
                // Stronger red/orange tint, less green/blue
                data[i] = Math.min(255, r + 100); // More Red
                data[i + 1] = Math.max(0, Math.min(255, g + 20)); // A bit more Green (for orange)
                data[i + 2] = Math.max(0, b - 50);  // Less Blue
            }
             // --- More advanced HSL approach (Example - requires HSL conversion functions) ---
             /*
             const hsl = rgbToHsl(r, g, b);
             const hue = hsl[0];
             const saturation = hsl[1];
             const lightness = hsl[2];

             // Check if it's not too light (skin/background) and has some saturation
             if (lightness < 0.7 && saturation > 0.1 && lightness > 0.05) {
                 // Shift hue towards orange/red (e.g., 15-40 degrees)
                 const targetHue = 25 / 360; // Target orange hue
                 const newHue = targetHue; // Force hue for simplicity here, better blend needed
                 const newSaturation = Math.min(1, saturation * 1.2 + 0.2); // Increase saturation
                 const newLightness = Math.min(1, lightness * 1.1); // Slightly lighten

                 const newRgb = hslToRgb(newHue, newSaturation, newLightness);
                 data[i] = newRgb[0];
                 data[i + 1] = newRgb[1];
                 data[i + 2] = newRgb[2];
             }
             */
        }

        // Put the modified data back
        ctx.putImageData(imageData, hairRegion.x, hairRegion.y);

        // --- Optional: Add Freckles ---
        // addFreckles(ctx, landmarks); // Implement this function if desired

        statusDiv.textContent = 'Processing complete!';

    } catch (error) {
        console.error("Error during gingerification:", error);
        statusDiv.textContent = 'An error occurred during processing.';
        // Draw original image back onto canvas in case of error during processing
        const ctx = outputCanvas.getContext('2d');
         ctx.drawImage(currentImage, 0, 0, outputCanvas.width, outputCanvas.height);
    } finally {
        gingerifyButton.disabled = false; // Re-enable button
    }
});


// --- Optional Freckle Function ---
/*
function addFreckles(ctx, landmarks) {
    const nose = landmarks.getNose();
    const leftCheek = landmarks.getLeftEyeBrow(); // Approx cheek area below eye
    const rightCheek = landmarks.getRightEyeBrow(); // Approx cheek area below eye

    // Simple estimation of cheek center points
    const leftCheekCenter = {
        x: (leftCheek[0].x + leftCheek[4].x) / 2,
        y: (nose[0].y + nose[6].y) / 2 + (leftCheek[0].y - nose[0].y) * 0.5 // Below eyebrow, around nose bridge height
    };
     const rightCheekCenter = {
        x: (rightCheek[0].x + rightCheek[4].x) / 2,
        y: (nose[0].y + nose[6].y) / 2 + (rightCheek[0].y - nose[0].y) * 0.5
    };

    const freckleCount = 50; // Number of freckles per side
    const freckleRadius = Math.max(1, ctx.canvas.width * 0.002); // Size based on image width
    const spread = ctx.canvas.width * 0.05; // How far freckles spread

    ctx.fillStyle = 'rgba(139, 69, 19, 0.5)'; // Brownish, semi-transparent

    for (let i = 0; i < freckleCount; i++) {
        // Left cheek freckle
        const lx = leftCheekCenter.x + (Math.random() - 0.5) * spread * 2;
        const ly = leftCheekCenter.y + (Math.random() - 0.5) * spread;
        ctx.beginPath();
        ctx.arc(lx, ly, freckleRadius * (Math.random() * 0.5 + 0.75), 0, Math.PI * 2); // Randomize size slightly
        ctx.fill();

        // Right cheek freckle
        const rx = rightCheekCenter.x + (Math.random() - 0.5) * spread * 2;
        const ry = rightCheekCenter.y + (Math.random() - 0.5) * spread;
        ctx.beginPath();
        ctx.arc(rx, ry, freckleRadius * (Math.random() * 0.5 + 0.75), 0, Math.PI * 2);
        ctx.fill();
    }
}
*/

// --- HSL Conversion Helpers (Example - needed for the advanced color approach) ---
/*
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function hslToRgb(h, s, l) {
    let r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
*/


// --- Initialization ---
loadModels(); // Start loading models when the script runs

