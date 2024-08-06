import { Strapi } from "@strapi/strapi";

export const itemExists = async (strapi: Strapi, entity: any, filterKey: string, filterValue: string) => {

    const results = await strapi.entityService.findMany(entity, {
        filters: { name: filterValue }
    })
    return !!results?.length;   
}

export const createItem = async (strapi: Strapi, entity: any, data: any) => {

    const result = await strapi.entityService.create(entity, {
        data
    })

    return result;
}

export const getCuisine = async (strapi: Strapi, data: {name: string}) => {
    let cuisineItems = await strapi.entityService.findMany("api::cuisine.cuisine", {
        filters: { name: data.name }
    })
    if(cuisineItems.length){
        return cuisineItems[0].id;
    } else {
        //create item
        const newCuisineItem = await strapi.entityService.create("api::cuisine.cuisine", {
            data
        })
    
        return newCuisineItem.id;
    }
    
}