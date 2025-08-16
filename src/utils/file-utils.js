/**
 * File System Utilities
 * Handles file operations, CSV management, and data persistence
 */

const fs = require('fs');
const path = require('path');
const Logger = require('./logger');

class FileSystemUtils {
    constructor() {
        this.logger = new Logger('FILE');
    }

    /**
     * Check if file exists
     */
    exists(filePath) {
        try {
            return fs.existsSync(filePath);
        } catch (error) {
            this.logger.error(`Error checking file existence: ${filePath}`, error);
            return false;
        }
    }

    /**
     * Create directory if it doesn't exist
     */
    ensureDirectory(dirPath) {
        try {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                this.logger.debug(`Created directory: ${dirPath}`);
            }
            return true;
        } catch (error) {
            this.logger.error(`Error creating directory: ${dirPath}`, error);
            return false;
        }
    }

    /**
     * Read file content
     */
    readFile(filePath, encoding = 'utf8') {
        try {
            if (!this.exists(filePath)) {
                this.logger.warn(`File not found: ${filePath}`);
                return null;
            }
            return fs.readFileSync(filePath, encoding);
        } catch (error) {
            this.logger.error(`Error reading file: ${filePath}`, error);
            return null;
        }
    }

    /**
     * Write file content
     */
    writeFile(filePath, content, encoding = 'utf8') {
        try {
            // Ensure directory exists
            const dir = path.dirname(filePath);
            this.ensureDirectory(dir);
            
            fs.writeFileSync(filePath, content, encoding);
            return true;
        } catch (error) {
            this.logger.error(`Error writing file: ${filePath}`, error);
            return false;
        }
    }

    /**
     * Append content to file
     */
    appendFile(filePath, content, encoding = 'utf8') {
        try {
            // Ensure directory exists
            const dir = path.dirname(filePath);
            this.ensureDirectory(dir);
            
            fs.appendFileSync(filePath, content, encoding);
            return true;
        } catch (error) {
            this.logger.error(`Error appending to file: ${filePath}`, error);
            return false;
        }
    }

    /**
     * Initialize CSV file with headers
     */
    initializeCsvFile(filePath, headers) {
        try {
            if (!this.exists(filePath)) {
                const headerLine = Array.isArray(headers) ? headers.join(',') + '\n' : headers;
                this.writeFile(filePath, headerLine);
                this.logger.success(`CSV file initialized: ${filePath}`);
                return true;
            }
            this.logger.debug(`CSV file already exists: ${filePath}`);
            return true;
        } catch (error) {
            this.logger.error(`Error initializing CSV file: ${filePath}`, error);
            return false;
        }
    }

    /**
     * Append CSV row
     */
    appendCsvRow(filePath, rowData) {
        try {
            const csvRow = Array.isArray(rowData) ? rowData.join(',') + '\n' : rowData + '\n';
            return this.appendFile(filePath, csvRow);
        } catch (error) {
            this.logger.error(`Error appending CSV row to: ${filePath}`, error);
            return false;
        }
    }

    /**
     * Read and parse CSV file
     */
    readCsvFile(filePath, hasHeaders = true) {
        try {
            const content = this.readFile(filePath);
            if (!content) {
                return { headers: [], rows: [] };
            }

            const lines = content.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) {
                return { headers: [], rows: [] };
            }

            const headers = hasHeaders ? lines[0].split(',') : [];
            const dataLines = hasHeaders ? lines.slice(1) : lines;
            
            const rows = dataLines.map(line => {
                const values = line.split(',');
                if (hasHeaders && headers.length > 0) {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header.trim()] = values[index]?.trim() || '';
                    });
                    return obj;
                }
                return values.map(val => val.trim());
            });

            return { headers, rows };
        } catch (error) {
            this.logger.error(`Error reading CSV file: ${filePath}`, error);
            return { headers: [], rows: [] };
        }
    }

    /**
     * Get file stats
     */
    getFileStats(filePath) {
        try {
            if (!this.exists(filePath)) {
                return null;
            }
            return fs.statSync(filePath);
        } catch (error) {
            this.logger.error(`Error getting file stats: ${filePath}`, error);
            return null;
        }
    }

    /**
     * Get file size in bytes
     */
    getFileSize(filePath) {
        const stats = this.getFileStats(filePath);
        return stats ? stats.size : 0;
    }

    /**
     * Get file modification time
     */
    getModificationTime(filePath) {
        const stats = this.getFileStats(filePath);
        return stats ? stats.mtime : null;
    }

    /**
     * Create backup of a file
     */
    createBackup(filePath, backupSuffix = '.backup') {
        try {
            if (!this.exists(filePath)) {
                this.logger.warn(`Cannot backup non-existent file: ${filePath}`);
                return false;
            }

            const backupPath = filePath + backupSuffix;
            const content = this.readFile(filePath);
            
            if (content !== null) {
                this.writeFile(backupPath, content);
                this.logger.debug(`Backup created: ${backupPath}`);
                return true;
            }
            return false;
        } catch (error) {
            this.logger.error(`Error creating backup for: ${filePath}`, error);
            return false;
        }
    }

    /**
     * Clean old files based on age
     */
    cleanOldFiles(directory, maxAgeInDays, pattern = '*') {
        try {
            if (!this.exists(directory)) {
                this.logger.warn(`Directory not found: ${directory}`);
                return 0;
            }

            const files = fs.readdirSync(directory);
            const cutoffTime = Date.now() - (maxAgeInDays * 24 * 60 * 60 * 1000);
            let deletedCount = 0;

            files.forEach(file => {
                const filePath = path.join(directory, file);
                const stats = this.getFileStats(filePath);
                
                if (stats && stats.mtime.getTime() < cutoffTime) {
                    try {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                        this.logger.debug(`Deleted old file: ${filePath}`);
                    } catch (deleteError) {
                        this.logger.error(`Error deleting file: ${filePath}`, deleteError);
                    }
                }
            });

            if (deletedCount > 0) {
                this.logger.info(`Cleaned ${deletedCount} old files from ${directory}`);
            }

            return deletedCount;
        } catch (error) {
            this.logger.error(`Error cleaning old files in: ${directory}`, error);
            return 0;
        }
    }

    /**
     * Format candle data for CSV
     */
    formatCandleForCsv(candle) {
        return [
            candle.endTime || candle.timestamp,
            candle.open?.toFixed(2) || '0.00',
            candle.high?.toFixed(2) || '0.00',
            candle.low?.toFixed(2) || '0.00',
            candle.close?.toFixed(2) || '0.00',
            candle.tickCount || 0
        ];
    }

    /**
     * Parse candle data from CSV row
     */
    parseCandleFromCsv(csvRow) {
        try {
            const values = Array.isArray(csvRow) ? csvRow : csvRow.split(',');
            
            return {
                timestamp: values[0]?.trim(),
                endTime: values[0]?.trim(),
                open: parseFloat(values[1]) || 0,
                high: parseFloat(values[2]) || 0,
                low: parseFloat(values[3]) || 0,
                close: parseFloat(values[4]) || 0,
                tickCount: parseInt(values[5]) || 0
            };
        } catch (error) {
            this.logger.error('Error parsing candle from CSV row', error);
            return null;
        }
    }
}

// Export singleton instance
const fileUtils = new FileSystemUtils();
module.exports = fileUtils;
