// Set banner background
const bannerImageUrl = "https://images.unsplash.com/photo-1606788075761-1f88494e5cf5";
const bannerEl = document.getElementById("bannerBg");
if (bannerEl) {
  bannerEl.style.backgroundImage = `url('${bannerImageUrl}')`;
}

const postList = document.getElementById("postList");
const pagination = document.getElementById("pagination");
const perPageSelect = document.getElementById("perPage");
const sortSelect = document.getElementById("sortBy");

let currentPage = parseInt(localStorage.getItem("page")) || 1;
let perPage = parseInt(localStorage.getItem("perPage")) || 10;
let sort = localStorage.getItem("sort") || "-published_at";

perPageSelect.value = perPage;
sortSelect.value = sort;

function saveState() {
  localStorage.setItem("page", currentPage);
  localStorage.setItem("perPage", perPage);
  localStorage.setItem("sort", sort);
}

async function fetchIdeas() {
    try {
      const url = `https://suitmedia-backend.suitdev.com/api/ideas?page[number]=${currentPage}&page[size]=${perPage}&append[]=small_image&append[]=medium_image&sort=${sort}`;
      console.log("📡 Fetching URL:", url);
  
      const res = await axios.get(url, {
        headers: {
          Accept: "application/json"
        }
      });
  
      console.log("✅ API Response:", res.data);
  
      const data = res.data.data;
      const meta = res.data.meta;
  
      renderPosts(data);
  
      if (meta && meta.last_page) {
        renderPagination(meta.last_page);
      } else {
        pagination.innerHTML = "<li class='page-item disabled'><span class='page-link'>No pagination info</span></li>";
        console.warn("⚠️ last_page tidak ditemukan:", meta);
      }
  
    } catch (error) {
      console.error("❌ Gagal fetch ideas:", error);
    }
  }

  function renderPosts(posts) {
    postList.innerHTML = "";
    posts.forEach(post => {
      console.log("DEBUG post:", post); // untuk memastikan struktur datanya
  
      const imageUrl =
        post?.small_image?.url ||
        post?.medium_image?.url ||
        "https://via.placeholder.com/300x200?text=No+Image";
  
      const col = document.createElement("div");
      col.className = "col-md-4";
      col.innerHTML = `
        <div class="card h-100">
          <img src="${imageUrl}" class="card-img-top" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=Not+Found'" />
          <div class="card-body">
            <small class="text-muted">${new Date(post.published_at).toLocaleDateString()}</small>
            <h5 class="card-title mt-2">${post.title}</h5>
          </div>
        </div>
      `;
      postList.appendChild(col);
    });
  }

function renderPagination(totalPages) {
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i == currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", e => {
      e.preventDefault();
      currentPage = i;
      saveState();
      fetchIdeas();
    });
    pagination.appendChild(li);
  }
}

perPageSelect.addEventListener("change", () => {
  perPage = parseInt(perPageSelect.value);
  currentPage = 1;
  saveState();
  fetchIdeas();
});

sortSelect.addEventListener("change", () => {
  sort = sortSelect.value;
  currentPage = 1;
  saveState();
  fetchIdeas();
});

fetchIdeas();
