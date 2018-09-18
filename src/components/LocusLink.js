import React from 'react';
import { Link } from 'react-router-dom';
import queryString from 'query-string';

import { chromosomesWithCumulativeLengths } from 'ot-charts';

const chromosomeDict = chromosomesWithCumulativeLengths.reduce((acc, d) => {
  acc[d.name] = d;
  return acc;
}, {});

const mb = 1000000;

const LocusLink = ({
  children,
  chromosome,
  position,
  selectedGenes,
  selectedTagVariants,
  selectedIndexVariants,
  selectedStudies,
}) => {
  const chromosomeObj = chromosomeDict[chromosome];
  const start = position > mb ? position - mb : 0;
  const end =
    position <= chromosomeObj.length - mb
      ? position + mb
      : chromosomeObj.length - 1;
  const params = { chromosome, start, end };
  if (selectedGenes) {
    params.selectedGenes = selectedGenes;
  }
  if (selectedTagVariants) {
    params.selectedTagVariants = selectedTagVariants;
  }
  if (selectedIndexVariants) {
    params.selectedIndexVariants = selectedIndexVariants;
  }
  if (selectedStudies) {
    params.selectedStudies = selectedStudies;
  }
  return <Link to={`/locus?${queryString.stringify(params)}`}>{children}</Link>;
};

export default LocusLink;
