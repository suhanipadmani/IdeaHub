import { User } from '@/models/User';
import { BaseService } from './base.service';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { generateToken } from '@/lib/jwt';

export class UserService extends BaseService<any> {
    constructor() {
        super(User);
    }

    async findByEmail(email: string) {
        await this.connect();
        return this.model.findOne({ email: email.toLowerCase() }).exec();
    }

    async validateCredentials(email: string, password: string) {
        const user = await this.findByEmail(email);
        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return null;

        return user;
    }

    async login(email: string, password: string) {
        const user = await this.validateCredentials(email, password);
        if (!user) return null;

        const token = generateToken(user._id.toString(), user.role);
        return { user, token };
    }

    async register(userData: any) {
        const email = userData.email.toLowerCase();
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        return this.create({
            ...userData,
            email,
            password: hashedPassword
        });
    }

    async findUsers(filter: any = {}, options: { page?: number, limit?: number, select?: string, sort?: any } = {}) {
        await this.connect();
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;
        const select = options.select || "";
        const sort = options.sort || { createdAt: -1 };

        const totalDocs = await this.model.countDocuments(filter);
        const users = await this.model.find(filter)
            .select(select)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec();

        return {
            docs: users,
            totalDocs,
            limit,
            page,
            totalPages: Math.ceil(totalDocs / limit)
        };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.findById(userId);
        if (!user) throw new Error("User not found");

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) throw new Error("Invalid current password");

        user.password = await bcrypt.hash(newPassword, 10);
        return user.save();
    }

    async deleteAccount(userId: string) {
        await this.connect();
        return this.model.findByIdAndDelete(userId).exec();
    }

    async forgotPassword(email: string) {
        const user = await this.findByEmail(email);
        if (!user) throw new Error("User not found");

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

        await user.save();
        return resetToken;
    }

    async resetPassword(token: string, password: string) {
        await this.connect();
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await this.model.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) throw new Error("Invalid or expired token");

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        return user.save();
    }

    async updateProfile(userId: string, profileData: any) {
        return this.update(userId, profileData);
    }
}

export const userService = new UserService();
