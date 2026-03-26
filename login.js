const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
  ? "http://localhost:3000" 
  : "https://ilivate-ecommerce.onrender.com";

console.log("Using API_URL:", API_URL);

// HELPER: SWITCH TO VERIFICATION VIEW
function showVerificationView() {
  console.log("Attempting to show verification view...");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const verifyWrapper = document.getElementById("verify-wrapper");

  if (loginForm && loginForm.parentElement) {
    loginForm.parentElement.style.display = "none";
  }
  if (registerForm && registerForm.parentElement) {
    registerForm.parentElement.style.display = "none";
  }
  if (verifyWrapper) {
    verifyWrapper.style.display = "block";
    console.log("Verification view displayed.");
  } else {
    console.error("verify-wrapper not found in DOM!");
  }
}

// HELPER: MANAGE BUTTON LOADING STATE
function setLoading(btn, isLoading, originalText) {
  if (isLoading) {
    btn.disabled = true;
    btn.textContent = "Processing...";
  } else {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

// REGISTRATION
document.getElementById("register-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button');
  const originalText = btn.textContent;
  let email = document.getElementById("register-email").value.trim();
  let password = document.getElementById("register-password").value.trim();

  if (!email || !password) {
    alert("Please fill in all fields!");
    return;
  }

  setLoading(btn, true);
  console.log(`Registering user: ${email}...`);

  fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: email, password: password })
  })
  .then(async res => {
    console.log(`Response received. Status: ${res.status}`);
    const data = await res.json();
    console.log("Response data:", data);

    // If registration was successful (even if email failed), we switch to verify
    const isSuccess = res.ok || (res.status === 500 && data.message && data.message.includes("Registration successful"));
    
    if (isSuccess) {
      console.log("Registration successful (or partial success with code fallback).");
      alert(data.message);
      showVerificationView();
    } else {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
  })
  .catch(err => {
    console.error("Registration error:", err);
    alert(`Registration error: ${err.message}`);
  })
  .finally(() => {
    setLoading(btn, false, originalText);
  });
});

// VERIFICATION
document.getElementById("verify-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button');
  const originalText = btn.textContent;
  let email = document.getElementById("register-email").value.trim(); 
  let code = document.getElementById("verify-code").value.trim();

  if (!code) {
    alert("Please enter the verification code!");
    return;
  }

  setLoading(btn, true);
  console.log(`Verifying email: ${email} with code: ${code}...`);

  fetch(`${API_URL}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: email, code: code })
  })
  .then(async res => {
    console.log(`Verification response received. Status: ${res.status}`);
    const data = await res.json();
    console.log("Verification data:", data);

    if (!res.ok) {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
    return data;
  })
  .then(data => {
    alert(data.message);
    window.location.reload(); 
  })
  .catch(err => {
    console.error("Verification error:", err);
    alert(`Verification error: ${err.message}`);
  })
  .finally(() => {
    setLoading(btn, false, originalText);
  });
});

// LOGIN
document.getElementById("login-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button');
  const originalText = btn.textContent;
  let email = document.getElementById("login-email").value.trim();
  let password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    alert("Please fill in all fields!");
    return;
  }

  setLoading(btn, true);
  console.log(`Logging in user: ${email}...`);

  fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: email, password: password })
  })
  .then(async res => {
    console.log(`Login response received. Status: ${res.status}`);
    const data = await res.json();
    console.log("Login data:", data);

    if (!res.ok) {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
    return data;
  })
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email); 
      alert("Login successful!");
      window.location.href = "index.html";
    } else {
      alert(data.message);
    }
  })
  .catch(err => {
    console.error("Login error:", err);
    alert(`Login error: ${err.message}`);
  })
  .finally(() => {
    setLoading(btn, false, originalText);
  });
});
