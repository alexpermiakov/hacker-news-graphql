import axios from 'axios';
import { getPublishedDate, getOffsetByCursor } from './utils';
import { BASE_URL } from './dataSources/StoryAPI';

type topNewsReturnType = Promise<{
  data: any[];
  hasMore: boolean;
  cursor: number;
}>;

export const topStories = async (
  _,
  { cursor, pageSize = 20 },
  { dataSources: { storyAPI } },
): topNewsReturnType => {
  const url = `${BASE_URL}/topstories.json`;
  const { data: items } = await axios.get(url);
  const offset = getOffsetByCursor(items, cursor);
  const ids = items.slice(offset, offset + pageSize);
  const res = await storyAPI.getByIds(ids);
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
