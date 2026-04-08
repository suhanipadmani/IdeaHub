import connectDB from '@/lib/db';
import { Model, Document } from 'mongoose';

export abstract class BaseService<T extends Document> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    protected async connect() {
        await connectDB();
    }

    async findById(id: string, options: any = {}) {
        await this.connect();
        return this.model.findById(id, null, options).exec();
    }

    async findOne(filter: any, options: any = {}) {
        await this.connect();
        return this.model.findOne(filter, null, options).exec();
    }

    async findMany(filter: any = {}, options: any = {}) {
        await this.connect();
        const sortBy = options.sort || { createdAt: -1 };
        return this.model.find(filter, null, options).sort(sortBy).exec();
    }

    async create(data: any) {
        await this.connect();
        const entity = new this.model(data);
        return entity.save();
    }

    async update(id: string, data: any, options: any = { returnDocument: 'after' }) {
        await this.connect();
        return this.model.findByIdAndUpdate(id, data, options).exec();
    }

    async delete(id: string) {
        await this.connect();
        return this.model.findByIdAndDelete(id).exec();
    }

    async getMonthlyGrowth(monthsCount: number = 6, filter: any = {}) {
        await this.connect();
        const startDate = new Date();
        startDate.setDate(1); 
        startDate.setMonth(startDate.getMonth() - (monthsCount - 1));
        startDate.setHours(0, 0, 0, 0);

        const baseCount = await this.model.countDocuments({ ...filter, createdAt: { $lt: startDate } });

        const monthlyData = await this.model.aggregate([
            { $match: { ...filter, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id": 1 } },
        ]);

        return { baseCount, monthlyData };
    }

    async count(filter: any = {}) {
        await this.connect();
        return this.model.countDocuments(filter).exec();
    }
}
