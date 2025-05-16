import { ShipmentDetail, RootObject } from '../types/shipmentDetail';

type ArrayContentShipmentDetail = Array<ShipmentDetail>;

type getParsedGlobalType = (
  originalParsedXML: RootObject,
  modifiedTableData: ArrayContentShipmentDetail,
) => {
  ojectGlobalToBuild?: RootObject;
  error?: string;
  success: boolean;
};

type getNewArrayObject = (parsedXmlObject: RootObject) => {
  shipmentDetailArray?: ArrayContentShipmentDetail;
  error?: string;
  success: boolean;
};

/** Esta función toma el objeto XML parseado original y los datos modificados de la tabla,
 *
 * y devuelve un nuevo objeto XML listo para ser convertido a string. */
export const updateParsedXMLWithTableData: getParsedGlobalType = (
  originalParsedXML,
  modifiedTableData,
) => {
  try {
    // Validación básica de la estructura de globalObject
    if (
      !originalParsedXML?.WMWROOT?.WMWDATA[0]?.Shipments[0]?.Shipment[0]
        ?.Details[0]
    ) {
      throw new Error(
        'Estructura de globalObject inválida en getObjectGlobal.',
      );
    }

    // Agregar al objecto global los cambios de la tabla
    // originalParsedXML.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0].ShipmentDetail = modifiedTableData;

    return {
      ojectGlobalToBuild: {
        ...originalParsedXML,
        ShipmentDetail: modifiedTableData,
      },
      success: true,
    };
  } catch (error) {
    console.error(
      'Error en getObjectGlobal al actualizar ShipmentDetail:',
      error,
    );

    return {
      error: 'Error en getObjectGlobal al actualizar ShipmentDetail',
      success: false,
    };
  }
};

export const getArrayObjectShipmentDetail: getNewArrayObject = (
  parsedXmlObject,
) => {
  try {
    // Validación básica de la estructura de parsedXmlObject
    if (
      !parsedXmlObject?.WMWROOT?.WMWDATA[0]?.Shipments[0]?.Shipment[0]
        ?.Details[0].ShipmentDetail
    ) {
      throw new Error(
        'Estructura de parsedXmlObject inválida en getArrayObjectShipmentDetail.',
      );
    }

    const detailsNodeSource =
      parsedXmlObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0];

    const currentShipmentDetailsSource = Array.isArray(
      detailsNodeSource.ShipmentDetail,
    )
      ? detailsNodeSource.ShipmentDetail
      : [];

    const shipmentDetailArray = [...currentShipmentDetailsSource];

    return { shipmentDetailArray, success: true };
  } catch (error) {
    console.error(
      'Error en getArrayObjectShipmentDetail al actualizar ShipmentDetail:',
      error,
    );
    return { error: 'Error en getArrayObjectShipmentDetail', success: false };
  }
};
