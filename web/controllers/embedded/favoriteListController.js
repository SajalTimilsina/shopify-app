// Description: Favorite List Controller.
import * as favoriteListService from '../services/favoriteListService.js';

export const createFavoriteList = async (req, res, next) => {
    try{
        const data = req.body;
        const storeName = res.locals.shopify.session.shop;
        const newList = await favoriteListService.createFavoriteList(data, storeName);
        return res.status(200).json({message: "Favorite list created successfully", data: newList});
    
        } catch (error) {
        next(error);
    }
}


export const getFavoriteLists = async (req, res, next) => {
    try{
        const storeName = res.locals.shopify.session.shop;
        const favoriteLists = await favoriteListService.getFavoriteLists(storeName, id);
        return res.status(200).json({data: favoriteLists});
    }catch(error){
        next(error);
    }
}

export const getFavoriteListById = async (req, res, next) => {
    try{
        const {id} = req.params;
        const storeName = res.locals.shopify.session.shop;
        const favoriteList = await favoriteListService.getFavoriteListById(id, storeName);
        return res.status(200).json({data: favoriteList});
    }catch(error){
        next(error);
    }
}

export const updateFavoriteList = async (req, res, next) => {
    try{
        const {id} = req.params;
        const data = req.body;
        const storeName = res.locals.shopify.session.shop;
        const updatedList = await favoriteListService.updateFavoriteList(id, data, storeName);
        return res.status(200).json({message: "Favorite list updated successfully", data: updatedList});
    }catch(error){
        next(error);
    }
}
