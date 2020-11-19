import 'core-js/fn/array/find';
import 'core-js/fn/math/log10';
import 'core-js/fn/object/values';

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

import ConfigApp from './ConfigApp';
import { unregister } from './registerServiceWorker';
import { graphqlApiUrl } from './configuration';

const client = new ApolloClient({
  link: new HttpLink({
    uri: `${graphqlApiUrl}/graphql`,
  }),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <ConfigApp />
  </ApolloProvider>,
  document.getElementById('root')
);

// disable service worker
unregister();
