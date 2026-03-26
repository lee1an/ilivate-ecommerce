let cart = JSON.parse(localStorage.getItem("cart")) || [];

const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
  ? "http://localhost:3000" 
  : "https://ilivate-ecommerce.onrender.com";

const paymentMethodSelect = document.getElementById("payment-method");
const gcashQrContainer = document.getElementById("gcash-qr-container");
const referenceInput = document.getElementById("reference-number");

// DISPLAY ORDER SUMMARY ON LOAD
document.addEventListener("DOMContentLoaded", function() {
  const summaryItems = document.getElementById("summary-items");
  const summaryTotal = document.getElementById("summary-total");
  
  if (cart.length === 0) {
    summaryItems.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  let total = 0;
  summaryItems.innerHTML = cart.map(item => {
    total += item.price * item.qty;
    return `
      <div class="summary-row" style="margin-bottom: 0.5rem; font-size: 0.95rem;">
        <span>${item.name} x${item.qty}</span>
        <span>₱${(item.price * item.qty).toLocaleString()}</span>
      </div>
    `;
  }).join('');

  summaryTotal.textContent = `₱${total.toLocaleString()}`;
});

paymentMethodSelect.addEventListener("change", function() {
  if (this.value === "GCash") {
    gcashQrContainer.style.display = "block";
    referenceInput.required = true;
  } else {
    gcashQrContainer.style.display = "none";
    referenceInput.required = false;
    referenceInput.value = "";
  }
});

document.getElementById("checkout-form").addEventListener("submit", function(e) {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let name = document.getElementById("name").value.trim();
  let address = document.getElementById("address").value.trim();
  let contact = document.getElementById("contact").value.trim();
  let paymentMethod = paymentMethodSelect.value;
  let referenceNumber = referenceInput.value.trim();
  let userEmail = localStorage.getItem("userEmail") || null; // Capture logged-in user email

  if (!name || !address || !contact || !paymentMethod) {
    alert("Please fill in all fields!");
    return;
  }

  if (paymentMethod === "GCash" && !referenceNumber) {
    alert("Please enter your GCash Reference Number!");
    return;
  }

  // POST to backend
  fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      address: address,
      contact: contact,
      paymentMethod: paymentMethod,
      referenceNumber: referenceNumber,
      cart: cart,
      userEmail: userEmail
    })
  })
  .then(res => res.json())
  .then(data => {
    alert("Order placed successfully!");
    console.log("Order saved:", data.order);
    localStorage.removeItem("cart");
    window.location.href = "index.html";
  })
  .catch(err => {
    console.error(err);
    alert("Error placing order. Please try again.");
  });
});

function goBack() {
  window.location.href = "cart.html";
}