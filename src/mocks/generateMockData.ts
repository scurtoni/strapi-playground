import { Strapi } from '@strapi/strapi';
import {seedUserExists, createSeedUser } from './mockUser'
import { createAddress, getDish, createRestaurant, createGetItem, createGetCuisine } from '../utils/dbUtils';
import { clearData } from './mockUtils';
import dishes from './dishes.json';
import { EntityName } from '../../types/custom/db';
import { getRandomInt } from '../utils/numberUtils';
import { prepareAddressData, prepareCuisineCreate, prepareDishCreate } from '../utils/dbCustomUtils';


const generateMockData = async (strapi: Strapi)=>{

    const dataExists = false; // await seedUserExists(strapi)

    const forceBootstrap = process.env.FORCE_APP_BOOTSTRAP_ONLY === 'true'

    const skipGeneration = dataExists && !forceBootstrap

    if (skipGeneration) {
        console.info('skipping seed data generation...')
        return
    }
    if (forceBootstrap || true) {
        console.info('forcing seed data re-creation...')
        await clearData(strapi)
        console.info('existing data has been cleaned!')
      }
    
    console.log('generating seed data...')
    
    const bulkRestaurantPromises = [];

    // fetch data from overpass-api
    const response = await fetch("http://overpass-api.de/api/interpreter?data=[out:json];area[place=city][\"name:en\"=\"London\"];node[amenity=restaurant](area);out;")
    
    const restaurantData:any = await response.json();

    const bulkCuisinePromises = prepareCuisineCreate(strapi, restaurantData);
    await Promise.all(bulkCuisinePromises)

    const bulkDishPromises = prepareDishCreate(strapi, dishes);
    await Promise.all(bulkDishPromises);

    const restaurantMap = restaurantData?.elements.reduce((restaurantMap, restarantItem)=>{
        if(restaurantMap[restarantItem?.tags?.name]){
          const addressList = [...(restaurantMap[restarantItem?.tags?.name]?.addresses || []), prepareAddressData(restarantItem)]
          restaurantMap[restarantItem?.tags?.name].addresses = addressList;
        } else {
          restaurantMap[restarantItem?.tags?.name] = restarantItem;
          restaurantMap[restarantItem?.tags?.name].addresses = [prepareAddressData(restarantItem)];
        }
        return restaurantMap;
      }, {})


      Object.keys(restaurantMap).forEach(async (restaurantKey)=> {

        const element = restaurantMap[restaurantKey];
        const cuisineIds = [];
        const dishIds = []
        const addresses = element.addresses;
        const addressIds = [];

        if(element?.tags.cuisine && element?.tags?.name){
            //console.info('name', `${element?.tags?.name} (${element?.tags.cuisine})`)

            let cuisineList = element?.tags?.cuisine?.split(";") || [];

            for(const cuisine of cuisineList) {
           
              const cuisineItem = await createGetCuisine(strapi, {name: cuisine});

              cuisineIds.push(cuisineItem?.id)

              const cuisineDishes = dishes[cuisine];
              const randomDishId = getRandomInt(0, cuisineDishes?.length || 0);

              const randomDishIds = [...new Set([1,2,3].map(()=>{
                return getRandomInt(0, cuisineDishes?.length || 0);
              }))]

              randomDishIds.forEach(async (randomDishId)=>{
                if(cuisineDishes?.[randomDishId]) {
                  const dishId = await getDish(strapi, {name: cuisineDishes?.[randomDishId]});
                  dishIds.push(dishId);
                }
              })
            };
            //populate restaurant and cuisine if not present 
            // split cuisine attribute by ; before insert it
            
            console.info('create restaurant with cuisines', cuisineIds)
      
            
            for(const address of addresses) {

              const addressId = await createAddress(strapi, address);

              addressIds.push(addressId);
          
            }

            const restaurantPromise = createRestaurant(strapi,{
              latitude: element?.lat,
              longitude: element?.lon,
              name: element?.tags?.name,
              cuisines: {connect: cuisineIds},
              dishes: {connect: dishIds},
              addresses: {connect: addressIds}
          });
   
              
          bulkRestaurantPromises.push(restaurantPromise)
        }
    })

    await Promise.all(bulkRestaurantPromises).catch(e => {
      console.error('error during generating seed data! Stopping the application...')
      throw new Error(e)
    })
}

export default generateMockData;