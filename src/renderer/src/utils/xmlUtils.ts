import { RootObject, ShipmentDetail } from '../types/shipmentDetail';
import { getArrayObjectShipmentDetail } from './objectGlobal';

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
