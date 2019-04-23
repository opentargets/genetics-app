import React from 'react';
import { OtTable, Button, significantFigures } from 'ot-ui';

const tableColumns = [
  {
    id: 'study',
    label: 'Study',
  },
  {
    id: 'beta',
    label: 'Study beta',
    renderCell: d => significantFigures(d.beta),
  },
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
    id: 'logH4H3',
    label: 'log(H4/H3)',
    renderCell: d => significantFigures(d.logH4H3),
  },
  {
    id: 'show',
    label: 'Regional Plot',
    renderCell: d => <Button gradient>Add track</Button>,
  },
];

const ColocTable = ({ loading, error, filenameStem, data }) => (
  <OtTable
    loading={loading}
    error={error}
    columns={tableColumns}
    data={data}
    sortBy="logH4H3"
    order="desc"
    downloadFileStem={filenameStem}
  />
);

export default ColocTable;