package com.ecommerce.app.backend.dto;

import com.ecommerce.app.backend.model.CartItem;
import com.ecommerce.app.backend.model.Product;

public class SimpleProductDTO {
    private Integer productId;
    private String name;
    private Double price;

    // Constructor
    public SimpleProductDTO(Integer productId, String name, Double price) {
        this.productId = productId;
        this.name = name;
        this.price = price;
    }
    // Static factory needed in CartItemDTO logic below
    // Getters
    public Integer getProductId() { return productId; }
    public String getName() { return name; }
    public Double getPrice() { return price; }
}