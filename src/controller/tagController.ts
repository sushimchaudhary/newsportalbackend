import { Request, Response, NextFunction } from "express";
import { Tag } from "../models/tagModel";
import { IAuthRequest } from "../types/AuthType";

class TagController {
    
    async getAllTags(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let filter: any = {};
            const { search, page, limit, status } = req.query;

            if (search) {
                filter.name = { $regex: search as string, $options: 'i' };
            }

            if (status) {
                filter.is_active = status === 'active';
            }

            const currentPage = page ? +page : 1;
            const pageSize = limit ? +limit : 50;
            const skip = (currentPage - 1) * pageSize;

            const data = await Tag.find(filter)
                .populate('createdBy', ['_id', 'name', 'email'])
                .populate('updatedBy', ['_id', 'name', 'email'])
                .sort({ name: "asc" })
                .skip(skip)
                .limit(pageSize);

            const totalCount = await Tag.countDocuments(filter);

            res.json({
                data,
                message: "Tags fetched successfully",
                status: true,
                meta: {
                    pagination: {
                        page: currentPage,
                        limit: pageSize,
                        totalCount: totalCount
                    }
                }
            });
        } catch (exception) {
            next(exception);
        }
    }

    async createTag(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = { ...req.body };
            const user = req.loggedInUser;

            if (!user) {
                return next({ code: 401, message: "Unauthorized" });
            }

            // Logic for status mapping
            if (data.status) {
                data.is_active = data.status === "active";
                delete data.status;
            }

            data.createdBy = (user as any)._id;
            data.updatedBy = (user as any)._id;

            const newTag = new Tag(data);
            await newTag.save();

            res.status(201).json({
                data: newTag,
                message: "Tag created successfully",
                status: true
            });
        } catch (exception: any) {
            if (exception.code === 11000) {
                return next({ code: 400, message: "Tag name already exists" });
            }
            next(exception);
        }
    }

    async updateTag(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const data = { ...req.body };

            const tag = await Tag.findById(id);
            if (!tag) {
                return next({ code: 404, message: "Tag not found" });
            }

            if (data.status) {
                data.is_active = data.status === "active";
                delete data.status;
            }

            data.updatedBy = (req.loggedInUser as any)._id;

            const updatedTag = await Tag.findByIdAndUpdate(id, { $set: data }, { new: true });

            res.json({
                data: updatedTag,
                message: "Tag updated successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }

    async deleteTag(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await Tag.findByIdAndDelete(id);

            if (!deleted) {
                return next({ code: 404, message: "Tag not found" });
            }

            res.json({
                message: "Tag deleted successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }
}

export default TagController;