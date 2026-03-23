let cart = JSON.parse(localStorage.getItem("cart")) || [];

document.getElementById("checkout-form").addEventListener("submit", function(e) {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let name = document.getElementById("name").value;
  let address = document.getElementById("address").value;
  let contact = document.getElementById("contact").value;

  alert(`Order placed successfully!\n\nName: ${name}\nAddress: ${address}\nContact: ${contact}\nItems: ${cart.length}`);

  localStorage.removeItem("cart");
  window.location.href = "index.html";
});

function goBack() {
  window.location.href = "cart.html";
}