import { gql } from 'apollo-server-lambda';

const typeDefs = gql`
  scalar JSON

  type News {
    id: ID!
    type: String!
    by: String!
    time: Int!
    title: String!
    text: String!
    parent: ID!
    url: String!
    score: Int!
    descendants: Int!
  }

  type Query {
    topNews: [News]
  }
`;

export default typeDefs;
