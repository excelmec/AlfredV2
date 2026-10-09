import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TupdateFnReturn } from 'Hooks/errorParser';
import SaveToolbar from '@/Components/save-toolbar';

type SaveChangesWithParam = {
  itemId: number;
  saveChanges(itemId: number): Promise<TupdateFnReturn>;
  hasUnsavedChanges: boolean;
  savingChanges: boolean;
};

type SaveChangesWithoutParam = {
  itemId: undefined;
  saveChanges: () => Promise<TupdateFnReturn>;
  hasUnsavedChanges: boolean;
  savingChanges: boolean;
};

type TProps = SaveChangesWithParam | SaveChangesWithoutParam;

export default function MerchEditToolbar({
  itemId,
  saveChanges,
  hasUnsavedChanges,
  savingChanges,
}: TProps) {
  const navigate = useNavigate();

  async function saveItem() {
    try {
      let res;
      if (itemId !== undefined) {
        res = await saveChanges(itemId);
      } else {
        res = await saveChanges();
      }

      if (res.success) {
        toast.success('Item Saved.');
        navigate(`/merch/items/view/${res.id}`, {
          replace: true,
        });
        return;
      }

      if (res.validationError) {
        toast.error('Please fix the errors to continue.');

        const firstErrorName = res.validationError[0]?.path;
        if (!firstErrorName) return;

        const firstErrorElem = document.getElementsByName(firstErrorName)[0];

        if (!firstErrorElem) return;

        firstErrorElem.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        return;
      }
    } catch (error: any) {
      console.log(error);
      toast.error(`Error saving item: ${error?.message}`);
    }
  }

  return (
    <SaveToolbar onSave={saveItem} hasUnsavedChanges={hasUnsavedChanges} saving={savingChanges} />
  );
}
