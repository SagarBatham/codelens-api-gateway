
package com.codelens.user_service.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;

@Service
public class JwtService {

    @Value("${security.jwt.secret}")
    private String secret;

    private SecretKey key;

    @PostConstruct
    public void initializeKey() {
        this.key = Keys.hmacShaKeyFor(
            secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(String username) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
            .subject(username)
            .issuedAt(new Date(now))
            .expiration(new Date(now + 60 * 60 * 1000L))
            .signWith(key)
            .compact();
    }
}
