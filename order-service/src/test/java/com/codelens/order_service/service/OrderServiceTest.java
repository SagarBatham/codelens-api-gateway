
package com.codelens.order_service.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.codelens.order_service.client.ProductClient;
import com.codelens.order_service.dto.ProductResponse;
import com.codelens.order_service.model.Order;
import com.codelens.order_service.repository.OrderRepository;

import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductClient productClient;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, productClient);
    }

    // Helper method to create ProductResponse objects
    // without adding setters or constructors to the DTO.
    private ProductResponse createProduct(
            Long id,
            String name,
            double price,
            int quantity) {

        ProductResponse product = new ProductResponse();

        try {
            setField(product, "id", id);
            setField(product, "name", name);
            setField(product, "price", price);
            setField(product, "quantity", quantity);

            return product;
        } catch (ReflectiveOperationException exception) {
            throw new RuntimeException(
                    "Unable to create ProductResponse for test",
                    exception);
        }
    }

    private void setField(
            ProductResponse product,
            String fieldName,
            Object value) throws ReflectiveOperationException {

        Field field = ProductResponse.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(product, value);
    }

    @Test
    void shouldRejectQuantityZero() {

        Order order = new Order(
                1L, 1L, 0, 0.0, "CREATED");

        StepVerifier.create(orderService.createOrder(order))
                .expectErrorMatches(error ->
                        error instanceof RuntimeException
                        && "Quantity must be greater than 0"
                                .equals(error.getMessage()))
                .verify();

        verifyNoInteractions(productClient);
        verifyNoInteractions(orderRepository);
    }

    @Test
    void shouldRejectInsufficientStock() {

        ProductResponse product = createProduct(
                1L, "Wireless Headphones", 2499.0, 2);

        Order order = new Order(
                1L, 1L, 5, 0.0, "CREATED");

        when(productClient.getProduct(1L))
                .thenReturn(Mono.just(product));

        StepVerifier.create(orderService.createOrder(order))
                .expectErrorMatches(error ->
                        error instanceof RuntimeException
                        && "Insufficient product quantity"
                                .equals(error.getMessage()))
                .verify();

        verify(productClient, never())
                .reduceStock(anyLong(), anyInt());

        verify(orderRepository, never())
                .save(any(Order.class));
    }

    @Test
    void shouldCreateOrderAndReduceStock() {

        ProductResponse product = createProduct(
                1L, "Wireless Headphones", 2499.0, 10);

        ProductResponse updatedProduct = createProduct(
                1L, "Wireless Headphones", 2499.0, 8);

        Order order = new Order(
                1L, 1L, 2, 0.0, null);

        when(productClient.getProduct(1L))
                .thenReturn(Mono.just(product));

        when(productClient.reduceStock(1L, 2))
                .thenReturn(Mono.just(updatedProduct));

        when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        StepVerifier.create(orderService.createOrder(order))
                .assertNext(savedOrder -> {
                    assertEquals(4998.0, savedOrder.getTotalPrice());
                    assertEquals("CREATED", savedOrder.getStatus());
                    assertEquals(1L, savedOrder.getProductId());
                    assertEquals(2, savedOrder.getQuantity());
                })
                .verifyComplete();

        verify(productClient).getProduct(1L);
        verify(productClient).reduceStock(1L, 2);
        verify(orderRepository).save(order);
    }

    @Test
    void shouldRestoreStockIfSavingOrderFails() {

        ProductResponse product = createProduct(
                1L, "Wireless Headphones", 2499.0, 10);

        ProductResponse updatedProduct = createProduct(
                1L, "Wireless Headphones", 2499.0, 8);

        Order order = new Order(
                1L, 1L, 2, 0.0, null);

        when(productClient.getProduct(1L))
                .thenReturn(Mono.just(product));

        when(productClient.reduceStock(1L, 2))
                .thenReturn(Mono.just(updatedProduct));

        when(orderRepository.save(any(Order.class)))
                .thenThrow(new RuntimeException("Database unavailable"));

        when(productClient.restoreStock(1L, 2))
                .thenReturn(Mono.just(updatedProduct));

        StepVerifier.create(orderService.createOrder(order))
                .expectErrorMatches(error ->
                        "Database unavailable".equals(error.getMessage()))
                .verify();

        verify(productClient).reduceStock(1L, 2);
        verify(orderRepository).save(order);
        verify(productClient).restoreStock(1L, 2);
    }

    @Test
    void shouldPropagateProductServiceFailure() {

        Order order = new Order(
                1L, 1L, 2, 0.0, null);

        when(productClient.getProduct(1L))
                .thenReturn(Mono.error(
                        new RuntimeException("Product service unavailable")));

        StepVerifier.create(orderService.createOrder(order))
                .expectErrorMatches(error ->
                        "Product service unavailable"
                                .equals(error.getMessage()))
                .verify();

        verify(productClient, never())
                .reduceStock(anyLong(), anyInt());

        verify(orderRepository, never())
                .save(any(Order.class));
    }
}
