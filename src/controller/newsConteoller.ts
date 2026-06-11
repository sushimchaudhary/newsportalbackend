import { Request, Response, NextFunction } from "express";
import { News } from "../models/newsModel";
import { IAuthRequest } from "../types/AuthType";
import { Subscriber } from "../models/subscribeModel";
import { sendEmail } from "../utils/emailServices";

class NewsController {
    
    // 1. Create News
    async createNews(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = { ...req.body };
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const user = req.loggedInUser;

            if (files?.image?.[0]) {
                data.image = files.image[0].path;
            }

            // Frontend bata aune array data handle garna (FormData support)
            if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);
            if (typeof data.type === 'string') data.type = JSON.parse(data.type);

            // FIX: Empty subCategory string ले गर्दा आउने Mongoose CastError रोक्न
            if (data.subCategory === '') {
                data.subCategory = null;
            }

            data.createdBy = (user as any)._id;
            data.updatedBy = (user as any)._id;

            const newNews = new News(data);
            await newNews.save();

            console.log("CHECKING URL:", process.env.FRONTEND_URL);

            if (newNews.is_published === 'Published') {
                const subscribers = await Subscriber.find({});
                if (subscribers.length > 0) {
                    const emails = subscribers.map(sub => sub.email);
                    const subject = `नयाँ समाचार: ${newNews.title}`;
                    const text = `हाम्रो वेबसाइटमा नयाँ समाचार थपिएको छ: ${newNews.title}\n\nथप हेर्न यहाँ क्लिक गर्नुहोस्: ${process.env.FRONTEND_URL}/blog/${newNews.slug}`;
                    
                    // ब्याकग्राउन्डमा पठाउन async को प्रयोग
                    sendEmail(emails, subject, text).catch(err => console.error("Email error:", err));
                }
            }

            res.status(201).json({
                data: newNews,
                message: "News created successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }

    // 2. Get All News (Filters + Pagination)
    // async getAllNews(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const { category, tag, status, search, page = 1, limit = 10 } = req.query;
    //         let filter: any = {};

    //         if (category) filter.category = category;
    //         if (tag) filter.tags = { $in: [tag] }; 
    //         if (status) filter.is_published = status;
    //         if (search) {
    //             filter.$or = [
    //                 { title: { $regex: search, $options: 'i' } },
    //                 { description: { $regex: search, $options: 'i' } }
    //             ];
    //         }

    //         const data = await News.find(filter)
    //             .populate('category', 'name')
    //             .populate('subCategory', 'name')
    //             .populate('tags', 'name')
    //             .populate('createdBy', 'name')
    //             .sort({ createdAt: -1 })
    //             .skip((+page - 1) * +limit)
    //             .limit(+limit);

    //         const totalCount = await News.countDocuments(filter);

    //         res.json({
    //             data,
    //             meta: { pagination: { page: +page, limit: +limit, totalCount } }
    //         });
    //     } catch (exception) {
    //         next(exception);
    //     }
    // }

    async getAllNews(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { category, tag, status, search, page = 1, limit = 10, isPublic } = req.query;
            let filter: any = {};
    
            // १. यदि यो पब्लिक कल हो भने, केवल 'Published' मात्र देखाउने
            if (isPublic === 'true') {
                filter.is_published = 'Published';
            } else if (status) {
                // यदि एडमिन कल हो र 'status' स्पेसिफिक छ भने त्यो प्रयोग गर्ने
                filter.is_published = status;
            }
    
            // २. बाँकी फिल्टरहरू
            if (category) filter.category = category;
            if (tag) filter.tags = { $in: [tag] }; 
            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
    
            const data = await News.find(filter)
                .populate('category', 'name')
                .populate('subCategory', 'name')
                .populate('tags', 'name')
                .populate('createdBy', 'name')
                .sort({ createdAt: -1 })
                .skip((+page - 1) * +limit)
                .limit(+limit);
    
            const totalCount = await News.countDocuments(filter);
    
            res.json({
                data,
                meta: { pagination: { page: +page, limit: +limit, totalCount } }
            });
        } catch (exception) {
            next(exception);
        }
    }

async getNewsBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const paramSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
        const decodedSlug = decodeURIComponent(paramSlug).normalize("NFC");


        const news = await News.findOneAndUpdate(
            { slug: decodedSlug }, 
            { $inc: { viewCount: 1 } },
            // { new: true }
            { returnDocument: 'after' }
        ).populate('category tags createdBy subCategory');
        
        if (!news) {
            // यदि सिधै म्याच भएन भने, debug को लागि सानो log राख्नुहोस्
            console.log("News not found for slug:", decodedSlug);
            return next({ code: 404, message: "News not found" });
        }

        res.json({ data: news, status: true });
    } catch (exception) {
        next(exception);
    }
}

    // 4. Update News
    async updateNews(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const data = { ...req.body };
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const user = req.loggedInUser;

            // Purano news check garne
            const newsDetail = await News.findById(id);
            if (!newsDetail) {
                return next({ code: 404, message: "News article not found" });
            }

            // Naya image upload vako chha vane path update garne
            if (files?.image?.[0]) {
                data.image = files.image[0].path;
            }

            // Multiple selection logic
            if (data.tags && typeof data.tags === 'string') data.tags = JSON.parse(data.tags);
            if (data.type && typeof data.type === 'string') data.type = JSON.parse(data.type);

            // FIX: Update गर्दा पनि खाली subCategory आयो भने null बनाउने
            if (data.subCategory === '') {
                data.subCategory = null;
            }

            data.updatedBy = (user as any)._id;

            const updatedNews = await News.findByIdAndUpdate(
                id, 
                { $set: data }, 
                // { new: true }
                { returnDocument: 'after' }
            );

            res.json({
                data: updatedNews,
                message: "News updated successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }

    // 5. Delete News
    async deleteNews(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await News.findByIdAndDelete(id);

            if (!deleted) {
                return next({ code: 404, message: "News not found or already deleted" });
            }

            res.json({
                message: "News deleted successfully",
                status: true
            });
        } catch (exception) {
            next(exception);
        }
    }
}

export default NewsController;