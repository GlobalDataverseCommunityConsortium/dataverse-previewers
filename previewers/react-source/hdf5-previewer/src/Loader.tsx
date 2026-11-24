import useAxios from 'axios-hooks';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { FiLoader } from 'react-icons/fi';
import type { H5File } from './H5WasmApp';

import styles from './H5WasmApp.module.css';

// Example URL: http://localhost:5174/?siteUrl=https://dataverse.harvard.edu/&fileid=6938813

// Types
interface Props {
  onH5File: (h5File: H5File) => void;
}

function Loader({ onH5File }: Props) {

  // Parse URL parameters
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  const fileID = urlParams.get('fileid') || ''
  const APIToken = urlParams.get('apiToken') || ''
  let siteURL = urlParams.get('siteUrl') || ''

  if (siteURL.endsWith("/")) {
    // Remove trailing slash, if given
    siteURL = siteURL.slice(0, -1)
  }

  // Construct Dataverse file URL
  const url = `${siteURL}/api/access/datafile/${fileID}`

  // Construct headers and add apiToken, if given
  const headers: { [key: string]: string } = {}

  if (APIToken) {
    // Add apiToken to headers
    headers['X-Dataverse-key'] = APIToken
  }

  const [{ loading, error }, execute] = useAxios<ArrayBuffer>(
    {
      url,
      headers: headers,
      responseType: 'arraybuffer'
    },
    { manual: true, }
  );

  const fetchFile = useCallback(async () => {
    if (url) {
      const { data } = await execute();
      onH5File({ filename: fileID, buffer: data });
    }
  }, [url, fileID, execute, onH5File]);

  useEffect(() => {
    void fetchFile();
  }, [url, fetchFile]);

  if (error) {
    return (
      <div className='loader'>
        <FiLoader className={styles.urlLoader} size="30px" aria-label="Error..." />
        <h4 className={styles.loaderHeading}>Something went wrong with the request!</h4>
      </div>
    )
  }

  return (
    <div className='loader'>
      <FiLoader className={styles.urlLoader} size="30px" aria-label="Loading..." />
      <h4 className={styles.loaderHeading}>Fetching HDF5 file from</h4>
      <p className={styles.loaderSource}>{url}</p>
    </div>
  );
}

export default Loader;
