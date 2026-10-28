
package com.codelens.gateway.security;

import java.nio.charset.StandardCharsets;

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
		this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
	}

	public String generateToken(String username) {
		long now = System.currentTimeMillis();

		return Jwts.builder().subject(username).issuedAt(new java.util.Date(now))
				.expiration(new java.util.Date(now + 60 * 60 * 1000L)).signWith(key).compact();
	}

	public String validateToken(String token) {
		return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
	}
}
