import React, { Component } from "react";
import Link from "./Link";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { LINKS_PER_PAGE } from "../constants";

export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      count
    }
  }
`

class LinkList extends Component {
  _updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({ query: FEED_QUERY });

    const votedLink = data.feed.links.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    store.writeQuery({ query: FEED_QUERY, data });
  };

  _getQueryVariables = () => {
    const isNewPage = this.props.location.pathname.includes('new')
    const page = parseInt(this.props.match.params.page, 10)
  
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return { first, skip, orderBy }
  }

  render() {
    return (
      <Query query={FEED_QUERY} variables={this._getQueryVariables()}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>;
          if (error) return <div>Error</div>;

          const linksToRender = data.feed.links;

          return (
            <div>
              {linksToRender.map((link, index) => (
                <Link key={link.id} link={link} index={index} updateStoreAfterVote={this._updateCacheAfterVote} />
              ))}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
