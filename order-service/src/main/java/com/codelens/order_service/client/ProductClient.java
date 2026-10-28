package com.codelens.order_service.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.codelens.order_service.dto.ProductResponse;

import reactor.core.publisher.Mono;

@Service
public class ProductClient {

    private final WebClient webClient;
    private final String productServiceUrl;

    public ProductClient(
            WebClient webClient,
            @Value("${product-service.url}") String productServiceUrl) {

        this.webClient = webClient;
        this.productServiceUrl = productServiceUrl;
    }

    public Mono<ProductResponse> getProduct(Long productId) {

        return webClient
                .get()
                .uri(productServiceUrl + "/products/" + productId)
                .retrieve()
                .bodyToMono(ProductResponse.class);
    }
    
    public Mono<ProductResponse> reduceStock(Long productId, int quantity) {

        return webClient
                .put()
                .uri(productServiceUrl + "/products/" + productId
                        + "/reduce-stock?quantity=" + quantity)
                .retrieve()
                .bodyToMono(ProductResponse.class);
    }
    
    public Mono<ProductResponse> restoreStock(
            Long productId, int quantity) {

        return webClient
                .put()
                .uri(productServiceUrl + "/products/" + productId
                        + "/restore-stock?quantity=" + quantity)
                .retrieve()
                .bodyToMono(ProductResponse.class);
    }
    
    
}