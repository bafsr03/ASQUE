"use client";

import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/utils";

// Register fonts
Font.register({
  family: "Times-Roman",
  fonts: [
    { src: "https://fonts.gstatic.com/s/timesnewroman/v12/TimesNewRoman.ttf" },
    { src: "https://fonts.gstatic.com/s/timesnewroman/v12/TimesNewRomanBold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Times-Roman",
    fontSize: 11,
    color: "#000",
  },
  header: {
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 60,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  companyInfo: {
    textAlign: "center",
    marginTop: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 10,
    alignSelf: "center",
  },
  grid: {
    flexDirection: "row",
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#000",
    padding: 15,
  },
  col6: {
    width: "50%",
  },
  label: {
    fontSize: 9,
    color: "#000",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  value: {
    fontSize: 11,
    marginBottom: 10,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  
  totals: {
    marginTop: 20,
    alignItems: "flex-end",
    paddingRight: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 250,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 2,
  },
  totalLabel: {
    fontSize: 11,
    color: "#000",
  },
  totalValue: {
    fontSize: 11,
    fontWeight: "bold",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 250,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#000",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 4,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  section: {
    marginTop: 30,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    textTransform: "uppercase",
    textDecoration: "underline",
  },
  text: {
    lineHeight: 1.6,
    marginBottom: 6,
    textAlign: "justify",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 9,
    color: "#000",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 15,
    fontStyle: "italic",
  },
  productDetail: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  productTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000",
  },
});

interface TemplateProps {
  quote: any;
  settings?: any;
}

export default function ClassicTemplate({ quote, settings }: TemplateProps) {
  const subtotal = quote.items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
  const afterDiscount = subtotal - quote.discount;
  const tax = afterDiscount * quote.taxRate;
  const total = afterDiscount + tax;

  const primaryColor = settings?.primaryColor || "#000";
  const fontFamily = "Times-Roman"; // Enforce serif for classic

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            {settings?.logoUrl ? (
              <Image src={settings.logoUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              <Text style={styles.logoText}>{settings?.companyName || "ASQUE"}</Text>
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{settings?.companyName || "Tu Nombre de Empresa"}</Text>
            {settings?.companyAddress && <Text>{settings.companyAddress}</Text>}
            {settings?.companyEmail && <Text>{settings.companyEmail}</Text>}
            {settings?.companyPhone && <Text>{settings.companyPhone}</Text>}
            {settings?.companyTaxId && <Text>RUC: {settings.companyTaxId}</Text>}
          </View>
        </View>

        <Text style={styles.title}>COTIZACIÓN</Text>

        {/* Info Grid */}
        <View style={styles.grid}>
          <View style={styles.col6}>
            <Text style={styles.label}>Facturar A:</Text>
            <Text style={styles.value}>{quote.client.name}</Text>
            <Text style={styles.value}>{quote.client.taxId}</Text>
            {quote.client.address && <Text>{quote.client.address}</Text>}
            {quote.client.contact && <Text>Atn: {quote.client.contact}</Text>}
          </View>
          <View style={styles.col6}>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.label}>Número de Cotización:</Text>
              <Text style={styles.value}>{quote.quoteNumber}</Text>
            </View>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>{formatDate(quote.date)}</Text>
            </View>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.label}>Válido Hasta:</Text>
              <Text style={styles.value}>
                {formatDate(new Date(new Date(quote.date).setDate(new Date(quote.date).getDate() + quote.validityDays)))}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>Agente:</Text>
              <Text style={styles.value}>{quote.agentName || "-"}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>DESCRIPCIÓN</Text>
            <Text style={styles.colQty}>CANT</Text>
            <Text style={styles.colPrice}>PRECIO UNIT.</Text>
            <Text style={styles.colTotal}>MONTO</Text>
          </View>
          {quote.items.map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={{ fontWeight: "bold" }}>{item.product.name}</Text>
                <Text style={{ fontSize: 9, fontStyle: "italic" }}>{item.product.code}</Text>
                {item.product.shortDesc && (
                  <Text style={{ fontSize: 10, marginTop: 2 }}>{item.product.shortDesc}</Text>
                )}
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
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          {quote.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descuento:</Text>
              <Text style={{ ...styles.totalValue, color: "red" }}>-{formatCurrency(quote.discount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IGV (18%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Notes & Terms */}
        {(quote.notes || quote.paymentTerms) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Términos y Condiciones</Text>
            {quote.paymentTerms && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ ...styles.label, marginBottom: 4 }}>Términos de Pago:</Text>
                <Text style={styles.text}>{quote.paymentTerms}</Text>
              </View>
            )}
            {quote.notes && (
              <View>
                <Text style={{ ...styles.label, marginBottom: 4 }}>Notas:</Text>
                <Text style={styles.text}>{quote.notes}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.footer}>
          Gracias por su preferencia. Apreciamos su confianza en nosotros.
        </Text>
      </Page>

      {/* Product Details Appendix */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={{ ...styles.title, marginBottom: 0, borderBottomWidth: 0 }}>Especificaciones del Producto</Text>
        </View>

        {quote.items.map((item: any, index: number) => (
          <View key={index} style={styles.productDetail}>
            <Text style={styles.productTitle}>{item.product.name} ({item.product.code})</Text>
            
            {item.product.longDesc && (
              <Text style={styles.text}>{item.product.longDesc}</Text>
            )}

            {item.product.specs && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.label}>Especificaciones Técnicas:</Text>
                <Text style={{ ...styles.text, fontFamily: "Courier", fontSize: 10 }}>{item.product.specs}</Text>
              </View>
            )}
          </View>
        ))}

        <Text style={styles.footer}>
          Página 2 - Detalles del Producto
        </Text>
      </Page>
    </Document>
  );
}
