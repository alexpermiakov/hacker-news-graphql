import axios from 'axios';
import { getPublishedDate, getOffsetByCursor, extractDomain } from './utils';
import { BASE_URL } from './dataSources/StoryAPI';

type topNewsReturnType = Promise<{
  data: any[];
  hasMore: boolean;
  cursor: number;
}>;

const formatStory = story => ({
  ...story,
  time: getPublishedDate(story.time),
  numberOfComments: (story.kids || []).length,
  logo: story.url
    ? `https://api.faviconkit.com/${extractDomain(story.url)}/144`
    : '',
  domain: extractDomain(story.url),
});

const loadComments = async (storyAPI, stories) => {
  const idsArray = stories.map(story => (story.kids || []).slice(0, 5));
  const idsPromises = idsArray.map(ids => storyAPI.getItemsByIds(ids));
  const commentsArray: any[] = await Promise.all(idsPromises);

  for (const [index, story] of stories.entries()) {
    story.comments = commentsArray[index].filter(comment => comment.by);
  }
};

export const topStories = async (
  _,
  { cursor, pageSize = 15 },
  { dataSources: { storyAPI } },
): topNewsReturnType => {
  const url = `${BASE_URL}/topstories.json`;
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
