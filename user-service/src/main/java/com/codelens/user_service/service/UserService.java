package com.codelens.user_service.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.codelens.user_service.exception.InvalidCredentialsException;
import com.codelens.user_service.model.User;
import com.codelens.user_service.repository.UserRepository;
import com.codelens.user_service.security.JwtService;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User createUser(User user) {

        String encodedPassword =
                passwordEncoder.encode(user.getPassword());

        user.setPassword(encodedPassword);

        return userRepository.save(user);
    }

    public String login(String username, String password) {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Invalid username or password"
                        ));

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new InvalidCredentialsException(
                    "Invalid username or password"
            );
        }

        return jwtService.generateToken(
                user.getUsername()
        );
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }
}