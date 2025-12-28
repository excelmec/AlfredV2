import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import { IResult } from '../eventTypes';
import { IValidateResult, resultValidationSchema } from './resultValidation';
import { ValidationError } from 'yup';

export function useEventResultsCrud() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { axiosEventsPrivate } = useContext(ApiContext);

  async function addResult(eventId: number, result: IValidateResult) {
    try {
      setLoading(true);
      setError('');
      await resultValidationSchema.validate(result, { abortEarly: false });
      await axiosEventsPrivate.post('/api/Result', { ...result, eventId });
      return true;
    } catch (err: any) {
      if (err instanceof ValidationError) {
        setError(err.inner.map((e) => e.message).join(', '));
      } else {
        setError(getErrMsg(err));
      }
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function updateResult(resultId: number, eventId: number, result: IValidateResult) {
    try {
      setLoading(true);
      setError('');
      await resultValidationSchema.validate(result, { abortEarly: false });
      await axiosEventsPrivate.put('/api/Result', { ...result, id: resultId, eventId });
      return true;
    } catch (err: any) {
      if (err instanceof ValidationError) {
        setError(err.inner.map((e) => e.message).join(', '));
      } else {
        setError(getErrMsg(err));
      }
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function deleteResult(resultId: number) {
    try {
      setLoading(true);
      setError('');
      await axiosEventsPrivate.delete('/api/Result', { data: { id: resultId } });
      return true;
    } catch (err) {
      setError(getErrMsg(err));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function deleteAllResults(eventId: number) {
    try {
      setLoading(true);
      setError('');
      await axiosEventsPrivate.delete(`/api/Result/event/${eventId}`);
      return true;
    } catch (err) {
      setError(getErrMsg(err));
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    setError,
    addResult,
    updateResult,
    deleteResult,
    deleteAllResults,
  };
}
