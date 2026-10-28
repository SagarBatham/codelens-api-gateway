package com.codelens.gateway.ratelimiter;

import java.net.InetSocketAddress;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.codelens.gateway.security.JwtAuthenticationFilter;

import io.micrometer.core.instrument.MeterRegistry;
import reactor.core.publisher.Mono;

@Component
public class RateLimiterFilter implements GlobalFilter, Ordered {

    private final RateLimiterService rateLimiterService;
    private final MeterRegistry meterRegistry;

    public RateLimiterFilter(
            RateLimiterService rateLimiterService,
            MeterRegistry meterRegistry) {
        this.rateLimiterService = rateLimiterService;
        this.meterRegistry = meterRegistry;
    }

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            GatewayFilterChain chain) {

        String username = exchange.getAttribute(
                JwtAuthenticationFilter.AUTHENTICATED_USER);

        String key;

        if (username != null && !username.isBlank()) {
            key = "user:" + username;
        } else {
            InetSocketAddress remoteAddress =
                    exchange.getRequest().getRemoteAddress();

            String clientIp = remoteAddress != null
                    && remoteAddress.getAddress() != null
                    ? remoteAddress.getAddress().getHostAddress()
                    : "unknown";

            key = "ip:" + clientIp;
        }

        return rateLimiterService.allowRequest(key)
                .flatMap(allowed -> {
                    meterRegistry.counter("rate_limiter.requests.total")
                            .increment();

                    if (allowed) {
                        meterRegistry.counter("rate_limiter.requests.allowed")
                                .increment();
                        return chain.filter(exchange);
                    }

                    meterRegistry.counter("rate_limiter.requests.rejected")
                            .increment();

                    exchange.getResponse()
                            .setStatusCode(HttpStatus.TOO_MANY_REQUESTS);

                    return exchange.getResponse().setComplete();
                });
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
