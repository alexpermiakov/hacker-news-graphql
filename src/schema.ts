import { gql } from 'apollo-server-lambda';

const typeDefs = gql`
  scalar JSON

  type News {
    id: ID!
    type: String!
    by: String!
    time: String!
    title: String!
    text: String
    url: String
    score: Int!
    numberOfComments: Int!
    logo: String
  }

  type TopNewsConnection {
    cursor: Int
    hasMore: Boolean!
    data: [News]!
  }

  type Query {
    topNews(pageSize: Int, cursor: Int): TopNewsConnection!
  }
`;

export default typeDefs;
