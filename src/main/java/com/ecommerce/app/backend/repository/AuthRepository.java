package com.ecommerce.app.backend.repository;

import com.ecommerce.app.backend.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthRepository extends JpaRepository<Users, Integer> {

    Users findByUsername(String username);
}
