import { Strapi } from '@strapi/strapi';
import {seedUserExists, createSeedUser } from './mockUser'
import { itemExists, createItem, getCuisine } from '../utils/dbUtils';
import { clearData } from './mockUtils';
import dishes from './dishes.json';

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

      const response = await fetch("http://overpass-api.de/api/interpreter?data=[out:json];area[place=city][\"name:en\"=\"London\"];node[amenity=restaurant](area);out;")
      
    const restaurantData:any = await response.json();

    restaurantData?.elements?.forEach(async (element)=> {
        const cuisineIds = [];
        if(element?.tags.cuisine && element?.tags?.name){
            //console.info('name', `${element?.tags?.name} (${element?.tags.cuisine})`)

            let cuisineList = element?.tags?.cuisine?.split(";") || [];

            for(const cuisine of cuisineList) {
           
              const cuisineId = await getCuisine(strapi, {name: cuisine});

              cuisineIds.push(cuisineId)
            };
            //pupulate restaurant and cuisine if not present 
            // split cuisine attribute by ; before insert it
            

            console.info('create restaurant with cuisines', cuisineIds)
      
            
            const restaurantPromise = strapi.entityService.create('api::restaurant.restaurant', {
                data: {
                    latitude: element?.lat,
                    longitude: element?.lon,
                    name: element?.tags?.name,
                    cuisines: cuisineIds
                }
              })
              
              bulkRestaurantPromises.push(restaurantPromise)
        }
    })

    await Promise.all(bulkRestaurantPromises)

/*
      await Promise.all([
      //  generateTodoData(strapi),
        createSeedUser(strapi),
      ]).catch(e => {
        console.error('error during generating seed data! Stopping the application...')
        throw new Error(e)
      })*/
    


}

export default generateMockData;