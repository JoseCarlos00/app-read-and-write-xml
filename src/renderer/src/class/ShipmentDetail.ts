import { TableRowData } from '../types/types';
import { ShipmentDetail as ShipmentDetailType } from '../types/shipmentDetail';

export class ShipmentDetail {
  ErpOrderLineNum: string;
  SKU: string;
  TotalQuantity: string;
  ErpOrder: string;
  example: ShipmentDetailType;

  constructor({ erpOrder, sku, qty, lineNumber }: TableRowData) {
    this.ErpOrderLineNum = lineNumber;
    this.SKU = sku;
    this.TotalQuantity = qty;
    this.ErpOrder = erpOrder;

    this.example = {
      Action: 'Save',
      ErpOrder: '3405-32523',
      ErpOrderLineNum: '646840',
      RequestedQty: '36',
      SKU: {
        Company: 'FM',
        Item: '1025-3645-32152',
        Quantity: '36',
        QuantityUm: 'PZ',
      },
      TotalQuantity: '36',
    };
  }

  createDetail(): ShipmentDetailType {
    return {
      Action: 'Save',
      ErpOrder: this.ErpOrder,
      ErpOrderLineNum: this.ErpOrderLineNum,
      RequestedQty: this.TotalQuantity,
      SKU: {
        Company: 'FM',
        Item: this.SKU,
        Quantity: this.TotalQuantity,
        QuantityUm: 'PZ',
      },
      TotalQuantity: this.TotalQuantity,
    };
  }

  static getNewArrayObject(
    shipmentDetails: TableRowData[],
  ): ShipmentDetailType[] {
    return shipmentDetails.map((detail) => {
      return new ShipmentDetail(detail).createDetail();
    });
  }
}
