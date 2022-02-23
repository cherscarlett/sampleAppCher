// Copyright (c) 2021 by Audere
//
// Use of this source code is governed by an MIT-style license that
// can be found in the LICENSE file distributed with this file.

import RNFS from 'react-native-fs';

const pathSubstitutions = [
  {
    native: RNFS.DocumentDirectoryPath,
    symbol: 'Documents',
  },
  {
    native: RNFS.CachesDirectoryPath,
    symbol: 'Caches',
  },
  {
    native: RNFS.TemporaryDirectoryPath,
    symbol: 'Temporary',
  },
  {
    native: RNFS.DownloadDirectoryPath,
    symbol: 'Downloads',
  },
  {
    native: RNFS.LibraryDirectoryPath,
    symbol: 'Library',
  },
];

export const reducePath = (path: string) => {
  const substitution = pathSubstitutions.find(e => path.includes(e.native));
  if (substitution) {
    return path.replace(substitution.native, `{{${substitution.symbol}}}`);
  }
  return path;
};

export const expandPath = (path: string) => {
  const substitution = pathSubstitutions.find(e =>
    path.includes(`{{${e.symbol}}}`),
  );
  if (substitution) {
    return path.replace(`{{${substitution.symbol}}}`, substitution.native);
  }
  return path;
};
