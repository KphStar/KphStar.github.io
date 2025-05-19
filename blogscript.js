// Firebase configuration (updated with your actual config from Firebase Console)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "dlblog.firebaseapp.com",
  projectId: "dlblog",
  storageBucket: "dlblog.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const blogList = document.getElementById('blog-list');
const blogDetail = document.getElementById('blog-detail');
const detailTitle = document.getElementById('detail-title');
const detailDate = document.getElementById('detail-date');
const detailContent = document.getElementById('detail-content');
const relatedPosts = document.getElementById('related-posts');

// Load and display blog posts
function loadBlogPosts() {
  blogList.innerHTML = '';
  db.collection('blogs').orderBy('publishedDate', 'desc').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const postDiv = document.createElement('div');
      postDiv.className = 'blog-post';
      postDiv.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.readTime}</p>
        <p><i class="fas fa-calendar"></i> Published: ${data.publishedDate ? data.publishedDate.toDate().toLocaleDateString() : 'N/A'}</p>
        <p>${data.preview}</p>
      `;
      postDiv.addEventListener('click', () => showDetail(doc.id));
      blogList.appendChild(postDiv);
    });
  });
}

// Show blog post detail
function showDetail(postId) {
  db.collection('blogs').doc(postId).get().then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      detailTitle.textContent = data.title;
      detailDate.textContent = `Published: ${data.publishedDate ? data.publishedDate.toDate().toLocaleDateString() : 'N/A'}`;
      detailContent.innerHTML = data.content;
      blogList.classList.add('hidden');
      blogDetail.classList.remove('hidden');
      loadRelatedPosts(postId);
    }
  });
}

// Load related posts
function loadRelatedPosts(currentId) {
  relatedPosts.innerHTML = '';
  db.collection('blogs').limit(4).get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (doc.id !== currentId) {
        const data = doc.data();
        const postDiv = document.createElement('div');
        postDiv.className = 'related-post';
        postDiv.innerHTML = `
          <p>${data.title} <small>(${data.publishedDate ? data.publishedDate.toDate().toLocaleDateString() : 'N/A'})</small></p>
        `;
        relatedPosts.appendChild(postDiv);
      }
    });
  });
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  loadBlogPosts();
});

// Navigation placeholders
document.getElementById('prev-post').addEventListener('click', () => console.log('Previous post'));
document.getElementById('next-post').addEventListener('click', () => console.log('Next post'));