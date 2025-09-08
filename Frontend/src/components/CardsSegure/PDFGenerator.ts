// PDF Generator utility for insurance cards
import jsPDF from 'jspdf';

export interface InsurancePlan {
    id: string;
    name: string;
    price: number;
    coverage: string[];
    description: string;
}

export interface UserInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
}

export class PDFGenerator {
    static generateInsuranceCard(plan: InsurancePlan, userInfo: UserInfo): void {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('Tarjeta de Seguro Médico', 20, 30);

        // Plan information
        doc.setFontSize(16);
        doc.text(`Plan: ${plan.name}`, 20, 50);
        doc.setFontSize(12);
        doc.text(`Precio: $${plan.price}/mes`, 20, 65);

        // User information
        doc.setFontSize(14);
        doc.text('Información del Asegurado:', 20, 85);
        doc.setFontSize(12);
        doc.text(`Nombre: ${userInfo.name}`, 20, 100);
        doc.text(`Email: ${userInfo.email}`, 20, 115);
        doc.text(`Teléfono: ${userInfo.phone}`, 20, 130);
        doc.text(`Dirección: ${userInfo.address}`, 20, 145);

        // Coverage
        doc.setFontSize(14);
        doc.text('Cobertura:', 20, 165);
        doc.setFontSize(12);
        plan.coverage.forEach((item, index) => {
            doc.text(`• ${item}`, 25, 180 + (index * 15));
        });

        // Save the PDF
        doc.save(`seguro-${plan.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    }
}

export default PDFGenerator;
