package com.ecommerce.app.backend.repository;

import com.ecommerce.app.backend.model.Cart;
import com.ecommerce.app.backend.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    Cart findByUser(Users user);
}
