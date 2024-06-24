const Cart = require('../../../database/models/Cart.js');

const {
    checkProductAvailability,
    getUserCart,
    addCart,
    updateProductQuantity,
    pushNewProduct,
    calculateSubTotal,
} = require('./functions.js');

module.exports.cartCtrl = {
    addToCart:
        async (req, res, next) => {
            const { productId, quantity } = req.body;
            const { _id } = req.authUser;
            
            //! Check if the product exists and if it's available
            const product = await checkProductAvailability(productId, quantity);
            if (!product) {
                return next(new Error('Product not found or not available', {status: 404}));
            }

            //! Check if the user has a cart
            const userCart = await getUserCart(_id);

            //! Check if the user has no cart, create a new cart and add the product to it
            if(!userCart) {
                const newCart = await addCart(_id, product, quantity);
                return res.status(201).json({ 
                    success: true,
                    data: newCart,
                    message: 'Product Added To Cart Successfully'
                });
            }
        
            //! The cart state after modifying its products array to reflect the updated quantities and subtotals.
            //! Check if the returned value is null, then the product is not found in the cart and we will add it.
            let newCartProducts = await updateProductQuantity(userCart, productId, quantity);
            if (!newCartProducts) {
                newCartProducts = await pushNewProduct(userCart, product, quantity);
            }
        
            //! update the userCart products with the newCartProducts
            //! we can remove the calculation of the subtotal from the functions and call it here once.
            userCart.products = newCartProducts;
            userCart.subTotal = calculateSubTotal(userCart.products);
        
            await userCart.save();
            res.status(201).json({
                success: true, 
                data: userCart,
                message: 'Product Added To Cart Successfully' 
            });
        },

    removeFromCart: 
        async (req, res, next) => {
            const { productId } = req.params;
            const { _id } = req.authUser;
        
            const userCart = await Cart.findOne({
                user: _id,
                "products.product": productId,
            });

            if (!userCart) {
                return next({ message: "Product not found in cart", cause: 404 });
            }

            //! The resulting state of the userCart.products array, after removing the specified product from the user's cart
            userCart.products = userCart.products.filter(
                (product) => product.product.toString() !== productId
            );
        
            //! The calculated subtotal after updating the cart's products array
            userCart.subTotal = calculateSubTotal(userCart.products);
        
            const newCart = await userCart.save();
        
            //! If the cart's products array is empty we will delete the cart.
            if (newCart.products.length === 0) {
                await Cart.findByIdAndDelete(newCart._id);
            }
        
            res.status(201).json({
                success: true,
                data: null,
                message: 'Product Removed From Cart Successfully' 
            });
        },
    
    getUserCart: 
        async(req, res, next) => {
            const { _id } = req.authUser;
            const userCart = await Cart.findOne({user: _id})
            if (!userCart) {
                return res.status(200).json({
                    success: true,
                    data: null,
                    message: "Cart Is Empty"
                });
            }

            res.status(201).json({
                success: true,
                data: userCart,
                message: '' 
            });
        },
    
    deleteUserCart: 
        async(req, res, next) => {
            const { _id } = req.authUser;
            const userCart = await Cart.findOneAndDelete({user: _id})
            if (!userCart) {
                return res.status(200).json({
                    success: true,
                    data: null,
                    message: "Cart Is Already Empty"
                });
            }

            res.status(201).json({
                success: true,
                data: null,
                message: 'Cart Deleted Successfully' 
            });
        }
};