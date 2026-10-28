
package com.codelens.gateway.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;
import tools.jackson.databind.JsonNode;

@RestController
@RequestMapping("/dashboard")
public class LatencyController {

    private final WebClient webClient;

    public LatencyController(
            @Value("${prometheus.url:http://localhost:9090}") String prometheusUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(prometheusUrl)
                .build();
    }

    @GetMapping("/latency")
    public Mono<Map<String, Object>> getLatencyMetrics() {

        String filter =
                "{job=\"codelens-gateway\",uri!~\"/actuator/.*\"}";

        String averageQuery =
                "1000 * sum(rate(http_server_requests_seconds_sum" + filter
                + "[5m])) / sum(rate(http_server_requests_seconds_count"
                + filter + "[5m]))";

        String p95Query =
        	    "1000 * histogram_quantile(0.95, " +
        	    "sum by (le) (rate(http_server_requests_seconds_bucket{" +
        	    "job=\"codelens-gateway\",uri!~\"/actuator/.*\"}[5m])))";

        String requestRateQuery =
                "sum(rate(http_server_requests_seconds_count"
                + filter + "[5m]))";

        return Mono.zip(
                queryPrometheus(averageQuery),
                queryPrometheus(p95Query),
                queryPrometheus(requestRateQuery)
        ).map(result -> Map.<String, Object>of(
                "averageLatencyMs", result.getT1(),
                "p95LatencyMs", result.getT2(),
                "requestsPerSecond", result.getT3()
        ));
    }

    private Mono<Double> queryPrometheus(String query) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/query")
                        .queryParam("query", "{query}")
                        .build(Map.of("query", query)))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(json -> {
                    if (!"success".equals(json.path("status").asText())) {
                        throw new IllegalStateException(
                                "Prometheus query failed: "
                                + json.path("error").asText());
                    }

                    JsonNode results = json.path("data").path("result");

                    if (!results.isArray() || results.isEmpty()) {
                        return 0.0;
                    }

                    String rawValue = results.get(0)
                            .path("value")
                            .path(1)
                            .asText("");

                    try {
                        double value = Double.parseDouble(rawValue);

                        return Double.isFinite(value) ? value : 0.0;
                    } catch (NumberFormatException exception) {
                        return 0.0;
                    }
                });
    }
}
