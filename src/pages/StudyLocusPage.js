import React from 'react';
import { Query } from 'react-apollo';
import { loader } from 'graphql.macro';
import gql from 'graphql-tag';
import { Helmet } from 'react-helmet';
import * as d3 from 'd3';

import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';

import {
  Tab,
  Tabs,
  SectionHeading,
  PlotContainer,
  PlotContainerSection,
  significantFigures,
} from 'ot-ui';
import { GeneTrack } from 'ot-charts';

import BasePage from './BasePage';
import ColocQTLTable from '../components/ColocQTLTable';
import ColocQTLGeneTissueTable from '../components/ColocQTLGeneTissueTable';
import ColocGWASTable from '../components/ColocGWASTable';
import ColocGWASHeatmapTable from '../components/ColocGWASHeatmapTable';
import CredibleSetWithRegional from '../components/CredibleSetWithRegional';
import Slider from '../components/Slider';

const STUDY_LOCUS_PAGE_QUERY = loader('../queries/StudyLocusPageQuery.gql');
const GWAS_REGIONAL_QUERY = loader('../queries/GWASRegionalQuery.gql');
const QTL_REGIONAL_QUERY = loader('../queries/QTLRegionalQuery.gql');

const HALF_WINDOW = 250000;

const generateComparatorFromAccessor = accessor => (a, b) => {
  const aValue = accessor(a);
  const bValue = accessor(b);
  return aValue > bValue ? 1 : aValue === bValue ? 0 : -1;
};
const log2h4h3Comparator = generateComparatorFromAccessor(d => d.log2h4h3);

const gwasCredibleSetQueryAliasedFragment = ({ study, indexVariant }) => `
gwasCredibleSet__${study.studyId}__${
  indexVariant.id
}: gwasCredibleSet(studyId: "${study.studyId}", variantId: "${
  indexVariant.id
}") {
  tagVariant {
    id
    rsId
    position
  }
  pval
  se
  beta
  postProb
  MultisignalMethod
  logABF
  is95
  is99
}
`;

const qtlCredibleSetId = ({
  qtlStudyName,
  phenotypeId,
  tissue,
  indexVariant,
}) =>
  `qtlCredibleSet__${qtlStudyName}__${phenotypeId}__${tissue.id}__${
    indexVariant.id
  }`;
const qtlCredibleSetQueryAliasedFragment = ({
  qtlStudyName,
  phenotypeId,
  tissue,
  indexVariant,
}) => `
qtlCredibleSet__${qtlStudyName}__${phenotypeId}__${tissue.id}__${
  indexVariant.id
}: qtlCredibleSet(studyId: "${qtlStudyName}", variantId: "${
  indexVariant.id
}", phenotypeId: "${phenotypeId}", bioFeature: "${tissue.id}") {
  tagVariant {
    id
    rsId
    position
  }
  pval
  se
  beta
  postProb
  MultisignalMethod
  logABF
  is95
  is99
}
`;

const flattenPosition = ({ tagVariant, ...rest }) => ({
  tagVariant,
  position: tagVariant.position,
  ...rest,
});

const traitAuthorYear = s =>
  `${s.traitReported} (${s.pubAuthor}, ${new Date(s.pubDate).getFullYear()})`;

// gene exons come as flat list, rendering expects list of pairs
const flatExonsToPairedExons = genes => {
  const paired = genes.map(d => ({
    ...d,
    exons: d.exons.reduce((result, value, index, array) => {
      if (index % 2 === 0) {
        result.push(array.slice(index, index + 2));
      }
      return result;
    }, []),
  }));
  return paired;
};

class LocusTraitPage extends React.Component {
  state = {
    qtlTabsValue: 'heatmap',
    gwasTabsValue: 'heatmap',
    credSet95Value: 'all',
    log2h4h3SliderValue: 1, // equivalent to H4 being double H3; suggested by Ed
    h4SliderValue: 0.2, // 20% default; suggested by Ed
  };
  handleQtlTabsChange = (_, qtlTabsValue) => {
    this.setState({ qtlTabsValue });
  };
  handleGWASTabsChange = (_, gwasTabsValue) => {
    this.setState({ gwasTabsValue });
  };
  handleCredSet95Change = event => {
    this.setState({ credSet95Value: event.target.value });
  };
  handleLog2h4h3SliderChange = (_, log2h4h3SliderValue) => {
    this.setState({ log2h4h3SliderValue });
  };
  handleH4SliderChange = (_, h4SliderValue) => {
    this.setState({ h4SliderValue });
  };
  render() {
    const { match } = this.props;
    const { studyId, indexVariantId } = match.params;

    const [chromosome, positionStr] = indexVariantId.split('_');
    const position = parseInt(positionStr);
    const start = position - HALF_WINDOW;
    const end = position + HALF_WINDOW;

    // const colocQtlTableDataWithState = COLOC_QTL_TABLE_DATA;
    // const colocGWASTableDataWithState = COLOC_GWAS_TABLE_DATA.map(d => ({
    //   ...d,
    //   ...STUDY_INFOS[d.study],
    // }));

    // TODO: reenable
    // const maxQtlLogH4H3 = d3.max(colocQtlTableDataWithState, d => d.logH4H3);
    // const maxGWASLogH4H3 = d3.max(colocGWASTableDataWithState, d => d.logH4H3);
    const maxLog2h4h3 = 10; // d3.max([maxQtlLogH4H3, maxGWASLogH4H3]);

    // const colocGWASTableDataWithStateFiltered = colocGWASTableDataWithState
    //   .filter(d => d.logH4H3 >= this.state.logH4H3SliderValue)
    //   .filter(d => d.h4 >= this.state.h4SliderValue);

    // const colocQtlTableDataWithStateFiltered = colocQtlTableDataWithState
    //   .filter(d => d.logH4H3 >= this.state.logH4H3SliderValue)
    //   .filter(d => d.h4 >= this.state.h4SliderValue);

    return (
      <BasePage>
        <Query
          query={STUDY_LOCUS_PAGE_QUERY}
          variables={{
            studyId,
            variantId: indexVariantId,
            chromosome,
            start,
            end,
          }}
        >
          {({ loading, error, data }) => {
            if (loading || error) {
              return null;
            }

            const {
              studyInfo,
              variantInfo,
              gwasColocalisation,
              qtlColocalisation,
              gwasColocalisationForRegion,
              pageCredibleSet,
              genes,
            } = data;

            {
              /* const gwasCredibleSetQuery = gql(`
query GWASCredibleSetsQuery {
  ${gwasColocalisation.map(gwasCredibleSetQueryAliasedFragment).join('')}
}`);

const qtlCredibleSetQuery = gql(`
query QTLCredibleSetsQuery {
  ${qtlColocalisation.map(qtlCredibleSetQueryAliasedFragment).join('')}
}`); */
            }

            const colocalisationCredibleSetQuery = gql(`
query CredibleSetsQuery {
  ${gwasColocalisation.map(gwasCredibleSetQueryAliasedFragment).join('')}
  ${qtlColocalisation.map(qtlCredibleSetQueryAliasedFragment).join('')}
}
            `);

            return (
              <React.Fragment>
                <Helmet>
                  <title>{`(${
                    studyInfo.traitReported
                  }, ${indexVariantId})`}</title>
                </Helmet>
                <Typography variant="h4" color="textSecondary">
                  {`${studyInfo.traitReported}`}
                </Typography>
                <Typography variant="subtitle1">
                  {studyInfo.pubAuthor}{' '}
                  {studyInfo.pubDate
                    ? `(${new Date(studyInfo.pubDate).getFullYear()})`
                    : null}{' '}
                  {studyInfo.pubJournal ? (
                    <em>{studyInfo.pubJournal}</em>
                  ) : null}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  {`Locus around ${indexVariantId}`}
                </Typography>

                <SectionHeading
                  heading={`QTL Colocalisation`}
                  subheading={
                    <React.Fragment>
                      Which molecular traits colocalise with{' '}
                      <strong>{traitAuthorYear(studyInfo)}</strong> at this
                      locus?
                    </React.Fragment>
                  }
                />
                <Tabs
                  variant="scrollable"
                  value={this.state.qtlTabsValue}
                  onChange={this.handleQtlTabsChange}
                >
                  <Tab label="Heatmap" value={'heatmap'} />
                  <Tab label="Table" value={'table'} />
                </Tabs>

                {this.state.qtlTabsValue === 'heatmap' ? (
                  <ColocQTLGeneTissueTable
                    loading={false}
                    error={false}
                    data={qtlColocalisation}
                  />
                ) : null}
                {this.state.qtlTabsValue === 'table' ? (
                  <ColocQTLTable
                    loading={false}
                    error={false}
                    data={qtlColocalisation}
                    handleToggleRegional={this.handleToggleRegional}
                  />
                ) : null}

                <SectionHeading
                  heading={`GWAS Study Colocalisation`}
                  subheading={
                    <React.Fragment>
                      Which GWAS studies colocalise with{' '}
                      <strong>{traitAuthorYear(studyInfo)}</strong> at this
                      locus?
                    </React.Fragment>
                  }
                />
                <Tabs
                  variant="scrollable"
                  value={this.state.gwasTabsValue}
                  onChange={this.handleGWASTabsChange}
                >
                  <Tab label="Heatmap" value={'heatmap'} />
                  <Tab label="Table" value={'table'} />
                </Tabs>
                {this.state.gwasTabsValue === 'heatmap' ? (
                  <ColocGWASHeatmapTable
                    loading={false}
                    error={false}
                    data={gwasColocalisationForRegion}
                  />
                ) : null}
                {this.state.gwasTabsValue === 'table' ? (
                  <ColocGWASTable
                    loading={false}
                    error={false}
                    data={gwasColocalisation}
                    handleToggleRegional={this.handleToggleRegional}
                  />
                ) : null}

                <SectionHeading
                  heading={`Credible Set Overlap`}
                  subheading={`Which variants at this locus are most likely causal?`}
                />
                <PlotContainer
                  center={
                    <Typography>
                      Showing credible sets for{' '}
                      <strong>{traitAuthorYear(studyInfo)}</strong> and GWAS
                      studies/QTLs in colocalisation. Expand the section to see
                      the underlying regional plot.
                    </Typography>
                  }
                >
                  <PlotContainerSection>
                    <Grid container alignItems="center">
                      <Grid item>
                        <div style={{ padding: '0 20px' }}>
                          <Typography>Credible set variants</Typography>
                          <RadioGroup
                            style={{ padding: '0 16px' }}
                            row
                            aria-label="95% credible set"
                            name="credset95"
                            value={this.state.credSet95Value}
                            onChange={this.handleCredSet95Change}
                          >
                            <FormControlLabel
                              value="95"
                              control={<Radio />}
                              label="95%"
                            />
                            <FormControlLabel
                              value="all"
                              control={<Radio />}
                              label="all"
                            />
                          </RadioGroup>
                        </div>
                      </Grid>
                      <Grid item>
                        <Slider
                          label={`log2(H4/H3): ${significantFigures(
                            this.state.log2h4h3SliderValue
                          )}`}
                          min={0}
                          max={Math.ceil(maxLog2h4h3)}
                          step={Math.ceil(maxLog2h4h3) / 50}
                          value={this.state.log2h4h3SliderValue}
                          onChange={this.handleLog2h4h3SliderChange}
                        />
                      </Grid>
                      <Grid item>
                        <Slider
                          label={`H4: ${significantFigures(
                            this.state.h4SliderValue
                          )}`}
                          min={0}
                          max={1}
                          step={0.02}
                          value={this.state.h4SliderValue}
                          onChange={this.handleH4SliderChange}
                        />
                      </Grid>
                    </Grid>
                  </PlotContainerSection>
                </PlotContainer>

                <CredibleSetWithRegional
                  credibleSetProps={{
                    label: traitAuthorYear(studyInfo),
                    start,
                    end,
                    data: pageCredibleSet.map(flattenPosition),
                  }}
                  regionalProps={{
                    title: null,
                    studyId: studyInfo.studyId,
                    chromosome,
                    start,
                    end,
                  }}
                />

                <Query query={colocalisationCredibleSetQuery} variables={{}}>
                  {({ loading: loading2, error: error2, data: data2 }) => {
                    if (loading2 || error2) {
                      return null;
                    }

                    // de-alias
                    const gwasColocalisationCredibleSets = gwasColocalisation.map(
                      ({ study, indexVariant, ...rest }) => ({
                        study,
                        indexVariant,
                        credibleSet: data2[
                          `gwasCredibleSet__${study.studyId}__${
                            indexVariant.id
                          }`
                        ].map(flattenPosition),
                        ...rest,
                      })
                    );
                    const qtlColocalisationCredibleSets = qtlColocalisation.map(
                      ({
                        qtlStudyName,
                        phenotypeId,
                        tissue,
                        indexVariant,
                        ...rest
                      }) => ({
                        qtlStudyName,
                        phenotypeId,
                        tissue,
                        indexVariant,
                        credibleSet: data2[
                          `qtlCredibleSet__${qtlStudyName}__${phenotypeId}__${
                            tissue.id
                          }__${indexVariant.id}`
                        ].map(flattenPosition),
                        ...rest,
                      })
                    );

                    const gwasColocalisationCredibleSetsFiltered = gwasColocalisationCredibleSets
                      .filter(d => d.log2h4h3 >= this.state.log2h4h3SliderValue)
                      .filter(d => d.h4 >= this.state.h4SliderValue)
                      .sort(log2h4h3Comparator)
                      .reverse();

                    const qtlColocalisationCredibleSetsFiltered = qtlColocalisationCredibleSets
                      .filter(d => d.log2h4h3 >= this.state.log2h4h3SliderValue)
                      .filter(d => d.h4 >= this.state.h4SliderValue)
                      .sort(log2h4h3Comparator)
                      .reverse();

                    return (
                      <React.Fragment>
                        <Typography style={{ paddingTop: '10px' }}>
                          <strong>GWAS</strong>
                        </Typography>
                        {gwasColocalisationCredibleSetsFiltered.length > 0 ? (
                          gwasColocalisationCredibleSetsFiltered.map(d => {
                            return (
                              <CredibleSetWithRegional
                                key={`gwasCredibleSet__${d.study.studyId}__${
                                  d.indexVariant.id
                                }`}
                                credibleSetProps={{
                                  label: traitAuthorYear(d.study),
                                  start,
                                  end,
                                  h4: d.h4,
                                  logH4H3: d.log2h4h3,
                                  data: d.credibleSet,
                                }}
                                regionalProps={{
                                  title: null,
                                  query: GWAS_REGIONAL_QUERY,
                                  variables: {
                                    studyId: d.study.studyId,
                                    chromosome,
                                    start,
                                    end,
                                  },
                                  start,
                                  end,
                                }}
                              />
                            );
                          })
                        ) : (
                          <Typography align="center">
                            No GWAS studies satisfying the applied filters.
                          </Typography>
                        )}

                        <Typography style={{ paddingTop: '10px' }}>
                          <strong>QTL</strong>
                        </Typography>
                        {qtlColocalisationCredibleSetsFiltered.length > 0 ? (
                          qtlColocalisationCredibleSetsFiltered.map(d => {
                            return (
                              <CredibleSetWithRegional
                                key={`qtlCredibleSet__${d.qtlStudyName}__${
                                  d.phenotypeId
                                }__${d.tissue.id}__${d.indexVariant.id}`}
                                credibleSetProps={{
                                  label: `${d.qtlStudyName}: ${
                                    d.gene.symbol
                                  } in ${d.tissue.name}`,
                                  start,
                                  end,
                                  h4: d.h4,
                                  logH4H3: d.log2h4h3,
                                  data: d.credibleSet,
                                }}
                                regionalProps={{
                                  title: null,
                                  query: QTL_REGIONAL_QUERY,
                                  variables: {
                                    studyId: d.qtlStudyName,
                                    phenotypeId: d.phenotypeId,
                                    bioFeature: d.tissue.id,
                                    chromosome,
                                    start,
                                    end,
                                  },
                                  start,
                                  end,
                                }}
                              />
                            );
                          })
                        ) : (
                          <Typography align="center">
                            No QTL studies satisfying the applied filters.
                          </Typography>
                        )}
                      </React.Fragment>
                    );
                  }}
                </Query>

                <Typography style={{ paddingTop: '10px' }}>
                  <strong>Genes</strong>
                </Typography>
                <PlotContainer>
                  <PlotContainerSection>
                    <div style={{ paddingRight: '32px' }}>
                      <GeneTrack
                        data={{ genes: flatExonsToPairedExons(genes) }}
                        start={start}
                        end={end}
                      />
                    </div>
                  </PlotContainerSection>
                </PlotContainer>
              </React.Fragment>
            );
          }}
        </Query>
      </BasePage>
    );
  }
}

export default LocusTraitPage;