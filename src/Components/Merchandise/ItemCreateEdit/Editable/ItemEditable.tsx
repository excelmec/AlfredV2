import {
  Grid,
  Box,
  Typography,
  Paper,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  // Input,
  Select,
  OutlinedInput,
  Chip,
  MenuItem,
  IconButton,
  TextField,
  FormHelperText,
  Checkbox,
} from '@mui/material';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import './ItemEditable.css';

import { ReactElement, useEffect, useState } from 'react';
import {
  IItemEditWithFile,
  IMediaObjectEditWithFile,
  IStockCountEdit,
} from 'Hooks/Merchandise/create-update/itemEditTypes';
import { EMediaObjectType, sizeOptions } from 'Hooks/Merchandise/itemTypes';
import { ValidationError } from 'yup';
import { debounce } from 'lodash';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

/**DRAG START */

const grid = 8;

const getItemStyle = (isDragging: any, draggableStyle: any) => ({
  width: '150px',
  aspectRation: 'initial',
  userSelect: 'none',
  margin: `0 ${grid * 2}px 0 0`,
  background: isDragging ? 'lightgreen' : 'none',
  cursor: 'pointer',
  position: 'relative',
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: any) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  display: 'flex',
  padding: grid * 2,
  paddingRight: 0,
  overflow: 'auto',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '80%',
});

/** DRAG END */

export default function ItemEditable({
  itemId,
  item,
  setItem,
  imagesLoading,
  validateEvent,
  validationErrors,
}: {
  itemId?: number;
  item: IItemEditWithFile;
  setItem: React.Dispatch<React.SetStateAction<IItemEditWithFile>>;
  imagesLoading?: boolean;
  validateEvent: () => boolean;
  validationErrors: ValidationError[];
}) {
  const [newColorOption, setNewColorOption] = useState<string>('');

  function StockRow({ color }: { color: string }) {
    const stockErrors = validationErrors.filter((error) => {
      return error.path?.startsWith('stockCount') && error.path.endsWith('count');
    });

    const tableCells: ReactElement[] = [];

    item.sizeOptions.forEach((size) => {
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
        item.stockCount.find((stock) => stock.colorOption === color && stock.sizeOption === size)
          ?.count ?? 0;

      tableCells.push(
        <TableCell align="center">
          <TextField
            name={`stockCount[${item.stockCount.findIndex(
              (stock) => stock.colorOption === color && stock.sizeOption === size,
            )}].count`}
            variant="outlined"
            fullWidth
            error={extractedValidationError !== undefined}
            helperText={extractedValidationError?.message ?? ''}
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
            placeholder="Stock Count"
            type="number"
          />
        </TableCell>,
      );
    });

    return (
      <TableRow>
        <TableCell
          align="center"
          sx={{
            fontWeight: 'bold',
            borderRight: '1px solid #0000001f',
          }}
        >
          {color}
        </TableCell>
        {tableCells}
      </TableRow>
    );
  }

  function SelectOptions({
    itemField,
    label,
    options,
  }: {
    itemField: 'sizeOptions';
    label: string;
    options: IItemEditWithFile[typeof itemField];
  }) {
    const errMsg = validationErrors.find((error) => {
      return error.path === 'sizeOptions';
    })?.message;

    return (
      <>
        <Select
          fullWidth
          multiple
          value={item[itemField]}
          onChange={(event) => {
            const {
              target: { value },
            } = event;

            if (!Array.isArray(value)) {
              /**
               * This happens on AutoFill
               */
              return;
            }

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
              [itemField]: value,

              stockCount: [
                ...item.stockCount.filter((stock) => value.includes(stock.sizeOption)),
                ...newStocks,
              ],
            });
          }}
          input={<OutlinedInput label={label} />}
          renderValue={(selected) => (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
              }}
            >
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
          error={errMsg !== undefined}
          name={itemField}
        >
          {options.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
        {errMsg && <FormHelperText>{errMsg}</FormHelperText>}
      </>
    );
  }

  /**DRAG START */

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const color = result.destination.droppableId;
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

    const newMediaObjects = [...viewOrderUpdatedMediaObjects, ...otherColorMediaObjects];

    setItem({
      ...item,
      mediaObjects: newMediaObjects,
    });
  };

  function DraggableColorImages({ color }: { color: string }) {
    const [loadingNewImage, setLoadingNewImage] = useState<boolean>(false);

    if (imagesLoading) {
      return <Typography>Loading Images...</Typography>;
    }

    const colorMediaItems = item.mediaObjects
      .filter((mediaObject) => mediaObject.colorOption === color)
      .sort((a, b) => a.viewOrdering - b.viewOrdering);

    return (
      <div className="item-image-edit-row">
        {colorMediaItems.length === 0 ? (
          'No Images added'
        ) : (
          <>
            <DragDropContext
              onDragEnd={onDragEnd}
              autoScrollerOptions={{
                disabled: false,
              }}
            >
              <Droppable droppableId={color} direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    className="item-edit-droppable-div"
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
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
                            style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                          >
                            <img
                              alt={`${itemId}-${color}-${index}`}
                              src={mediaObject.url}
                              className="item-edit-draggable-img"
                            />
                            <div
                              className="item-edit-draggable-delete"
                              onClick={() => {
                                setItem({
                                  ...item,
                                  mediaObjects: item.mediaObjects.filter(
                                    (eachMediaObject) =>
                                      eachMediaObject.fileName !== mediaObject.fileName,
                                  ),
                                });
                              }}
                            >
                              <DeleteForeverIcon />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </>
        )}
        <label htmlFor={`item-image-add-${itemId}-${color}`}>
          <div className={`item-edit-image-add ${loadingNewImage ? 'disabled' : ''}`}>
            <AddIcon />
            <span className="item-edit-image-add-text">
              {loadingNewImage ? 'Loading...' : 'Add new image'}
            </span>
          </div>
        </label>
        <input
          disabled={loadingNewImage}
          accept="image/*"
          type="file"
          style={{ display: 'none' }}
          id={`item-image-add-${itemId}-${color}`}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setLoadingNewImage(true);

              /**
               * The filename coming from user system might cuase clashes,
               * hence we generate a random name
               */
              const min = 1,
                max = 10000;
              const randomFileName = (Math.random() * (max - min) + min).toString();
              const newImage = new File([e.target.files[0]], randomFileName, {
                type: e.target.files[0].type,
              });

              const maxViewOrdering = item.mediaObjects
                .filter((mediaObject) => {
                  return mediaObject.colorOption === color;
                })
                .map((mediaObject) => {
                  return mediaObject.viewOrdering;
                })
                .reduce((a, b) => Math.max(a, b), 0);

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
                e.target.value = '';
              };
              reader.onerror = (e) => {
                console.error(e);
              };
              reader.readAsDataURL(newImage);
            }
          }}
        />
      </div>
    );
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

    console.log('ItemEditable: new color added', {
      colors: [...item.colorOptions, newColorOptionTrimmed],
    });
    setNewColorOption('');
  }

  /**DRAG END */

  useEffect(() => {
    debounce(validateEvent, 300)();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  return (
    <Box className="item-editable-data-container" component={Paper} elevation={1} borderRadius={0}>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        className="item-editable-data-grid"
      >
        <Grid item xs={12}>
          <Typography variant="h5">Item Basic Details</Typography>
        </Grid>
        {!itemId && (
          <>
            <Grid item xs={6}>
              <Typography>ID</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{itemId}</Typography>
            </Grid>
          </>
        )}

        <Grid item xs={6}>
          <Typography>Name</Typography>
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="name"
            variant="outlined"
            fullWidth
            value={item.name}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            placeholder="Name"
            error={validationErrors.some((error) => {
              return error.path === 'name';
            })}
            helperText={
              validationErrors.find((error) => {
                return error.path === 'name';
              })?.message ?? ''
            }
          />
        </Grid>

        <Grid item xs={6}>
          <Typography>Description</Typography>
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="description"
            variant="outlined"
            fullWidth
            value={item.description}
            onChange={(e) => setItem({ ...item, description: e.target.value })}
            placeholder="Description"
            multiline
            error={validationErrors.some((error) => {
              return error.path === 'description';
            })}
            helperText={
              validationErrors.find((error) => {
                return error.path === 'description';
              })?.message ?? ''
            }
          />
        </Grid>

        <Grid item xs={6}>
          <Typography>Price</Typography>
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="price"
            variant="outlined"
            fullWidth
            value={item.price}
            onChange={(e) =>
              setItem({
                ...item,
                price: parseInt(e.target.value),
              })
            }
            placeholder="Price"
            multiline
            type="number"
            error={validationErrors.some((error) => {
              return error.path === 'price';
            })}
            helperText={
              validationErrors.find((error) => {
                return error.path === 'price';
              })?.message ?? ''
            }
          />
        </Grid>

        <Grid item xs={6}>
          <Typography>Size Options</Typography>
        </Grid>
        <Grid item xs={6}>
          <SelectOptions itemField="sizeOptions" label="Size Options" options={sizeOptions} />
        </Grid>

        <Grid item xs={6}>
          <Typography>Color Options</Typography>
        </Grid>
        <Grid item xs={6} container rowGap={2}>
          <Grid item xs={12}>
            <Box>
              {item?.colorOptions?.length === 0 ? (
                <Typography color="error">No Color Options Created</Typography>
              ) : (
                item?.colorOptions?.map((color) => (
                  <Box
                    sx={{
                      display: 'inline-block',
                      m: 0.5,
                    }}
                  >
                    <Chip
                      key={color}
                      label={color}
                      variant="outlined"
                      onDelete={(e) => {
                        setItem({
                          ...item,
                          colorOptions: item.colorOptions.filter(
                            (itemColor) => itemColor !== color,
                          ),

                          stockCount: item.stockCount.filter(
                            (stock) => stock.colorOption !== color,
                          ),

                          mediaObjects: item.mediaObjects.filter(
                            (mediaObject) => mediaObject.colorOption !== color,
                          ),
                        });
                      }}
                    />
                  </Box>
                ))
              )}
            </Box>
          </Grid>
          {/* <Grid item xs={6}>
						<Typography>Add Color Option</Typography>
					</Grid> */}
          <Grid item xs={7}>
            <TextField
              name="colorOptions"
              fullWidth
              value={newColorOption}
              onChange={(e) => setNewColorOption(e.target.value)}
              placeholder="Add new Color Option"
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  handleNewColorAddition();
                }
              }}
              error={validationErrors.some((error) => {
                return error.path === 'colorOptions';
              })}
              helperText={
                validationErrors.find((error) => {
                  return error.path === 'colorOptions';
                })?.message ?? ''
              }
            />
          </Grid>

          <Grid item xs={5}>
            <Box>
              <IconButton
                sx={{
                  display: newColorOption.trim() === '' ? 'none' : '',
                }}
                onClick={handleNewColorAddition}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                onClick={() => setNewColorOption('')}
                sx={{
                  display: newColorOption === '' ? 'none' : '',
                }}
              >
                <ClearIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Grid item xs={6}>
          <Typography>Can Be Pre-ordered</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>
            <Checkbox
              // checked=
              name="canBePreordered"
              checked={item.canBePreordered}
              onChange={(e) => {
                console.log(`Checked: ${e.target.checked}`);
                setItem({ ...item, canBePreordered: e.target.checked });
                console.log(`Checked after: ${item.canBePreordered}`);
              }}
            />
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">Stock Details</Typography>
        </Grid>

        <Grid item xs={12}>
          {item.stockCount?.length !== 0 ? (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      width={100}
                      sx={{
                        fontWeight: 'bold',
                        borderRight: '1px solid #0000001f',
                      }}
                    >
                      {}
                    </TableCell>
                    {item.sizeOptions?.map((size) => (
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 'bold',
                        }}
                        width={100}
                      >
                        {size}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>{item.colorOptions?.map((color) => StockRow({ color }))}</TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No Stock Data Available</Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {item.colorOptions?.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="error">No Color Options Created</Typography>
          </Grid>
        ) : (
          item.colorOptions?.map((color) => (
            <>
              <Grid item xs={12}>
                <Typography variant="h5">Images for color: {color}</Typography>
              </Grid>
              <Grid item xs={12}>
                <DraggableColorImages color={color} />
              </Grid>
            </>
          ))
        )}
      </Grid>
    </Box>
  );
}
