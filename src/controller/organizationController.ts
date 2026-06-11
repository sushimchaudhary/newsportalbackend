import { Request, Response, NextFunction } from "express";
import { Organization } from "../models/organizationModel";
import { IAuthRequest } from "../types/AuthType";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryConfig } from "../config/AppConfig";

cloudinary.config(cloudinaryConfig);

class OrganizationController {

    async OrganizationGet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let filter = {}
            const query = req.query;
            
            if(query.search){
                const searchStr = query.search as string;
                filter = {
                    ...filter,
                    $or: [
                        { name: { $regex: searchStr, $options: 'i' } },
                        { email: { $regex: searchStr, $options: 'i' } },
                        { address: { $regex: searchStr, $options: 'i' } },
                        { contact_no: { $regex: searchStr, $options: 'i' } }
                    ]
                }
            }

            const currentPage = (query.page)? +query?.page : 1 ;
            const limit = (query.limit)? +query?.limit : 50 ;
            const skip = (currentPage - 1) * limit;

            const data = await Organization.find(filter)
                .populate('createdBy', ['_id', 'name','email', 'role', 'logo' ])
                .populate('updatedBy', ['_id', 'name','email', 'role', 'logo' ])
                .sort({"name": "asc"})
                .skip(skip)
                .limit(limit)

            const totalCount = await Organization.countDocuments(filter)
            res.json({
                data: data,
                message: "your organization list",
                status: true,
                code: 200,
                success: true,
                total: data.length,
                meta: {
                    pagination: {
                        page:currentPage,
                        limit: limit,
                        totalCount :totalCount
                    }
                }
            })
        } catch(exception){
            console.log(exception);
            next(exception);
        }
    }

    async createOrganization(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = { ...req.body }; 
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const user = req.loggedInUser;

            if (!user) {
                return next({ code: 401, message: "Unauthorized: User information missing" });
            }

            // १. Contact Number लाई सधैं Array बनाउने logic
            if (data.contact_no) {
                data.contact_no = Array.isArray(data.contact_no) 
                    ? data.contact_no 
                    : [data.contact_no];
            }

            delete data.logo;
            if (files && files.logo && files.logo[0]) {
                data.logo = files.logo[0].path;
                data.thumbnail = cloudinary.url(files.logo[0].filename, {
                    transformation: [{ width: 400, height: 400, crop: "thumb" }]
                });
            }

            data.createdBy = (user as any)._id;
            data.updatedBy = (user as any)._id;

            const newOrg = new Organization(data);
            await newOrg.save();

            res.status(201).json({
                data: newOrg,
                message: "Organization created successfully",
                status: true,
                success: true
            });
        } catch (exception:any) {
            if (exception.code === 11000) {
                return next({ 
                    code: 400, 
                    message: `Duplicate field: ${Object.keys(exception.keyValue)} already exists.` 
                });
            }
            next(exception);
        }
    }

    async updateOrganization(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const data = { ...req.body };
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            const organization = await Organization.findById(id);
            if (!organization) {
                return next({ code: 404, message: "Organization not found" });
            }

            // २. Update गर्दा पनि contact_no लाई सधैं Array बनाउने
            if (data.contact_no) {
                data.contact_no = Array.isArray(data.contact_no) 
                    ? data.contact_no 
                    : [data.contact_no];
            }

            if (files && files.logo && files.logo[0]) {
                data.logo = files.logo[0].path;
                data.thumbnail = cloudinary.url(files.logo[0].filename, {
                    transformation: [{ width: 400, height: 400, crop: "thumb" }]
                });
            } else {
                delete data.logo; 
            }

            data.updatedBy = (req.loggedInUser as any)._id;

            const updatedOrg = await Organization.findByIdAndUpdate(id, { $set: data }, { new: true });

            res.json({
                data: updatedOrg,
                message: "Organization updated successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }

    async deleteOrganization(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deletedOrg = await Organization.findByIdAndDelete(id);
            if (!deletedOrg) {
                return next({ code: 404, message: "Organization not found" });
            }
            res.json({
                message: "Organization deleted successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }
}

export default OrganizationController;