package com.codelens.gateway.health;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

@RestController
public class HealthController {

    private final ServiceHealthService serviceHealthService;

    public HealthController(
            ServiceHealthService serviceHealthService) {
        this.serviceHealthService = serviceHealthService;
    }

    @GetMapping("/service-health")
    public Mono<Map<String, String>> serviceHealth() {
        return serviceHealthService.checkServices();
    }

    @GetMapping("/service-health/details")
    public Mono<Map<String, ServiceHealthResult>> serviceHealthDetails() {
        return serviceHealthService.checkServicesDetailed();
    }
}