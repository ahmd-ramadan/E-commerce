const Wishlist = require('../../../database/models/Wishlist.js');

module.exports.wishlistCtrl = {
    addToWishlist: 
        async(req, res, next) => {
            const {productId} = req.body;
            const {_id} = req.authUser; 
            let wishlist = await Wishlist.findOne({user: _id});
            if (!wishlist) {
                wishlist = new Wishlist({ 
                    user: _id, 
                    products: [{ 
                        product: productId 
                    }] 
                });
            } else {
                if (wishlist.products.some(product => product.product.toString() === productId)) {
                    return next(new Error('Product already in wishlist', {status: 404}));
                }
                wishlist.products.push({ product: productId });
            }
            await wishlist.save();
            res.status(200).json({ 
                success: true,
                data: wishlist,
                message: 'Product added to wishlist'
            });
        },
    
    removeFromWishlist:
        async (req, res, next) => {
            const { productId } = req.params;
            const {_id} = req.authUser;
        
            let wishlist = await Wishlist.findOne({ user: _id });
            if (!wishlist) {
                return res.status(200).json({ 
                    success: true,
                    data: null,
                    message: 'Wishlist is Empty' 
                });
            }

            wishlist.products = wishlist.products.filter(
                product => product.product.toString() !== productId
            );
            await wishlist.save();

            if(wishlist.products.length == 0) {
                await Wishlist.findByIdAndDelete(wishlist._id); 
            }

            res.status(200).json({ 
                success: true,
                data: null,
                message: 'Product removed from wishlist Successfully'
            });
            
        },

    getUserWishlist: 
        async(req, res, next) => {
            const {_id} = req.authUser;
            const wishlist = await Wishlist.findOne({ user: _id }).populate({
                path: "products.product",
                model: "Product",
                select: "title"         //! Will Be changed
            });

            if (!wishlist) {
                return res.status(200).json({ 
                    success: true,
                    data: null,
                    message: 'Wishlist is Empty' 
                });
            }

            res.status(200).json({ 
                success: true,
                data: wishlist,
                message: ''
            });
        },
    
    deleteUserWishlist: 
        async(req, res, next) => {
            const { _id } = req.authUser;
            const wishlist = await Wishlist.findOneAndDelete({user: _id})
            if (!wishlist) {
                return res.status(200).json({
                    success: true,
                    data: null,
                    message: "Wishlist Is Already Empty"
                });
            }

            res.status(201).json({
                success: true,
                data: null,
                message: 'Wishlist Deleted Successfully' 
            });
        }
}