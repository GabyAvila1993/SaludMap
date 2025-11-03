import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = ({ establecimientoId, place }) => {
  // Usar la misma lógica de detección que en Map.jsx
  const getTypeFromPlace = (place) => {
    const tags = place.tags ?? place.properties ?? {};
    const amenity = (tags.amenity || tags.healthcare || '').toString().toLowerCase();
    const name = (tags.name || '').toString().toLowerCase();

    if (amenity.includes('hospital') || name.includes('hospital')) return 'hospital';
    if (amenity.includes('clinic') || name.includes('clínica') || name.includes('clinic')) return 'clinic';
    if (amenity.includes('veterinary') || name.includes('veterin')) return 'veterinary';
    if (amenity.includes('doctor') || name.includes('doctor') || name.includes('médic')) return 'doctors';

    return 'default';
  };

  const type = getTypeFromPlace(place);

  const getDataByType = () => {
    switch(type) {
      case 'hospital':
        return {
          labels: ['Emergencias', 'Pediatría', 'Traumatología', 'Cardiología', 'Cirugía'],
          title: 'Estadísticas del Hospital',
          datasets: [{
            label: 'Consultas por especialidad',
            data: Array.from({length: 5}, () => Math.floor(Math.random() * 100)),
            backgroundColor: ['#FF6B6B', '#FFD700', '#4ECDC4', '#45B7D1', '#FFA500'],
          }]
        };

      case 'clinic':
        return {
          labels: ['Medicina General', 'Pediatría', 'Ginecología', 'Traumatología', 'Oftalmología'],
          title: 'Estadísticas de la Clínica',
          datasets: [{
            label: 'Consultas por especialidad',
            data: Array.from({length: 5}, () => Math.floor(Math.random() * 100)),
            backgroundColor: ['#FFD700', '#4ECDC4', '#FF6B6B', '#45B7D1', '#FFA500'],
          }]
        };

      case 'veterinary':
        return {
          labels: ['Vacunación', 'Control General', 'Cirugías', 'Urgencias', 'Peluquería'],
          title: 'Estadísticas de la Veterinaria',
          datasets: [{
            label: 'Servicios veterinarios',
            data: Array.from({length: 5}, () => Math.floor(Math.random() * 100)),
            backgroundColor: ['#4ECDC4', '#FFD700', '#FF6B6B', '#FFA500', '#45B7D1'],
          }]
        };

      case 'doctors':
        return {
          labels: ['Consultas Generales', 'Controles', 'Estudios', 'Urgencias'],
          title: 'Estadísticas del Consultorio',
          datasets: [{
            label: 'Tipos de atención',
            data: Array.from({length: 4}, () => Math.floor(Math.random() * 100)),
            backgroundColor: ['#FFD700', '#4ECDC4', '#FF6B6B', '#45B7D1'],
          }]
        };

      default:
        return {
          labels: ['Consultas', 'Urgencias', 'Controles'],
          title: 'Estadísticas del Establecimiento',
          datasets: [{
            label: 'Tipos de atención',
            data: Array.from({length: 3}, () => Math.floor(Math.random() * 100)),
            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4'],
          }]
        };
    }
  };

  const data = getDataByType();
  const hourlyData = {
    labels: ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    datasets: [{
      label: 'Pacientes por horario',
      data: Array.from({length: 6}, () => Math.floor(Math.random() * 50)),
      borderColor: '#47472e',
      backgroundColor: '#ffe0a6',
      tension: 0.3,
      fill: true
    }]
  };

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SaludMap';
      workbook.created = new Date();

      // Hoja de Servicios
      const wsServicios = workbook.addWorksheet('Servicios');
      
      // Configurar columnas
      wsServicios.columns = [
        { header: 'Servicio', key: 'servicio', width: 20 },
        { header: 'Cantidad', key: 'cantidad', width: 15 },
        { header: 'Porcentaje', key: 'porcentaje', width: 15 }
      ];

      // Estilizar encabezados
      wsServicios.getRow(1).font = { bold: true, color: { argb: '47472E' } };
      wsServicios.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0A6' }
      };

      // Añadir datos
      const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
      data.labels.forEach((label, index) => {
        const cantidad = data.datasets[0].data[index];
        wsServicios.addRow({
          servicio: label,
          cantidad: cantidad,
          porcentaje: `${((cantidad/total) * 100).toFixed(1)}%`
        });

        // Estilizar celdas de datos
        const row = wsServicios.lastRow;
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Hoja de Horarios
      const wsHorarios = workbook.addWorksheet('Horarios');
      wsHorarios.columns = [
        { header: 'Horario', key: 'horario', width: 15 },
        { header: 'Pacientes', key: 'pacientes', width: 15 },
        { header: 'Ocupación', key: 'ocupacion', width: 15 }
      ];

      // Estilizar encabezados
      wsHorarios.getRow(1).font = { bold: true, color: { argb: '47472E' } };
      wsHorarios.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0A6' }
      };

      // Añadir datos de horarios
      const maxPacientes = 50;
      hourlyData.labels.forEach((label, index) => {
        const pacientes = hourlyData.datasets[0].data[index];
        wsHorarios.addRow({
          horario: label,
          pacientes: pacientes,
          ocupacion: `${((pacientes/maxPacientes) * 100).toFixed(1)}%`
        });

        // Estilizar celdas de datos
        const row = wsHorarios.lastRow;
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Añadir resumen
      const wsSummary = workbook.addWorksheet('Resumen');
      wsSummary.addRow([`Estadísticas de ${place.tags?.name || 'Establecimiento'}`]);
      wsSummary.addRow([`Generado el: ${new Date().toLocaleString()}`]);
      wsSummary.addRow(['']);
      wsSummary.addRow(['Total de servicios:', total]);
      wsSummary.addRow(['Servicio más solicitado:', data.labels[0]]);
      wsSummary.addRow(['Hora más concurrida:', hourlyData.labels[0]]);

      // Estilizar resumen
      wsSummary.getRow(1).font = { bold: true, size: 14 };
      wsSummary.getColumn(1).width = 25;
      wsSummary.getColumn(2).width = 20;

      // Generar y descargar
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Estadisticas_${place.tags?.name || 'Establecimiento'}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
      saveAs(new Blob([buffer]), fileName);

    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Hubo un error al exportar el archivo. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>{data.title}</h2>
        <button 
          onClick={exportToExcel}
          className="export-button"
          type="button"
        >
          📊 Exportar a Excel
        </button>
      </div>
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Servicios más solicitados</h3>
          <Bar data={data} />
        </div>
        <div className="chart-container">
          <h3>Horarios más concurridos</h3>
          <Line data={hourlyData} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;