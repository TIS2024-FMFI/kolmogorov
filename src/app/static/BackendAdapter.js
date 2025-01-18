import Statement from './Statement.js';

export class BackendAdapter {
    constructor(baseURL) {
        this.baseURL = baseURL || "http://127.0.0.1:5000";
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
        const url = `${this.baseURL}/statement/${id}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error fetching statement: ${response.statusText}`);
            }
            const data = await response.json();
            return new Statement(data);
        } catch (error) {
            console.error("Error:", error);
            throw error;
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
