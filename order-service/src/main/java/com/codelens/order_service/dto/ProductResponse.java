package com.codelens.order_service.dto;

public class ProductResponse {

    private Long id;
    private String name;
    private double price;
    private int quantity;

    public ProductResponse() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public int getQuantity() {
        return quantity;
    }
}