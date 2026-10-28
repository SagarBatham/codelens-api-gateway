package com.codelens.product_service.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codelens.product_service.model.Product;
import com.codelens.product_service.service.ProductService;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // CREATE
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    // READ ALL
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // READ ONE
    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        return productService.getProduct(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {

        return productService.updateProduct(id, product);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {

        productService.deleteProduct(id);

        return "Product deleted successfully";
    }
    
    @PutMapping("/{id}/reduce-stock")
    public Product reduceStock(
            @PathVariable Long id,
            @RequestParam int quantity) {

        return productService.reduceStock(id, quantity);
    }
    
    @PutMapping("/{id}/restore-stock")
    public Product restoreStock(
            @PathVariable Long id,
            @RequestParam int quantity) {

        return productService.restoreStock(id, quantity);
    }
}