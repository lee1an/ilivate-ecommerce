const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
  ? "http://localhost:3000" 
  : "https://ilivate-ecommerce.onrender.com"; // You will replace this after hosting

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price, image) {
  let found = false;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].name === name) {
      cart[i].qty += 1;
      found = true;
    }
  }

  if (!found) {
    cart.push({ name: name, price: price, image: image, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  alert(name + " added to cart!");
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((total, item) => total + item.qty, 0);
  
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
}

function goToCart() {
  window.location.href = "cart.html";
}

function buyNow(name, price, image) {
  let cart = [];
  cart.push({ name: name, price: price, image: image, qty: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();

  window.location.href = "checkout.html";
}

// SEARCH AND FILTER
const searchInput = document.getElementById("search-input");
if (searchInput) {
  searchInput.addEventListener("input", function() {
    filterProducts();
  });
}

function filterProducts(category = null) {
  let cards = document.querySelectorAll(".card");
  let activeCategory = category;
  
  // Handle category button highlighting
  if (category) {
    let buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(btn => {
      btn.classList.remove("active");
      if (btn.getAttribute("onclick").includes(`'${category}'`)) {
        btn.classList.add("active");
      }
    });
    // Store category globally or in a data attribute to keep it active during search
    document.querySelector(".filters").setAttribute("data-active", category);
  } else {
    activeCategory = document.querySelector(".filters").getAttribute("data-active") || "all";
  }

  let searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

  cards.forEach(card => {
    let cardCategory = card.getAttribute("data-category");
    let cardTitle = card.querySelector("h3").textContent.toLowerCase();
    
    let matchesCategory = activeCategory === "all" || cardCategory === activeCategory;
    let matchesSearch = cardTitle.includes(searchTerm);

    if (matchesCategory && matchesSearch) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}
document.addEventListener("DOMContentLoaded", function() {
  updateCartBadge();
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("userEmail");
  
  if (token && email) {
    fetch(`${API_URL}/profile`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-User-Email": email
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.email) {
        document.getElementById("user-guest-actions").style.display = "none";
        document.getElementById("user-logged-in-actions").style.display = "block";
        document.getElementById("user-email").textContent = data.email;
      }
    });
  }

  // Toggle profile dropdown on click for mobile
  const profileBtn = document.getElementById("profile-btn");
  const dropdownContent = document.getElementById("profile-dropdown-content");
  
  if (profileBtn) {
    profileBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      dropdownContent.classList.toggle("show");
    });

    document.addEventListener("click", function() {
      if (dropdownContent.classList.contains("show")) {
        dropdownContent.classList.remove("show");
      }
    });
  }
});

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
  window.location.reload();
}

// REVIEWS LOGIC
let currentProduct = null;

function openReviews(productName) {
  currentProduct = productName;
  document.getElementById("modal-product-name").textContent = `Reviews for ${productName}`;
  document.getElementById("reviews-modal").style.display = "block";
  fetchReviews(productName);
}

function closeReviews() {
  document.getElementById("reviews-modal").style.display = "none";
  currentProduct = null;
}

function fetchReviews(productName) {
  fetch(`${API_URL}/reviews/${productName}`)
    .then(res => res.json())
    .then(reviews => {
      const list = document.getElementById("reviews-list");
      if (reviews.length === 0) {
        list.innerHTML = `<p class="text-muted">No reviews yet. Be the first to review!</p>`;
        return;
      }
      list.innerHTML = reviews.map(r => `
        <div class="review-card">
          <div class="review-stars">
            ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
          </div>
          <div class="review-meta">
            <strong>${r.user_email}</strong> • ${new Date(r.created_at).toLocaleDateString()}
          </div>
          <p class="review-comment">${r.comment}</p>
        </div>
      `).join('');
    })
    .catch(err => console.error("Error fetching reviews:", err));
}

function submitReview() {
  const ratingInput = document.querySelector('input[name="rating"]:checked');
  const comment = document.getElementById("review-comment").value.trim();
  const userEmail = localStorage.getItem("userEmail") || "Guest";

  if (!ratingInput) {
    alert("Please select a rating!");
    return;
  }
  if (!comment) {
    alert("Please write a comment!");
    return;
  }

  const reviewData = {
    productName: currentProduct,
    userEmail: userEmail,
    rating: parseInt(ratingInput.value),
    comment: comment
  };

  fetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      document.getElementById("review-comment").value = "";
      ratingInput.checked = false;
      fetchReviews(currentProduct);
    })
    .catch(err => {
      console.error("Error submitting review:", err);
      alert("Error submitting review. Please try again.");
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById("reviews-modal");
  if (event.target == modal) {
    closeReviews();
  }
}