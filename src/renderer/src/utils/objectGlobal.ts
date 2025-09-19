import {
  ShipmentDetail,
  RootObject,
  TableDetailSummary,
  CommentEntry,
} from '../types/shipmentDetail';

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

type getNewSummaryDetailObject = (parsedXmlObject: RootObject) => {
  shipmentSummaryDetail?: TableDetailSummary | null;
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

    type ShipmentDetailSource = {
      ShipmentDetail: ShipmentDetail[] | ShipmentDetail | null;
    };

    const detailsNodeSource: ShipmentDetailSource =
      parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments?.Shipment?.Details;

    let currentShipmentDetailsSource: ShipmentDetail[] = [];

    if (
      Array.isArray(detailsNodeSource.ShipmentDetail) &&
      detailsNodeSource.ShipmentDetail.length > 0
    ) {
      currentShipmentDetailsSource = detailsNodeSource.ShipmentDetail;
    } else if (detailsNodeSource.ShipmentDetail !== null) {
      const shipmentDetail = detailsNodeSource.ShipmentDetail as ShipmentDetail;
      currentShipmentDetailsSource = [shipmentDetail];
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

export const getArrayObjectShipmentSummary: getNewSummaryDetailObject = (
  parsedXmlObject,
) => {
  console.log('getArrayObjectShipmentSummary', {
    parsedXmlObject,
    'WMWROOT?.WMWDATA[0]?.Shipments[0]':
      parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments?.Shipment,
  });
  try {
    // Validación básica de la estructura de parsedXmlObject
    if (!parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments?.Shipment) {
      throw new Error(
        'Estructura de parsedXmlObject inválida en getArrayObjectShipmentDetail.',
      );
    }

    type GetComments = (
      comments: CommentEntry[] | CommentEntry,
    ) => Partial<TableDetailSummary>['Comments'];

    const getComments: GetComments = (comments) => {
      if (comments && Array.isArray(comments) && comments.length > 0) {
        return comments as TableDetailSummary['Comments'];
      } else if (comments) {
        return [comments] as TableDetailSummary['Comments'];
      }

      return null;
    };

    const shipmentSummaryDetail: TableDetailSummary = {
      Customer: {
        CustomerName:
          parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments.Shipment.Customer
            .Customer,
        CustomerAddress:
          parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments.Shipment.Customer
            .CustomerAddress.Name,
      },
      ErpOrder: parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments.Shipment.ErpOrder,
      ShipmentId:
        parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments.Shipment.ShipmentId,
      ShipToAddress: {
        ShipTo:
          parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments.Shipment.Customer.ShipTo,
        Name: parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments.Shipment.Customer
          .ShipToAddress.Name,
        Address:
          parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments.Shipment.Customer
            .ShipToAddress.Address1 ||
          parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments.Shipment.Customer
            .ShipToAddress.Address2 ||
          parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments.Shipment.Customer
            .ShipToAddress.Address3,
      },
      OrderDetails: {
        OrderDate:
          parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments.Shipment.OrderDate,
        OrderType:
          parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments.Shipment.OrderType,
      },
      Comments:
        getComments(
          parsedXmlObject?.WMWROOT?.WMWDATA?.Shipments.Shipment.Comments
            .Comment,
        ) ?? null,
    };

    return {
      shipmentSummaryDetail,
      success: true,
    };
  } catch (error) {
    console.error(
      'Error en getArrayObjectShipmentSummary al actualizar ShipmentSummaryDetail:',
      error,
    );
    return { error: 'Error en getArrayObjectShipmentSummary', success: false };
  }
};
