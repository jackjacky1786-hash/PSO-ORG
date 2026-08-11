import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc,
    doc,
    orderBy, 
    query 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAVFvyuOauxGNNdNoCuZhwdHpPF1xIgGag",
    authDomain: "pso-career-hub-c083a.firebaseapp.com",
    projectId: "pso-career-hub-c083a",
    storageBucket: "pso-career-hub-c083a.firebasestorage.app",
    messagingSenderId: "145259853379",
    appId: "1:145259853379:web:41955f7b763e0b873c86f6",
    measurementId: "G-R98WD2C298"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allPostsData = [];

window.openCareerTab = function(tabId) {
    const contents = document.querySelectorAll(".career-tab-content");
    const buttons = document.querySelectorAll(".tab-btn");

    contents.forEach(content => content.style.display = "none");
    buttons.forEach(btn => btn.classList.remove("active"));

    const target = document.getElementById(tabId);
    if (target) target.style.display = "block";
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add("active");
    }
};

window.toggleTheme = function() {
    document.body.classList.toggle("dark-mode");
};

window.filterPosts = function() {
    const searchVal = document.getElementById("searchInput").value.toLowerCase();
    const filtered = allPostsData.filter(post => 
        post.title.toLowerCase().includes(searchVal) || 
        post.desc.toLowerCase().includes(searchVal) ||
        post.category.toLowerCase().includes(searchVal)
    );
    renderPosts(filtered);
};

window.checkCareerSuggestion = function() {
    const val = document.getElementById("interestSelect").value;
    const resultDiv = document.getElementById("quizResult");

    if (val === "math") {
        resultDiv.innerHTML = "🎯 సూచన: <strong>MPC Group</strong> లేదా <strong>Polytechnic (CSE/ECE/Civil)</strong> ని ఎంచుకోండి.";
    } else if (val === "bio") {
        resultDiv.innerHTML = "🎯 సూచన: <strong>BiPC Group</strong> లేదా <strong>Paramedical Courses</strong> ని ఎంచుకోండి.";
    } else if (val === "commerce") {
        resultDiv.innerHTML = "🎯 సూచన: <strong>CEC / MEC Group</strong> ఎంచుకుని CA, B.Com లేదా BBA వైపు వెళ్ళండి.";
    } else if (val === "arts") {
        resultDiv.innerHTML = "🎯 సూచన: <strong>HEC Group</strong> ఎంచుకుని Civil Services లేదా Law (CLAT) కు సిద్ధమవ్వండి.";
    } else {
        resultDiv.innerHTML = "⚠️ దయచేసి ఏదైనా ఒక ఆసక్తికర విభాగాన్ని ఎంచుకోండి.";
    }
};

window.deletePost = async function(id) {
    const pass = prompt("🔑 అడ్మిన్ పాస్‌వర్డ్ ఎంటర్ చేయండి:");
    if (pass !== "pso123") {
        alert("❌ తప్పుడు పాస్‌వర్డ్!");
        return;
    }
    if (confirm("మీరు నిజంగా ఈ పోస్ట్‌ను తొలగించాలనుకుంటున్నారా?")) {
        try {
            await deleteDoc(doc(db, "pso_posts", id));
            alert("🗑️ పోస్ట్ విజయవంతంగా తొలగించబడింది!");
            fetchPosts();
        } catch (e) {
            alert("ఎర్రర్: " + e.message);
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    fetchPosts();

    const postForm = document.getElementById("postForm");
    if (postForm) {
        postForm.addEventListener("submit", addNewUpdate);
    }
});

async function addNewUpdate(event) {
    event.preventDefault();

    const adminPass = document.getElementById('adminPass').value;
    if (adminPass !== "pso123") {
        alert("❌ తప్పుడు అడ్మిన్ పాస్‌వర్డ్!");
        return;
    }

    const category = document.getElementById('postCategory').value;
    const title = document.getElementById('postTitle').value.trim();
    const desc = document.getElementById('postDesc').value.trim();
    const link = document.getElementById('postLink').value.trim();

    try {
        await addDoc(collection(db, "pso_posts"), {
            category: category,
            title: title,
            desc: desc,
            link: link || "#",
            date: new Date().toLocaleDateString('te-IN'),
            createdAt: Date.now()
        });

        alert('✨ పోస్ట్ విజయవంతంగా అప్‌లోడ్ అయింది!');
        document.getElementById("postForm").reset();
        fetchPosts();
    } catch (error) {
        alert("పోస్ట్ విఫలమైంది: " + error.message);
    }
}

async function fetchPosts() {
    const postsContainer = document.getElementById("postsContainer");
    if (!postsContainer) return;

    try {
        const q = query(collection(db, "pso_posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            postsContainer.innerHTML = "<p style='text-align:center;'>ప్రస్తుతానికి ఎలాంటి పోస్ట్‌లు లేవు.</p>";
            return;
        }

        allPostsData = [];
        querySnapshot.forEach((docSnap) => {
            allPostsData.push({ id: docSnap.id, ...docSnap.data() });
        });

        renderPosts(allPostsData);
    } catch (error) {
        postsContainer.innerHTML = "<p style='text-align:center; color:red;'>డేటా లోడ్ చేయడంలో సమస్య ఏర్పడింది.</p>";
    }
}

function renderPosts(posts) {
    const postsContainer = document.getElementById("postsContainer");
    if (!postsContainer) return;

    if (posts.length === 0) {
        postsContainer.innerHTML = "<p style='text-align:center;'>ఎలాంటి పోస్ట్‌లు లభించలేదు.</p>";
        return;
    }

    postsContainer.innerHTML = "";
    posts.forEach((data) => {
        const shareText = encodeURIComponent(`📢 *${data.title}*\n\n${data.desc}\n\nమరిన్ని వివరాలకు చూడండి: https://psoorghub.netlify.app`);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;

        const postCard = `
            <div style="border:1px solid var(--border-color); padding:15px; margin-bottom:15px; border-radius:8px; background:var(--card-bg);">
                <span style="background:var(--primary-color); color:#fff; padding:3px 8px; border-radius:4px; font-size:12px;">${data.category}</span>
                <h3 style="margin:10px 0 5px 0;">${data.title}</h3>
                <p>${data.desc}</p>
                <small style="opacity:0.7;">తేదీ: ${data.date}</small>
                <div style="margin-top:10px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                    ${data.link && data.link !== '#' ? `<a href="${data.link}" target="_blank" style="color:var(--primary-color); font-weight:bold;">మరిన్ని వివరాలు 🔗</a>` : ''}
                    <a href="${whatsappUrl}" target="_blank" style="background:#25D366; color:#fff; padding:5px 10px; border-radius:5px; text-decoration:none; font-size:12px; font-weight:bold; margin-left:auto;">
                        💬 WhatsApp Share
                    </a>
                    <button onclick="deletePost('${data.id}')" style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:12px;">🗑️ Delete</button>
                </div>
            </div>
        `;
        postsContainer.innerHTML += postCard;
    });
}