

import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/utils";

// Register fonts
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf" },
    { src: "https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#444",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 60,
  },
  logo: {
    width: 100,
    height: 40,
    marginBottom: 10,
    justifyContent: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: -0.5,
  },
  companyInfo: {
    textAlign: "left",
  },
  companyName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000",
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 40,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  grid: {
    flexDirection: "row",
    marginBottom: 40,
  },
  col6: {
    width: "50%",
  },
  label: {
    fontSize: 7,
    color: "#888",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  value: {
    fontSize: 9,
    marginBottom: 15,
    color: "#000",
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingBottom: 8,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  
  totals: {
    marginTop: 30,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 9,
    color: "#888",
  },
  totalValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
  },
  section: {
    marginTop: 40,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  text: {
    lineHeight: 1.6,
    marginBottom: 6,
    color: "#666",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 60,
    right: 60,
    textAlign: "left",
    fontSize: 7,
    color: "#aaa",
  },
  productDetail: {
    marginBottom: 30,
  },
  productTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000",
  },
});

interface TemplateProps {
  quote: any;
  settings?: any;
}

export default function MinimalTemplate({ quote, settings }: TemplateProps) {
  const subtotal = quote.items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
  const afterDiscount = subtotal - quote.discount;
  const tax = afterDiscount * quote.taxRate;
  const total = afterDiscount + tax;

  const primaryColor = settings?.primaryColor || "#000";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.logo}>
              {settings?.logoUrl ? (
                <Image src={settings.logoUrl} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left" }} />
              ) : (
                <Text style={styles.logoText}>{settings?.companyName || "ASQUE"}</Text>
              )}
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{settings?.companyName || "Tu Nombre de Empresa"}</Text>
              {settings?.companyAddress && <Text>{settings.companyAddress}</Text>}
              {settings?.companyEmail && <Text>{settings.companyEmail}</Text>}
              {settings?.companyPhone && <Text>{settings.companyPhone}</Text>}
            </View>
          </View>
          
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.title}>Cotización</Text>
            <View style={{ marginBottom: 10, alignItems: "flex-end" }}>
              <Text style={styles.label}>Cotización No.</Text>
              <Text style={styles.value}>{quote.quoteNumber}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.value}>{formatDate(quote.date)}</Text>
            </View>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.grid}>
          <View style={styles.col6}>
            <Text style={styles.label}>Preparado Para</Text>
            <Text style={styles.value}>{quote.client.name}</Text>
            <Text style={styles.value}>{quote.client.taxId}</Text>
            {quote.client.address && <Text>{quote.client.address}</Text>}
          </View>
          <View style={styles.col6}>
            <Text style={styles.label}>Válido Hasta</Text>
            <Text style={styles.value}>
              {formatDate(new Date(new Date(quote.date).setDate(new Date(quote.date).getDate() + quote.validityDays)))}
            </Text>
            <Text style={styles.label}>Agente</Text>
            <Text style={styles.value}>{quote.agentName || "-"}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Ítem</Text>
            <Text style={styles.colQty}>Cant.</Text>
            <Text style={styles.colPrice}>Precio</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {quote.items.map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={{ fontWeight: "bold", color: "#000" }}>{item.product.name}</Text>
                <Text style={{ fontSize: 8, color: "#888", marginTop: 2 }}>{item.product.code}</Text>
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          {quote.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descuento</Text>
              <Text style={{ ...styles.totalValue, color: "red" }}>-{formatCurrency(quote.discount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IGV (18%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={{ ...styles.grandTotalValue, color: primaryColor }}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Notes & Terms */}
        {(quote.notes || quote.paymentTerms) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas</Text>
            {quote.paymentTerms && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ ...styles.label, marginBottom: 2 }}>Pago</Text>
                <Text style={styles.text}>{quote.paymentTerms}</Text>
              </View>
            )}
            {quote.notes && (
              <View>
                <Text style={{ ...styles.label, marginBottom: 2 }}>Información Adicional</Text>
                <Text style={styles.text}>{quote.notes}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.footer}>
          {settings?.companyName} • {settings?.companyEmail}
        </Text>
      </Page>

      {/* Product Details Appendix */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Especificaciones</Text>
        </View>

        {quote.items.map((item: any, index: number) => (
          <View key={index} style={styles.productDetail}>
            <Text style={styles.productTitle}>{item.product.name}</Text>
            
            {item.product.longDesc && (
              <Text style={styles.text}>{item.product.longDesc}</Text>
            )}

            {item.product.specs && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.label}>Specs</Text>
                <Text style={{ ...styles.text, fontSize: 8 }}>{item.product.specs}</Text>
              </View>
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
}
