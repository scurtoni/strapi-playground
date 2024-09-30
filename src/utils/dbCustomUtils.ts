import { Strapi } from "@strapi/strapi";


export const prepareAddressData = (element) => {
  return {
    streetName: element?.tags?.["addr:street"] || "",
    streetNumber: element?.tags?.["addr:housenumber"] || "",
    postalCode: element?.tags?.["addr:postcode"] || "",
    city: element?.tags?.["addr:city"] || "",
    latitude: element?.lat || 0,
    longitude: element?.lon || 0,
  }
}

export const prepareCuisineCreate = (strapi: Strapi, restaurantData: any) => {

    //create unique list of cuisine
  const cuisineSet = restaurantData?.elements.reduce((cuisineSet, element)=> {
    (element?.tags?.cuisine?.split(";")|| []).forEach(item => cuisineSet.add(item?.toLowerCase()))
    return cuisineSet
  }, new Set());

  return Array.from(cuisineSet).map((cuisineName: string)=>{
    return strapi.entityService.create("api::cuisine.cuisine", {
      data: {name: cuisineName}
    })
  });
}

export const prepareDishCreate = (strapi: Strapi, dishes: any) => {

    const dishesList = Object.keys(dishes).reduce((dishesList: any = [], cuisineKey: string)=>{
        const dishesCuisineList = dishes[cuisineKey];

        dishesCuisineList.forEach((dishName)=>{
            dishesList.push({
                name: dishName,
                cuisine: cuisineKey
            })
        })
        return dishesList

    }, []) 

    return dishesList.map((dish)=>{
        return strapi.entityService.create("api::dish.dish", {
            data: {name: dish.name}
          })
    })
}