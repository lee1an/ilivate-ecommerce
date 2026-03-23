let cart = JSON.parse(localStorage.getItem("cart")) || [];

let cartItemsDiv = document.getElementById("cart-items");
let totalText = document.getElementById("total");

function displayCart() {
  cartItemsDiv.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `<p class="empty">Your cart is empty</p>`;
    totalText.innerText = "";
    return;
  }

  for (let i = 0; i < cart.length; i++) {
    let item = cart[i];

    if (!item.qty) {
      item.qty = 1;
    }

    let itemTotal = item.price * item.qty;
    total += itemTotal;

    cartItemsDiv.innerHTML += `
      <div class="card">
        <h3>${item.name}</h3>
        <p>₱${item.price}</p>

        <div class="qty-controls">
          <button onclick="decreaseQty(${i})">-</button>
          <span>${item.qty}</span>
          <button onclick="increaseQty(${i})">+</button>
        </div>

        <p>Total: ₱${itemTotal}</p>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  }

  totalText.innerText = "Total: ₱" + total;

  localStorage.setItem("cart", JSON.stringify(cart));
}

function increaseQty(index) {
  cart[index].qty += 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function decreaseQty(index) {
  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
  } else {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function checkout() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }
  window.location.href = "checkout.html";
}

function goBack() {
  window.location.href = "index.html";
}

displayCart();