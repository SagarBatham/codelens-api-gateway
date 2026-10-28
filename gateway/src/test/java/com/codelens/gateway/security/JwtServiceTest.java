package com.codelens.gateway.security;

import static org.junit.jupiter.api.Assertions.assertThrows;

import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.Test;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

class JwtServiceTest {

    @Test
    void rejectsExpiredToken() throws Exception {
        String secret = "01234567890123456789012345678901";
        SecretKey key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8));

        JwtService jwtService = new JwtService();

        Field keyField = JwtService.class.getDeclaredField("key");
        keyField.setAccessible(true);
        keyField.set(jwtService, key);

        long now = System.currentTimeMillis();

        String expiredToken = Jwts.builder()
                .subject("test-user")
                .issuedAt(new Date(now - 120_000))
                .expiration(new Date(now - 60_000))
                .signWith(key)
                .compact();

        assertThrows(
                ExpiredJwtException.class,
                () -> jwtService.validateToken(expiredToken));
    }
}