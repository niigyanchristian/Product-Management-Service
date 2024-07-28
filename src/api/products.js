const { CUSTOMER_SERVICE, SHOPPING_SERVICE } = require("../config");
const ProductService = require("../services/product-service");
const { PublishMessage, SubscribeMessage } = require("../utils");
const UserAuth = require("./middlewares/auth");

module.exports = (app,channel) => {
  const service = new ProductService();

  SubscribeMessage(channel,service);
  
  app.post("/shop/create",UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { name, desc,banner,address,contact,email,locCoords } = req.body;

    // validation
    const { data } = await service.CreateShop({
      name,desc,banner,owner_id:_id,
      address,contact,email,locCoords
    });
    const payload = {
      event:'CHANGE_USER_TO_OWNER',
      data:{owner_id:_id,newRole:'shop_owner'}
    }

    PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(payload));
    return res.json(data);
  });
 
  app.post("/product/create", async (req, res, next) => {
    const { name, desc, type, unit, price, available, suplier, banner,shop_id } =
      req.body;
    // validation
    const { data } = await service.CreateProduct({
      name,
      desc,
      type,
      unit,
      price,
      available,
      suplier,
      banner,
      shop_id
    });
    return res.status(201).json(data);
  });

  app.get("/myshop/:id",UserAuth,async (req, res, next) => {
    const id = req.params.id;

    try {
      const { data } = await service.GetShopById(id);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.delete("/myshop/:id",UserAuth,async (req, res, next) => {
    const id = req.params.id;
    const { _id } = req.user;

    try {
      const { data } = await service.GetShopByIdAndDelete(id);
      const { data:shops } = await service.GetShops(_id);

      if(shops.length==0){
        const payload = {
          event:'CHANGE_USER_TO_OWNER',
          data:{owner_id:_id,newRole:'user'}
        }
        PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(payload));
      }
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get("/shop/myshop",UserAuth,async (req, res, next) => {
    const { _id } = req.user;

    try {
      const { data } = await service.GetShops(_id);
      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      return res.status(200).json([]);
      // return res.status(404).json({ error });
    }
  });

  app.get("/category/:type", async (req, res, next) => {
    const type = req.params.type;

    try {
      const { data } = await service.GetProductsByCategory(type);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get("/shops",UserAuth,async (req, res, next) => {
    
    try {
      const { data } = await service.GetAllShops();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get("/shops/:shopId/listings",async (req,res)=>{
    const shop_id = req.params.shopId;
    const {data} = await service.GetShopProducts(shop_id);
    return res.status(200).json(data);
  })

  app.get("/listings/:id", async (req, res, next) => {
    const productId = req.params.id;

    try {
      const { data } = await service.GetProductDescription(productId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.put("/listings/:id", async (req, res, next) => {
    const listing_id = req.params.id;
    const { name, desc, type, unit, price, available, suplier, banner,shop_id } =
      req.body;

    try {
      const { data } = await service.UpdateProduct({name, desc, type, unit, price, available, suplier, banner,shop_id,listing_id});
      return res.status(201).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.delete("/listings/:id",async (req,res)=>{
    const listing_id = req.params.id;
    try {
      const { data } = await service.DeleteProduct(listing_id);
      return res.status(201).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }

  })

  app.post("/ids", async (req, res, next) => {
    const { ids } = req.body;
    const products = await service.GetSelectedProducts(ids);
    return res.status(200).json(products);
  });

  app.put("/wishlist", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try{
      const { data } = await service.GetProductPayload(
        _id,
        { productId: req.body._id },
        "ADD_TO_WISHLIST"
      );
  
      // PublishCustomerEvent(data);
      PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
  
      res.status(201).json(data);
    }catch{
      res.status(500).json('Internal server error');
    }
  });

  app.delete("/wishlist/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const productId = req.params.id;

    const { data } = await service.GetProductPayload(
      _id,
      { productId },
      "REMOVE_FROM_WISHLIST"
    );
    // PublishCustomerEvent(data);
    PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));

    res.status(200).json(data);
  });

  app.put("/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      const { data } = await service.GetProductPayload(
        _id,
        { productId: req.body._id, qty: req.body.qty,shop_id:req.body.shop_id },
        "ADD_TO_CART"
      );
  
      // PublishCustomerEvent(data);
      // PublishShoppingEvent(data);
  
      PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
      PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify(data));
  
      const response = { product: data.data.product, unit: data.data.qty };
  
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({data:error.message});
    }
  });

  app.delete("/cart/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const productId = req.params.id;

    const { data } = await service.GetProductPayload(
      _id,
      { productId },
      "REMOVE_FROM_CART"
    );

    // PublishCustomerEvent(data);
    // PublishShoppingEvent(data);

    PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
    PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify(data));

    const response = { product: data.data.product, unit: data.data.qty };

    res.status(200).json(response);
  });

  app.get("/whoami", (req, res, next) => {
    return res
      .status(200)
      .json({ msg: "/ or /products : I am products Service" });
  });

  //get Top products and category
  app.get("/", async (req, res, next) => {
    //check validation
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });
};
