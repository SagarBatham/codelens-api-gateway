package com.codelens.order_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.codelens.order_service.client.ProductClient;
import com.codelens.order_service.model.Order;
import com.codelens.order_service.repository.OrderRepository;

import reactor.core.publisher.Mono;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;

    public OrderService(
            OrderRepository orderRepository,
            ProductClient productClient) {

        this.orderRepository = orderRepository;
        this.productClient = productClient;
    }

    // CREATE
    public Mono<Order> createOrder(Order order) {

        if (order.getQuantity() <= 0) {
            return Mono.error(
                    new RuntimeException("Quantity must be greater than 0"));
        }

        return productClient.getProduct(order.getProductId())
                .flatMap(product -> {

                    if (product.getQuantity() < order.getQuantity()) {
                        return Mono.error(
                                new RuntimeException("Insufficient product quantity"));
                    }

                    order.setTotalPrice(
                            product.getPrice() * order.getQuantity());
                    order.setStatus("CREATED");

                    return productClient
                            .reduceStock(
                                    order.getProductId(),
                                    order.getQuantity())
                            .flatMap(updatedProduct ->
                                    Mono.fromCallable(
                                            () -> orderRepository.save(order))
                                    .onErrorResume(saveError ->
                                            productClient.restoreStock(
                                                    order.getProductId(),
                                                    order.getQuantity())
                                            .then(Mono.error(saveError))));
                });
    }

    // GET ALL
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // GET BY ID
    public Order getOrder(Long id) {

        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));
    }

    // UPDATE
    public Order updateOrder(Long id, Order order) {

        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        existingOrder.setUserId(order.getUserId());
        existingOrder.setProductId(order.getProductId());
        existingOrder.setQuantity(order.getQuantity());
        existingOrder.setTotalPrice(order.getTotalPrice());
        existingOrder.setStatus(order.getStatus());

        return orderRepository.save(existingOrder);
    }

    // DELETE
    public void deleteOrder(Long id) {

        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        orderRepository.delete(existingOrder);
    }
    
    
}