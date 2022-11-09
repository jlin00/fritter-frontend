import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';

export type Link = {
  _id: Types.ObjectId;
  issuerId: Types.ObjectId;
  link: string;
};

export type PopulatedLink = {
  _id: Types.ObjectId;
  issuerId: User;
  link: string;
};

export const LinkSchema = new Schema<Link>({
  issuerId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  link: {
    type: String,
    required: true
  }
});

const LinkModel = model<Link>('Link', LinkSchema);
export default LinkModel;
