// Define API Base URL (ensure this matches your backend address)
const API_BASE_URL = "http://localhost:8080"; // Assuming backend runs here

document.addEventListener("DOMContentLoaded", loadCart);

function loadCart() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Please login to view cart.");
        window.location.href = "login.html";
        return;
    }

    // Correct API endpoint based on Controller
    fetch(`${API_BASE_URL}/api/cart/${userId}`)
        .then(res => {
            if (!res.ok) {
                // Basic error check
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json(); // Expecting List<SimpleCartItemDTO>
        })
        .then(cartItems => { // cartItems is now the array of DTOs
            const tbody = document.getElementById("cartItems");
            const grandTotalElement = document.getElementById("grandTotal");

            if (!tbody || !grandTotalElement) {
                console.error("Required table elements not found in cart.html");
                return;
            }

            tbody.innerHTML = ""; // Clear previous items
            let grandTotal = 0;

            if (!cartItems || cartItems.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">Your cart is empty.</td></tr>';
                grandTotalElement.textContent = "0.00";
                return;
            }

            // Process the array of SimpleCartItemDTO
            cartItems.forEach(item => {
                // Access data via DTO structure
                const product = item.product;
                if (!product) {
                    console.warn("Cart item missing product data:", item);
                    return; // Skip this item
                }
                const price = product.price || 0; // Handle null price
                const totalPrice = price * item.quantity;
                grandTotal += totalPrice;

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${product.name || 'N/A'}</td>
                    <td>${item.quantity}</td>
                    <td>₹${price.toFixed(2)}</td>
                    <td>₹${totalPrice.toFixed(2)}</td>
                    <td><button onclick="removeItem(${item.cartItemId})">Remove</button></td>
                `; // Use item.cartItemId
                tbody.appendChild(row);
            });

            grandTotalElement.textContent = grandTotal.toFixed(2);
        })
        .catch(error => {
            console.error("Failed to load cart:", error);
            const tbody = document.getElementById("cartItems");
            if(tbody) {
                tbody.innerHTML = `<tr><td colspan="5">Error loading cart: ${error.message}</td></tr>`;
            }
             const grandTotalElement = document.getElementById("grandTotal");
             if(grandTotalElement) grandTotalElement.textContent = "Error";
        });
}

function removeItem(cartItemId) {
    if (!confirm("Are you sure you want to remove this item?")) {
        return;
    }
    // Correct API endpoint based on Controller
    fetch(`${API_BASE_URL}/api/cart/remove/${cartItemId}`, { method: 'DELETE' })
        .then(res => {
             if (!res.ok) {
                // Try to get error message
                 return res.json().then(err => { throw new Error(err.message || `Failed with status ${res.status}`) });
             }
             return res.json(); // Expect success message map
        })
        .then(data => {
             console.log(data.message);
             loadCart(); // Reload the cart view
        })
        .catch(error => {
            console.error("Failed to remove item:", error);
            alert(`Error removing item: ${error.message}`);
        });
}

function checkout() {
    alert("Checkout feature coming soon!");
}

// Optional: Function to clear the cart
function clearUserCart() {
    const userId = localStorage.getItem("userId");
     if (!userId) {
        alert("Please login first.");
        return;
    }
    if (!confirm("Are you sure you want to empty your cart?")) {
        return;
    }
    fetch(`${API_BASE_URL}/api/cart/clear/${userId}`, { method: 'DELETE' })
         .then(res => {
             if (!res.ok) {
                return res.json().then(err => { throw new Error(err.message || `Failed with status ${res.status}`) });
             }
             return res.json();
         })
         .then(data => {
             console.log(data.message);
             loadCart(); // Reload cart
         })
         .catch(error => {
             console.error("Failed to clear cart:", error);
             alert(`Error clearing cart: ${error.message}`);
         });
}