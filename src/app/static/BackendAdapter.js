import Statement from './Statement.js';

export class BackendAdapter {
    constructor(baseURL) {
        this.baseURL = baseURL || "http://127.0.0.1:5000";
        this.requestQueue = [];
        this.processingQueue = false;
        this.batchSize = 50; // Maximum number of statements to fetch in one request
        this.batchTimeout = 50; // ms to wait before processing batch
        this.currentBatch = new Map(); // Map of pending batch requests
        this.batchTimeoutId = null;
    }

    async parseFile(formData) {
        try {
            const response = await fetch(`${this.baseURL}/parse_database`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: data.message === 'Database parsed successfully.',
                message: data.message
            };
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    async getStatement(id) {
        return new Promise((resolve, reject) => {
            this.currentBatch.set(id, { resolve, reject });
            
            // Clear existing timeout
            if (this.batchTimeoutId) {
                clearTimeout(this.batchTimeoutId);
            }
            
            // If batch is full, process immediately
            if (this.currentBatch.size >= this.batchSize) {
                this.processBatch();
            } else {
                // Otherwise wait a short time for more requests
                this.batchTimeoutId = setTimeout(() => this.processBatch(), this.batchTimeout);
            }
        });
    }

    async processBatch() {
        if (this.currentBatch.size === 0) return;

        const batchIds = Array.from(this.currentBatch.keys());
        const currentBatchCopy = new Map(this.currentBatch);
        this.currentBatch = new Map(); // Clear current batch
        
        try {
            const response = await fetch(`${this.baseURL}/statements/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ labels: batchIds })
            });

            if (!response.ok) {
                throw new Error(`Error fetching statements: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Resolve/reject all promises in the batch
            for (const [id, { resolve, reject }] of currentBatchCopy) {
                if (data[id]) {
                    resolve(new Statement(data[id]));
                } else {
                    reject(new Error(`Statement ${id} not found`));
                }
            }
        } catch (error) {
            // If batch request fails, reject all promises
            for (const { reject } of currentBatchCopy.values()) {
                reject(error);
            }
        }
    }

    async parseSetMm() {
        try {
            const response = await fetch(`${this.baseURL}/parse_set_mm`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                message: data.message
            };
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }
}

export default BackendAdapter