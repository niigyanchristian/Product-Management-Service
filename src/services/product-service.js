const { ProductRepository } = require("../database");
const { FormateData } = require("../utils");

// All Business logic will be here
class ProductService {

    constructor(){
        this.repository = new ProductRepository();
    }
    

    async CreateShop(shopInputs){

        const shopResult = await this.repository.CreateShop(shopInputs)
        return FormateData(shopResult);
    }

    async CreateProduct(productInputs){

        const productResult = await this.repository.CreateProduct(productInputs)
        return FormateData(productResult);
    }

    async UpdateProduct(productInputs){

        const productResult = await this.repository.UpdateProduct(productInputs)
        return FormateData(productResult);
    }
    async DeleteProduct(productId){

        const productResult = await this.repository.DeleteProduct(productId)
        return FormateData(productResult);
    }
    
    async GetAllShops(){
        const shops = await this.repository.AllShops();

        return FormateData( shops );
    }
    async GetShopById(id){
        const shops = await this.repository.ShopById(id);

        return FormateData( shops );
    }

    async GetShopByIdAndDelete(id){
        const shops = await this.repository.ShopByIdAndDelete(id);

        return FormateData( shops );
    }
    async GetShops(id){
        const shops = await this.repository.Shops(id);

        return FormateData( shops );
    }
    async GetProducts(){
        const products = await this.repository.Products();

        let categories = {};

        products.map(({ type }) => {
            categories[type] = type;
        });
        
        return FormateData({
            products,
            categories:  Object.keys(categories)  
           })

    }

    async GetProductDescription(productId){
        
        const product = await this.repository.FindById(productId);
        return FormateData(product)
    }

    async GetProductsByCategory(category){

        const products = await this.repository.FindByCategory(category);
        return FormateData(products)

    }

    async GetSelectedProducts(selectedIds){
        
        const products = await this.repository.FindSelectedProducts(selectedIds);
        return FormateData(products);
    }

    async GetProductPayload(userId,{ productId, qty },event){

         const product = await this.repository.FindById(productId);

        if(product){
             const payload = { 
                event: event,
                data: { userId, product, qty}
            };
 
             return FormateData(payload)
        }else{
            return FormateData({error: 'No product Available'});
        }

    }

    async GetShopProducts(shop_id){
        const products =await this.repository.FindShopProducts(shop_id);
        return FormateData(products);
    }

    async ManageStock(data){

        data.forEach(async element => {
            await this.repository.ManageStockQuantity( element.product._id,element.unit,element.product.shop_id,element.product.price);            
        });

        // return FormateData(product);
    }
 

    async SubscribeEvents(payload){
 
        payload = JSON.parse(payload);
        const { event, data } = payload;
        const { productId, order } = data;

        
        switch(event){
            case 'CREATE_ORDER':
                this.ManageStock(order.items);
                break;
            default:
                break;
        }
 
    }
}

module.exports = ProductService;