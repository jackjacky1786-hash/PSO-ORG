// Firebase Modules దిగుమతి (Import)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    orderBy, 
    query 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// మీ నిజమైన Firebase కీలు Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAVFvyuOauxGNNdNoCuZhwdHpPF1xIgGag",
    authDomain: "pso-career-hub-c083a.firebaseapp.com",
    projectId: "pso-career-hub-c083a",
    storageBucket: "pso-career-hub-c083a.firebasestorage.app",
    messagingSenderId: "145259853379",
    appId: "1:145259853379:web:41955f7b763e0b873c86f6",
    measurementId: "G-R98WD2C298"
};

// Firebase & Firestore ప్రారంభించడం
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM లోడైన తర్వాత పోస్టులను లోడ్ చేయడం
document.addEventListener("DOMContentLoaded", () => {
    fetchPosts();

    const postForm = document.getElementById("postForm");
    if (postForm) {
        postForm.addEventListener("submit", addNewUpdate);
    }
});

// 1. కొత్త పోస్ట్‌ను Firestore లో సేవ్ చేసే ఫంక్షన్
async function addNewUpdate(event) {
    event.preventDefault();

    const category = document.getElementById('postCategory')?.value || 'General';
    const title = document.getElementById('postTitle')?.value.trim();
    const desc = document.getElementById('postDesc')?.value.trim();
    const link = document.getElementById('postLink')?.value.trim();

    if (!title || !desc) {
        alert("దయచేసి శీర్షిక మరియు వివరాలను నమోదు చేయండి.");
        return;
    }

    try {
        await addDoc(collection(db, "pso_posts"), {
            category: category,
            title: title,
            desc: desc,
            link: link || "#",
            date: new Date().toLocaleDateString('te-IN'),
            createdAt: Date.now()
        });

        alert('✨ పోస్ట్ సక్సెస్ ఫుల్‌గా లైవ్ డేటాబేస్ లో సేవ్ అయింది!');
        document.getElementById("postForm").reset();
        fetchPosts(); // కొత్త పోస్ట్ లైవ్‌లో కనిపించడానికి
    } catch (error) {
        console.error("డేటాబేస్ లో సేవ్ చేయడంలో ఎర్రర్: ", error);
        alert("పోస్ట్ పబ్లిష్ చేయడంలో సమస్య వచ్చింది. మళ్ళీ ప్రయత్నించండి.");
    }
}

// 2. Firestore నుండి పోస్టులను తీసుకొచ్చి సైట్‌లో చూపించే ఫంక్షన్
async function fetchPosts() {
    const postsContainer = document.getElementById("postsContainer");
    if (!postsContainer) return;

    postsContainer.innerHTML = "<p>డేటా లోడ్ అవుతోంది...</p>";

    try {
        const q = query(collection(db, "pso_posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            postsContainer.innerHTML = "<p>ప్రస్తుతానికి ఏ పోస్ట్‌లు అందుబాటులో లేవు.</p>";
            return;
        }

        postsContainer.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const postCard = `
                <div class="post-card" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                    <span class="badge" style="background: #007bff; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px;">${data.category}</span>
                    <h3 style="margin: 10px 0 5px 0;">${data.title}</h3>
                    <p style="color: #555;">${data.desc}</p>
                    <small style="color: #888;">తేదీ: ${data.date}</small>
                    ${data.link && data.link !== "#" ? `<br><a href="${data.link}" target="_blank" style="display:inline-block; margin-top:8px; color:#007bff;">మరిన్ని వివరాలు 🔗</a>` : ''}
                </div>
            `;
            postsContainer.innerHTML += postCard;
        });
    } catch (error) {
        console.error("పోస్టులు లోడ్ చేయడంలో ఎర్రర్: ", error);
        postsContainer.innerHTML = "<p>డేటా లోడ్ చేయడంలో సమస్య ఏర్పడింది.</p>";
    }
}