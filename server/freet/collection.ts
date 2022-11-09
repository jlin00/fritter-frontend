import type {HydratedDocument, Types} from 'mongoose';
import FreetModel from './model';
import LinkModel from '../link/model';
import type {Freet} from './model';
import type {Link} from '../link/model';
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
      tags: taglist.map(t => t._id),
      upvotes: [],
      downvotes: [],
      links: []
    });

    await freet.save(); // Saves freet to MongoDB
    return freet.populate(['authorId', 'tags', 'upvotes', 'downvotes', 'links']);
  }

  /**
   * Find a freet by freetId
   *
   * @param {string} freetId - The id of the freet to find
   * @return {Promise<HydratedDocument<Freet>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOne(freetId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    return FreetModel.findOne({_id: freetId}).populate(['authorId', 'tags', 'upvotes', 'downvotes', 'links']);
  }

  /**
   * Get all the freets in the database
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAll(): Promise<Array<HydratedDocument<Freet>>> {
    return FreetModel.find({}).sort({dateModified: -1}).populate(['authorId', 'tags', 'upvotes', 'downvotes', 'links']);
  }

  /**
   * Get all the freets by given author
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Freet>>> {
    const author = await UserCollection.findOneByUsername(username);
    return FreetModel.find({authorId: author._id}).sort({dateModified: -1}).populate(['authorId', 'tags', 'upvotes', 'downvotes', 'links']);
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
    return freet.populate(['authorId', 'tags', 'upvotes', 'downvotes', 'links']);
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
    }).sort({dateModified: -1}).populate(['authorId', 'tags', 'upvotes', 'downvotes', 'links']);
  }

  /**
   * Add a credibility vote to a freet
   *
   * @param {string} freetId - The id of the freet being voted on
   * @param {string} issuerId - The user issuing the vote
   * @param {boolean} credible - Whether or not the freet is credible
   * @returns {Promise<HydratedDocument<Freet>>} - The updated freet
   */
  static async addVote(freetId: Types.ObjectId, issuerId: Types.ObjectId, credible: boolean): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    if (credible) {
      freet.upvotes.push(issuerId);
    } else {
      freet.downvotes.push(issuerId);
    }

    await freet.save();
    return freet.populate(['authorId', 'tags', 'upvotes', 'downvotes', 'links']);
  }

  /**
   * Remove a credibility vote from a freet
   *
   * @param {string} freetId - The id of the freet being voted on
   * @param {string} issuerId - The user issuing the vote
   * @returns {Promise<HydratedDocument<Freet>>} - The updated freet
   */
  static async removeVote(freetId: Types.ObjectId, issuerId: Types.ObjectId): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});

    for (const votes of [freet.upvotes, freet.downvotes]) {
      const index = votes.indexOf(issuerId);
      if (index !== -1) {
        votes.splice(index, 1);
      }
    }

    await freet.save();
    return freet.populate(['authorId', 'tags', 'upvotes', 'downvotes', 'links']);
  }

  /**
   * Determine if there is a vote belonging to given freet from given user
   *
   * @param {string} freetId - The id of the freet
   * @param {string} issuerId - The id of the issuer
   * @returns {Promise<Boolean>} - The vote object
   */
  static async isVoteExists(freetId: Types.ObjectId | string, issuerId: Types.ObjectId | string): Promise<boolean> {
    const freet = await FreetModel.findOne({_id: freetId});
    return freet.upvotes.some(id => id.toString() === issuerId.toString()) || freet.downvotes.some(id => id.toString() === issuerId.toString());
  }

  /**
   * Delete all votes associated with given userId
   *
   * @param {string} userId - The relevant userId
   * @returns {Promise<HydratedDocument<Freet>[]>} - true if the votes have been deleted, false otherwise
   */
  static async deleteVotesByUserId(userId: Types.ObjectId): Promise<Array<HydratedDocument<Freet>>> {
    const freets = await this.findAll();
    const promises = [];
    for (const freet of freets) {
      promises.push(this.removeVote(freet._id, userId));
    }

    return Promise.all(promises);
  }

  /**
   * Add a reference link for a freet
   *
   * @param {string} freetId - The id of the freet
   * @param {string} issuerId - The user issuing the link
   * @param {string} refLink - The reference link
   * @returns {Promise<HydratedDocument<Freet>>} - The updated freet
   */
  static async addLink(freetId: Types.ObjectId, issuerId: Types.ObjectId, refLink: string): Promise<HydratedDocument<Freet>> {
    const link = new LinkModel({
      issuerId,
      link: refLink
    });

    const freet = await FreetModel.findOne({_id: freetId});
    freet.links.push(link);

    await freet.save();
    return freet.populate(['authorId', 'tags', 'upvotes', 'downvotes', 'links']);
  }

  /**
   * Remove a reference link from a freet
   *
   * @param {string} freetId - The id of the freet being voted on
   * @param {string} linkId - The id of the link
   * @returns {Promise<HydratedDocument<Freet>>} - The updated freet
   */
  static async removeLink(freetId: Types.ObjectId, linkId: Types.ObjectId): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    let index = -1;

    for (let i = 0; i < freet.links.length; i++) {
      if (freet.links[i]._id === linkId) {
        index = i;
      }
    }

    if (index !== -1) {
      freet.links.splice(index, 1);
    }

    await freet.save();
    return freet.populate(['authorId', 'tags', 'upvotes', 'downvotes', 'links']);
  }

  /**
   * Find a reference link by id
   *
   * @param {string} freetId - The freet that the reference link belongs to
   * @param {string} linkId - The id of the reference link
   * @return {Promise<Link>} - The reference link
   */
  static async findLink(freetId: Types.ObjectId | string, linkId: Types.ObjectId | string): Promise<Link> {
    const freet = await this.findOne(freetId);

    for (const link of freet.links) {
      if (link._id === linkId) {
        return link;
      }
    }

    return null;
  }

  /**
   * Delete all links associated with given userId
   *
   * @param {string} userId - The relevant userId
   * @returns {Promise<HydratedDocument<Freet>[]>} - true if the links have been deleted, false otherwise
   */
  static async deleteLinksByUserId(userId: Types.ObjectId | string): Promise<Array<HydratedDocument<Freet>>> {
    const freets = await this.findAll();
    const promises = [];

    for (const freet of freets) {
      for (const link of freet.links) {
        if (link.issuerId === userId) {
          promises.push(this.removeLink(freet._id, link.issuerId));
        }
      }
    }

    return Promise.all(promises);
  }
}

export default FreetCollection;
