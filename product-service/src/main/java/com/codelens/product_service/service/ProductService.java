package com.codelens.product_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.codelens.product_service.model.Product;
import com.codelens.product_service.repository.ProductRepository;

import jakarta.transaction.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // CREATE
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    // READ ALL
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // READ ONE
    public Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));
    }

    // UPDATE
    public Product updateProduct(Long id, Product product) {

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        existingProduct.setName(product.getName());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setQuantity(product.getQuantity());

        return productRepository.save(existingProduct);
    }

    // DELETE
    public void deleteProduct(Long id) {

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        productRepository.delete(existingProduct);
    }
    
    @Transactional
    public Product reduceStock(Long productId, int quantity) {

        if (quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than 0");
        }

        int updatedRows = productRepository.reduceStockIfAvailable(
                productId, quantity);

        if (updatedRows == 0) {
            if (!productRepository.existsById(productId)) {
                throw new RuntimeException("Product not found");
            }

            throw new RuntimeException(
                    "Insufficient product quantity");
        }

        return productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));
    }
    
    @Transactional
    public Product restoreStock(Long productId, int quantity) {

        if (quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than 0");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        product.setQuantity(product.getQuantity() + quantity);

        return productRepository.save(product);
    }
}