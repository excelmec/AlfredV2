import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';

interface StatusFilterProps<T extends string> {
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (selected: T[]) => void;
}

/** A row of checkboxes used to include or exclude statuses from a list */
export function StatusFilter<T extends string>({
  options,
  selected,
  onChange,
}: StatusFilterProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {options.map((option) => (
        <Label key={option.value} className="cursor-pointer text-sm font-normal">
          <Checkbox
            checked={selected.includes(option.value)}
            onCheckedChange={() =>
              onChange(
                selected.includes(option.value)
                  ? selected.filter((v) => v !== option.value)
                  : [...selected, option.value],
              )
            }
          />
          {option.label}
        </Label>
      ))}
    </div>
  );
}
