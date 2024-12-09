// Firebase SDK imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js';
import { fetchSongRecommendations } from './api.js'; // Import fetch function for recommendations
import ColorThief from 'https://cdn.jsdelivr.net/npm/colorthief@2.3.0/dist/color-thief.mjs'; // Import ColorThief for color analysis

// Firebase configuration (use your actual Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyCBuM6DxuXdABv5wdbBDbTyyvxFukWxoC0",
    authDomain: "iml-400-project-3-23a97.firebaseapp.com",
    projectId: "iml-400-project-3-23a97",
    storageBucket: "iml-400-project-3-23a97.appspot.com",
    messagingSenderId: "98936287666",
    appId: "1:98936287666:web:cc76637aa524c973f4f4ab",
    measurementId: "G-CJHWRP4LZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage();

// DOM Elements
const SelBtn = document.getElementById('selbtn');
const myImg = document.getElementById('myImg');
const recommendationText = document.getElementById('recommendationText');
const songRecommendation = document.getElementById('songRecommendation');
const satisfiedText = document.getElementById('satisfiedText');
const satisfiedButtons = document.getElementById('satisfiedButtons');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const oneMoreBtn = document.getElementById('oneMoreBtn');

// File handling
let files = [];
let reader = new FileReader();
let input = document.createElement('input');
input.type = 'file';

input.onchange = (e) => {
    files = e.target.files;
    const file = files[0];

    // Show elements once a file is selected
    if (file) {
        myImg.style.display = 'block';
        recommendationText.style.display = 'block';
        reader.readAsDataURL(file);
    }
};

reader.onload = function () {
    myImg.src = reader.result;

    // Analyze the image after it loads
    myImg.onload = () => {
        analyzeImageWithAI(reader.result); // Call AI analysis on the image
    };
};

// Trigger file selection
SelBtn.onclick = () => input.click();

// Function to analyze the image color using ColorThief
async function analyzeImageWithAI(imageData) {
    const colorThief = new ColorThief();
    const img = new Image();
    img.src = imageData;

    img.onload = async () => {
        const dominantColor = colorThief.getColor(img);

        // Convert RGB to a vibe
        const vibe = determineVibeFromColor(dominantColor);

        // Recommend songs based on the vibe
        recommendSong(vibe);
    };
}

// Refined color-to-vibe mapping based on color theory
function determineVibeFromColor(color) {
    const [r, g, b] = color;

    if (r > 150 && g < 100 && b < 100) return 'energetic'; 
    if (r > 200 && g > 100 && b < 50) return 'warm'; 
    if (r > 200 && g > 150 && b < 100) return 'happy'; 
    if (r < 100 && g < 100 && b > 150) return 'chill'; 
    if (r < 100 && g > 150 && b < 100) return 'calm'; 
    if (r < 100 && g < 100 && b > 100) return 'sad'; 
    if (r > 200 && g > 200 && b > 200) return 'neutral'; 
    if (r < 100 && g < 100 && b < 100) return 'melancholy'; 
    if (r > 150 && g > 100 && b > 50) return 'reflective'; 

    return 'chill';
}

// Function to fetch and display song recommendations
async function recommendSong(vibe, isRetry = false) {
    try {
        // Show loading spinner and set appropriate message
        songRecommendation.innerHTML = '<div class="loader"></div>'; 
        recommendationText.innerText = isRetry ? "Fine. Here's another..." : "Interesting..."; 
        recommendationText.style.display = 'block';
        songRecommendation.style.display = 'block';

        const songs = await fetchSongRecommendations(vibe);

        // Clear the previous song recommendations and update the DOM
        songRecommendation.innerHTML = '';
        if (songs.length > 0) {
            const song = songs[Math.floor(Math.random() * songs.length)];
            const songElement = document.createElement('div');
            songElement.innerHTML = `
                <p><strong>${song.name}</strong> by ${song.artist}</p>
                <a href="${song.url}" target="_blank"><button id="listenBtn">Listen here</button></a>
                <hr>
            `;
            songRecommendation.appendChild(songElement);

            // Show "Satisfied?" section after displaying the song
            satisfiedText.style.display = 'block';
            satisfiedButtons.style.display = 'block';
        } else {
            songRecommendation.innerText = 'No recommendations available.';
            satisfiedText.style.display = 'none';
            satisfiedButtons.style.display = 'none';
        }
    } catch (error) {
        console.error('Error recommending songs:', error);
        songRecommendation.innerText = 'Could not fetch song recommendations.';
    }
}

// Event listeners for "Yes", "No", and "One More" buttons
yesBtn.addEventListener('click', () => {
    recommendationText.innerText = "Good."; // Update the message when "Yes" is clicked
    satisfiedText.style.display = 'none'; // Hide "Satisfied?" text and buttons
    satisfiedButtons.style.display = 'none';
});

noBtn.addEventListener('click', () => retrySongRecommendation());
oneMoreBtn.addEventListener('click', () => retrySongRecommendation());

function retrySongRecommendation() {
    recommendationText.innerText = "Fine. Here's another..."; // Update the text
    recommendSong('retry', true); // Fetch a new song recommendation
}
