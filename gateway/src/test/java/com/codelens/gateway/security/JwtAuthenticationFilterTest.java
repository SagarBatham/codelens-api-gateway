package com.codelens.gateway.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.http.HttpStatus;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import reactor.test.StepVerifier;

class JwtAuthenticationFilterTest {

    @Test
    void expiredTokenReturns401() throws Exception {
        String secret = "01234567890123456789012345678901";
        SecretKey key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8));

        JwtService jwtService = new JwtService();

        Field keyField = JwtService.class.getDeclaredField("key");
        keyField.setAccessible(true);
        keyField.set(jwtService, key);

        JwtAuthenticationFilter filter =
                new JwtAuthenticationFilter(jwtService);

        long now = System.currentTimeMillis();

        String expiredToken = Jwts.builder()
                .subject("test-user")
                .issuedAt(new Date(now - 120_000))
                .expiration(new Date(now - 60_000))
                .signWith(key)
                .compact();

        MockServerWebExchange exchange = MockServerWebExchange
                .from(org.springframework.mock.http.server.reactive
                        .MockServerHttpRequest.get("/api/products")
                        .header("Authorization", "Bearer " + expiredToken));

        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();

        assertEquals(
                HttpStatus.UNAUTHORIZED,
                exchange.getResponse().getStatusCode());

        verify(chain, never()).filter(exchange);
    }
}