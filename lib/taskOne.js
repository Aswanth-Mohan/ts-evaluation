"use strict";
//Task 1: Inventory Management System
const calculateInventoryValue = (products) => {
    let totalValue = 0;
    products.map((product) => {
        if (product.inStock) {
            totalValue = totalValue + (product.price * product.quantity);
        }
    });
    return totalValue;
};
const products = [
    { id: 1, name: "Laptop", price: 999.99, inStock: true, tags: ["electronics"], quantity: 1 },
    { id: 2, name: "Mouse", price: 24.99, inStock: false, quantity: 1 },
    { id: 3, name: "Keyboard", price: 59.99, inStock: true, quantity: 1 },
    { id: 2, name: "Web cam", price: 32.99, inStock: false, quantity: 1 },
];
console.log(calculateInventoryValue(products));
