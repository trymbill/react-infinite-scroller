import React, { Component, PureComponent } from 'react';
import ReactDOM from 'react-dom';
import InfiniteScroll from '../../dist/InfiniteScroll';
import qwest from 'qwest';

const imageList = [];
const api = {
  baseUrl: 'https://api.soundcloud.com',
  client_id: 'caf73ef1e709f839664ab82bef40fa96',
};

class Track extends PureComponent {
  render() {
    const { permalink_url, artwork_url, title } = this.props;
    return (
      <div className="track">
        <a href={permalink_url} target="_blank" rel="noopener noreferrer">
          <img src={artwork_url} width="150" height="150" />
          <p className="title"> {title} </p>{' '}
        </a>{' '}
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tracks: [],
      hasMoreItems: true,
      nextHref: null,
    };
  }

  loadItems(page) {
    var self = this;

    var url = api.baseUrl + '/users/8665091/favorites';
    if (this.state.nextHref) {
      url = this.state.nextHref;
    }

    qwest
      .get(
        url,
        {
          client_id: api.client_id,
          linked_partitioning: 1,
          page_size: 10,
        },
        {
          cache: true,
        },
      )
      .then(function(xhr, resp) {
        if (resp) {
          var tracks = self.state.tracks;
          resp.collection.map(track => {
            if (track.artwork_url == null) {
              track.artwork_url = track.user.avatar_url;
            }

            tracks.push(track);
          });

          if (resp.next_href) {
            self.setState({
              tracks: tracks,
              nextHref: resp.next_href,
            });
          } else {
            self.setState({
              hasMoreItems: false,
            });
          }
        }
      });
  }

  render() {
    const loader = <div className="loader"> Loading... </div>;

    var items = [];
    this.state.tracks.map((track, i) => {
      items.push(<Track {...track} key={i} />);
    });

    return (
      <InfiniteScroll
        pageStart={0}
        loadMore={this.loadItems.bind(this)}
        hasMore={this.state.hasMoreItems}
        loader={loader}
      >
        <div className="tracks"> {items} </div>{' '}
      </InfiniteScroll>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
