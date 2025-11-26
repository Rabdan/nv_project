const fs = require('fs');
const path = require('path');
const axios = require('axios');

const WORKFLOWS_DIR = path.join(__dirname, '../n8n-data/workflows');
const N8N_API_URL = (process.env.N8N_BASE_URL || 'http://n8n:5678') + '/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY; // Needs to be set in env

const CREDENTIALS_DIR = path.join(__dirname, '../n8n-data/credentials');

const syncCredentials = async () => {
    console.log('Starting n8n credential sync...');
    if (!fs.existsSync(CREDENTIALS_DIR)) {
        console.log('No credentials directory found, skipping sync.');
        return;
    }

    const files = fs.readdirSync(CREDENTIALS_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(CREDENTIALS_DIR, file);
        try {
            let content = fs.readFileSync(filePath, 'utf8');

            // Replace placeholders with env vars
            content = content.replace('OPENAI_API_KEY_PLACEHOLDER', process.env.OPENAI_API_KEY);
            content = content.replace('NV_API_KEY_PLACEHOLDER', process.env.API_KEY);

            const credentialData = JSON.parse(content);
            console.log(`Syncing credential: ${credentialData.name}`);

            if (N8N_API_KEY) {
                try {
                    // Get existing credentials to check if this one exists
                    const existingCreds = await axios.get(`${N8N_API_URL}/credentials`, {
                        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
                    });

                    // Find credential by name
                    const existing = existingCreds.data.data?.find(c => c.name === credentialData.name);

                    if (existing) {
                        // Update existing credential
                        await axios.patch(`${N8N_API_URL}/credentials/${existing.id}`, credentialData, {
                            headers: { 'X-N8N-API-KEY': N8N_API_KEY }
                        });
                        console.log(`Credential ${credentialData.name} updated (ID: ${existing.id}).`);
                    } else {
                        // Create new credential
                        await axios.post(`${N8N_API_URL}/credentials`, credentialData, {
                            headers: { 'X-N8N-API-KEY': N8N_API_KEY }
                        });
                        console.log(`Credential ${credentialData.name} created.`);
                    }
                } catch (apiError) {
                    console.error(`API error for ${credentialData.name}:`, apiError.response?.status);
                    if (apiError.response?.data) {
                        console.error('Details:', JSON.stringify(apiError.response.data, null, 2));
                    }
                }
            } else {
                console.warn('Skipping n8n upload: N8N_API_KEY not set.');
            }

        } catch (error) {
            console.error(`Error syncing credential ${file}:`, error.message);
        }
    }
    console.log('n8n credential sync completed.');
};

const syncWorkflows = async () => {
    console.log('Starting n8n workflow sync...');

    if (!fs.existsSync(WORKFLOWS_DIR)) {
        console.log('No workflows directory found, skipping sync.');
        return;
    }

    const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(WORKFLOWS_DIR, file);
        try {
            let content = fs.readFileSync(filePath, 'utf8');

            // Replace backend URL placeholder
            content = content.replace(/{BACKEND_URL}/g, process.env.BACKEND_URL || 'http://nv-api:4000');
            // Replace API Key placeholder
            content = content.replace(/{X-API-KEY}/g, process.env.API_KEY || 'neurovision_secret_key');

            const workflowData = JSON.parse(content);
            console.log(`Syncing workflow: ${workflowData.name}`);

            if (N8N_API_KEY) {
                // Filter to only include fields that n8n API accepts
                const filteredWorkflow = {
                    name: workflowData.name,
                    nodes: workflowData.nodes,
                    connections: workflowData.connections,
                    settings: workflowData.settings || {},
                    staticData: workflowData.staticData || null
                };

                try {
                    // Get existing workflows to check if this one exists
                    const existingWorkflows = await axios.get(`${N8N_API_URL}/workflows`, {
                        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
                    });

                    // Find workflow by name
                    const existing = existingWorkflows.data.data?.find(w => w.name === workflowData.name);

                    if (existing) {
                        // Update existing workflow
                        await axios.put(`${N8N_API_URL}/workflows/${existing.id}`, filteredWorkflow, {
                            headers: { 'X-N8N-API-KEY': N8N_API_KEY }
                        });
                        console.log(`Workflow ${workflowData.name} updated (ID: ${existing.id}).`);
                    } else {
                        // Create new workflow
                        await axios.post(`${N8N_API_URL}/workflows`, filteredWorkflow, {
                            headers: { 'X-N8N-API-KEY': N8N_API_KEY }
                        });
                        console.log(`Workflow ${workflowData.name} created.`);
                    }
                } catch (apiError) {
                    console.error(`API error for ${workflowData.name}:`, apiError.response?.status, apiError.response?.statusText);
                    if (apiError.response?.data) {
                        console.error('Details:', JSON.stringify(apiError.response.data, null, 2));
                    }
                }
            } else {
                console.warn('Skipping n8n upload: N8N_API_KEY not set.');
            }

        } catch (error) {
            console.error(`Error syncing workflow ${file}:`, error.message);
        }
    }
    console.log('n8n workflow sync completed.');
};

const exportN8nData = async () => {
    const archiver = require('archiver');
    const uploadsDir = path.join(__dirname, '../uploads');

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const outputPath = path.join(uploadsDir, 'n8n-data.zip');
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
        output.on('close', () => {
            console.log(`n8n-data.zip created: ${archive.pointer()} bytes`);
            resolve(outputPath);
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        // Process and add credentials
        if (fs.existsSync(CREDENTIALS_DIR)) {
            const credFiles = fs.readdirSync(CREDENTIALS_DIR).filter(f => f.endsWith('.json'));
            credFiles.forEach(file => {
                let content = fs.readFileSync(path.join(CREDENTIALS_DIR, file), 'utf8');
                // Replace placeholders
                content = content.replace('OPENAI_API_KEY_PLACEHOLDER', process.env.OPENAI_API_KEY || 'YOUR_OPENAI_KEY');
                content = content.replace('NV_API_KEY_PLACEHOLDER', process.env.API_KEY || 'YOUR_API_KEY');
                archive.append(content, { name: `credentials/${file}` });
            });
        }

        // Process and add workflows
        if (fs.existsSync(WORKFLOWS_DIR)) {
            const workflowFiles = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));
            workflowFiles.forEach(file => {
                let content = fs.readFileSync(path.join(WORKFLOWS_DIR, file), 'utf8');
                // Replace backend URL
                content = content.replace(/{BACKEND_URL}/g, process.env.BACKEND_URL || 'http://nv-api:4000');
                // Replace API Key placeholder
                content = content.replace(/{X-API-KEY}/g, process.env.API_KEY || 'neurovision_secret_key');
                archive.append(content, { name: `workflows/${file}` });
            });
        }

        archive.finalize();
    });
};

module.exports = {
    syncWorkflows,
    syncCredentials,
    exportN8nData
};
