import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarDotsIcon } from '@phosphor-icons/react';
import { Button } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
import { Input } from '@/Components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value?: Date | null;
  onChange: (value: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  invalid?: boolean;
}

const isValid = (d?: Date | null): d is Date => !!d && !Number.isNaN(d.getTime());

/** Date and time picker built from Calendar + Popover (replaces MUI DateTimePicker) */
export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick date & time',
  disabled,
  className,
  id,
  invalid,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const date = isValid(value) ? value : undefined;
  const timeValue = date ? format(date, 'HH:mm') : '00:00';

  const setDay = (day?: Date) => {
    if (!day) return;
    const next = new Date(day);
    next.setHours(date?.getHours() ?? 0, date?.getMinutes() ?? 0, 0, 0);
    onChange(next);
  };

  const setTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    const next = new Date(date ?? new Date());
    next.setHours(h, m, 0, 0);
    onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            'w-full justify-start font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarDotsIcon />
          {date ? format(date, 'PPP, p') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} defaultMonth={date} onSelect={setDay} autoFocus />
        <div className="border-t p-3">
          <Input
            type="time"
            value={timeValue}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Time"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
