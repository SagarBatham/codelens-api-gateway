package com.codelens.gateway.health;

public record ServiceHealthResult(
        String status,
        long latencyMs
) {
}