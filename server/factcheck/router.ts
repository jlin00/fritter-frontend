import type {Request, Response} from 'express';
import {Types} from 'mongoose';
import express from 'express';
import * as factCheckValidator from './middleware';
import * as freetValidator from '../freet/middleware';
import * as userValidator from '../user/middleware';
import FreetCollection from '../freet/collection';

const router = express.Router();

/**
 * Add a new credibility vote to given freet.
 *
 * @name POST /api/credibility/:freetId/votes
 *
 * @param {boolean} credible - Whether the vote is credible or uncredible
 * @return {VoteResponse} - The created vote
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the freetId is invalid
 * @throws {409} - If the user has already issued a vote for the given freet
 */
router.post(
  '/:freetId/votes',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    factCheckValidator.hasNotAlreadyVoted
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    await FreetCollection.addVote(new Types.ObjectId(req.params.freetId), new Types.ObjectId(userId), req.body.credible);

    res.status(201).json({
      message: 'Your vote was issued successfully.',
    });
  }
);

/**
 * Delete a credibility vote from given freet
 *
 * @name DELETE /api/credibility/:freetId/votes
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the freetId is not valid or there is no vote from the user on given freet
 */
router.delete(
  '/:freetId/votes',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    factCheckValidator.hasAlreadyVoted
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    await FreetCollection.removeVote(new Types.ObjectId(req.params.freetId), new Types.ObjectId(userId));

    res.status(200).json({
      message: 'Your vote was deleted successfully.'
    });
  }
);

/**
 * Add a new reference link for given freet.
 *
 * @name POST /api/credibility/:freetId/links
 *
 * @param {string} link - The reference link
 * @return {referenceLinkResponse} - The created reference link
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the freetId is invalid
 * @throws {413} - If link is poorly formatted
 */
router.post(
  '/:freetId/links',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    factCheckValidator.isValidURL
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    await FreetCollection.addLink(new Types.ObjectId(req.params.freetId), new Types.ObjectId(userId), req.body.link);

    res.status(201).json({
      message: 'Your reference link was added successfully.'
    });
  }
);

/**
 * Delete a reference link from given freet
 *
 * @name DELETE /api/credibility/:freetId/links/:linkId
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or user is not the issuer of the reference link
 * @throws {404} - If freetId, linkId is not valid
 */
router.delete(
  '/:freetId/links/:linkId',
  [
    userValidator.isUserLoggedIn,
    factCheckValidator.isReferenceLinkExists,
    factCheckValidator.isValidReferenceLinkModifier
  ],
  async (req: Request, res: Response) => {
    await FreetCollection.removeLink(new Types.ObjectId(req.params.freetId), new Types.ObjectId(req.params.linkId));

    res.status(200).json({
      message: 'Your reference link was deleted successfully.'
    });
  }
);

export {router as factCheckRouter};
