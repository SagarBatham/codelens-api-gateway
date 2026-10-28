package com.codelens.gateway.dashboard;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.micrometer.core.instrument.MeterRegistry;

@RestController
public class DashboardController {

    private final MeterRegistry meterRegistry;

    public DashboardController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @GetMapping("/dashboard/metrics")
    public Map<String, Double> getMetrics() {

        double total = getCounter("rate_limiter.requests.total");
        double allowed = getCounter("rate_limiter.requests.allowed");
        double rejected = getCounter("rate_limiter.requests.rejected");

        return Map.of(
                "totalRequests", total,
                "allowedRequests", allowed,
                "rejectedRequests", rejected
        );
    }

    private double getCounter(String name) {

        var counter = meterRegistry.find(name).counter();

        if (counter == null) {
            return 0;
        }

        return counter.count();
    }
}