package com.ecommerce.app.backend.dto;

import com.ecommerce.app.backend.model.CartItem;
import com.ecommerce.app.backend.model.Product;

public class SimpleCartItemDTO {
    private final Integer cartItemId;
    private final int quantity;
    private final SimpleProductDTO product;

    // Constructor
    public SimpleCartItemDTO(Integer cartItemId, int quantity, SimpleProductDTO product) {
        this.cartItemId = cartItemId;
        this.quantity = quantity;
        this.product = product;
    }

    // Static factory method for conversion
    public static SimpleCartItemDTO fromEntity(CartItem entity) {
        if (entity == null || entity.getProduct() == null) {
            return null; // Or handle error
        }
        Product p = entity.getProduct();
        Double price = (p.getPrice() != 0.0) ? p.getPrice() : 0.0; // Handle BigDecimal/null
        SimpleProductDTO productDTO = new SimpleProductDTO(p.getProduct_id(), p.getName(), price);
        return new SimpleCartItemDTO(entity.getCartItemId(), entity.getQuantity(), productDTO);
    }

    // Getters
    public Integer getCartItemId() { return cartItemId; }
    public int getQuantity() { return quantity; }
    public SimpleProductDTO getProduct() { return product; }
}
