import { IItem } from 'Hooks/Merchandise/itemTypes';
import { DetailCard } from '@/Components/detail-card';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';

export default function ItemDetails({ item }: { item: IItem }) {
  return (
    <div className="grid gap-6">
      <DetailCard
        title="Basic details"
        items={[
          { label: 'ID', value: item.id },
          { label: 'Name', value: item.name },
          { label: 'Description', value: item.description },
          { label: 'Price', value: item.price },
          {
            label: 'Size options',
            value: (
              <div className="flex flex-wrap gap-1">
                {item.sizeOptions.map((size) => (
                  <Badge key={size} variant="secondary">
                    {size}
                  </Badge>
                ))}
              </div>
            ),
          },
          {
            label: 'Color options',
            value: (
              <div className="flex flex-wrap gap-1">
                {item.colorOptions.map((color) => (
                  <Badge key={color} variant="secondary">
                    {color}
                  </Badge>
                ))}
              </div>
            ),
          },
          {
            label: 'Can be pre-ordered',
            value: item.canBePreordered ? (
              <Badge className="bg-primary/10 text-primary" variant="secondary">
                Yes
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                No
              </Badge>
            ),
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Stock details</CardTitle>
        </CardHeader>
        <CardContent>
          {item.stockCount.length !== 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-28 border-r" />
                    {item.sizeOptions.map((size) => (
                      <TableHead key={size} className="text-center">
                        {size}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.colorOptions.map((color) => (
                    <TableRow key={color}>
                      <TableCell className="border-r font-semibold">{color}</TableCell>
                      {item.sizeOptions.map((size) => {
                        const stock = item.stockCount.find(
                          (s) => s.colorOption === color && s.sizeOption === size,
                        );
                        return (
                          <TableCell
                            key={size}
                            className={
                              stock
                                ? 'text-center tabular-nums'
                                : 'text-center text-muted-foreground'
                            }
                          >
                            {stock ? stock.count : 'NA'}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No stock data available</p>
          )}
        </CardContent>
      </Card>

      {item?.colorOptions?.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No images available as no color options have been added
        </p>
      ) : (
        item.colorOptions?.map((color) => <MediaColorCard key={color} item={item} color={color} />)
      )}
    </div>
  );
}

function MediaColorCard({ item, color }: { item: IItem; color: string }) {
  const mediaObjects = item.mediaObjects?.filter(
    (mediaObject) => mediaObject.colorOption === color,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{color} images</CardTitle>
      </CardHeader>
      <CardContent>
        {!mediaObjects || mediaObjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No images available for this color</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {mediaObjects.map((mediaObject, index) => (
              <div
                key={mediaObject.id ?? index}
                className="relative w-36 overflow-hidden rounded-lg border bg-muted"
              >
                <img
                  src={mediaObject.url}
                  referrerPolicy="no-referrer"
                  alt={`Item ${mediaObject.colorOption} ${index + 1}`}
                  className="w-full select-none"
                />
                <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-xs font-semibold shadow">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
