module.exports = {
    PORT: process.env.PORT || 3001,
    DB_FILE: process.env.DB_FILE || 'data/family.db',
    OLLAMA_API_URL: process.env.OLLAMA_API_URL || 'http://localhost:11434/api',
    MODEL_NAME: process.env.MODEL_NAME || 'llama3.2:1b-instruct-fp16'
};
