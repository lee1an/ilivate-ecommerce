const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
  ? "http://localhost:3000" 
  : "https://ilivate-ecommerce.onrender.com";

document.addEventListener("DOMContentLoaded", function() {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("userEmail");
  
  if (!token || !email) {
    window.location.href = "login.html";
    return;
  }

  fetch(`${API_URL}/profile`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-User-Email": email
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.email) {
      const profileDetails = document.getElementById("profile-details");
      profileDetails.innerHTML = `
        <div class="form-group">
          <label>Email</label>
          <p>${data.email}</p>
        </div>
        <div class="form-group">
          <label>Account Status</label>
          <p>${data.is_verified ? 'Verified' : 'Not Verified'}</p>
        </div>
        <div class="form-group">
          <label>Member Since</label>
          <p>${new Date(data.created_at).toLocaleDateString()}</p>
        </div>
      `;
    } else {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
  });

  // Fetch orders
  const userEmail = localStorage.getItem("userEmail");
  if (userEmail) {
    fetch(`${API_URL}/my-orders?email=${userEmail}`)
    .then(res => res.json())
    .then(orders => {
      const orderHistory = document.getElementById("order-history");
      if (orders.length > 0) {
        orderHistory.innerHTML = orders.map(order => `
          <div class="card" style="margin-bottom: 1.5rem; text-align: left; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">
              <span style="font-weight: 600;">Order #${order.id}</span>
              <span class="text-muted" style="font-size: 0.9rem;">${new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div style="margin-bottom: 1rem;">
              <p style="margin: 0.25rem 0;"><strong>Shipping:</strong> ${order.address}</p>
              <p style="margin: 0.25rem 0;"><strong>Payment:</strong> ${order.payment_method}</p>
            </div>
            <div>
              <p style="margin-bottom: 0.5rem; font-weight: 600;">Items:</p>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${JSON.parse(order.cart).map(item => `
                  <li style="display: flex; justify-content: space-between; font-size: 0.9rem; padding: 0.25rem 0;">
                    <span>${item.qty}x ${item.name}</span>
                    <span>₱${(item.price * item.qty).toLocaleString()}</span>
                  </li>
                `).join('')}
              </ul>
              <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; font-weight: 700;">
                <span>Total Amount</span>
                <span style="color: var(--accent);">₱${JSON.parse(order.cart).reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        `).join('');
      }
    });
  }
});
