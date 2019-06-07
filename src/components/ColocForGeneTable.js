import React from 'react';
import { Link, OtTable, significantFigures } from 'ot-ui';
import StudyLocusLink from './StudyLocusLink';

const tableColumns = [
  {
    id: 'study',
    label: 'Study',
    renderCell: d => (
      <Link to={`/study/${d.study.studyId}`}>{d.study.studyId}</Link>
    ),
  },
  {
    id: 'traitReported',
    label: 'Trait reported',
    renderCell: d => d.study.traitReported,
  },
  {
    id: 'pubAuthor',
    label: 'Author',
    renderCell: d => d.study.pubAuthor,
  },
  {
    id: 'indexVariant',
    label: 'Lead variant',
    renderCell: d => (
      <Link to={`/variant/${d.leftVariant.id}`}>{d.leftVariant.id}</Link>
    ),
  },
  {
    id: 'phenotypeId',
    label: 'Phenotype',
  },
  {
    id: 'tissue.name',
    label: 'Tissue',
    renderCell: d => d.tissue.name,
  },
  {
    id: 'qtlStudyId',
    label: 'Source',
  },
  // {
  //   id: 'beta',
  //   label: 'QTL beta',
  //   renderCell: d => significantFigures(d.beta),
  // },
  {
    id: 'h3',
    label: 'H3',
    renderCell: d => significantFigures(d.h3),
  },
  {
    id: 'h4',
    label: 'H4',
    renderCell: d => significantFigures(d.h4),
  },
  {
    id: 'log2h4h3',
    label: 'log2(H4/H3)',
    renderCell: d => significantFigures(d.log2h4h3),
  },
  {
    id: 'studyLocus',
    label: 'View',
    renderCell: d => (
      <StudyLocusLink
        hasSumsStats={d.study.hasSumsStats}
        indexVariantId={d.leftVariant.id}
        studyId={d.study.studyId}
      />
    ),
  },
];

const ColocTable = ({ loading, error, filenameStem, data }) => (
  <OtTable
    loading={loading}
    error={error}
    columns={tableColumns}
    data={data}
    sortBy="log2h4h3"
    order="desc"
    downloadFileStem={filenameStem}
  />
);

export default ColocTable;
