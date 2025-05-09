package com.ecommerce.app.backend.controller;

import com.ecommerce.app.backend.dto.SimpleCartItemDTO; // Import DTO
import com.ecommerce.app.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // Use ResponseEntity for better responses
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Map; // For simple map responses

@RestController
@RequestMapping("/api/cart") // Standardize prefix to /api/cart
@CrossOrigin(origins = "*") // Allow requests from frontend
public class CartController {

    private final CartService cartService; // Use constructor injection

    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // GET /api/cart/{userId} -> Returns list of simplified cart items
    @GetMapping("/{userId}")
    public ResponseEntity<?> getCartContents(@PathVariable Integer userId) {
        try {
            List<SimpleCartItemDTO> items = cartService.getCartItemsByUserId(userId);
            return ResponseEntity.ok(items); // Return list of DTOs
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // Log exception e
            return ResponseEntity.status(500).body(Map.of("message", "Error fetching cart items"));
        }
    }

    // POST /api/cart/add -> Uses RequestBody for data
    static class AddToCartRequest { // Inner class for request body
        public Integer productId;
        public int quantity;
    }

    @PostMapping("/add/{userId}") // userId in path, product/quantity in body
    public ResponseEntity<?> addToCart(@PathVariable Integer userId, @RequestBody AddToCartRequest request) {
        if (request.productId == null || request.quantity <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product ID and positive quantity required."));
        }
        try {
            SimpleCartItemDTO addedItem = cartService.addToCart(userId, request.productId, request.quantity);
            return ResponseEntity.ok(addedItem); // Return the added/updated item DTO
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) { // Catch stock issues etc.
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // Log exception e
            return ResponseEntity.status(500).body(Map.of("message", "Error adding item to cart"));
        }
    }

    // DELETE /api/cart/remove/{cartItemId} -> Changed path, use cartItemId
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<?> removeItem(@PathVariable Integer cartItemId) {
        try {
            cartService.removeItemFromCart(cartItemId);
            return ResponseEntity.ok(Map.of("message", "Item removed successfully."));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // Log exception e
            return ResponseEntity.status(500).body(Map.of("message", "Error removing item from cart"));
        }
    }

    // DELETE /api/cart/clear/{userId}
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearCart(@PathVariable Integer userId) {
        try {
            cartService.clearCart(userId);
            return ResponseEntity.ok(Map.of("message", "Cart cleared successfully."));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // Log exception e
            return ResponseEntity.status(500).body(Map.of("message", "Error clearing cart"));
        }
    }
}