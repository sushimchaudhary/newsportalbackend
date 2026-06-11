import { Request, Response, NextFunction } from "express";
import { About } from "../models/aboutUsModel";
import { IAuthRequest } from "../types/AuthType";

class AboutController {
    
    // 1. Get All About entries (with search/pagination)
    async getAbouts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let filter: any = {};
            const query = req.query;

            if (query.search) {
                const searchStr = query.search as string;
                filter.description = { $regex: searchStr, $options: 'i' };
            }

            const currentPage = query.page ? +query.page : 1;
            const limit = query.limit ? +query.limit : 50;
            const skip = (currentPage - 1) * limit;

            const data = await About.find(filter)
                .populate('createdBy', ['_id', 'name', 'email'])
                .populate('updatedBy', ['_id', 'name', 'email'])
                .sort({ createdAt: "desc" })
                .skip(skip)
                .limit(limit);

            const totalCount = await About.countDocuments(filter);

            res.json({
                data,
                message: "About list fetched successfully",
                status: true,
                meta: {
                    pagination: {
                        page: currentPage,
                        limit: limit,
                        totalCount: totalCount
                    }
                }
            });
        } catch (exception) {
            next(exception);
        }
    }

    // 2. Create New About
    async createAbout(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = { ...req.body };
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const user = req.loggedInUser;

            if (!user) {
                return next({ code: 401, message: "Unauthorized" });
            }

            if (files && files.image && files.image[0]) {
                data.image = files.image[0].path;
            }

            data.createdBy = (user as any)._id;
            data.updatedBy = (user as any)._id;

            const newAbout = new About(data);
            await newAbout.save();

            res.status(201).json({
                data: newAbout,
                message: "About section created successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }

    // 3. Update About
    async updateAbout(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const data = { ...req.body };
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            const about = await About.findById(id);
            if (!about) {
                return next({ code: 404, message: "About section not found" });
            }

            if (files && files.image && files.image[0]) {
                data.image = files.image[0].path;
            }

            data.updatedBy = (req.loggedInUser as any)._id;

            const updatedAbout = await About.findByIdAndUpdate(
                id, 
                { $set: data }, 
                // { new: true }
                { returnDocument: 'after' }
            );

            res.json({
                data: updatedAbout,
                message: "About section updated successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }

    // 4. Delete About
    async deleteAbout(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await About.findByIdAndDelete(id);

            if (!deleted) {
                return next({ code: 404, message: "About section not found" });
            }

            res.json({
                message: "About section deleted successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }

    // 5. Get Single About by ID
    async getAboutById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const data = await About.findById(id)
                .populate('createdBy', ['name', 'email'])
                .populate('updatedBy', ['name', 'email']);

            if (!data) {
                return next({ code: 404, message: "About section not found" });
            }

            res.json({
                data,
                message: "About details fetched",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }
}

export default AboutController;