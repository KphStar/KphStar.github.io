import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
  import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    orderBy,
    query,
    limit
  } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCpgmRi0ZxLhB5DcvZtwMQnzyeq--_yt-8",
    authDomain: "dlblog-12d5e.firebaseapp.com",
    databaseURL: "https://dlblog-12d5e-default-rtdb.firebaseio.com",
    projectId: "dlblog-12d5e",
    storageBucket: "dlblog-12d5e.appspot.com",
    messagingSenderId: "982675731972",
    appId: "1:982675731972:web:a83674bdce84ed7ed62751",
    measurementId: "G-NX04FHD1WG"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const blogList = document.getElementById('blog-list');
  const blogDetail = document.getElementById('blog-detail');
  const detailTitle = document.getElementById('detail-title');
  const detailDate = document.getElementById('detail-date');
  const detailContent = document.getElementById('detail-content');
  const relatedPosts = document.getElementById('related-posts');
  const paginationDiv = document.getElementById('pagination');

  const postsPerPage = 5; // Number of posts per page
  let allPosts = [];

  async function loadBlogPosts() {
    blogList.innerHTML = '';
    try {
      const q = query(collection(db, 'blogs'), orderBy('publishedDate', 'asc')); // Ascending = Blog 1 first
      const querySnapshot = await getDocs(q);
      allPosts = [];
      querySnapshot.forEach((doc) => {
        allPosts.push({ id: doc.id, ...doc.data() });
      });
      renderPage(1);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      blogList.innerHTML = '<p>Error loading blog posts. Check the console for details.</p>';
    }
  }

  function renderPage(pageNumber) {
    blogList.innerHTML = '';
    blogDetail.classList.add('hidden');
    const start = (pageNumber - 1) * postsPerPage;
    const end = start + postsPerPage;
    const pagePosts = allPosts.slice(start, end);

    pagePosts.forEach((data) => {
      const postDiv = document.createElement('div');
      postDiv.className = 'blog-post';
      postDiv.innerHTML = `
        <h3>${data.title}</h3>
        <p><i class="fas fa-calendar"></i> Published: ${data.publishedDate ? new Date(data.publishedDate.toDate()).toLocaleDateString() : 'N/A'}</p>
        <p>${data.preview}</p>
      `;
      postDiv.addEventListener('click', () => showDetail(data.id));
      blogList.appendChild(postDiv);
    });

    renderPagination(pageNumber);
  }

  function renderPagination(currentPage) {
    paginationDiv.innerHTML = '';
    const totalPages = Math.ceil(allPosts.length / postsPerPage);

    const createButton = (text, page) => {
      const btn = document.createElement('button');
      btn.textContent = text;
      if (page === currentPage) btn.classList.add('active');
      btn.addEventListener('click', () => renderPage(page));
      return btn;
    };

    if (currentPage > 1) paginationDiv.appendChild(createButton('<', currentPage - 1));
    for (let i = 1; i <= totalPages; i++) {
      paginationDiv.appendChild(createButton(i, i));
    }
    if (currentPage < totalPages) paginationDiv.appendChild(createButton('>', currentPage + 1));
  }

async function showDetail(postId) {
  blogList.classList.add('hidden');
  blogDetail.classList.remove('hidden');
  paginationDiv.style.display = 'none';

  document.getElementById('go-back').style.display = 'block';

  const related = document.getElementById('related-posts');
  if (related) related.remove();

  try {
    const docRef = doc(db, 'blogs', postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      detailTitle.textContent = data.title;
      detailDate.textContent = `Published: ${data.publishedDate ? data.publishedDate.toDate().toLocaleDateString() : 'N/A'}`;
      detailContent.innerHTML = data.content;
    } else {
      blogDetail.innerHTML = '<p>Blog post not found.</p>';
    }
  } catch (error) {
    blogDetail.innerHTML = '<p>Error loading blog post details. Check the console for details.</p>';
  }
}


  async function loadRelatedPosts(currentId) {
    relatedPosts.innerHTML = '';
    try {
      const q = query(collection(db, 'blogs'), limit(5)); // Adjust the limit as needed
      const querySnapshot = await getDocs(q);
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
    } catch (error) {
      relatedPosts.innerHTML = '<p>Error loading related posts.</p>';
    }
  }

document.addEventListener('DOMContentLoaded', () => {
  loadBlogPosts();
});