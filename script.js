let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price) {
  let found = false;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].name === name) {
      cart[i].qty += 1;
      found = true;
    }
  }

  if (!found) {
    cart.push({ name: name, price: price, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(name + " added to cart!");
}

function goToCart() {
  window.location.href = "cart.html";
}

function filterProducts(category) {
  let cards = document.querySelectorAll(".card");
  let buttons = document.querySelectorAll(".filters button");



  for (let b = 0; b < buttons.length; b++) {
    buttons[b].classList.remove("active");
  }
  event.target.classList.add("active");

  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    let cardCategory = card.getAttribute("data-category");

    if (category === "all" || cardCategory === category) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  }
}
function buyNow(name, price) {
  let cart = [];
  cart.push({ name: name, price: price });

  localStorage.setItem("cart", JSON.stringify(cart));

  window.location.href = "checkout.html";
}