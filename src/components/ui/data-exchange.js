import React, { useState, useRef } from 'react';
import { Upload, Download, FileJson, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToJSON, exportToCSV, importFromJSON, importFromCSV } from '../../utils/dataExchange';

export function DataExchange() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = async (format) => {
    setExporting(true);
    setMessage(null);
    
    try {
      let result;
      if (format === 'json') {
        result = await exportToJSON();
      } else {
        result = await exportToCSV();
      }
      
      setMessage({
        type: 'success',
        text: `Exported ${result.count} resources successfully`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Export failed: ${error.message}`
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    setMessage(null);
    
    try {
      let result;
      if (file.name.endsWith('.json')) {
        result = await importFromJSON(file);
      } else if (file.name.endsWith('.csv')) {
        result = await importFromCSV(file);
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.');
      }
      
      if (result.imported.resources !== undefined) {
        setMessage({
          type: 'success',
          text: `Imported ${result.imported.resources} resources and ${result.imported.accounts || 0} accounts`
        });
      } else {
        setMessage({
          type: 'success',
          text: `Imported ${result.imported} resources`
        });
      }
      
      // Reset file input
      event.target.value = '';
      
      // Refresh page after successful import
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Import failed: ${error.message}`
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Import/Export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Section */}
        <div>
          <h3 className="text-sm font-medium mb-2">Export Data</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => handleExport('json')}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              <FileJson className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
            <Button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
          </div>
        </div>

        {/* Import Section */}
        <div>
          <h3 className="text-sm font-medium mb-2">Import Data</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            variant="outline"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? 'Importing...' : 'Import from File'}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Supports JSON and CSV formats
          </p>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 p-3 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}