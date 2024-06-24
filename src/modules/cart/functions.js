const Cart = require('../../../database/models/Cart.js');
const Product = require('../../../database/models/Product.js');

module.exports.getUserCart = async(userId) => {
    const userCart = await Cart.findOne({user: userId});
    return userCart;
}

module.exports.addCart = async(userId, product, quantity) => {
    const cartObj = {
        user: userId,
        products: [
            {
                product: product._id,
                quantity,
                basePrice: product.appliedPrice,
                title: product.title,
                finalPrice: product.appliedPrice * quantity,
            },
        ],
        subTotal: product.appliedPrice * quantity,
    };
    const newCart = await Cart.create(cartObj);
    return newCart;
};

module.exports.checkProductAvailability = async(productId, quantity) => {
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) return null;
    return product;
}

module.exports.updateProductQuantity = async(cart, productId, quantity) => {
    const isProductExistInCart = cart.products.some(
        (productd) => productd.product.toString() === productId
    );
    if (!isProductExistInCart) {
        return null;
    }
    cart?.products.forEach(product => {
        if (product.product.toString() === productId) {
            product.quantity = quantity;
            product.finalPrice = product.basePrice * quantity;
        }
    });
    return cart.products;
}

module.exports.calculateSubTotal = (products) => {
    let subTotal = 0;
    for (const product of products) {
        subTotal += product.finalPrice;
    }
    return subTotal;
}

module.exports.pushNewProduct = async(cart, product, quantity) => {
    cart?.products.push({
        product: product._id,
        quantity: quantity,
        basePrice: product.appliedPrice,
        title: product.title,
        finalPrice: product.appliedPrice * quantity,
    });
    return cart.products;
}