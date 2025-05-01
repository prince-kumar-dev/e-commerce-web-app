package com.ecommerce.app.backend.repository;

import com.ecommerce.app.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Integer> {
}
