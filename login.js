const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
  ? "http://localhost:3000" 
  : "https://ilivate-ecommerce.onrender.com";

document.getElementById("register-form").addEventListener("submit", function(e) {
  e.preventDefault();

  let email = document.getElementById("register-email").value.trim();
  let password = document.getElementById("register-password").value.trim();

  if (!email || !password) {
    alert("Please fill in all fields!");
    return;
  }

  fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: email, password: password })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
    return data;
  })
  .then(data => {
    alert(data.message);
    console.log("Hiding login form wrapper:", document.getElementById("login-form").parentElement);
    document.getElementById("login-form").parentElement.style.display = "none";
    console.log("Hiding register form wrapper:", document.getElementById("register-form").parentElement);
    document.getElementById("register-form").parentElement.style.display = "none";
    console.log("Showing verify wrapper:", document.getElementById("verify-wrapper"));
    document.getElementById("verify-wrapper").style.display = "block";
  })
  .catch(err => {
    console.error("Registration fetch error:", err);
    alert(`Error: ${err.message}`);
  });
});

document.getElementById("verify-form").addEventListener("submit", function(e) {
  e.preventDefault();

  let email = document.getElementById("register-email").value.trim(); // Get email from original form
  let code = document.getElementById("verify-code").value.trim();

  if (!code) {
    alert("Please enter the verification code!");
    return;
  }

  fetch(`${API_URL}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: email, code: code })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
    return data;
  })
  .then(data => {
    alert(data.message);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email);
      window.location.href = "index.html";
    } else {
      window.location.reload();
    }
  })
  .catch(err => {
    console.error("Verification fetch error:", err);
    alert(`Error: ${err.message}`);
  });
});

document.getElementById("login-form").addEventListener("submit", function(e) {
  e.preventDefault();

  let email = document.getElementById("login-email").value.trim();
  let password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    alert("Please fill in all fields!");
    return;
  }

  fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: email, password: password })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
    return data;
  })
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email); // Store user email
      alert("Login successful!");
      window.location.href = "index.html";
    } else {
      alert(data.message);
    }
  })
  .catch(err => {
    console.error("Login fetch error:", err);
    alert(`Error: ${err.message}`);
  });
});
