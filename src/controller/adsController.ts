import { Request, Response, NextFunction } from "express";
import { Ad } from "../models/adsModel";
import { IAuthRequest } from "../types/AuthType";

class AdController {
    
    async getAllAds(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let filter: any = {};
            const { search, page, limit } = req.query;

            if (search) {
                filter.title = { $regex: search as string, $options: 'i' };
            }

            const currentPage = page ? +page : 1;
            const size = limit ? +limit : 50;
            const skip = (currentPage - 1) * size;

            const data = await Ad.find(filter)
                .populate('createdBy', ['_id', 'name'])
                .populate('updatedBy', ['_id', 'name'])
                .sort({ createdAt: "desc" })
                .skip(skip)
                .limit(size);

            const totalCount = await Ad.countDocuments(filter);

            res.json({
                data,
                message: "Ads list fetched successfully",
                status: true,
                meta: {
                    pagination: { page: currentPage, limit: size, totalCount }
                }
            });
        } catch (exception) {
            next(exception);
        }
    }

    async createAd(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = { ...req.body };
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const user = req.loggedInUser;

            if (!user) return next({ code: 401, message: "Unauthorized" });

            // Handle Image Upload
            if (files?.image?.[0]) {
                data.image = files.image[0].path;
            } else {
                return next({ code: 400, message: "Ad banner image is required" });
            }

            data.createdBy = (user as any)._id;
            data.updatedBy = (user as any)._id;

            const newAd = new Ad(data);
            await newAd.save();

            res.status(201).json({
                data: newAd,
                message: "Ad created successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }

    async updateAd(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const data = { ...req.body };
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            const ad = await Ad.findById(id);
            if (!ad) return next({ code: 404, message: "Ad not found" });

            if (files?.image?.[0]) {
                data.image = files.image[0].path;
            }

            data.updatedBy = (req.loggedInUser as any)._id;

            const updatedAd = await Ad.findByIdAndUpdate(id, { $set: data }, { new: true });

            res.json({
                data: updatedAd,
                message: "Ad updated successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }

    async deleteAd(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await Ad.findByIdAndDelete(id);

            if (!deleted) return next({ code: 404, message: "Ad not found" });

            res.json({
                message: "Ad deleted successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }
}

export default AdController;