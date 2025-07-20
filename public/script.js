const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registered successfully!");
        window.location.href = "./login.html";
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong!");
    }
  });
}

//handling user session on home page
window.addEventListener('DOMContentLoaded', () => {
  const greeting = document.getElementById('user-greeting');
  const authLinks = document.getElementById('auth-links');
  const logoutBtn = document.getElementById('logout-btn');

  if (authLinks) authLinks.style.display = 'block';
  if (logoutBtn) logoutBtn.style.display = 'none';

  fetch('/session-user')
    .then(res => {
      if (!res.ok) throw new Error('Not logged in');
      return res.json();
    })
    .then(data => {
      if (greeting) greeting.innerHTML = `<p>Welcome, ${data.user.name}!</p>`;
      if (authLinks) authLinks.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
    })
    .catch(() => {
      if (greeting) greeting.innerHTML = '';
      if (authLinks) authLinks.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
    });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = '/logout';
    });
  }
});





