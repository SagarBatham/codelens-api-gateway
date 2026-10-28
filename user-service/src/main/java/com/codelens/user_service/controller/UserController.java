package com.codelens.user_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codelens.user_service.dto.AuthResponse;
import com.codelens.user_service.dto.UserResponse;
import com.codelens.user_service.model.LoginRequest;
import com.codelens.user_service.model.User;
import com.codelens.user_service.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public UserResponse createUser(@RequestBody User user) {

        User savedUser = userService.createUser(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getUsername()
        );
    }
    
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
    	
    	String token=userService.login(request.getUsername(), request.getPassword());

        return new AuthResponse(token);
    }
    
    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        User user = userService.getUser(id);

        return new UserResponse(
                user.getId(),
                user.getUsername()
        );
    }
}