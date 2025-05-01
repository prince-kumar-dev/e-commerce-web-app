// Use the same API base URL constant if defined in auth.js and loaded first,
// otherwise define it here too.
const API_BASE_URL = "http://localhost:8080";

// Helper function to show cart messages on the index page
function showCartMessage(type, text) {
    const messageDiv = document.getElementById("cart-message");

    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`; // Set class for styling
        messageDiv.classList.remove('hidden');
        // Optionally hide after a few seconds
        setTimeout(() => {
             messageDiv.classList.add('hidden');
        }, 3000);
    } else {
        alert(text); // Fallback
    }
}


document.addEventListener("DOMContentLoaded", () => {
  const productContainer = document.getElementById("product-list");

  if (!productContainer) return; // Exit if container not found

  fetch(`${API_BASE_URL}/products`)
    .then(res => {
        if (!res.ok) {
            throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
        }
        return res.json();
    })
    .then(products => {
      productContainer.innerHTML = ''; // Clear loading message or previous content

      if (!products || products.length === 0) {
          productContainer.innerHTML = '<p>No products found.</p>';
          return;
      }

      products.forEach(product => {
        // Create elements instead of using innerHTML +=
        const productDiv = document.createElement('div');

        productDiv.className = 'product';
        productDiv.setAttribute('data-product-id', product.product_id); // Store ID for event listener

        const name = document.createElement('h3');
        name.textContent = product.name;
        productDiv.appendChild(name);

        const des = document.createElement('p');
        des.textContent = product.description;
        productDiv.appendChild(des);

        const price = document.createElement('p');
        price.className = 'price'; // Added class for specific styling
        price.textContent = `₹${product.price.toFixed(2)}`; // Format price
        productDiv.appendChild(price);

        const stock = document.createElement('p');
        stock.textContent = `Stock: ${product.stock_quantity}`;
        productDiv.appendChild(stock);

        const addButton = document.createElement('button');
        addButton.textContent = 'Add to Cart';
        addButton.className = 'add-to-cart-btn'; // Class for event listener
        // Disable button if stock is 0
        if (product.stock <= 0) {
            addButton.disabled = true;
            addButton.textContent = 'Out of Stock';
        }
        productDiv.appendChild(addButton);

        productContainer.appendChild(productDiv);
      });
    })
    .catch(error => {
        console.error("Error fetching products:", error);
        productContainer.innerHTML = `<p class="message error">Could not load products. ${error.message}</p>`;
    });

    // Event Delegation for "Add to Cart" buttons
    productContainer.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('add-to-cart-btn')) {
            const productDiv = event.target.closest('.product');
            const productId = productDiv.getAttribute('data-product-id');
            if (productId) {
                 // Temporarily disable button to prevent double clicks
                 event.target.disabled = true;
                 event.target.textContent = 'Adding...';
                 addToCart(parseInt(productId), event.target); // Pass button element
            }
        }
    });
});

// Updated addToCart function
function addToCart(productId, buttonElement) {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    showCartMessage("error", "Please log in first to add items to your cart!");
    // Redirect after a short delay
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
    // Re-enable button immediately if redirecting
    if (buttonElement) {
        buttonElement.disabled = false;
        buttonElement.textContent = 'Add to Cart';
    }
    return;
  }

  fetch(`${API_BASE_URL}/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: parseInt(userId), productId: productId, quantity: 1 }), // Ensure correct types
  })
  .then(res => {
      if (res.ok) {
          // Check content type before parsing
          const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return res.json().then(data => ({ ok: true, data })); // Pass data along
            } else {
                 return res.text().then(text => ({ ok: true, text })); // Handle plain text response if needed
            }
      } else {
          // Try to parse error response
           return res.json().catch(() => null).then(errorData => {
                throw new Error(errorData?.message || `Failed to add to cart: ${res.status} ${res.statusText}`);
            });
      }
  })
  .then(response => { // Use response.data or response.text
      // Use backend message if available, otherwise generic success
      const successMessage = response.data?.message || response.text || "Product added to cart!";
      showCartMessage("success", successMessage);
      // Maybe update stock display if backend confirms? (More advanced)
  })
  .catch(error => {
      console.error("Add to cart Error:", error);
      showCartMessage("error", error.message || "Could not add product to cart.");
  })
  .finally(() => {
      // Re-enable the button after the request finishes
      if (buttonElement) {
          buttonElement.disabled = false;
          buttonElement.textContent = 'Add to Cart';
      }
  });
}