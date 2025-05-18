import { ShipmentDetail } from '../../types/shipmentDetail';
import { TableRowData } from '../../types/types';

export const getContentBodyTable = (
  shipmentDetails: ShipmentDetail[] | undefined,
): TableRowData[] => {
  try {
    if (
      !shipmentDetails ||
      !Array.isArray(shipmentDetails) ||
      shipmentDetails.length === 0
    ) {
      return []; // Devuelve un array vacío si no hay datos
    }

    const content = shipmentDetails
      .map((detail) => {
        const ErpOrderLineNum = detail.ErpOrderLineNum;
        const SKU = detail?.SKU;
        const TotalQuantity = detail?.TotalQuantity;
        const ErpOrder = detail?.ErpOrder;

        // Es crucial que LineNumber exista para la key
        if (
          typeof ErpOrderLineNum === 'undefined' ||
          ErpOrderLineNum === null
        ) {
          console.warn('Detalle omitido por falta de ErpOrderLineNum:', detail);
          return null; // Omitir este elemento si no tiene LineNumber
        }

        const key = ErpOrderLineNum.toString();

        const skuValue = SKU ? SKU.Item.toString() : 'N/A'; // Valor por defecto o placeholder para SKU

        const quantityValue =
          typeof TotalQuantity !== 'undefined' ? TotalQuantity.toString() : '0'; // Valor por defecto

        const erpOrderValue =
          typeof ErpOrder !== 'undefined' ? ErpOrder.toString() : '0'; // Valor por defecto

        if (erpOrderValue === '0') {
          console.warn('Detalle omitido por falta de ErpOrder:', detail);
          return null; // Omitir este elemento si no tiene LineNumber
        }

        return {
          key,
          sku: skuValue,
          qty: quantityValue,
          lineNumber: key,
          erpOrder: erpOrderValue,
        };
      })
      .filter((item) => item !== null); // Filtrar elementos que no pudieron ser procesados

    return content;
  } catch (error) {
    console.error('Error al procesar los datos para la tabla:', error); // Usar console.error
    return []; // Devuelve un array vacío en caso de error
  }
};
