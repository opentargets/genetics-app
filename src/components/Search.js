import React from 'react';
import { withRouter } from 'react-router';
import { withApollo } from 'react-apollo';
import { loader } from 'graphql.macro';

import { Search as OtSearch } from 'ot-ui';

import SearchOption from './SearchOption';

const SEARCH_QUERY = loader('../queries/SearchQuery.gql');

const asGroupedOptions = data => {
  return [
    {
      label: 'Genes',
      options: data.genes.map(d => ({ ...d, groupType: 'gene' })),
    },
    {
      label: 'Variants',
      options: data.variants.map(d => ({ ...d, groupType: 'variant' })),
    },
    {
      label: 'Studies',
      options: data.studies.map(d => ({ ...d, groupType: 'study' })),
    },
  ];
};

class Search extends React.Component {
  handleSelectOption = (value, { action }) => {
    const { history } = this.props;
    if (action === 'select-option') {
      switch (value.groupType) {
        case 'gene':
          history.push(`/gene/${value.id}`);
          break;
        case 'variant':
          history.push(`/variant/${value.id}`);
          break;
        case 'study':
          history.push(`/study/${value.studyId}`);
          break;
        default:
          break;
      }
    }
  };
  handleInputChange = inputValue => {
    if (!inputValue || inputValue.length < 3) {
      return;
    }

    const { client } = this.props;
    return client
      .query({
        query: SEARCH_QUERY,
        variables: { queryString: inputValue },
      })
      .then(response => {
        if (response.data && response.data.search) {
          return asGroupedOptions(response.data.search);
        } else {
          return asGroupedOptions({
            genes: [],
            variants: [],
            studies: [],
          });
        }
      });
  };
  render() {
    return (
      <OtSearch
        onInputChange={this.handleInputChange}
        optionComponent={SearchOption}
        onSelectOption={this.handleSelectOption}
        placeholder="Search for a gene, variant or trait..."
      />
    );
  }
}

export default withApollo(withRouter(Search));
