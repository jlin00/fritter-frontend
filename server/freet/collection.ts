import type {HydratedDocument, Types} from 'mongoose';
import type {Freet} from './model';
import FreetModel from './model';
import UserCollection from '../user/collection';
import TagCollection from '..//tag/collection';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class FreetCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} authorId - The id of the author of the freet
   * @param {string} content - The id of the content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly created freet
   */
  static async addOne(authorId: Types.ObjectId | string, content: string, tags: string[]): Promise<HydratedDocument<Freet>> {
    const date = new Date();
    const taglist = await TagCollection.findOrCreateMany(tags);

    const freet = new FreetModel({
      authorId,
      dateCreated: date,
      content,
      dateModified: date,
      tags: taglist.map(t => t._id)
    });

    await freet.save(); // Saves freet to MongoDB
    return freet.populate(['authorId', 'tags']);
  }

  /**
   * Find a freet by freetId
   *
   * @param {string} freetId - The id of the freet to find
   * @return {Promise<HydratedDocument<Freet>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOne(freetId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    return FreetModel.findOne({_id: freetId}).populate(['authorId', 'tags']);
  }

  /**
   * Get all the freets in the database
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAll(): Promise<Array<HydratedDocument<Freet>>> {
    return FreetModel.find({}).sort({dateModified: -1}).populate(['authorId', 'tags']);
  }

  /**
   * Get all the freets by given author
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Freet>>> {
    const author = await UserCollection.findOneByUsername(username);
    return FreetModel.find({authorId: author._id}).sort({dateModified: -1}).populate(['authorId', 'tags']);
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {string} content - The new content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async updateOne(freetId: Types.ObjectId | string, content: string, tags: string[]): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    const taglist = await TagCollection.findOrCreateMany(tags);
    freet.tags = taglist.map(t => t._id);
    freet.content = content;
    freet.dateModified = new Date();
    await freet.save();
    return freet.populate(['authorId', 'tags']);
  }

  /**
   * Delete a freet with given freetId.
   *
   * @param {string} freetId - The freetId of freet to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(freetId: Types.ObjectId | string): Promise<boolean> {
    const freet = await FreetModel.deleteOne({_id: freetId});
    return freet !== null;
  }

  /**
   * Delete all the freets by the given author
   *
   * @param {string} authorId - The id of author of freets
   */
  static async deleteMany(authorId: Types.ObjectId | string): Promise<void> {
    await FreetModel.deleteMany({authorId});
  }

  /**
    * Get all freets authored by a user in a given list of usernames or containing tags in a given list of tags.
    *
    * @param {string[]} authors - The users to filter for
    * @param {string[]} tags - The tags to filter for
    * @returns {Promise<HydratedDocument<Freet>[]>} - The array of freets matching parameters
    */
  static async filter(authors: Types.ObjectId[] | string[], tags: Types.ObjectId[] | string[]): Promise<Array<HydratedDocument<Freet>>> {
    return FreetModel.find({
      $or: [
        {authorId: {$in: authors}},
        {tags: {$in: tags}}
      ]
    }).sort({dateModified: -1}).populate(['authorId', 'tags']);
  }
}

export default FreetCollection;
