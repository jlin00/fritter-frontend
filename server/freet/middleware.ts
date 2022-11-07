import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';

/**
 * Checks if a freet with freetId is req.params exists
 */
const isFreetExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.freetId);
  const freet = validFormat ? await FreetCollection.findOne(req.params.freetId) : '';
  if (!freet) {
    res.status(404).json({
      error: `Freet with freet ID ${req.params.freetId} does not exist.`
    });
    return;
  }

  next();
};

/**
 * Checks if the content of the freet in req.body is valid, i.e not a stream of empty
 * spaces and not more than 140 characters
 */
const isValidFreetContent = (req: Request, res: Response, next: NextFunction) => {
  const {content} = req.body as {content: string};
  if (!content.trim()) {
    res.status(400).json({
      error: 'Freet content must be at least one character long.'
    });
    return;
  }

  if (content.length > 140) {
    res.status(413).json({
      error: 'Freet content must be no more than 140 characters.'
    });
    return;
  }

  next();
};

/**
 * Checks if the current user is the author of the freet whose freetId is in req.params
 */
const isValidFreetModifier = async (req: Request, res: Response, next: NextFunction) => {
  const freet = await FreetCollection.findOne(req.params.freetId);
  const userId = freet.authorId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: 'Cannot modify other users\' freets.'
    });
    return;
  }

  next();
};

/**
 * Check that each tag in the taglist is valid, it matches the tag regex
 */
const isValidTaglist = async (req: Request, res: Response, next: NextFunction) => {
  let tags;
  if (req.query.tags !== undefined) {
    tags = (req.query.tags as string) === '' ? [] : (req.query.tags as string).split(',');
  } else if (req.query.tags === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    tags = req.body.tags;
  }

  const tagRegex = /^\w+$/i;
  for (const tag of tags) {
    if (!tagRegex.test(tag)) {
      res.status(400).json({
        error: 'Tag must be a nonempty alphanumeric string.'
      });
      return;
    }
  }

  next();
};

export {
  isValidFreetContent,
  isFreetExists,
  isValidFreetModifier,
  isValidTaglist
};
