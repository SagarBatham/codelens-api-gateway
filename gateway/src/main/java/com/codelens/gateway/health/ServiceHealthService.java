package com.codelens.gateway.health;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import reactor.core.publisher.Mono;

@Service
public class ServiceHealthService {

    private final ServiceHealthClient serviceHealthClient;

    public ServiceHealthService(
            ServiceHealthClient serviceHealthClient) {
        this.serviceHealthClient = serviceHealthClient;
    }

    // Existing endpoint response remains unchanged.
    public Mono<Map<String, String>> checkServices() {

        Mono<String> userHealth =
                serviceHealthClient.checkUserService();

        Mono<String> productHealth =
                serviceHealthClient.checkProductService();

        Mono<String> orderHealth =
                serviceHealthClient.checkOrderService();

        return Mono.zip(userHealth, productHealth, orderHealth)
                .map(result -> {
                    Map<String, String> health = new LinkedHashMap<>();

                    health.put("user-service", result.getT1());
                    health.put("product-service", result.getT2());
                    health.put("order-service", result.getT3());

                    return health;
                });
    }

    // New endpoint data: status and latency for each service.
    public Mono<Map<String, ServiceHealthResult>> checkServicesDetailed() {

        Mono<ServiceHealthResult> userHealth =
                serviceHealthClient.checkUserServiceDetails();

        Mono<ServiceHealthResult> productHealth =
                serviceHealthClient.checkProductServiceDetails();

        Mono<ServiceHealthResult> orderHealth =
                serviceHealthClient.checkOrderServiceDetails();

        return Mono.zip(userHealth, productHealth, orderHealth)
                .map(result -> {
                    Map<String, ServiceHealthResult> health =
                            new LinkedHashMap<>();

                    health.put("user-service", result.getT1());
                    health.put("product-service", result.getT2());
                    health.put("order-service", result.getT3());

                    return health;
                });
    }
}