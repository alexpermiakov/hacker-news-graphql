import { RESTDataSource } from 'apollo-datasource-rest';

export const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

class StoryAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = BASE_URL;
  }

  async getById(id: number) {
    return await this.get(`/item/${id}.json`);
  }

  async getByIds(ids: [number]) {
    return Promise.all(ids.map(id => this.getById(id)));
  }
}

export default StoryAPI;
