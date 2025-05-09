document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username")
  const navLinks = document.getElementById('nav-links');
  const userStatus = document.getElementById('user-status');

  // Clear previous dynamic links
  navLinks.querySelectorAll('.dynamic-link').forEach(link => link.remove());
  userStatus.innerHTML = '';

  if (userId && username) {
    userStatus.innerHTML = `<span style="margin-right: 10px;">Welcome User ${username}!</span> <a href="#" id="logout-link" class="dynamic-link" style="color: #eee;">Logout</a>`;

    const cartLink = document.createElement('li');
    cartLink.classList.add('dynamic-link');
    cartLink.innerHTML = `<a href="cart.html">Cart</a>`;
    navLinks.appendChild(cartLink);

    const logoutButton = document.getElementById('logout-link');
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem("userId");
        alert("You have been logged out.");
        window.location.href = "login.html";
      });
    }
  } else {
    const loginLink = document.createElement('li');
    loginLink.classList.add('dynamic-link');
    loginLink.innerHTML = `<a href="login.html">Login</a>`;
    navLinks.appendChild(loginLink);

    const registerLink = document.createElement('li');
    registerLink.classList.add('dynamic-link');
    registerLink.innerHTML = `<a href="register.html">Register</a>`;
    navLinks.appendChild(registerLink);
  }
});
