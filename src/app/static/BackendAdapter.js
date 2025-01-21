import Statement from './Statement.js';

export class BackendAdapter {
    constructor(baseURL) {
        this.baseURL = baseURL || "http://127.0.0.1:5000";
        this.requestQueue = [];
        this.processingQueue = false;
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
            this.requestQueue.push({ id, resolve, reject });
            if (!this.processingQueue) {
                this.processQueue();
            }
        });
    }

    async processQueue() {
        if (this.requestQueue.length === 0) {
            this.processingQueue = false;
            return;
        }
    
        this.processingQueue = true;
        const { id, resolve, reject } = this.requestQueue.shift();
    
        try {
            const response = await fetch(`${this.baseURL}/statement/${id}`);
            if (!response.ok) {
                throw new Error(`Error fetching statement: ${response.statusText}`);
            }
            const data = await response.json();
            resolve(new Statement(data));
        } catch (error) {
            reject(error);
        }
    
        this.processQueue(); // Recursive call without delay
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