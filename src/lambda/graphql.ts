// import '@babel/polyfill/noConflict';
import { ApolloServer } from 'apollo-server-lambda';
import GraphQLJSON from 'graphql-type-json';
import { Context, Callback, APIGatewayProxyEvent } from 'aws-lambda';
import typeDefs from '../schema';
import {
  topStories,
  askStories,
  showStories,
  jobsStories,
  story,
} from '../resolvers';
import StoryAPI from '../dataSources/StoryAPI';

const resolvers = {
  Query: {
    topStories,
    askStories,
    showStories,
    jobsStories,
    story,
  },
  JSON: GraphQLJSON,
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  dataSources: () => ({
    storyAPI: new StoryAPI(),
  }),
});

const handler = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
) => {
  const serverHandler = server.createHandler({
    cors: {
      origin: '*',
      methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'],
      allowedHeaders: 'content-Type',
    },
  });

  context.callbackWaitsForEmptyEventLoop = false;
  return serverHandler(event, context, callback);
};

export { handler };
