import shopify from "../shopify.js";
//require('dotenv').config({path: './../.env.quickorderapp-prod'});
import dotenv from 'dotenv';

dotenv.config({path: './../.env.quickorderapp-dev'});


export default async function addScriptTags(session) {
    //console.log(`#####: The host URL: ${process.env.HOST}`);
    const src = `https://${session.shop}/apps/proxy-1/shopifyscript.js`;
    //const src = "https://emerdepot2.myshopify.com/apps/proxy-1/shopifyscript.js";
    try {
        const scriptTags = new shopify.api.rest.ScriptTag({
            session: session
        });
        scriptTags.event = "onload";
        scriptTags.src =  src;
        console.log(`Script tags SRC: ${scriptTags.src}`);
        const reply = await scriptTags.save({update: true,});
        console.log(`reply" ${reply} & session" ${session.shop}`);
        console.log(`Script tags added for shop: ${session.shop}`);
    } catch (error) {
        console.error("Error adding script tags", error);
    }

    try{
        const scriptTagsAll = await shopify.api.rest.ScriptTag.all({session: session});
        //console.log(`Script tags all:` ,scriptTagsAll);
        if(scriptTagsAll.data.length > 0) {
            const found = scriptTagsAll.data.some(item => item.src === src);
            found ? console.log(`####: Script tags found for shop: ${session.shop}`) : console.error(`#####: Script tags not found for shop: ${session.shop}`);
        }
    } catch (error) {
        console.error("Error fetching script tags", error);
    }
}

