import {
  RootObject,
  ShipmentDetail,
  TableDetailSummary,
} from '../types/shipmentDetail';
import {
  getArrayObjectShipmentDetail,
  getArrayObjectShipmentSummary,
} from './objectGlobal';

export const extractTableDataFromParsedXML = (
  parsedXmlObject: RootObject,
): Array<ShipmentDetail> => {
  if (!parsedXmlObject) {
    return [];
  }

  const { success, shipmentDetailArray } =
    getArrayObjectShipmentDetail(parsedXmlObject);

  if (success && shipmentDetailArray) {
    return shipmentDetailArray;
  }

  return [];
};

export const extractTableDetailFromParsedXML = (
  parsedXmlObject: RootObject,
): TableDetailSummary | null => {
  if (!parsedXmlObject) {
    return null;
  }

  const { success, shipmentSummaryDetail } =
    getArrayObjectShipmentSummary(parsedXmlObject);

  if (success && shipmentSummaryDetail) {
    return shipmentSummaryDetail;
  }

  return null;
};
