package com.ecommerce.app.backend.service;

import com.ecommerce.app.backend.dto.SimpleCartItemDTO; // Import DTO
import com.ecommerce.app.backend.model.*;
import com.ecommerce.app.backend.repository.*;
import jakarta.persistence.EntityNotFoundException; // Use standard JPA exception
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CartService {

    // Use constructor injection (recommended)
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AuthRepository userRepository; // Assuming you have UserRepository based on AuthRepository usage
    private final ProductRepository productRepository;

    @Autowired // Constructor Injection
    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       AuthRepository userRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    // Renamed for clarity - returns DTOs for the frontend
    @Transactional(readOnly = true) // Use Transactional for session management
    public List<SimpleCartItemDTO> getCartItemsByUserId(Integer userId) {
        Cart cart = findCartByUserIdInternal(userId);
        if (cart == null || cart.getCartItems() == null) {
            return Collections.emptyList(); // Return empty list if no cart or no items
        }
        // Convert CartItem entities to DTOs
        return cart.getCartItems().stream()
                .map(SimpleCartItemDTO::fromEntity)
                .filter(Objects::nonNull) // Filter out any nulls from conversion errors
                .collect(Collectors.toList());
    }

    // Helper to find cart, throws exception if user not found
    private Cart findCartByUserIdInternal(Integer userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        return cartRepository.findByUser(user);
    }

    @Transactional // Make method transactional
    public SimpleCartItemDTO addToCart(Integer userId, Integer productId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive.");
        }

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + productId));

        // Check stock
        if (product.getStock_quantity() < quantity) {
            throw new RuntimeException("Not enough stock for " + product.getName() + ". Available: " + product.getStock_quantity());
        }

        Cart cart = cartRepository.findByUser(user);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            // Initialize the list if needed, though JPA might handle it
            cart.setCartItems(new ArrayList<>());
            cart = cartRepository.save(cart); // Save the new cart first
        }

        // Check if item already exists in cart
        Optional<CartItem> existingItemOpt = cart.getCartItems().stream()
                .filter(item -> item.getCartItemId() == productId)
                .findFirst();

        CartItem savedItem;
        if (existingItemOpt.isPresent()) {
            // Update quantity
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + quantity;
            // Re-check stock for total quantity
            if (product.getStock_quantity() < newQuantity) {
                throw new RuntimeException("Not enough stock to add quantity for " + product.getName() + ". Available: " + product.getStock_quantity() + ", In Cart: "+ existingItem.getQuantity());
            }
            existingItem.setQuantity(newQuantity);
            savedItem = cartItemRepository.save(existingItem); // Save the updated item
        } else {
            // Create new item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            savedItem = cartItemRepository.save(newItem); // Save the new item
            // Add the new item to the cart's collection in memory (optional, depends on cascade/fetch)
            // cart.getCartItems().add(savedItem);
        }

        // Return DTO of the added/updated item
        return SimpleCartItemDTO.fromEntity(savedItem);
    }

    @Transactional
    public void removeItemFromCart(Integer cartItemId) {
        // Optional: Add check if item exists before deleting
        if (!cartItemRepository.existsById(cartItemId)) {
            throw new EntityNotFoundException("Cart item not found with ID: " + cartItemId);
        }
        cartItemRepository.deleteById(cartItemId);
        // Security Note: This still allows deleting ANY item if ID is known.
        // A better approach would be: deleteByCartItemIdAndCartUserId(Integer cartItemId, Integer userId)
    }

    @Transactional
    public void clearCart(Integer userId) {
        Cart cart = findCartByUserIdInternal(userId); // Reuse helper
        if (cart != null && cart.getCartItems() != null && !cart.getCartItems().isEmpty()) {
            // Explicitly delete items using the repository
            cartItemRepository.deleteAll(cart.getCartItems());
            // Clear the list in the cart object in memory as well
            cart.getCartItems().clear();
            // Optional: Save the cart if needed, though cascade might handle it if relationship is bidirectional managed
            // cartRepository.save(cart);
        }
    }
}