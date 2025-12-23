const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));

const mimeTypes = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpg',
    '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    console.log(`[${req.method}] ${pathname}`);

    // Route: API Submit
    if (req.method === 'POST' && pathname === '/api/submit') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { name, phone, message } = JSON.parse(body || '{}');
                if (!name || !phone || !message) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: '信息不完整' }));
                }
                const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
                data.push({ name, phone, message, timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) });
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: '服务器错误' }));
            }
        });
    } 
    // Route: Admin Export
    else if (req.method === 'GET' && pathname === '/admin/export') {
        try {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            const headers = ['姓名', '电话', '寄语', '提交时间'];
            const BOM = '\uFEFF';
            let csvContent = BOM + headers.join(',') + '\r\n';
            data.forEach(item => {
                csvContent += `${item.name},${item.phone},"${item.message.replace(/"/g, '""')}",${item.timestamp}\r\n`;
            });
            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename=BeOne_Wishes_${Date.now()}.csv`
            });
            res.end(csvContent);
        } catch (e) {
            res.writeHead(500);
            res.end('导出失败');
        }
    } 
    // Route: Static Files
    else {
        let filePath = '.' + pathname;
        if (filePath === './') filePath = './index.html';

        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('404 Not Found');
                } else {
                    res.writeHead(500);
                    res.end('Error: ' + error.code);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`Zero-dependency server running at http://localhost:${PORT}`);
});
