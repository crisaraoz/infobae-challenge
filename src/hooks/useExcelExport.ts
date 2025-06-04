'use client';

import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { CategorizedResult } from '@/types';

interface ExportData {
  expandWorthy: CategorizedResult[];
  notExpandWorthy: CategorizedResult[];
  topic: string;
}

export function useExcelExport() {
  const exportToExcel = useCallback((data: ExportData) => {
    const { expandWorthy, notExpandWorthy, topic } = data;
    
    // Crear workbook
    const workbook = XLSX.utils.book_new();
    
    // Función para formatear datos
    const formatResults = (results: CategorizedResult[], category: string) => {
      return results.map((result, index) => ({
        '#': index + 1,
        'Categoría': category,
        'Título': result.title,
        'URL': result.url,
        'Puntuación': result.score ? `${Math.round(result.score * 100)}%` : 'N/A',
        'Autor': result.author || 'N/A',
        'Fecha de Publicación': result.publishedDate ? 
          new Date(result.publishedDate).toLocaleDateString('es-ES') : 'N/A',
        'Razonamiento': result.reasoning || 'N/A',
        'Prioridad': result.priority || 0
      }));
    };

    // Formatear datos de ambas categorías
    const expandWorthyData = formatResults(expandWorthy, 'Vale la pena expandir');
    const notExpandWorthyData = formatResults(notExpandWorthy, 'No vale la pena expandir');
    
    // Combinar todos los datos
    const allData = [...expandWorthyData, ...notExpandWorthyData];
    
    // Crear hoja con todos los resultados
    const worksheet = XLSX.utils.json_to_sheet(allData);
    
    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 5 },   // #
      { wch: 20 },  // Categoría
      { wch: 50 },  // Título
      { wch: 60 },  // URL
      { wch: 12 },  // Puntuación
      { wch: 20 },  // Autor
      { wch: 15 },  // Fecha
      { wch: 40 },  // Razonamiento
      { wch: 10 }   // Prioridad
    ];
    
    worksheet['!cols'] = columnWidths;
    
    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados de Investigación');
    
    // Crear hoja de resumen
    const summaryData = [
      { 'Métrica': 'Tema de Investigación', 'Valor': topic },
      { 'Métrica': 'Fecha de Exportación', 'Valor': new Date().toLocaleDateString('es-ES') },
      { 'Métrica': 'Hora de Exportación', 'Valor': new Date().toLocaleTimeString('es-ES') },
      { 'Métrica': 'Total de Resultados', 'Valor': allData.length },
      { 'Métrica': 'Vale la pena expandir', 'Valor': expandWorthy.length },
      { 'Métrica': 'No vale la pena expandir', 'Valor': notExpandWorthy.length },
      { 'Métrica': 'Porcentaje de Expansión', 'Valor': `${Math.round((expandWorthy.length / allData.length) * 100)}%` }
    ];
    
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
    
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen');
    
    // Crear hoja solo con resultados que valen la pena expandir
    if (expandWorthy.length > 0) {
      const expandWorthyWorksheet = XLSX.utils.json_to_sheet(expandWorthyData);
      expandWorthyWorksheet['!cols'] = columnWidths;
      XLSX.utils.book_append_sheet(workbook, expandWorthyWorksheet, 'Vale la Pena Expandir');
    }
    
    // Crear hoja solo con resultados que no valen la pena expandir
    if (notExpandWorthy.length > 0) {
      const notExpandWorthyWorksheet = XLSX.utils.json_to_sheet(notExpandWorthyData);
      notExpandWorthyWorksheet['!cols'] = columnWidths;
      XLSX.utils.book_append_sheet(workbook, notExpandWorthyWorksheet, 'No Vale la Pena Expandir');
    }
    
    // Generar archivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `investigacion-${topic.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.xlsx`;
    
    // Descargar archivo
    saveAs(blob, fileName);
  }, []);

  const exportSimpleList = useCallback((data: ExportData) => {
    const { expandWorthy, notExpandWorthy, topic } = data;
    
    // Crear workbook
    const workbook = XLSX.utils.book_new();
    
    // Función para crear datos simples (solo título y URL)
    const createSimpleData = (results: CategorizedResult[], category: string) => {
      return results.map((result, index) => ({
        '#': index + 1,
        'Categoría': category,
        'Título': result.title,
        'URL': result.url,
        'Puntuación': result.score ? `${Math.round(result.score * 100)}%` : 'N/A'
      }));
    };

    // Formatear datos
    const expandWorthyData = createSimpleData(expandWorthy, 'Vale la pena expandir');
    const notExpandWorthyData = createSimpleData(notExpandWorthy, 'No vale la pena expandir');
    const allData = [...expandWorthyData, ...notExpandWorthyData];
    
    // Crear hoja principal
    const worksheet = XLSX.utils.json_to_sheet(allData);
    worksheet['!cols'] = [
      { wch: 5 },   // #
      { wch: 20 },  // Categoría
      { wch: 50 },  // Título
      { wch: 60 },  // URL
      { wch: 12 }   // Puntuación
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista Simple');
    
    // Generar archivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `lista-simple-${topic.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.xlsx`;
    
    saveAs(blob, fileName);
  }, []);

  const exportAsCSV = useCallback((data: ExportData) => {
    const { expandWorthy, notExpandWorthy, topic } = data;
    
    // Crear datos CSV
    const csvData = [];
    csvData.push(['#', 'Categoría', 'Título', 'URL', 'Puntuación', 'Autor', 'Fecha', 'Razonamiento']);
    
    expandWorthy.forEach((result, index) => {
      csvData.push([
        index + 1,
        'Vale la pena expandir',
        result.title,
        result.url,
        result.score ? `${Math.round(result.score * 100)}%` : 'N/A',
        result.author || 'N/A',
        result.publishedDate ? new Date(result.publishedDate).toLocaleDateString('es-ES') : 'N/A',
        result.reasoning || 'N/A'
      ]);
    });
    
    notExpandWorthy.forEach((result, index) => {
      csvData.push([
        expandWorthy.length + index + 1,
        'No vale la pena expandir',
        result.title,
        result.url,
        result.score ? `${Math.round(result.score * 100)}%` : 'N/A',
        result.author || 'N/A',
        result.publishedDate ? new Date(result.publishedDate).toLocaleDateString('es-ES') : 'N/A',
        result.reasoning || 'N/A'
      ]);
    });
    
    // Convertir a CSV
    const csvContent = csvData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    // Agregar BOM para UTF-8
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `investigacion-${topic.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.csv`;
    
    saveAs(blob, fileName);
  }, []);

  return {
    exportToExcel,
    exportSimpleList,
    exportAsCSV
  };
} 