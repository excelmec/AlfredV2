import { useContext, useState } from 'react';
import { ApiContext } from '../../../Contexts/Api/ApiContext';
import {
  IUpdateNetworkError,
  IUpdateSuccess,
  IUpdateValidationError,
  TupdateFnReturn,
  getErrMsg,
} from '../../errorParser';
import { ValidationError } from 'yup';
import {
  IValidateCreateEvent,
  defaultDummyEvent,
  objectToFormData,
  createEventValidationSchema,
} from './eventValidation';
import { AxiosResponse } from 'axios';
import { IEvent } from '../eventTypes';

export function useEventCreate() {
  const [newEvent, setNewEvent] = useState<IValidateCreateEvent>(defaultDummyEvent);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const { axiosEventsPrivate } = useContext(ApiContext);

  function validateEvent(): boolean {
    try {
      createEventValidationSchema.validateSync(newEvent, {
        abortEarly: false,
        stripUnknown: true,
      });
      setValidationErrors([]);
      return true;
    } catch (err: any) {
      if (err instanceof ValidationError) {
        setValidationErrors(err.inner);
        console.log(err.inner);
      } else {
        console.log(err);
        setError(err?.message);
      }
      return false;
    }
  }

  async function createEvent(): Promise<TupdateFnReturn> {
    try {
      console.log({ newEvent });
      setLoading(true);

      if (!validateEvent()) {
        return {
          success: false,
          validationError: validationErrors,
        } as IUpdateValidationError;
      }

      const newEventFormData = objectToFormData(newEvent);

      const createRes = await axiosEventsPrivate.post<any, AxiosResponse<IEvent>>(
        `/api/events`,
        newEventFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      if (!createRes.data?.id) {
        setError('Something went wrong when creating event. Event ID not found');
      }

      return {
        success: true,
        id: createRes.data?.id,
      } as IUpdateSuccess;
    } catch (err) {
      console.log(err);
      const errMsg = getErrMsg(err);
      setError(errMsg);
      return {
        success: false,
        networkError: errMsg,
      } as IUpdateNetworkError;
    } finally {
      setLoading(false);
    }
  }

  return {
    newEvent,
    setNewEvent,
    loading,
    error,
    setError,
    createEvent,

    validateEvent,
    validationErrors,
  } as const;
}
