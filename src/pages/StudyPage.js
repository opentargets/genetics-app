import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { commaSeparate } from 'ot-ui';

import {
  PageTitle,
  SubHeading,
  DownloadSVGPlot,
  SectionHeading,
  Button,
  ListTooltip,
} from 'ot-ui';
import { Manhattan, withTooltip } from 'ot-charts';

import BasePage from './BasePage';
import ManhattanTable, { tableColumns } from '../components/ManhattanTable';
import ScrollToTop from '../components/ScrollToTop';

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
      const { variantId, variantRsId, ...rest } = d;
      return {
        ...rest,
        indexVariantId: variantId,
        indexVariantRsId: variantRsId,
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
        variantId
        variantRsId
        pval
        chromosome
        position
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

const StudyInfo = ({ studyInfo }) => {
  return (
    <div>
      {`${studyInfo.pubAuthor} (${new Date(studyInfo.pubDate).getFullYear()}) `}
      {studyInfo.pubJournal && <em>{`${studyInfo.pubJournal} `}</em>}
      {studyInfo.pmid && (
        <a
          href={`http://europepmc.org/abstract/med/${studyInfo.pmid}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {studyInfo.pmid}
        </a>
      )}
    </div>
  );
};

const StudySize = ({ studyInfo }) => {
  const { nInitial, nReplication, nCases } = studyInfo;
  return (
    <div>
      {nInitial !== null && `N Study: ${commaSeparate(nInitial)}`}{' '}
      {nReplication !== null && `N Replication: ${commaSeparate(nReplication)}`}{' '}
      {nCases !== null && `N Cases: ${commaSeparate(nCases)}`}
    </div>
  );
};

class StudyPage extends React.Component {
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
                    significance (p-value < 5e-8)`
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
                  loading={loading}
                  error={error}
                  svgContainer={manhattanPlot}
                  filenameStem={`${studyId}-independently-associated-loci`}
                >
                  <ManhattanWithTooltip data={manhattan} ref={manhattanPlot} />
                </DownloadSVGPlot>
                <ManhattanTable
                  loading={loading}
                  error={error}
                  data={manhattan.associations}
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
}

export default StudyPage;
