import axios from 'axios';
import { getPublishedDate, getOffsetByCursor } from './utils';

const topStoriesURL = `https://hacker-news.firebaseio.com/v0/topstories.json`;

const getItemURL = storyId =>
  `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`;

const getStories = async storyIds => {
  const stories = storyIds.map(storyId => axios.get(getItemURL(storyId)));
  const res = await Promise.all(stories);

  return res.map(it => (it as any).data);
};

type topNewsReturnType = Promise<{
  data: any[];
  hasMore: boolean;
  cursor: number;
}>;

export const topNews = async (
  _,
  { cursor, pageSize = 20 },
): topNewsReturnType => {
  const { data: items } = await axios.get(topStoriesURL);

  const offset = getOffsetByCursor(items, cursor);
  const res = await getStories(items.slice(offset, offset + pageSize));
  const hasMore = res.length > 0;

  const data = res.map(item => ({
    ...item,
    time: getPublishedDate(item.time),
    numberOfComments: (item.kids || []).length,
    logo: 'https://s2.googleusercontent.com/s2/favicons?domain_url=' + item.url,
  }));

  return {
    cursor: hasMore ? res[res.length - 1].id : null,
    hasMore,
    data,
  };
};
