const db = require('../db');
const PDFDocument = require('pdfkit-table');

// Obtener todos los reportes de un equipo
exports.getReportsByItemId = async (req, res) => {
    try {
        const { itemId } = req.params;
        const result = await db.query(
            'SELECT * FROM maintenance_reports WHERE item_id = $1 ORDER BY fecha DESC',
            [itemId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener reportes:', error);
        res.status(500).json({ error: 'Error al obtener los reportes de mantenimiento' });
    }
};

// Generar PDF del historial
exports.generatePDF = async (req, res) => {
    try {
        const { itemId } = req.params;

        // Obtener información del equipo
        const itemResult = await db.query('SELECT * FROM inventory_items WHERE id = $1', [itemId]);
        if (itemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado' });
        }
        const item = itemResult.rows[0];

        // Obtener historial de reportes
        const reportsResult = await db.query(
            'SELECT * FROM maintenance_reports WHERE item_id = $1 ORDER BY fecha DESC',
            [itemId]
        );
        const reports = reportsResult.rows;

        // Crear el documento PDF con márgenes ajustados
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const pageWidth = doc.page.width - 80; // ancho útil (A4 = 595 - 80 = 515)

        // Configurar respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_Mantenimiento_${item.serial}.pdf`);
        doc.pipe(res);

        // ========== TÍTULO ==========
        doc.fontSize(18).font('Helvetica-Bold').text('REPORTE DE MANTENIMIENTO', { align: 'center' });
        doc.fontSize(9).font('Helvetica').text('SISTEMA DE INVENTARIO HOSPITALARIO', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(8).text(`Fecha de generación: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown(0.5);

        // ========== CUADRO DE INFO DEL EQUIPO ==========
        const boxY = doc.y;
        const boxHeight = 80;
        doc.rect(40, boxY, pageWidth, boxHeight).fill('#f1f5f9').stroke('#cbd5e1');
        doc.fillColor('#000');

        const col1X = 50;
        const col2X = 300;
        let lineY = boxY + 10;

        doc.fontSize(9).font('Helvetica-Bold').text('INFORMACIÓN DEL EQUIPO', col1X, lineY);
        doc.font('Helvetica').fontSize(8);
        doc.text(`Equipo:     ${item.marca} ${item.modelo}`, col1X, lineY + 16);
        doc.text(`No. Serial: ${item.serial}`, col1X, lineY + 30);
        doc.text(`Tipo:       ${item.tipo}`, col1X, lineY + 44);

        doc.fontSize(9).font('Helvetica-Bold').text('UBICACIÓN Y RESPONSABLE', col2X, lineY);
        doc.font('Helvetica').fontSize(8);
        doc.text(`Ubicación:    ${item.ubicacion}`, col2X, lineY + 16);
        doc.text(`Departamento: ${item.departamento || 'N/A'}`, col2X, lineY + 30);
        doc.text(`Responsable:  ${item.asignado_a || 'N/A'}`, col2X, lineY + 44);

        // Mover el cursor justo debajo del cuadro
        doc.x = 40;
        doc.y = boxY + boxHeight + 15;

        // ========== TABLA DE INTERVENCIONES ==========
        const table = {
            title: "HISTORIAL DE INTERVENCIONES",
            subtitle: "Detalle cronológico de mantenimientos y reparaciones",
            headers: [
                { label: "Fecha", width: 70, align: 'left' },
                { label: "Tipo", width: 80, align: 'left' },
                { label: "Técnico", width: 100, align: 'left' },
                { label: "Descripción", width: 190, align: 'left' },
                { label: "Costo", width: 75, align: 'right' },
            ],
            rows: reports.map(r => [
                r.fecha ? new Date(r.fecha).toLocaleDateString() : 'N/A',
                r.tipo_mantenimiento || '',
                r.tecnico || '',
                r.descripcion || '',
                r.costo ? `$${Number(r.costo).toFixed(2)}` : '-'
            ]),
        };

        await doc.table(table, {
            width: pageWidth,
            columnsSize: [70, 80, 100, 190, 75],
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
            prepareRow: () => doc.font("Helvetica").fontSize(7),
        });

        // ========== FIRMAS ==========
        const bottomPos = doc.page.height - 90;
        doc.moveTo(60, bottomPos).lineTo(240, bottomPos).stroke();
        doc.moveTo(360, bottomPos).lineTo(540, bottomPos).stroke();

        doc.fontSize(8).font('Helvetica').text('Firma del Técnico', 60, bottomPos + 8, { width: 180, align: 'center' });
        doc.text('Sello de Departamento', 360, bottomPos + 8, { width: 180, align: 'center' });

        doc.end();

    } catch (error) {
        console.error('Error al generar PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error al generar el reporte PDF' });
        }
    }
};

// Crear un nuevo reporte
exports.createReport = async (req, res) => {
    try {
        const { item_id, tipo_mantenimiento, descripcion, tecnico, costo, notas, fecha } = req.body;

        const result = await db.query(
            `INSERT INTO maintenance_reports (
        item_id, tipo_mantenimiento, descripcion, tecnico, costo, notas, fecha
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [item_id, tipo_mantenimiento, descripcion, tecnico, costo, notas, fecha || new Date()]
        );

        // Opcionalmente, actualizar la fecha de último mantenimiento en el equipo
        await db.query(
            'UPDATE inventory_items SET ultimo_mantenimiento = $1 WHERE id = $2',
            [fecha || new Date(), item_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear reporte:', error);
        res.status(500).json({ error: 'Error al crear el reporte de mantenimiento' });
    }
};

// Eliminar un reporte
exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM maintenance_reports WHERE id = $1', [id]);
        res.json({ message: 'Reporte eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar reporte:', error);
        res.status(500).json({ error: 'Error al eliminar el reporte de mantenimiento' });
    }
};
