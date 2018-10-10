import React from 'react';
import { Link } from 'react-router-dom';

import { OtTable } from 'ot-ui';
import { getCytoband } from 'ot-charts';

import LocusLink from './LocusLink';
import variantIdComparator from '../logic/variantIdComparator';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

const tableColumns = studyIds => [
  {
    id: 'indexVariantId',
    label: 'Variant',
    tooltip:
      'This locus is shared across all selected studies. Only the lead variant in the root study is shown.',
    renderCell: rowData => (
      <Link to={`/variant/${rowData.indexVariantId}`}>
        {rowData.indexVariantId}
      </Link>
    ),
    comparator: variantIdComparator,
  },
  {
    id: 'indexVariantRsId',
    label: 'rsID',
  },
  {
    id: 'cytoband',
    label: 'Cytoband',
    renderCell: rowData => {
      const [chromosome, position] = rowData.indexVariantId.split('_');
      return getCytoband(chromosome, position);
    },
  },
  {
    id: 'bestGenes',
    label: 'Top Ranked Genes',
    tooltip:
      'The list of genes with equal best overall score across all variants in either the credible set or LD expansion of a given locus',
    renderCell: rowData => (
      <React.Fragment>
        {rowData.bestGenes.map((d, i) => (
          <React.Fragment key={i}>
            <Link to={`/gene/${d.gene.id}`}>{d.gene.symbol}</Link>{' '}
          </React.Fragment>
        ))}
      </React.Fragment>
    ),
  },
  {
    id: 'locus',
    label: 'View',
    renderCell: rowData => (
      <LocusLink
        chromosome={rowData.chromosome}
        position={rowData.position}
        selectedStudies={studyIds}
      >
        Locus
      </LocusLink>
    ),
  },
];

function ManhattansVariantsTable({
  loading,
  error,
  data,
  studyIds,
  filenameStem,
}) {
  return (
    <OtTable
      loading={loading}
      error={error}
      columns={tableColumns(studyIds)}
      data={data}
      sortBy="indexVariantId"
      order="asc"
      downloadFileStem={filenameStem}
      message="Loci in this table are shared across all selected studies."
      reportTableDownloadEvent={format => {
        reportAnalyticsEvent({
          category: 'table',
          action: 'download',
          label: `study-comparison:intersecting-loci:${format}`,
        });
      }}
      reportTableSortEvent={(sortBy, order) => {
        reportAnalyticsEvent({
          category: 'table',
          action: 'sort-column',
          label: `study-comparison:intersecting-loci:${sortBy}(${order})`,
        });
      }}
    />
  );
}

export default ManhattansVariantsTable;
