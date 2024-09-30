import { Strapi } from "@strapi/strapi";


enum EntityName {
    Restaurant = "api::restaurant.restaurant",
    Cuisine = "api::cuisine.cuisine",
    Dish = "api::dish.dish"
  }

export const getItem = async (strapi: Strapi, entityName: EntityName, data: any, filters) => {

    let items = await strapi.entityService.findMany(entityName, {
        filters: filters
    })
    return items.length ? items[0] : null;
}

export const createGetItem = async (strapi: Strapi, entityName: EntityName, data: any, filters: any) => {

    try {
        let item = await getItem(strapi, entityName, data, filters)
    if (item) {
        return item;
    } else {
        //create item
        const newItem = await strapi.entityService.create(entityName, {
            data
        })

        return newItem;
    }
    } catch (e) {
        console.error(e)
    }
}

export const createGetCuisine = async (strapi: Strapi, data: { name: string }) => {
    return createGetItem(strapi, EntityName.Cuisine, data, data)
}

export const createRestaurant = (strapi: Strapi, data: any) => {
    //create or return cousine
   /* let restaurantItems = await strapi.entityService.findMany("api::restaurant.restaurant", {
        filters: { name: data.name }
    })
    if (restaurantItems.length) {

        const restaurantItem = restaurantItems[0];
         
        //update address list
        return await strapi.entityService.update('api::restaurant.restaurant', restaurantItem.id, {
            data: {
              addresses: {
                connect: [addressId]
              },
            },
          });
    } else {*/
        //create restaurant
       return strapi.entityService.create("api::restaurant.restaurant", {
            data
        })
   // }

}

export const getDish = async (strapi: Strapi, data: { name: string }) => {

   
    return createGetItem(strapi, EntityName.Dish, data, { name: data.name });
    
    /*try {
        //create or return cousine
        let dishItems = await strapi.entityService.findMany("api::dish.dish", {
            filters: { name: data.name }
        })
        if (dishItems.length) {
            return dishItems[0].id;
        } else {
            //create item
            const newCuisineItem = await strapi.entityService.create("api::dish.dish", {
                data
            })

            return newCuisineItem.id;
        }
    } catch (e) {
        console.error(e)
    }*/
}

interface AddressData {
    streetName: string;
    streetNumber: string;
    postalCode: string;
    city: string;
    latitude: number;
    longitude: number;
}
export const createAddress = async (strapi: Strapi, data: AddressData) => {

    //create item
    const newCuisineItem = await strapi.entityService.create("api::address.address", {
        data
    })

    return newCuisineItem.id;


}