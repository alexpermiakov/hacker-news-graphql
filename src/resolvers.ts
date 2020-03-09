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
  favicon: story.url
    ? `https://favicongrabber.com/api/grab/${extractDomain(story.url)}`
    : '',
  domain: extractDomain(story.url),
  user: story.by || story.user,
  comments: formatComments(flatComments(story.comments)),
});

const formatComments = comments =>
  (comments || []).map(formatComment).filter(Boolean);

const formatComment = comment =>
  comment && (comment.user || comment.by)
    ? {
        ...comment,
        user: comment.user || comment.by,
        text: comment.text || comment.content,
      }
    : null;

const flatComments = (comments, res = [], level = 0) => {
  comments = comments || [];
  for (let comment of comments) {
    res.push({
      ...comment,
      level: level + 1,
    });
    flatComments(comment.comments, res, level + 1);
    delete comment.comments;
  }
  return res;
};

const loadComments = async (storyAPI, stories) => {
  const idsArray = stories.map(story => (story.kids || []).slice(0, 5));
  const idsPromises = idsArray.map(ids => storyAPI.getItemsByIds(ids));
  const commentsArray: any[] = await Promise.all(idsPromises);

  for (const [index, story] of stories.entries()) {
    story.comments = formatComments(flatComments(commentsArray[index])).map(
      comment => ({
        ...comment,
        text: '<p>' + comment.text,
      }),
    );
  }
};

const getStoriesByIds = async ({ ids, storyAPI }) => {
  const stories = await storyAPI.getItemsByIds(ids);
  const formattedStories = stories.map(formatStory);
  await loadComments(storyAPI, formattedStories);
  return formattedStories;
};

const getStoriesByCursor = async ({ cursor, pageSize, storyAPI, type }) => {
  const url = `${BASE_URL}/${type}.json`;
  const { data: items } = await axios.get(url);
  const offset = getOffsetByCursor(items, cursor);
  const ids = items.slice(offset, offset + pageSize);

  const stories = await getStoriesByIds({ ids, storyAPI });
  const hasMore = stories.length > 0;

  return {
    cursor: hasMore ? stories[stories.length - 1].id : null,
    hasMore,
    data: stories,
  };
};

export const search = async (
  _,
  { cursor = 0, query },
  { dataSources: { storyAPI } },
) => {
  const url = `https://hn.algolia.com/api/v1/search?tags=story&query=${query}&page=${cursor}`;
  const { data: items } = await axios.get(url);
  const ids = items.hits.map(it => it.objectID);
  const stories = await getStoriesByIds({ ids, storyAPI });
  const hasMore = stories.length > 0;

  return {
    cursor: hasMore ? stories[stories.length - 1].id : null,
    hasMore,
    data: stories,
  };
};

export const topStories = async (
  _,
  { cursor, pageSize = 15 },
  { dataSources: { storyAPI } },
) => getStoriesByCursor({ cursor, pageSize, storyAPI, type: 'topstories' });

export const askStories = async (
  _,
  { cursor, pageSize = 15 },
  { dataSources: { storyAPI } },
) => getStoriesByCursor({ cursor, pageSize, storyAPI, type: 'askstories' });

export const showStories = async (
  _,
  { cursor, pageSize = 15 },
  { dataSources: { storyAPI } },
) => getStoriesByCursor({ cursor, pageSize, storyAPI, type: 'showstories' });

export const bestStories = async (
  _,
  { cursor, pageSize = 15 },
  { dataSources: { storyAPI } },
) => getStoriesByCursor({ cursor, pageSize, storyAPI, type: 'beststories' });

export const jobStories = async (
  _,
  { cursor, pageSize = 15 },
  { dataSources: { storyAPI } },
) => getStoriesByCursor({ cursor, pageSize, storyAPI, type: 'jobstories' });

export const story = async (_, { id }): Promise<any> => {
  const url = `https://api.hnpwa.com/v0/item/${id}.json`;
  const { data } = await axios.get(url);

  return {
    cursor: null,
    hasMore: false,
    data: formatStory(data),
  };
};

export const stories = async (
  _,
  { ids = [] },
  { dataSources: { storyAPI } },
) => ({
  cursor: null,
  hasMore: false,
  data: await getStoriesByIds({ ids, storyAPI }),
});
