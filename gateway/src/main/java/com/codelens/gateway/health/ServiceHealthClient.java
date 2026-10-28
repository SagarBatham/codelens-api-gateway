package com.codelens.gateway.health;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import reactor.core.publisher.Mono;

@Service
public class ServiceHealthClient {

    private final WebClient webClient;

    private final String userServiceHealthUrl;
    private final String productServiceHealthUrl;
    private final String orderServiceHealthUrl;

    public ServiceHealthClient(
            WebClient webClient,
            @Value("${health.user-url}") String userServiceHealthUrl,
            @Value("${health.product-url}") String productServiceHealthUrl,
            @Value("${health.order-url}") String orderServiceHealthUrl) {

        this.webClient = webClient;
        this.userServiceHealthUrl = userServiceHealthUrl;
        this.productServiceHealthUrl = productServiceHealthUrl;
        this.orderServiceHealthUrl = orderServiceHealthUrl;
    }

    // Existing status-only methods: preserve compatibility.

    @CircuitBreaker(
            name = "userService",
            fallbackMethod = "userServiceFallback")
    public Mono<String> checkUserService() {
        return checkService(userServiceHealthUrl);
    }

    @CircuitBreaker(
            name = "productService",
            fallbackMethod = "productServiceFallback")
    public Mono<String> checkProductService() {
        return checkService(productServiceHealthUrl);
    }

    @CircuitBreaker(
            name = "orderService",
            fallbackMethod = "orderServiceFallback")
    public Mono<String> checkOrderService() {
        return checkService(orderServiceHealthUrl);
    }

    // New detailed methods: status + measured latency.

    @CircuitBreaker(
            name = "userService",
            fallbackMethod = "userServiceDetailsFallback")
    public Mono<ServiceHealthResult> checkUserServiceDetails() {
        return checkServiceWithLatency(userServiceHealthUrl);
    }

    @CircuitBreaker(
            name = "productService",
            fallbackMethod = "productServiceDetailsFallback")
    public Mono<ServiceHealthResult> checkProductServiceDetails() {
        return checkServiceWithLatency(productServiceHealthUrl);
    }

    @CircuitBreaker(
            name = "orderService",
            fallbackMethod = "orderServiceDetailsFallback")
    public Mono<ServiceHealthResult> checkOrderServiceDetails() {
        return checkServiceWithLatency(orderServiceHealthUrl);
    }

    private Mono<String> checkService(String url) {
        return webClient
                .get()
                .uri(url)
                .retrieve()
                .bodyToMono(HealthResponse.class)
                .map(HealthResponse::status)
                .timeout(Duration.ofSeconds(2));
    }

    private Mono<ServiceHealthResult> checkServiceWithLatency(String url) {
        return webClient
                .get()
                .uri(url)
                .retrieve()
                .bodyToMono(HealthResponse.class)
                .map(HealthResponse::status)
                .timeout(Duration.ofSeconds(2))
                .elapsed()
                .map(result -> new ServiceHealthResult(
                        result.getT2(),
                        result.getT1()
                ));
    }

    private Mono<String> userServiceFallback(Throwable throwable) {
        return Mono.just("DOWN");
    }

    private Mono<String> productServiceFallback(Throwable throwable) {
        return Mono.just("DOWN");
    }

    private Mono<String> orderServiceFallback(Throwable throwable) {
        return Mono.just("DOWN");
    }

    private Mono<ServiceHealthResult> userServiceDetailsFallback(
            Throwable throwable) {
        return Mono.just(new ServiceHealthResult("DOWN", -1));
    }

    private Mono<ServiceHealthResult> productServiceDetailsFallback(
            Throwable throwable) {
        return Mono.just(new ServiceHealthResult("DOWN", -1));
    }

    private Mono<ServiceHealthResult> orderServiceDetailsFallback(
            Throwable throwable) {
        return Mono.just(new ServiceHealthResult("DOWN", -1));
    }
}