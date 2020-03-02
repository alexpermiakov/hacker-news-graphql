import axios from 'axios';
import { getPublishedDate, getOffsetByCursor, extractDomain } from './utils';
import { BASE_URL } from './dataSources/StoryAPI';

type storiesReturnType = Promise<{
  data: any[];
  hasMore: boolean;
  cursor: number;
}>;

const formatStory = story => ({
  ...story,
  score: story.score || story.points,
  time: getPublishedDate(story.time),
  numberOfComments: (story.kids || story.comments || []).length,
  favicon: story.url ? `https://${extractDomain(story.url)}/favicon.ico` : '',
  domain: extractDomain(story.url),
  user: story.by || story.user,
  comments: flatComments(story.comments.map(formatComment).filter(Boolean)),
});

const formatComment = ({ comments, ...rest }) =>
  rest.user || rest.by
    ? {
        ...rest,
        user: rest.user || rest.by,
        text: rest.text || rest.content,
        comments:
          comments && comments.length ? comments.map(formatComment) : [],
      }
    : null;

const flatComments = (comments = [], res = []) => {
  for (let comment of comments) {
    res.push(comment);
    flatComments(comment.comments, res);
    delete comment.comments;
  }
  return res;
};

const loadComments = async (storyAPI, stories) => {
  const idsArray = stories.map(story => (story.kids || []).slice(0, 5));
  const idsPromises = idsArray.map(ids => storyAPI.getItemsByIds(ids));
  const commentsArray: any[] = await Promise.all(idsPromises);

  for (const [index, story] of stories.entries()) {
    story.comments = commentsArray[index].filter(comment => comment.by);
  }
};

const getStories = async ({
  cursor,
  pageSize = 15,
  storyAPI,
  type,
}): storiesReturnType => {
  const url = `${BASE_URL}/${type}.json`;
  const { data: items } = await axios.get(url);
  const offset = getOffsetByCursor(items, cursor);
  const ids = items.slice(offset, offset + pageSize);
  const stories = await storyAPI.getItemsByIds(ids);
  const hasMore = stories.length > 0;

  const formattedStories = stories.map(formatStory);

  await loadComments(storyAPI, formattedStories);

  return {
    cursor: hasMore ? stories[stories.length - 1].id : null,
    hasMore,
    data: formattedStories,
  };
};

export const topStories = async (
  _,
  { cursor, pageSize = 15 },
  { dataSources: { storyAPI } },
): storiesReturnType =>
  getStories({ cursor, pageSize, storyAPI, type: 'topstories' });

export const askStories = async (
  _,
  { cursor, pageSize = 15 },
  { dataSources: { storyAPI } },
): storiesReturnType =>
  getStories({ cursor, pageSize, storyAPI, type: 'askstories' });

export const showStories = async (
  _,
  { cursor, pageSize = 15 },
  { dataSources: { storyAPI } },
): storiesReturnType =>
  getStories({ cursor, pageSize, storyAPI, type: 'showstories' });

export const jobsStories = async (
  _,
  { cursor, pageSize = 15 },
  { dataSources: { storyAPI } },
): storiesReturnType =>
  getStories({ cursor, pageSize, storyAPI, type: 'jobsstories' });

export const story = async (
  _,
  { id, cursor, pageSize = 15 },
  { dataSources: { storyAPI } },
): Promise<any> => {
  const url = `https://api.hnpwa.com/v0/item/${id}.json`;
  const { data } = await axios.get(url);

  return {
    cursor: null,
    hasMore: false,
    data: formatStory(data),
  };
};
