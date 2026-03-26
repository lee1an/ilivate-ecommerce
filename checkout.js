const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
  ? "http://localhost:3000" 
  : "https://ilivate-ecommerce.onrender.com";

const paymentMethodSelect = document.getElementById("payment-method");
const gcashQrContainer = document.getElementById("gcash-qr-container");
const referenceInput = document.getElementById("reference-number");

// DISPLAY ORDER SUMMARY ON LOAD
document.addEventListener("DOMContentLoaded", function() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  console.log("Checkout loaded. Cart data:", cart);

  const summaryItems = document.getElementById("summary-items");
  const summarySubtotal = document.getElementById("summary-subtotal");
  const summaryShipping = document.getElementById("summary-shipping");
  const summaryTotal = document.getElementById("summary-total");
  
  if (!summaryItems || !summarySubtotal || !summaryShipping || !summaryTotal) {
    console.error("One or more summary elements not found in DOM!");
    return;
  }

  if (cart.length === 0) {
    summaryItems.innerHTML = "<p style='color: var(--text-muted); text-align: center; padding: 1rem;'>Your cart is empty.</p>";
    summarySubtotal.textContent = "₱0.00";
    summaryShipping.textContent = "₱0.00";
    summaryTotal.textContent = "₱0.00";
    return;
  }

  let subtotal = 0;
  const shippingFee = 100; // Fixed shipping fee as per cart.js

  summaryItems.innerHTML = cart.map(item => {
    const itemTotal = (item.price || 0) * (item.qty || 0);
    subtotal += itemTotal;
    return `
      <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
        <span style="color: var(--text-main);">${item.name} x${item.qty}</span>
        <span style="color: var(--text-muted);">₱${itemTotal.toLocaleString()}</span>
      </div>
    `;
  }).join('');

  const total = subtotal + shippingFee;

  summarySubtotal.textContent = `₱${subtotal.toLocaleString()}`;
  summaryShipping.textContent = `₱${shippingFee.toLocaleString()}`;
  summaryTotal.textContent = `₱${total.toLocaleString()}`;
  
  console.log(`Summary updated: Subtotal=₱${subtotal}, Shipping=₱${shippingFee}, Total=₱${total}`);
  
  // Update cart badge
  const badge = document.getElementById("cart-badge");
  if (badge) {
    const count = cart.reduce((total, item) => total + (item.qty || 0), 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
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

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
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