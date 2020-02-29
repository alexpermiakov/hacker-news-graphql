import { gql } from 'apollo-server-lambda';

const typeDefs = gql`
  scalar JSON

  type Comment {
    id: ID!
    by: String!
    score: Int!
    time: String!
    text: String!
    parent: ID!
    comments: [Comment!]
  }

  type Story {
    id: ID!
    type: String!
    by: String!
    time: String!
    title: String!
    text: String
    url: String
    score: Int!
    domain: String
    numberOfComments: Int!
    logo: String
    comments: [Comment!]
  }

  type TopStoriesConnection {
    cursor: Int
    hasMore: Boolean!
    data: [Story]!
  }

  type Query {
    topStories(pageSize: Int, cursor: Int): TopStoriesConnection!
  }
`;

export default typeDefs;
