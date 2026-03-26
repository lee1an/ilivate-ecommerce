let cart = JSON.parse(localStorage.getItem("cart")) || [];

function displayCart() {
  let cartItemsDiv = document.getElementById("cart-items");
  let totalText = document.getElementById("total");
  let subtotalText = document.getElementById("subtotal");
  let shippingText = document.getElementById("shipping");
  
  cartItemsDiv.innerHTML = "";
  let subtotal = 0;
  const shippingFee = cart.length > 0 ? 100 : 0;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 3rem;">Your cart is currently empty.</p>`;
  }

  for (let i = 0; i < cart.length; i++) {
    let item = cart[i];
    let itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    cartItemsDiv.innerHTML += `
      <div class="card" style="padding: 0;">
        <div class="card-img-wrapper" style="border-radius: 1.25rem 1.25rem 0 0;">
          <img src="${item.image || 'images/placeholder.png'}" alt="${item.name}">
        </div>
        <div class="card-content" style="padding: 1.5rem;">
          <h3 style="margin-bottom: 1rem;">${item.name}</h3>
          <p class="price" style="color: var(--accent); font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem;">₱${item.price.toLocaleString()}</p>

          <div class="qty-controls" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
            <button class="btn btn-outline" style="width: 36px; height: 36px; padding: 0; min-width: auto; border-radius: 0.5rem; background: rgba(255,255,255,0.05);" onclick="decreaseQty(${i})">-</button>
            <span style="font-weight: 700; min-width: 24px; text-align: center; font-size: 1.1rem;">${item.qty}</span>
            <button class="btn btn-outline" style="width: 36px; height: 36px; padding: 0; min-width: auto; border-radius: 0.5rem; background: rgba(255,255,255,0.05);" onclick="increaseQty(${i})">+</button>
          </div>

          <p style="font-weight: 600; font-size: 1rem; color: var(--text-main); margin-bottom: 1.5rem;">
            Subtotal: <span style="color: var(--accent);">₱${itemTotal.toLocaleString()}</span>
          </p>
          
          <div style="text-align: center; border-top: 1px solid var(--glass-border); padding-top: 1rem;">
            <button class="btn btn-ghost" style="color: var(--danger); font-weight: 600; font-size: 0.95rem;" onclick="removeItem(${i})">
              <i class="fas fa-trash-alt"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }

  let total = subtotal + shippingFee;
  if (subtotalText) subtotalText.innerText = "₱" + subtotal.toLocaleString();
  if (shippingText) shippingText.innerText = "₱" + shippingFee.toLocaleString();
  if (totalText) totalText.innerText = "₱" + total.toLocaleString();
}

function increaseQty(index) {
  cart[index].qty += 1;
  saveCart();
}

function decreaseQty(index) {
  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
    saveCart();
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
}

function clearCart() {
  if (confirm("Are you sure you want to clear your entire cart?")) {
    cart = [];
    saveCart();
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function goBack() {
  window.location.href = "index.html";
}

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  window.location.href = "checkout.html";
}

displayCart();