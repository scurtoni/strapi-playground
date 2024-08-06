import { Strapi } from "@strapi/strapi";
import generateMockData from "./mocks/generateMockData";
export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {

    if(process.env.NODE_ENV === 'development') {
      generateMockData(strapi);
    }
    if(process.env.FORCE_APP_BOOTSTRAP_ONLY) {
      process.exit(0);
    }
  },
};
