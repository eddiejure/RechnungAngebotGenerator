import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { DocumentData } from '../types/document';
import { formatCurrency, formatDate } from '../utils/calculations';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingTop: 76.5, // 2,7 cm
    paddingLeft: 70.9, // 2,5 cm
    paddingRight: 56.7, // 2,0 cm
    paddingBottom: 56.7, // 2,0 cm
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  // Absenderangabe (kleine Schrift über Empfängeradresse)
  senderReference: {
    position: 'absolute',
    top: 76.5, // 2,7 cm vom oberen Rand
    left: 70.9, // 2,5 cm vom linken Rand
    width: 241, // 85 mm
    fontSize: 7,
    color: '#666',
    borderBottom: 0.5,
    borderBottomColor: '#666',
    paddingBottom: 2,
    marginBottom: 3,
  },
  // Anschriftfeld (85mm × 45mm)
  addressField: {
    position: 'absolute',
    top: 88, // 2,7 cm + kleine Absenderzeile
    left: 70.9, // 2,5 cm vom linken Rand
    width: 241, // 85 mm
    height: 127.6, // 45 mm
    fontSize: 10,
  },
  addressLine: {
    marginBottom: 2,
  },
  // Firmeninfo rechts oben
  companyInfo: {
    position: 'absolute',
    top: 76.5,
    right: 56.7,
    width: 200,
    fontSize: 9,
    textAlign: 'right',
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  // Hauptinhalt beginnt nach Anschriftfeld + 2 Leerzeilen
  mainContent: {
    marginTop: 200, // Platz für Anschriftfeld + Abstand
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  documentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    fontSize: 9,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 6,
    fontWeight: 'bold',
    fontSize: 9,
    borderBottom: 1,
    borderBottomColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
    fontSize: 9,
  },
  col1: { width: '8%' }, // Position
  col2: { width: '52%' }, // Beschreibung
  col3: { width: '10%' }, // Menge
  col4: { width: '15%' }, // Einzelpreis
  col5: { width: '15%' }, // Gesamtpreis
  totals: {
    alignSelf: 'flex-end',
    width: '45%',
    marginBottom: 25,
    fontSize: 9,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    fontWeight: 'bold',
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginTop: 5,
    paddingTop: 6,
    fontSize: 10,
  },
  smallBusinessNote: {
    fontStyle: 'italic',
    color: '#666',
    fontSize: 8,
    marginBottom: 2,
  },
  notes: {
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
    padding: 8,
    fontSize: 9,
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  // Fußzeile mit Pflichtangaben (mindestens 2 cm vom unteren Rand)
  footer: {
    position: 'absolute',
    bottom: 56.7, // 2,0 cm vom unteren Rand
    left: 70.9,
    right: 56.7,
    fontSize: 7,
    color: '#666',
    lineHeight: 1.4,
    borderTop: 0.5,
    borderTopColor: '#666',
    paddingTop: 6,
  },
  footerRow: {
    marginBottom: 2,
  },
});

interface PDFDocumentProps {
  data: DocumentData;
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({ data }) => {
  const documentTitle = data.type === 'invoice' ? 'Rechnung' : 'Angebot';
  
  // Absenderzeile für Fensterumschlag
  const senderLine = `${data.company.name}, ${data.company.address}, ${data.company.postalCode} ${data.company.city}`;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Absenderangabe (kleine Schrift für Fensterumschlag) */}
        <View style={styles.senderReference}>
          <Text>{senderLine}</Text>
        </View>

        {/* Anschriftfeld (85mm × 45mm) - perfekt für Fensterumschlag */}
        <View style={styles.addressField}>
          <Text style={styles.addressLine}>{data.customer.name}</Text>
          <Text style={styles.addressLine}>{data.customer.address}</Text>
          <Text style={styles.addressLine}>
            {data.customer.postalCode} {data.customer.city}
          </Text>
          {data.customer.country && data.customer.country !== 'Deutschland' && (
            <Text style={styles.addressLine}>{data.customer.country}</Text>
          )}
        </View>

        {/* Firmeninfo rechts oben */}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{data.company.name}</Text>
          <Text>{data.company.address}</Text>
          <Text>{data.company.postalCode} {data.company.city}</Text>
          <Text>Tel: {data.company.phone}</Text>
          <Text>E-Mail: {data.company.email}</Text>
          <Text>Steuernr.: {data.company.taxId}</Text>
          <Text>USt-IdNr.: {data.company.vatId}</Text>
        </View>

        {/* Hauptinhalt */}
        <View style={styles.mainContent}>
          {/* Betreffzeile */}
          <Text style={styles.documentTitle}>
            {documentTitle} Nr. {data.documentNumber}
          </Text>
          
          {/* Dokumentinformationen */}
          <View style={styles.documentInfo}>
            <View>
              <Text>{documentTitle}sdatum: {formatDate(data.date)}</Text>
              {data.type === 'invoice' && data.dueDate && (
                <Text>Fälligkeitsdatum: {formatDate(data.dueDate)}</Text>
              )}
            </View>
          </View>

          {/* Positionen-Tabelle */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Pos.</Text>
              <Text style={styles.col2}>Beschreibung</Text>
              <Text style={styles.col3}>Menge</Text>
              <Text style={styles.col4}>Einzelpreis</Text>
              <Text style={styles.col5}>Gesamtpreis</Text>
            </View>
            
            {data.lineItems.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.col1}>{item.position}</Text>
                <Text style={styles.col2}>{item.description}</Text>
                <Text style={styles.col3}>{item.quantity}</Text>
                <Text style={styles.col4}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={styles.col5}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>

          {/* Summen */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text>Zwischensumme:</Text>
              <Text>{formatCurrency(data.subtotal)}</Text>
            </View>
            
            {!data.isSmallBusiness && (
              <View style={styles.totalRow}>
                <Text>19% MwSt.:</Text>
                <Text>{formatCurrency(data.vatAmount)}</Text>
              </View>
            )}
            
            <View style={styles.totalRowBold}>
              <Text>Gesamtbetrag:</Text>
              <Text>{formatCurrency(data.total)}</Text>
            </View>
          </View>

          {/* Kleinunternehmer-Hinweis */}
          {data.isSmallBusiness && (
            <Text style={[styles.smallBusinessNote, { marginBottom: 15, fontSize: 9 }]}>
              Gemäß §19 UStG wird keine Umsatzsteuer berechnet.
            </Text>
          )}

          {/* Anmerkungen */}
          {data.notes && (
            <View style={styles.notes}>
              <Text style={styles.notesTitle}>Anmerkungen:</Text>
              <Text>{data.notes}</Text>
            </View>
          )}
        </View>

        {/* Fußzeile mit Pflichtangaben */}
        <View style={styles.footer}>
          <Text style={styles.footerRow}>
            Bankverbindung: {data.company.bankName} | IBAN: {data.company.iban} | BIC: {data.company.bic}
          </Text>
          <Text style={styles.footerRow}>
            {data.company.registerCourt} {data.company.registerNumber} | Geschäftsführer: {data.company.manager}
          </Text>
          <Text style={styles.footerRow}>
            Steuernummer: {data.company.taxId} | USt-IdNr.: {data.company.vatId}
          </Text>
        </View>
      </Page>
    </Document>
  );
};