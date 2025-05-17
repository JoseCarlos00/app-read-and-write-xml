export type RootObject = {
  WMWROOT: {
    $: Record<string, any>;
    WMWDATA: WmwData;
  };
};

export type WmwData = {
  Shipments: ShipmentContainer;
};

type ShipmentContainer = {
  Shipment: Shipment;
};

type Shipment = {
  Action: string;
  UserDef6: string;
  UserDef8: string;
  AllocateComplete: string;
  Comments: CommentContainer; // Compuesto
  ConsolidationAllowed: string;
  Customer: CustomerInfo; // Compuesto
  CustomerPO: string;
  ErpOrder: string;
  OrderDate: string;
  OrderType: string;
  Priority: string;
  ShipmentId: string;
  UserDef13: string;
  Warehouse: string;
  Details: ShipmentDetailContainer; // Compuesto
};

type CommentContainer = {
  Comment: CommentEntry[];
};

type CommentEntry = {
  CommentType: string;
  Text: string;
};

type CustomerInfo = {
  Carrier: string;
  CarrierService: string;
  Company: string;
  CustomerAddress: AddressNameOnly; // Compuesto
  Customer: string;
  CustomerCategories: CustomerCategories; // Compuesto
  ShipTo: string;
  ShipToAddress: ShipToAddress; // Compuesto
};

type AddressNameOnly = {
  Name: string;
};

type CustomerCategories = {
  Category1: string;
  Category2: string;
  Category8: string;
  Category10: string;
};

type ShipToAddress = {
  Address1: string;
  Address2: string;
  Address3: string;
  City: string;
  Country: string;
  Name: string;
  PostalCode: string;
  State: string;
};

type ShipmentDetailContainer = {
  ShipmentDetail: ShipmentDetail[];
};

export type ShipmentDetail = {
  Action: string;
  ErpOrder: string;
  ErpOrderLineNum: string;
  RequestedQty: string;
  SKU: SKUItem;
  TotalQuantity: string;
};

export type SKUItem = {
  Company: string;
  Item: string;
  Quantity: string;
  QuantityUm: string;
};
