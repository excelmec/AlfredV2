import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { CheckIcon, PlusIcon, TrashIcon, XIcon } from '@phosphor-icons/react';
import { ValidationError } from 'yup';
import { debounce } from 'lodash';

import {
  IItemEditWithFile,
  IMediaObjectEditWithFile,
  IStockCountEdit,
} from 'Hooks/Merchandise/create-update/itemEditTypes';
import { EMediaObjectType, ESize, sizeOptions } from 'Hooks/Merchandise/itemTypes';
import { FormField, FormSection, ToggleRow } from '@/Components/form-layout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Spinner } from '@/Components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/Components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface ItemEditableProps {
  itemId?: number;
  item: IItemEditWithFile;
  setItem: React.Dispatch<React.SetStateAction<IItemEditWithFile>>;
  imagesLoading?: boolean;
  validateEvent: () => boolean;
  validationErrors: ValidationError[];
}

export default function ItemEditable({
  itemId,
  item,
  setItem,
  imagesLoading,
  validateEvent,
  validationErrors,
}: ItemEditableProps) {
  const [newColorOption, setNewColorOption] = useState<string>('');

  const errorOf = (field: string) =>
    validationErrors.find((error) => error.path === field)?.message;

  /** Called as a function (not a component) so inputs keep focus while typing */
  function stockRow(color: string) {
    const stockErrors = validationErrors.filter((error) => {
      return error.path?.startsWith('stockCount') && error.path.endsWith('count');
    });

    return (
      <TableRow key={color}>
        <TableCell className="border-r font-semibold">{color}</TableCell>
        {item.sizeOptions.map((size) => {
          const stock = item.stockCount.find(
            (stock) => stock.colorOption === color && stock.sizeOption === size,
          );

          if (!stock) {
            item.stockCount.push({
              colorOption: color,
              sizeOption: size,
              count: 0,
            });
          }

          /**
           * Path is in format stockCount[0].count
           */
          const extractedValidationError = stockErrors.find((error) => {
            const pathString = error.path;
            if (!pathString) {
              return false;
            }
            const match = pathString.match(/\[(\d+)\]/);

            const index = match && match[0] ? match[1] : undefined;

            if (index === undefined || index === null) {
              return false;
            }

            const indexNumber = parseInt(index);
            if (isNaN(indexNumber)) {
              return false;
            }

            return (
              item.stockCount[indexNumber]?.colorOption === color &&
              item.stockCount[indexNumber]?.sizeOption === size
            );
          });

          const cellStockValue =
            item.stockCount.find(
              (stock) => stock.colorOption === color && stock.sizeOption === size,
            )?.count ?? 0;

          return (
            <TableCell key={size} className="min-w-28 align-top">
              <Input
                name={`stockCount[${item.stockCount.findIndex(
                  (stock) => stock.colorOption === color && stock.sizeOption === size,
                )}].count`}
                aria-invalid={extractedValidationError !== undefined}
                value={Number.isNaN(cellStockValue) ? '' : cellStockValue}
                onChange={(e) => {
                  const {
                    target: { value },
                  } = e;

                  setItem({
                    ...item,
                    stockCount: item.stockCount.map((stock) => {
                      if (stock.colorOption === color && stock.sizeOption === size) {
                        return {
                          ...stock,
                          count: parseInt(value),
                        };
                      } else {
                        return stock;
                      }
                    }),
                  });
                }}
                placeholder="Stock"
                type="number"
                className="text-center"
              />
              {extractedValidationError && (
                <p className="mt-1 text-xs font-medium text-destructive">
                  {extractedValidationError.message}
                </p>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    );
  }

  function handleSizesChange(value: ESize[]) {
    const newSizes = value.filter((size) => {
      return !item.sizeOptions.includes(size);
    });

    const newStocks: IStockCountEdit[] = newSizes
      .map((size) => {
        return item.colorOptions.map((color) => {
          return {
            colorOption: color,
            count: 0,
            sizeOption: size,
          };
        });
      })
      .flat();

    setItem({
      ...item,
      sizeOptions: value,

      stockCount: [
        ...item.stockCount.filter((stock) => value.includes(stock.sizeOption)),
        ...newStocks,
      ],
    });
  }

  function handleNewColorAddition() {
    const newColorOptionTrimmed = newColorOption.trim();

    if (newColorOptionTrimmed === '') {
      return;
    }

    const newStocks: IStockCountEdit[] = item.sizeOptions.map((size) => {
      return {
        colorOption: newColorOptionTrimmed,
        count: 0,
        sizeOption: size,
      };
    });
    setItem({
      ...item,
      colorOptions: [...item.colorOptions, newColorOptionTrimmed],
      stockCount: [...item.stockCount, ...newStocks],
    });

    setNewColorOption('');
  }

  useEffect(() => {
    debounce(validateEvent, 300)();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  return (
    <div className="grid min-w-0 gap-6">
      <FormSection
        title="Basic details"
        description={itemId ? `Item ID: ${itemId}` : 'Describe the item and how it is sold.'}
      >
        <FormField label="Name" htmlFor="item-name" error={errorOf('name')}>
          <Input
            id="item-name"
            name="name"
            value={item.name}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            placeholder="Name"
            aria-invalid={!!errorOf('name')}
          />
        </FormField>

        <FormField label="Price" htmlFor="item-price" error={errorOf('price')}>
          <Input
            id="item-price"
            name="price"
            type="number"
            value={Number.isNaN(item.price) ? '' : item.price}
            onChange={(e) => setItem({ ...item, price: parseInt(e.target.value) })}
            placeholder="Price"
            aria-invalid={!!errorOf('price')}
          />
        </FormField>

        <FormField
          label="Description"
          htmlFor="item-description"
          error={errorOf('description')}
          wide
        >
          <Textarea
            id="item-description"
            name="description"
            rows={4}
            value={item.description}
            onChange={(e) => setItem({ ...item, description: e.target.value })}
            placeholder="Description"
            aria-invalid={!!errorOf('description')}
          />
        </FormField>

        <FormField label="Size options" error={errorOf('sizeOptions')} wide>
          <ToggleGroup
            type="multiple"
            variant="outline"
            className="flex-wrap justify-start"
            value={item.sizeOptions}
            onValueChange={(v) => handleSizesChange(v as ESize[])}
          >
            {sizeOptions.map((size) => (
              <ToggleGroupItem key={size} value={size} aria-label={size}>
                {size}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FormField>

        <FormField label="Color options" error={errorOf('colorOptions')} wide>
          <div className="flex flex-wrap items-center gap-1.5">
            {item?.colorOptions?.length === 0 ? (
              <span className="text-sm text-destructive">No color options created</span>
            ) : (
              item?.colorOptions?.map((color) => (
                <Badge key={color} variant="outline" className="gap-1 py-3 pr-1.5 pl-2.5 text-sm">
                  {color}
                  <button
                    type="button"
                    aria-label={`Remove ${color}`}
                    className="rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() =>
                      setItem({
                        ...item,
                        colorOptions: item.colorOptions.filter((itemColor) => itemColor !== color),
                        stockCount: item.stockCount.filter((stock) => stock.colorOption !== color),
                        mediaObjects: item.mediaObjects.filter(
                          (mediaObject) => mediaObject.colorOption !== color,
                        ),
                      })
                    }
                  >
                    <XIcon className="size-3" weight="bold" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Input
              name="colorOptions"
              value={newColorOption}
              onChange={(e) => setNewColorOption(e.target.value)}
              placeholder="Add new color option"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleNewColorAddition();
                }
              }}
              aria-invalid={!!errorOf('colorOptions')}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Add color"
              disabled={newColorOption.trim() === ''}
              onClick={handleNewColorAddition}
            >
              <CheckIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Clear"
              disabled={newColorOption === ''}
              onClick={() => setNewColorOption('')}
            >
              <XIcon />
            </Button>
          </div>
        </FormField>

        <div className="md:col-span-2">
          <ToggleRow
            label="Can be pre-ordered"
            description="Allow orders while the item is out of stock."
          >
            <Checkbox
              name="canBePreordered"
              checked={item.canBePreordered}
              onCheckedChange={(checked) => setItem({ ...item, canBePreordered: checked === true })}
            />
          </ToggleRow>
        </div>
      </FormSection>

      <Card>
        <CardHeader>
          <CardTitle>Stock details</CardTitle>
        </CardHeader>
        <CardContent>
          {item.stockCount?.length !== 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-28 border-r" />
                    {item.sizeOptions?.map((size) => (
                      <TableHead key={size} className="text-center">
                        {size}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>{item.colorOptions?.map((color) => stockRow(color))}</TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add size and color options to enter stock.
            </p>
          )}
        </CardContent>
      </Card>

      {item.colorOptions?.length === 0 ? (
        <p className="text-sm text-destructive">No color options created</p>
      ) : (
        item.colorOptions?.map((color) => (
          <ColorImages
            key={color}
            color={color}
            item={item}
            setItem={setItem}
            itemId={itemId}
            imagesLoading={imagesLoading}
            error={errorOf('mediaObjects')}
          />
        ))
      )}
    </div>
  );
}

function ColorImages({
  color,
  item,
  setItem,
  itemId,
  imagesLoading,
  error,
}: {
  color: string;
  item: IItemEditWithFile;
  setItem: React.Dispatch<React.SetStateAction<IItemEditWithFile>>;
  itemId?: number;
  imagesLoading?: boolean;
  error?: string;
}) {
  const [loadingNewImage, setLoadingNewImage] = useState<boolean>(false);

  const colorMediaItems = item.mediaObjects
    .filter((mediaObject) => mediaObject.colorOption === color)
    .sort((a, b) => a.viewOrdering - b.viewOrdering);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    const thisColorMediaObjects: IMediaObjectEditWithFile[] = [];
    const otherColorMediaObjects: IMediaObjectEditWithFile[] = [];

    item.mediaObjects.forEach((mediaObject) => {
      if (mediaObject.colorOption === color) {
        thisColorMediaObjects.push(mediaObject);
      } else {
        otherColorMediaObjects.push(mediaObject);
      }
    });

    const [deleted] = thisColorMediaObjects.splice(sourceIndex, 1);
    thisColorMediaObjects.splice(destinationIndex, 0, deleted);

    const viewOrderUpdatedMediaObjects = thisColorMediaObjects.map((mediaObject, index) => ({
      ...mediaObject,
      viewOrdering: index,
    }));

    setItem({
      ...item,
      mediaObjects: [...viewOrderUpdatedMediaObjects, ...otherColorMediaObjects],
    });
  };

  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setLoadingNewImage(true);

      /**
       * The filename coming from user system might cause clashes,
       * hence we generate a random name
       */
      const min = 1,
        max = 10000;
      const randomFileName = (Math.random() * (max - min) + min).toString();
      const newImage = new File([e.target.files[0]], randomFileName, {
        type: e.target.files[0].type,
      });

      const maxViewOrdering = item.mediaObjects
        .filter((mediaObject) => mediaObject.colorOption === color)
        .map((mediaObject) => mediaObject.viewOrdering)
        .reduce((a, b) => Math.max(a, b), 0);

      const input = e.target;
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMediaObject: IMediaObjectEditWithFile = {
          file: newImage,
          type: EMediaObjectType.image,
          colorOption: color,
          url: reader.result as string,
          fileName: newImage.name,
          viewOrdering: maxViewOrdering + 1,
        };
        setItem({
          ...item,
          mediaObjects: [...item.mediaObjects, newMediaObject],
        });

        setLoadingNewImage(false);
        input.value = '';
      };
      reader.onerror = (err) => {
        console.error(err);
      };
      reader.readAsDataURL(newImage);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Images for {color}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {imagesLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Loading images...
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            {colorMediaItems.length > 0 && (
              <DragDropContext onDragEnd={onDragEnd} autoScrollerOptions={{ disabled: false }}>
                <Droppable droppableId={color} direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex max-w-full items-center gap-3 overflow-auto rounded-lg border border-dashed p-3 transition-colors',
                        snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'bg-muted/40',
                      )}
                    >
                      {colorMediaItems.map((mediaObject, index) => (
                        <Draggable
                          key={mediaObject.fileName}
                          draggableId={mediaObject.fileName}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                              className={cn(
                                'group relative w-36 shrink-0 cursor-grab overflow-hidden rounded-lg border bg-card select-none',
                                snapshot.isDragging && 'shadow-lg ring-2 ring-primary',
                              )}
                            >
                              <img
                                alt={`${itemId}-${color}-${index}`}
                                src={mediaObject.url}
                                className="w-full"
                              />
                              <button
                                type="button"
                                aria-label="Delete image"
                                className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md bg-background/90 text-destructive opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-white focus-visible:opacity-100"
                                onClick={() =>
                                  setItem({
                                    ...item,
                                    mediaObjects: item.mediaObjects.filter(
                                      (eachMediaObject) =>
                                        eachMediaObject.fileName !== mediaObject.fileName,
                                    ),
                                  })
                                }
                              >
                                <TrashIcon />
                              </button>
                              <span className="absolute bottom-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-xs font-semibold shadow">
                                {index + 1}
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            <label
              htmlFor={`item-image-add-${itemId}-${color}`}
              className={cn(
                'flex size-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary',
                loadingNewImage && 'pointer-events-none opacity-50',
              )}
            >
              {loadingNewImage ? <Spinner /> : <PlusIcon className="size-5" />}
              {loadingNewImage
                ? 'Loading...'
                : colorMediaItems.length === 0
                  ? 'Add first image'
                  : 'Add new image'}
            </label>
            <input
              disabled={loadingNewImage}
              accept="image/*"
              type="file"
              className="hidden"
              id={`item-image-add-${itemId}-${color}`}
              onChange={handleFileChosen}
            />
          </div>
        )}
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
