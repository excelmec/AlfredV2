import ItemEditable from 'Components/Merchandise/ItemCreateEdit/Editable/ItemEditable';
import MerchEditToolbar from 'Components/Merchandise/ItemCreateEdit/Toolbar/MerchEditToolbar';
import { useItemCreate } from 'Hooks/Merchandise/create-update/useItemCreate';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';

export default function MerchItemCreatePage() {
  const {
    item: modifiedItem,
    setItem: setModifiedItem,
    createItem,
    loading: savingItem,
    validationErrors,
    error,
    validateEvent,
  } = useItemCreate();

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader title="Create item" description="Add a new item to the merchandise store." />

      <MerchEditToolbar
        itemId={undefined}
        saveChanges={createItem}
        hasUnsavedChanges={false}
        savingChanges={savingItem}
      />

      <ItemEditable
        validationErrors={validationErrors}
        item={modifiedItem}
        setItem={setModifiedItem}
        validateEvent={validateEvent}
      />
    </>
  );
}
