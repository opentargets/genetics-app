import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import {
  PageTitle,
  SubHeading,
  DownloadSVGPlot,
  SectionHeading,
  Button,
  ListTooltip,
  MultiSelect,
} from 'ot-ui';
import { Manhattan, withTooltip, chromosomeNames } from 'ot-charts';

import BasePage from './BasePage';
import ManhattanTable, { tableColumns } from '../components/ManhattanTable';
import ScrollToTop from '../components/ScrollToTop';
import StudyInfo from '../components/StudyInfo';
import StudySize from '../components/StudySize';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

const SIGNIFICANCE = 5e-8;

function hasAssociations(data) {
  return (
    data &&
    data.manhattan &&
    data.manhattan.associations &&
    data.manhattan.associations.length > 0
  );
}

function transformAssociations(data) {
  return {
    associations: data.manhattan.associations.map(d => {
      const { variant, ...rest } = d;
      return {
        ...rest,
        indexVariantId: variant.id,
        indexVariantRsId: variant.rsId,
        chromosome: variant.chromosome,
        position: variant.position,
      };
    }),
  };
}

function hasStudyInfo(data) {
  return data && data.studyInfo;
}

function significantLoci(data) {
  return hasAssociations(data)
    ? data.manhattan.associations.filter(d => d.pval < SIGNIFICANCE).length
    : 0;
}

function loci(data) {
  return hasAssociations(data) ? data.manhattan.associations.length : 0;
}

const manhattanQuery = gql`
  query StudyPageQuery($studyId: String!) {
    studyInfo(studyId: $studyId) {
      studyId
      traitReported
      pubAuthor
      pubDate
      pubJournal
      pmid
      nInitial
      nReplication
      nCases
    }
    manhattan(studyId: $studyId) {
      associations {
        variant {
          id
          rsId
          chromosome
          position
        }
        pval
        credibleSetSize
        ldSetSize
        bestGenes {
          score
          gene {
            id
            symbol
          }
        }
      }
    }
  }
`;

class StudyPage extends React.Component {
  state = {
    focusChromosome: '',
  };
  render() {
    const { studyId } = this.props.match.params;
    let manhattanPlot = React.createRef();
    const ManhattanWithTooltip = withTooltip(
      Manhattan,
      ListTooltip,
      tableColumns(studyId),
      'manhattan'
    );
    return (
      <BasePage>
        <ScrollToTop onRouteChange />
        <Helmet>
          <title>{studyId}</title>
        </Helmet>

        <Query
          query={manhattanQuery}
          variables={{ studyId }}
          fetchPolicy="network-only"
        >
          {({ loading, error, data }) => {
            const isStudyWithInfo = hasStudyInfo(data);
            const isAssociatedStudy = hasAssociations(data);
            const significantLociCount = significantLoci(data);
            const lociCount = loci(data);

            const manhattan = isAssociatedStudy
              ? transformAssociations(data)
              : { associations: [] };
            return (
              <Fragment>
                <PageTitle>
                  {isStudyWithInfo ? data.studyInfo.traitReported : null}
                </PageTitle>
                <SubHeading
                  left={
                    isStudyWithInfo ? (
                      <StudyInfo studyInfo={data.studyInfo} />
                    ) : null
                  }
                  right={
                    isStudyWithInfo ? (
                      <StudySize studyInfo={data.studyInfo} />
                    ) : null
                  }
                />
                <Link
                  to={`/study-comparison/${studyId}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button gradient>Compare to related studies</Button>
                </Link>

                <SectionHeading
                  heading="Independently-associated loci"
                  subheading={
                    !loading
                      ? `Found ${significantLociCount} loci with genome-wide
                    significance (p-value < 5e-8) out of ${lociCount}`
                      : null
                  }
                  entities={[
                    {
                      type: 'study',
                      fixed: true,
                    },
                    {
                      type: 'indexVariant',
                      fixed: false,
                    },
                  ]}
                />

                <DownloadSVGPlot
                  left={
                    <MultiSelect
                      value={this.state.focusChromosome}
                      options={[
                        { label: 'All chromosomes', value: '' },
                        ...chromosomeNames.map(d => ({
                          label: `Chromosome ${d}`,
                          value: d,
                        })),
                      ]}
                      handleChange={this.handleChange}
                    />
                  }
                  loading={loading}
                  error={error}
                  svgContainer={manhattanPlot}
                  filenameStem={`${studyId}-independently-associated-loci`}
                >
                  <ManhattanWithTooltip
                    data={manhattan}
                    focusChromosome={this.state.focusChromosome}
                    handleChromosomeClick={this.handleChromosomeClick}
                    ref={manhattanPlot}
                  />
                </DownloadSVGPlot>
                <ManhattanTable
                  loading={loading}
                  error={error}
                  data={
                    this.state.focusChromosome
                      ? manhattan.associations.filter(
                          d => d.chromosome === this.state.focusChromosome
                        )
                      : manhattan.associations
                  }
                  studyId={studyId}
                  filenameStem={`${studyId}-independently-associated-loci`}
                />
              </Fragment>
            );
          }}
        </Query>
      </BasePage>
    );
  }
  handleChange = event => {
    if (event.target.value) {
      reportAnalyticsEvent({
        category: 'visualisation',
        action: 'filter',
        label: `study:manhattan:chromosome`,
      });
    }
    this.setState({ focusChromosome: event.target.value });
  };
  handleChromosomeClick = chromosome => {
    if (chromosome) {
      reportAnalyticsEvent({
        category: 'visualisation',
        action: 'filter',
        label: `study:manhattan:chromosome`,
      });
      this.setState({ focusChromosome: chromosome });
    } else {
      this.setState({ focusChromosome: '' });
    }
  };
}

export default StudyPage;
