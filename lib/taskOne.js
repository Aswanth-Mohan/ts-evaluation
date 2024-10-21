"use strict";
//Task 1: Inventory Management System
const calculateInventoryValue = (products) => {
    if (!Array.isArray(products) || products.length === 0) {
        return 0;
    }
    return products.reduce((totalValue, product) => {
        if (product.inStock) {
            return totalValue + Number((product.price * product.quantity).toFixed(2));
        }
        return totalValue;
    }, 0);
};
const products = [
    { id: 1, name: "Laptop", price: 999.99, inStock: true, tags: ["electronics"], quantity: 1 },
    { id: 2, name: "Mouse", price: 24.99, inStock: false, quantity: 1 },
    { id: 3, name: "Keyboard", price: 59.99, inStock: true, quantity: 1 },
    { id: 2, name: "Web cam", price: 32.99, inStock: false, quantity: 1 },
];
console.log(calculateInventoryValue(products));
