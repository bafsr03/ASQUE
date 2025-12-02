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
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    height: 40,
    backgroundColor: "#eee", // Placeholder for logo
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  companyInfo: {
    textAlign: "right",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1a365d",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a365d",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    marginBottom: 30,
  },
  col6: {
    width: "50%",
  },
  label: {
    fontSize: 8,
    color: "#666",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 10,
    marginBottom: 8,
    fontWeight: "bold",
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f7fafc",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  
  totals: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: "#666",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a365d",
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a365d",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4,
  },
  text: {
    lineHeight: 1.5,
    marginBottom: 4,
  },
  productDetail: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
  },
  productTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#2d3748",
  },
  specs: {
    marginTop: 4,
    fontSize: 9,
    color: "#4a5568",
    fontFamily: "Courier",
  },
  link: {
    color: "#3182ce",
    textDecoration: "none",
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#aaa",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
});

interface QuotePDFProps {
  quote: any;
}

export default function QuotePDF({ quote }: QuotePDFProps) {
  const subtotal = quote.items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
  const afterDiscount = subtotal - quote.discount;
  const tax = afterDiscount * quote.taxRate;
  const total = afterDiscount + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>ASQUE</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Your Company Name</Text>
            <Text>123 Business Street</Text>
            <Text>Lima, Peru</Text>
            <Text>contact@company.com</Text>
            <Text>+51 1 234 5678</Text>
          </View>
        </View>

        <Text style={styles.title}>QUOTATION</Text>

        {/* Info Grid */}
        <View style={styles.grid}>
          <View style={styles.col6}>
            <Text style={styles.label}>BILL TO</Text>
            <Text style={styles.value}>{quote.client.name}</Text>
            <Text style={styles.value}>{quote.client.taxId}</Text>
            {quote.client.address && <Text>{quote.client.address}</Text>}
            {quote.client.contact && <Text>Attn: {quote.client.contact}</Text>}
          </View>
          <View style={styles.col6}>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <View style={{ width: 80 }}>
                <Text style={styles.label}>QUOTE #</Text>
                <Text style={styles.value}>{quote.quoteNumber}</Text>
              </View>
              <View>
                <Text style={styles.label}>DATE</Text>
                <Text style={styles.value}>{formatDate(quote.date)}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: 80 }}>
                <Text style={styles.label}>VALID UNTIL</Text>
                <Text style={styles.value}>
                  {formatDate(new Date(new Date(quote.date).setDate(new Date(quote.date).getDate() + quote.validityDays)))}
                </Text>
              </View>
              <View>
                <Text style={styles.label}>AGENT</Text>
                <Text style={styles.value}>{quote.agentName || "-"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>DESCRIPTION</Text>
            <Text style={styles.colQty}>QTY</Text>
            <Text style={styles.colPrice}>UNIT PRICE</Text>
            <Text style={styles.colTotal}>AMOUNT</Text>
          </View>
          {quote.items.map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={{ fontWeight: "bold" }}>{item.product.name}</Text>
                <Text style={{ fontSize: 8, color: "#666" }}>{item.product.code}</Text>
                {item.product.shortDesc && (
                  <Text style={{ fontSize: 9, marginTop: 2 }}>{item.product.shortDesc}</Text>
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
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={{ ...styles.totalValue, color: "red" }}>-{formatCurrency(quote.discount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IGV (18%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={{ ...styles.totalLabel, fontWeight: "bold", color: "#1a365d" }}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Notes & Terms */}
        {(quote.notes || quote.paymentTerms) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Notes</Text>
            {quote.paymentTerms && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ ...styles.label, marginBottom: 2 }}>PAYMENT TERMS</Text>
                <Text style={styles.text}>{quote.paymentTerms}</Text>
              </View>
            )}
            {quote.notes && (
              <View>
                <Text style={{ ...styles.label, marginBottom: 2 }}>NOTES</Text>
                <Text style={styles.text}>{quote.notes}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.footer}>
          Thank you for your business!
        </Text>
      </Page>

      {/* Product Details Appendix */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Product Details & Specifications</Text>
        </View>

        {quote.items.map((item: any, index: number) => (
          <View key={index} style={styles.productDetail}>
            <Text style={styles.productTitle}>{item.product.name} ({item.product.code})</Text>
            
            {item.product.longDesc && (
              <Text style={styles.text}>{item.product.longDesc}</Text>
            )}

            {item.product.specs && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>TECHNICAL SPECIFICATIONS</Text>
                <Text style={styles.specs}>{item.product.specs}</Text>
              </View>
            )}

            {item.product.links && item.product.links.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>RESOURCES</Text>
                {item.product.links.map((link: any, i: number) => (
                  <Text key={i} style={styles.link}>
                    • {link.label || link.linkType}: {link.url}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}

        <Text style={styles.footer}>
          Page 2 - Product Details
        </Text>
      </Page>
    </Document>
  );
}
