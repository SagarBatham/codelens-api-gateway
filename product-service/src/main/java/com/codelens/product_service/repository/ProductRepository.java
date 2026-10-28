package com.codelens.product_service.repository;

import com.codelens.product_service.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Modifying
    @Query("""
        UPDATE Product p
        SET p.quantity = p.quantity - :quantity
        WHERE p.id = :productId
          AND p.quantity >= :quantity
    """)
    int reduceStockIfAvailable(
            @Param("productId") Long productId,
            @Param("quantity") int quantity);
}