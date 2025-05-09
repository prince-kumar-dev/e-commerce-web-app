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
    if (productContainer) { // Check if container exists before adding listener
          productContainer.addEventListener('click', function(event) {
              if (event.target && event.target.classList.contains('add-to-cart-btn')) {
                  const productDiv = event.target.closest('.product');
                  // Ensure product_id is correctly retrieved (check attribute name if needed)
                  const productId = productDiv.getAttribute('data-product-id');
                  if (productId) {
                      event.target.disabled = true; // Disable button immediately
                      event.target.textContent = 'Adding...';
                      // Call the corrected addToCart function
                      addProductToCart(parseInt(productId, 10), 1, event.target); // Pass button element
                  }
              }
          });
    }
});

function addProductToCart(productId, quantity, buttonElement) {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    showCartMessage("error", "Please log in first to add items to your cart!");
    // Re-enable button before redirecting
    if (buttonElement) {
        buttonElement.disabled = false;
        buttonElement.textContent = 'Add to Cart';
    }
    setTimeout(() => { window.location.href = "login.html"; }, 1500);
    return;
  }

  // Construct the correct URL and request body based on the REVISED controller
  const url = `${API_BASE_URL}/api/cart/add/${userId}`; // userId in path
  const requestBody = {
      productId: productId,
      quantity: quantity
  };

  fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody) // Send product/quantity in body
  })
  .then(async res => { // Use async here to easily await res.json() in case of error
      if (res.ok) {
          return res.json(); // Expecting the added/updated CartItemDTO
      } else {
          // Try to parse error message from backend
          let errorMsg = `Failed to add to cart: ${res.status}`;
          try {
              const errorData = await res.json(); // await here
              errorMsg = errorData.message || errorMsg;
          } catch (e) { /* Ignore if response not JSON */ }
          throw new Error(errorMsg);
      }
  })
  .then(addedItemDto => {
      console.log("Item added/updated:", addedItemDto);
      showCartMessage("success", `"${addedItemDto.product.name}" added to cart!`);
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