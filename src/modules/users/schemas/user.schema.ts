import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document & { _id: Types.ObjectId };

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, default: null })
  profilePicture: string;

  @Prop({ type: String, default: null })
  phoneNumber: string;

  @Prop({ type: Date, default: null })
  lastLogin: Date;

  @Prop({ type: String, default: null })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// Virtual for fullName
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    const result: any = ret;
    delete result.password;
    delete result.refreshToken;
    delete result.__v;
    return result;
  },
});
