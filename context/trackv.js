// visitor-tracker.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_Pw5SX4ZtyaUjj4_b6ptklaAZJW15CZY",
  authDomain: "visitor-b3811.firebaseapp.com",
  projectId: "visitor-b3811",
  storageBucket: "visitor-b3811.firebasestorage.app",
  messagingSenderId: "643577687780",
  appId: "1:643577687780:web:9e0079b3d717fe081706f1",
  measurementId: "G-43VV1138D4",
  databaseURL: "https://visitor-b3811-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function ipToLong(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
}

function isBlockedIP(ip) {
  const ipNum = ipToLong(ip);
  const tmoStart = ipToLong("172.32.0.0");
  const tmoEnd = ipToLong("172.63.255.255");
  return ipNum >= tmoStart && ipNum <= tmoEnd;
}

async function getIP() {
  const res = await fetch("https://api.ipify.org?format=json");
  const data = await res.json();
  return data.ip;
}

async function trackVisitor() {
  try {
    const ip = await getIP();

    if (isBlockedIP(ip)) {
      console.log("Blocked T-Mobile IP:", ip);
      document.getElementById('visitor-count').textContent = 'Blocked';
      return;
    }

    const safeIP = ip.replace(/\./g, "-");
    const ipRef = ref(db, 'visitors/' + safeIP);
    const snapshot = await get(ipRef);

    if (!snapshot.exists()) {
      await set(ipRef, { timestamp: Date.now() });
    }

    const allVisitorsRef = ref(db, 'visitors');
    const allVisitorsSnap = await get(allVisitorsRef);
    const count = allVisitorsSnap.exists() ? Object.keys(allVisitorsSnap.val()).length : 0;

    document.getElementById('visitor-count').textContent = count;

  } catch (err) {
    console.error("Visitor tracking error:", err);
    document.getElementById('visitor-count').textContent = 'Error';
  }
}

trackVisitor();
