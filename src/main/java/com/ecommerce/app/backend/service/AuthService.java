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

    public String Login(String username, String password) {
        Users user = authRepository.findByUsername(username);

        if (user != null) {
            if(user.getPassword().equals(password)) {
                return "Login Successfully";
            } else {
                return "Check your password";
            }
        }

        return "User is not registered with us";
    }
}
