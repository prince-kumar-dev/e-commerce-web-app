package com.ecommerce.app.backend.service;

import com.ecommerce.app.backend.model.Users;
import com.ecommerce.app.backend.repository.AuthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthRepository authRepository;

    public Users register(Users user) {
        return authRepository.save(user);
    }

    public Users Login(String username, String password) {
        return authRepository.findByUsername(username);
    }
}
