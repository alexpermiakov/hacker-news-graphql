import { gql } from 'apollo-server-lambda';

const typeDefs = gql`
  scalar JSON

  type Comment {
    id: ID!
    user: String!
    score: Int!
    time: String!
    text: String!
    parent: ID!
    comments: [Comment!]
    level: Int!
  }

  type Story {
    id: ID!
    type: String!
    user: String!
    time: String!
    title: String!
    text: String
    url: String
    score: Int!
    domain: String
    numberOfComments: Int!
    favicon: String
    comments: [Comment!]
  }

  type StoriesConnection {
    cursor: Int
    hasMore: Boolean!
    data: [Story]!
  }

  type StoryConnection {
    cursor: Int
    hasMore: Boolean!
    data: Story!
  }

  type Query {
    topStories(pageSize: Int, cursor: Int): StoriesConnection!
    askStories(pageSize: Int, cursor: Int): StoriesConnection!
    showStories(pageSize: Int, cursor: Int): StoriesConnection!
    jobsStories(pageSize: Int, cursor: Int): StoriesConnection!
    story(id: ID!, pageSize: Int, cursor: Int): StoryConnection!
  }
`;

export default typeDefs;
