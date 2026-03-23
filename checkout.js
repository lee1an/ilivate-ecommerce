let cart = JSON.parse(localStorage.getItem("cart")) || [];

document.getElementById("checkout-form").addEventListener("submit", function(e) {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let name = document.getElementById("name").value.trim();
  let address = document.getElementById("address").value.trim();
  let contact = document.getElementById("contact").value.trim();

  if (!name || !address || !contact) {
    alert("Please fill in all fields!");
    return;
  }

  // POST to backend
  fetch("http://localhost:3000/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      address: address,
      contact: contact,
      cart: cart
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