import { useContext, useState, useCallback, useMemo } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { IAttendeeUploadResponse } from './ticketTypes';

export function useAttendees() {
  const { axiosTicketsPrivate } = useContext(ApiContext);

  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [uploadResult, setUploadResult] = useState<IAttendeeUploadResponse | null>(null);

  const uploadAttendees = useCallback(
    async (file: File) => {
      try {
        setUploading(true);
        setError('');
        setUploadResult(null);

        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosTicketsPrivate.post<IAttendeeUploadResponse>(
          '/attendees',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        setUploadResult(response.data);
        return response.data;
      } catch (err) {
        setError(getErrMsg(err));
        return null;
      } finally {
        setUploading(false);
      }
    },
    [axiosTicketsPrivate],
  );

  const clearResult = useCallback(() => {
    setUploadResult(null);
    setError('');
  }, []);

  const values = useMemo(
    () => ({
      uploadAttendees,
      uploading,
      error,
      uploadResult,
      clearResult,
    }),
    [uploadAttendees, uploading, error, uploadResult, clearResult],
  );

  return values;
}
