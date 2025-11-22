import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Typography } from '@mui/material';

import { useItemView } from '../../../Hooks/Merchandise/useItemView';
import { IMediaObjectEditWithFile } from 'Hooks/Merchandise/create-update/itemEditTypes';
import axios from 'axios';
import { useItemEdit } from 'Hooks/Merchandise/create-update/useItemEdit';
import ItemEditable from 'Components/Merchandise/ItemCreateEdit/Editable/ItemEditable';
import MerchEditToolbar from 'Components/Merchandise/ItemCreateEdit/Toolbar/MerchEditToolbar';

export default function MerchItemEditPage() {
  const { item, fetchItem, loading, error } = useItemView();

  const {
    item: modifiedItem,
    setItem: setModifiedItem,
    updateItem,
    loading: savingItem,

    validationErrors,
    validateEvent,
  } = useItemEdit();

  const { itemId: itemIdStr } = useParams();
  const itemId = parseInt(itemIdStr ?? '');

  const [imagesLoading, setImagesLoading] = useState<boolean>(true);

  // const navigate = useNavigate();

  useEffect(() => {
    fetchItem(itemId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  async function loadImages() {
    if (!item) {
      return;
    }

    setImagesLoading(true);

    const imagePromises: Promise<Blob>[] = [];

    item.mediaObjects.forEach((mediaObject) => {
      imagePromises.push(
        axios.get(mediaObject.url, {
          responseType: 'blob',
        }),
      );
    });

    const imageBlobs = await Promise.all(imagePromises);

    const mediaObjects: IMediaObjectEditWithFile[] = imageBlobs.map((blob, index) => {
      const mediaObject = item.mediaObjects[index];

      return {
        url: mediaObject.url,
        type: mediaObject.type,
        colorOption: mediaObject.colorOption,
        viewOrdering: mediaObject.viewOrdering,
        fileName: mediaObject.id,
        file: new File([blob], mediaObject.id),
      };
    });

    setModifiedItem({
      ...item,
      mediaObjects,
    });

    setImagesLoading(false);
  }

  useEffect(() => {
    if (!item) {
      return;
    }

    setModifiedItem({
      ...item,
      mediaObjects: [],
    });

    loadImages();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  if (error) {
    return <Typography variant="h5">{error}</Typography>;
  }

  if (loading) {
    return <Typography variant="h5">Loading...</Typography>;
  }

  if (!item) {
    return <Typography variant="h5">Item not found</Typography>;
  }

  return (
    <>
      <>
        <br />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography variant="h5" noWrap>
            Edit Item
          </Typography>
        </Box>
        <br />

        <MerchEditToolbar
          itemId={itemId}
          saveChanges={updateItem}
          hasUnsavedChanges={false}
          savingChanges={savingItem}
        />

        <ItemEditable
          validationErrors={validationErrors}
          item={modifiedItem}
          setItem={setModifiedItem}
          imagesLoading={imagesLoading}
          itemId={itemId}
          validateEvent={validateEvent}
        />
      </>
    </>
  );
}
