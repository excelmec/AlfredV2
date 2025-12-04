import { useContext, useState } from 'react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import {
  IUpdateNetworkError,
  IUpdateSuccess,
  IUpdateValidationError,
  TupdateFnReturn,
  getErrMsg,
} from 'Hooks/errorParser';
import { IItemEditWithFile, dummyEditItemWithFile } from './itemEditTypes';
import { AxiosResponse } from 'axios';
import { IItem } from '../itemTypes';
import { itemValidationSchema } from './itemEditValidation';
import { ValidationError } from 'yup';

export function useItemCreate() {
  const [item, setItem] = useState<IItemEditWithFile>(dummyEditItemWithFile);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const { axiosMerchPrivate } = useContext(ApiContext);

  function validateEvent(): boolean {
    try {
      itemValidationSchema.validateSync(item, {
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

  async function createItem(): Promise<TupdateFnReturn> {
    try {
      setLoading(true);

      if (!validateEvent()) {
        return {
          success: false,
          validationError: validationErrors,
        } as IUpdateValidationError;
      }

      const payloadForm = new FormData();
      payloadForm.append('data', JSON.stringify(item));
      item.mediaObjects.forEach((mediaObject) => {
        console.log(mediaObject, mediaObject.file.arrayBuffer());
        payloadForm.append('media', mediaObject.file, mediaObject.file.name);
      });

      const response = await axiosMerchPrivate.post<
        any,
        AxiosResponse<{
          message: string;
          item: IItem;
        }>
      >(`/admin/item`, payloadForm, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        id: response.data.item.id,
      } as IUpdateSuccess;
    } catch (err) {
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
    item,
    setItem,
    loading,
    error,
    validationErrors,

    validateEvent,
    createItem,
  } as const;
}
