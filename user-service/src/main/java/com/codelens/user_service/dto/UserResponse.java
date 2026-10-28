package com.codelens.user_service.dto;

public class UserResponse {

    private Long id;
    private String username;

    public UserResponse() {
    }

    public UserResponse(Long id, String username) {
        this.id = id;
        this.username = username;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }
}