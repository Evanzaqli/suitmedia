const bannerEl = document.getElementById("bannerBg");

function extractFirstImageFromContent(htmlContent) {
  if (!htmlContent) return null;
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  const img = tempDiv.querySelector("img");
  return img?.src || null;
}

async function fetchBanner(postIndex = 0) {
  try {
    const url = "https://server-suitmedia-production.up.railway.app/api/ideas?page=1&size=10&sort=-published_at";
    const res = await axios.get(url);

    const post = res.data?.data?.[postIndex];
    console.log(`📦 Post ke-${postIndex + 1}:`, post);

    if (!post) {
      console.warn(`⚠ Post ke-${postIndex + 1} tidak ditemukan.`);
      return;
    }

    const imageUrl =
      post?.small_image?.[1]?.url ??
      post?.medium_image?.[1]?.url ??
      extractFirstImageFromContent(post?.content) ??
      "https://dummyimage.com/1200x500/cccccc/000000&text=Banner+Unavailable";

    console.log("🖼 Gambar yang digunakan:", imageUrl);

    if (bannerEl) {
      bannerEl.style.backgroundImage = `url('${imageUrl}')`;
      bannerEl.style.backgroundSize = "cover";
      bannerEl.style.backgroundPosition = "center";
    } else {
      console.warn("⚠ Elemen banner dengan ID 'bannerBg' tidak ditemukan.");
    }
  } catch (error) {
    console.error("❌ Gagal mengambil gambar banner dari API:", error);
  }
}

fetchBanner(8); // Tampilkan banner dari post ke-5 (indeks 4)


const postList = document.getElementById("postList");
const pagination = document.getElementById("pagination");
const perPageSelect = document.getElementById("perPage");
const sortSelect = document.getElementById("sortBy");

let currentPage = parseInt(localStorage.getItem("page")) || 1;
let perPage = parseInt(localStorage.getItem("perPage")) || 10;
let sort = localStorage.getItem("sort") || "-published_at";

perPageSelect.value = perPage;
sortSelect.value = sort;

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

function saveState() {
  localStorage.setItem("page", currentPage);
  localStorage.setItem("perPage", perPage);
  localStorage.setItem("sort", sort);
}

async function fetchIdeas() {
  try {
    const url = `https://server-suitmedia-production.up.railway.app/api/ideas?page=${currentPage}&size=${perPage}&sort=${sort}`;
    console.log("📡 Meminta data ke:", url);

    const res = await axios.get(url);
    const data = res.data.data;
    const meta = res.data.meta;

    console.log("✅ API Response:", data);

    renderPosts(data);

    if (meta && meta.total) {
      const from = (currentPage - 1) * perPage + 1;
      const to = Math.min(currentPage * perPage, meta.total);
      const total = meta.total;
      document.getElementById("infoRange").textContent = `Showing ${from} - ${to} of ${total}`;
    }

    if (meta?.last_page) renderPagination(meta.last_page);
  } catch (error) {
    console.error("❌ Gagal fetch data:", error);
  }
}



function renderPosts(posts) {
  postList.innerHTML = "";

  posts.forEach((post, i) => {
    const imageUrl = extractFirstImageFromContent(post.content);
    const title = post.title || "Untitled";
    const publishedAt = post.published_at
      ? new Date(post.published_at).toLocaleDateString()
      : "Unknown";

    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";

    col.innerHTML = `
      <div class="card h-100">
        <img src="${imageUrl}" class="card-img-top" loading="lazy"
             onerror="this.src='https://dummyimage.com/600x400/cccccc/000000&text=Image+Error'" />
        <div class="card-body">
          <small class="text-muted">${publishedAt}</small>
          <h5 class="card-title mt-2 text-truncate-3">${title}</h5>
        </div>
      </div>
    `;
    postList.appendChild(col);
  });
}



function renderPagination(totalPages) {
  const maxVisiblePages = 7;
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  // Hitung grup halaman saat ini
  const currentGroup = Math.floor((currentPage - 1) / maxVisiblePages);
  const startPage = currentGroup * maxVisiblePages + 1;
  const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  // Tombol Prev
  const prev = document.createElement("li");
  prev.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prev.innerHTML = `<a class="page-link" href="#">« Prev</a>`;
  prev.addEventListener("click", e => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      saveState();
      fetchIdeas();
    }
  });
  pagination.appendChild(prev);

  // Nomor halaman terbatas pada 7
  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", e => {
      e.preventDefault();
      if (i !== currentPage) {
        currentPage = i;
        saveState();
        fetchIdeas();
      }
    });
    pagination.appendChild(li);
  }

  // Tombol Next
  const next = document.createElement("li");
  next.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
  next.innerHTML = `<a class="page-link" href="#">Next »</a>`;
  next.addEventListener("click", e => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      saveState();
      fetchIdeas();
    }
  });
  pagination.appendChild(next);
}

fetchIdeas();

// Header scroll hide/show
let lastScroll = 0;
const header = document.getElementById("mainHeader");
window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;
  if (currentScroll > lastScroll && currentScroll > 100) {
    header.classList.add("header-hidden");
  } else {
    header.classList.remove("header-hidden");
  }
  lastScroll = currentScroll;
});

// Active menu
const currentPath = window.location.pathname;
document.querySelectorAll(".nav-link").forEach(link => {
  if (link.getAttribute("href") === currentPath) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", function () {
    document.querySelectorAll(".nav-link").forEach(el => el.classList.remove("active"));
    this.classList.add("active");
  });
});
// Parallax scroll
window.addEventListener("scroll", () => {
  const scrolled = window.scrollY;
  document.getElementById("bannerBg").style.transform = `translateY(${scrolled * 0.4}px)`;
});
