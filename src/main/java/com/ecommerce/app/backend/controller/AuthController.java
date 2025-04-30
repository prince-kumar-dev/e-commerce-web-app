package com.ecommerce.app.backend.controller;

import com.ecommerce.app.backend.model.Users;
import com.ecommerce.app.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public boolean authRegister(@RequestBody Users user) {
        System.out.println(user);
        return authService.register(user).getUsername().equals(user.getUsername());
    }

    @GetMapping("/login/{username}/{password}")
    public String authLogin(@PathVariable String username, @PathVariable String password) {
        return authService.Login(username, password);
    }
}
