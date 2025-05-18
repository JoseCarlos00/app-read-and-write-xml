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
    if (!originalParsedXML?.WMWROOT?.WMWDATA?.Shipments?.Shipment?.Details) {
      throw new Error(
        'Estructura de globalObject inválida en getObjectGlobal.',
      );
    }

    // Agregar al objecto global los cambios de la tabla
    // originalParsedXML.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0].ShipmentDetail = modifiedTableData;
    originalParsedXML.WMWROOT.WMWDATA.Shipments.Shipment.Details.ShipmentDetail =
      modifiedTableData;

    console.log('ojectGlobalToBuild', {
      originalParsedXML,
      modifiedTableData,
      ojectGlobalToBuild: originalParsedXML,
    });

    return {
      ojectGlobalToBuild: originalParsedXML,
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
  console.log('getArrayObjectShipmentDetail', {
    parsedXmlObject,
    'WMWROOT?.WMWDATA[0]?.Shipments[0]':
      parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments?.Shipment?.Details,
  });

  try {
    // Validación básica de la estructura de parsedXmlObject
    if (!parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments?.Shipment?.Details) {
      throw new Error(
        'Estructura de parsedXmlObject inválida en getArrayObjectShipmentDetail.',
      );
    }

    const detailsNodeSource =
      parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments?.Shipment?.Details;
    // const detailsNodeSource =
    //   parsedXmlObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0];

    console.log('detailsNodeSource', detailsNodeSource);

    let currentShipmentDetailsSource: ArrayContentShipmentDetail | object = [];

    if (
      Array.isArray(detailsNodeSource.ShipmentDetail) &&
      detailsNodeSource.ShipmentDetail.length > 0
    ) {
      currentShipmentDetailsSource = detailsNodeSource.ShipmentDetail;
    } else if (
      typeof detailsNodeSource.ShipmentDetail === 'object' &&
      detailsNodeSource.ShipmentDetail !== null
    ) {
      currentShipmentDetailsSource = [{ ...detailsNodeSource.ShipmentDetail }];
    }

    return { shipmentDetailArray: currentShipmentDetailsSource, success: true };
  } catch (error) {
    console.error(
      'Error en getArrayObjectShipmentDetail al actualizar ShipmentDetail:',
      error,
    );
    return { error: 'Error en getArrayObjectShipmentDetail', success: false };
  }
};
