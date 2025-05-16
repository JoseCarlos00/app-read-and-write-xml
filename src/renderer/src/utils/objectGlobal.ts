import { ShipmentDetail, RootObject } from '../types/shipmentDetail';

type ArrayContentShipmentDetail = Array<ShipmentDetail>;

type getObjectGlobalType = (
  baseObject: RootObject,
  newDetailsContent: ArrayContentShipmentDetail,
) => {
  baseObject?: RootObject;
  error?: string;
  success: boolean;
};

export const getObjectGlobal: getObjectGlobalType = (
  baseObject,
  newDetailsContent,
) => {
  try {
    // Validación básica de la estructura de globalObject
    if (
      !baseObject?.WMWROOT?.WMWDATA[0]?.Shipments[0]?.Shipment[0]?.Details[0]
    ) {
      throw new Error(
        'Estructura de globalObject inválida en getObjectGlobal.',
      );
    }

    // Agregar al objecto global los cambios de la tabla
    // baseObject es globalObject.dataObject del estado, que es una copia y se puede mutar aquí.
    baseObject.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0].ShipmentDetail =
      newDetailsContent;

    return { baseObject, success: true };
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
