const mongoose = require('mongoose');
const { ProductModel, ShopModel } = require("../models");

//Dealing with data base operations
class ProductRepository {


    async CreateShop({ name, desc,owner_id,banner,address,contact,email,locCoords }){

        console.log(address,contact,email)
        // TODO: Check if the owner exist before adding shop.
            const shop = new ShopModel({
                name, desc, owner_id,banner,address,contact,email,locCoords
            });
            const shopResult = await shop.save();
            return shopResult;
    }
    async AllShops(){

        return await ShopModel.find();
    }
    async Shops(owner_id){

        console.log(owner_id)
        return await ShopModel.find({owner_id:owner_id});
    }
    async ShopById(owner_id){
        return await ShopModel.findById(owner_id);
    }
    async ShopByIdAndDelete(owner_id){
        return await ShopModel.findByIdAndDelete(owner_id);
    }
    
    async CreateProduct({ name, desc, type, unit,price, available, suplier, banner,shop_id }){

        const shop = await ShopModel.findById(shop_id);

        if(shop){
            const product = new ProductModel({
                name, desc, type, unit,price, available, suplier, banner,shop_id
            });
        //    return await ProductModel.findByIdAndDelete('607286419f4a1007c1fa7f40');
            const productResult = await product.save();
            return productResult;
        }else{
            return 'Shop does not exist';
        }
    }

    async UpdateProduct({ name, desc, type, unit,price, available, suplier, banner,shop_id,listing_id }){

        const shop = await ShopModel.findById(shop_id);

        if(shop){
            const productResult =await ProductModel.findByIdAndUpdate(listing_id,{
                name, desc, type, unit,price, available, suplier, banner,shop_id
            },{new:true});
            return productResult;
        }else{
            return 'Shop does not exist';
        }
    }
    async DeleteProduct(_id){
        const product = await ProductModel.findByIdAndDelete(_id);
        return product;
    }


     
     async Products(){
        return await ProductModel.find();
    }
   
    async FindById(id){
        
       return await ProductModel.findById(id);

    }

    async FindByCategory(category){

        const products = await ProductModel.find({ type: category});

        return products;
    }

    async FindSelectedProducts(selectedIds){
        const products = await ProductModel.find().where('_id').in(selectedIds.map(_id => _id)).exec();
        return products;
    }

    async FindShopProducts(shop_id){
        const products = await ProductModel.find({shop_id:shop_id});
        return products;
    }

    async ManageStockQuantity(productId,qty,shop_id,price){
        const product = await ProductModel.findByIdAndUpdate(
            productId,
            { $inc: { unit: -qty } },
            { new: true }
        );
        const shop = await ShopModel.findByIdAndUpdate(
            shop_id,
            { $inc: { account: price*qty } },
            { new: true }
        );

        return product;
    }
    
}

module.exports = ProductRepository;
