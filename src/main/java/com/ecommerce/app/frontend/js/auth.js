document.addEventListener('DOMContentLoaded', () => {

    const messageDiv = document.getElementById('message'); // Shared message div

    // --- Helper Functions (from previous example) ---
    const showMessage = (message, type) => {
        if(!messageDiv) return;

        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`; // 'error' or 'success'
    };

    const hideMessage = () => {
        if(!messageDiv) return;

        messageDiv.textContent = '';
        messageDiv.className = 'message hidden';
    };

    const setLoading = (button, isLoading) => {
        if (!button) return; // Guard clause

        const loader = button.querySelector('.loader');

        if (isLoading) {
            button.disabled = true;
            if (loader) loader.style.display = 'inline-block';
        } else {
            button.disabled = false;
            if (loader) loader.style.display = 'none';
        }
    };


    // this is base url of my project
    const API_BASE_URL = "http://localhost:8080/register";

    // --- Registration Logic ---
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {

        const usernameInput = document.getElementById('username');

        const passwordInput = document.getElementById('password');

        const roleSelect = document.getElementById('role');

        const registerButton = document.getElementById('registerButton');



        registerForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent default form submission

            hideMessage(); // Clear previous messages

            setLoading(registerButton, true); // Show loader and disable button


            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            const role = roleSelect.value; // Get the selected role

            // Basic client-side validation (optional, but good practice)
            if (!username || !password || !role) {
                showMessage('Please fill in all fields.', 'error');
                setLoading(registerButton, false);
                return;
            }

            if (password.length < 6) { // Example: Minimum password length check
                 showMessage('Password must be at least 6 characters long.', 'error');
                 setLoading(registerButton, false);
                 return;
            }

            fetch(`API_BASE_URL`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, role }),
            })
            .then(async res => { // Use async to easily await res.json() if needed

                if (res.ok) {
                    return { success: true }; // Indicate success
                } else {
                    // Try to get error message from backend response body
                    let errorMessage = "Registration failed. Please try again.";

                    try {
                        const errorData = await res.json();
                        if (errorData && errorData.message) {
                            errorMessage = errorData.message; // Use backend message if available
                        } else {
                            errorMessage = `Registration failed (${res.status})`;
                        }
                    } catch (jsonError) {
                        // Ignore if response body isn't valid JSON
                        errorMessage = `Registration failed (${res.status})`;
                    }
                    // Throw an error to be caught by the .catch block
                    throw new Error(errorMessage);
                }
            })
            .then(data => { // Only runs if res.ok was true
                showMessage('Registration successful! Redirecting to login...', 'success');
                // Redirect after a short delay to allow user to see the message
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
                // Keep button disabled/loading until redirect
            })
            .catch(error => {
                console.error("Registration Error:", error);
                showMessage(error.message || 'An unexpected error occurred.', 'error');
                setLoading(registerButton, false); // Re-enable button on error
            });
        });
    }













    // --- Login Logic ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const usernameInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');
        const loginButton = document.getElementById('loginButton');

        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            hideMessage();
            setLoading(loginButton, true);

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

             if (!username || !password) {
                showMessage('Please enter username and password.', 'error');
                setLoading(loginButton, false);
                return;
            }

            fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            })
            .then(async res => {
                if (!res.ok) {
                     // Try to get error message from backend
                    let errorMessage = "Login failed.";
                     try {
                        const errorData = await res.json();
                         if (errorData && errorData.message) {
                            errorMessage = errorData.message;
                        } else {
                             errorMessage = `Invalid credentials or server error (${res.status})`;
                         }
                    } catch (jsonError) {
                        errorMessage = `Invalid credentials or server error (${res.status})`;
                    }
                    throw new Error(errorMessage);
                }
                // If response is OK, parse the JSON body
                return res.json();
            })
            .then(data => {
                // Check for expected data from your Spring backend (e.g., userId, token, role)
                // Adjust this condition based on what your backend ACTUALLY returns on successful login
                if (data && data.userId) { // Assuming userId indicates success
                    showMessage('Login successful! Redirecting...', 'success');

                    // Store user info from the response
                    localStorage.setItem("userId", data.userId);
                    if(data.role) { // Store role if backend provides it
                        localStorage.setItem("userRole", data.role);
                    }
                     if(data.token) { // Store token if backend provides it
                        localStorage.setItem("authToken", data.token);
                    }

                    // Redirect after delay
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1000);
                    // Keep loading until redirect

                } else {
                    // If response was OK but didn't contain expected data
                    throw new Error("Login failed: Invalid response from server.");
                }
            })
            .catch(error => {
                console.error("Login Error:", error);
                showMessage(error.message || 'Invalid username or password.', 'error');
                setLoading(loginButton, false); // Re-enable button on error
            });
        });
    }
});