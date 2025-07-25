// mdtopreso.js - A simple markdown to presentation converter
// Written by: @rsnake

(async () => {
// Dynamically inject sql.js and papaparse scripts
function injectScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

await injectScript('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js');
await injectScript('https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js');

// Dynamically inject Plotly.js if needed
async function injectPlotly() {
    if (!window.Plotly) {
        await injectScript('https://cdn.plot.ly/plotly-2.26.0.min.js');
    }
}

// Dynamically inject js-yaml if needed
async function injectJsYaml() {
    if (!window.jsyaml) {
        await injectScript('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js');
    }
}

// --- Begin mdtopreso-helper.js code (integrated) ---
// Utility to fetch a file (CSV or JSON) via XMLHttpRequest
async function fetchAndParseFile(url, type = null, jsonPath = '$') {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = async function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        let result;
                        let fileType = type;
                        if (!fileType) {
                            if (url.endsWith('.csv')) fileType = 'csv';
                            else if (url.endsWith('.json') || url.endsWith('.json5')) fileType = 'json';
                        }
                        if (fileType === 'csv') {
                            result = parseCsvToTable(xhr.responseText);
                        } else if (fileType === 'json') {
                            result = await parseJsonToTable(xhr.responseText, jsonPath);
                        } else {
                            throw new Error('Unknown file type');
                        }
                        resolve(result);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error(`Failed to load file: ${xhr.statusText}`));
                }
            }
        };
        xhr.onerror = function() {
            reject(new Error('Network error while loading file'));
        };
        xhr.send();
    });
}

function parseCsvToTable(csvString) {
    if (!csvString.endsWith('\n')) csvString += '\n';
    const parsed = window.Papa.parse(csvString, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
        newline: ''
    });
    const columns = (parsed.meta.fields || []).map(f => ({ name: f, type: 'auto' }));
    // Filter out rows that are completely empty
    const data = parsed.data.filter(row => Object.values(row).some(v => v !== null && v !== undefined && v !== ''));
    console.log('Parsed CSV data:', data);
    return { columns, data };
}

async function parseJsonToTable(jsonString, jsonPath = '$') {
    const data = window.json5 ? window.json5.parse(jsonString) : JSON.parse(jsonString);
    let result = data;
    if (window.jsonpath && jsonPath && jsonPath !== '$') {
        result = window.jsonpath.query(data, jsonPath);
    }
    if (!Array.isArray(result)) {
        throw new Error('Resulting data is not an array');
    }
    const columns = Array.from(new Set(result.flatMap(row => Object.keys(row)))).map(c => ({ name: c, type: 'auto' }));
    return { columns, data: result };
}

function renderTable({ columns, data }) {
    if (!columns.length) return '<div>No data</div>';
    let html = '<table class="markdown-table"><thead><tr>';
    html += columns.map(col => `<th>${escapeHtml(col.name)}</th>`).join('');
    html += '</tr></thead><tbody>';
    for (const row of data) {
        html += '<tr>' + columns.map(col => `<td>${escapeHtml(row[col.name] !== undefined ? row[col.name] : '')}</td>`).join('') + '</tr>';
    }
    html += '</tbody></table>';
    return html;
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function processSqlBlock(sqlBlock) {
    const tableDefRegex = /^TABLE\s+(\w+)\s*=\s*file\(['"]([^'"\)]+)['"]\)/gim;
    let match;
    const tables = [];
    let sql = sqlBlock;
    while ((match = tableDefRegex.exec(sqlBlock)) !== null) {
        tables.push({ alias: match[1], file: match[2] });
        sql = sql.replace(match[0], '');
    }
    sql = sql.trim();
    if (!sql.toLowerCase().startsWith('select')) {
        const selectIdx = sql.toLowerCase().indexOf('select');
        if (selectIdx >= 0) sql = sql.slice(selectIdx);
    }
    if (!window.initSqlJs) throw new Error('sql.js not loaded');
    const SQL = await window.initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });
    const db = new SQL.Database();
    for (const t of tables) {
        let ext = t.file.split('.').pop().toLowerCase();
        let columns, data;
        if (ext === 'csv') {
            const parsed = parseCsvToTable(await fetchText(t.file));
            columns = parsed.columns;
            data = parsed.data;
        } else if (ext === 'json' || ext === 'json5') {
            const parsed = await parseJsonToTable(await fetchText(t.file));
            columns = parsed.columns;
            data = parsed.data;
        } else {
            throw new Error('Unsupported file type: ' + ext);
        }
        const colDefs = columns.map(c => `"${c.name}" TEXT`).join(', ');
        db.run(`CREATE TABLE "${t.alias}" (${colDefs});`);
        const stmt = db.prepare(`INSERT INTO "${t.alias}" VALUES (${columns.map(() => '?').join(',')})`);
        for (const row of data) {
            stmt.run(columns.map(c => row[c.name]));
        }
        stmt.free();
    }
    let result;
    try {
        result = db.exec(sql);
    } catch (e) {
        return `<div class="error">SQL Error: ${escapeHtml(e.message)}</div>`;
    }
    console.log('SQL result:', result);
    if (!result.length) {
        window._lastSqlResult = [];
        return '<div>No results</div>';
    }
    const columns = result[0].columns.map(name => ({ name, type: 'auto' }));
    const data = result[0].values.map(row => Object.fromEntries(row.map((v, i) => [columns[i].name, v])));
    window._lastSqlResult = data;
    return renderTable({ columns, data });
}

async function fetchText(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) resolve(xhr.responseText);
                else reject(new Error('Failed to fetch ' + url));
            }
        };
        xhr.onerror = () => reject(new Error('Network error fetching ' + url));
        xhr.send();
    });
}
// --- End mdtopreso-helper.js code (integrated) ---

class MarkdownPresentation {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.imageUrls = new Set();
        this.isNavMinimized = false;  // Add state tracking for nav
        this.highlighter = null;  // Add highlighter instance
        this.isPresenterMode = false;  // Add presenter mode state
        this.mermaidBlocks = []; // Add this line to store Mermaid blocks at class level
        this.init();
    }

    async init() {
        // Initialize Shiki
        try {
            const { codeToHtml } = await import('https://esm.sh/shiki@3.4.2');
            this.highlighter = {
                codeToHtml: (code, options) => codeToHtml(code, options)
            };
        } catch (error) {
            console.error('Failed to initialize Shiki:', error);
        }

        // Initialize Mermaid
        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.6.0/dist/mermaid.min.js';
                script.onload = () => {
                    mermaid.initialize({
                        startOnLoad: false,  // We'll handle initialization manually
                        theme: 'default',
                        securityLevel: 'loose'
                    });
                    resolve();
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        } catch (error) {
            console.error('Failed to initialize Mermaid:', error);
        }

        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const markdownFile = urlParams.get('page');
        const hash = window.location.hash.substring(1); // Remove the # symbol
        const slideNumber = parseInt(hash.replace('slide=', '')) - 1;

        if (markdownFile) {
            try {
                // Use XMLHttpRequest for local files
                const markdown = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    // Use just the filename without the full path
                    const filename = markdownFile.split('/').pop();
                    xhr.open('GET', filename, true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                console.log('Initial markdown content:', xhr.responseText);
                                resolve(xhr.responseText);
                            } else {
                                reject(new Error(`Failed to load markdown file: ${xhr.statusText}`));
                            }
                        }
                    };
                    xhr.onerror = function() {
                        reject(new Error('Network error while loading markdown file'));
                    };
                    xhr.send();
                });
                
                // Store the raw markdown content without parsing it as HTML
                this.rawMarkdown = markdown;
                document.body.innerHTML = ''; // Clear the body instead
            } catch (error) {
                console.error('Error loading markdown file:', error);
                document.body.innerHTML = `<div class="error">Error loading markdown file: ${error.message}</div>`;
                return;
            }
        }

        await this.parseMarkdown();
        this.prefetchImages();
        
        // Create initial bottom bar
        const bottomBar = document.createElement('div');
        bottomBar.className = 'bottom-bar';
        document.body.appendChild(bottomBar);
        
        this.setupEventListeners();
        
        // Check for slide number
        if (!isNaN(slideNumber) && slideNumber >= 0 && slideNumber < this.slides.length) {
            this.renderSlide(slideNumber);
            return;
        }
        
        this.renderSlide(0);
    }

    async parseMarkdown() {
        let content = this.rawMarkdown || document.body.innerHTML;

        // Handle Obsidian-style transclusions: ![[filename]] (non-recursive, one pass only)
        const transclusionRegex = /!\[\[([^\]]+)\]\]/g;
        let transclusionMatches = [];
        let transclusionMatch;
        // Collect all unique transclusion markers in the original content only
        let seenTransclusions = new Set();
        while ((transclusionMatch = transclusionRegex.exec(content)) !== null) {
            if (!seenTransclusions.has(transclusionMatch[0])) {
                transclusionMatches.push({
                    full: transclusionMatch[0],
                    filename: transclusionMatch[1]
                });
                seenTransclusions.add(transclusionMatch[0]);
            }
        }
        for (const t of transclusionMatches) {
            // Only fetch .md files, add .md if not present
            let fileToFetch = t.filename.endsWith('.md') ? t.filename : t.filename + '.md';
            try {
                const transcluded = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', fileToFetch, true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                resolve(xhr.responseText);
                            } else {
                                resolve(`[Could not load: ${fileToFetch}]`);
                            }
                        }
                    };
                    xhr.onerror = function() {
                        resolve(`[Could not load: ${fileToFetch}]`);
                    };
                    xhr.send();
                });
                // Replace all instances in the original content only (not recursively)
                content = content.split(t.full).join(transcluded);
            } catch (e) {
                content = content.split(t.full).join(`[Could not load: ${fileToFetch}]`);
            }
        }
        
        // Check for frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
        if (frontmatterMatch) {
            const frontmatterContent = frontmatterMatch[1];
            const frontmatterLines = frontmatterContent.split('\n');
            const frontmatter = {};
            
            for (const line of frontmatterLines) {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join(':').trim();
                    frontmatter[key.trim()] = value;
                }
            }
            
            // Process frontmatter settings
            if (frontmatter['frontmatter'] === 'True') {
                // Remove the frontmatter from content
                content = content.replace(/^---\n[\s\S]*?\n---\n/, '');
                
                // Apply frontmatter settings
                if (frontmatter['refresh']) {
                    const refreshSeconds = parseInt(frontmatter['refresh']);
                    if (!isNaN(refreshSeconds)) {
                        setInterval(() => {
                            window.location.reload();
                        }, refreshSeconds * 1000);
                    }
                }
                
                if (frontmatter['title']) {
                    document.title = frontmatter['title'];
                }
                
                if (frontmatter['author']) {
                    // Handle author name with quotes
                    const author = frontmatter['author'].replace(/^["']|["']$/g, '');
                    const metaAuthor = document.querySelector('meta[name="author"]');
                    if (metaAuthor) {
                        metaAuthor.content = author;
                    } else {
                        const meta = document.createElement('meta');
                        meta.name = 'author';
                        meta.content = author;
                        document.head.appendChild(meta);
                    }
                }
                
                if (frontmatter['bgcolor']) {
                    document.body.style.backgroundColor = frontmatter['bgcolor'];
                }
                
                // Add support for font color
                if (frontmatter['font-color']) {
                    const fontColor = frontmatter['font-color'].startsWith('#') ? 
                        frontmatter['font-color'] : 
                        `#${frontmatter['font-color']}`;
                    document.body.style.color = fontColor;
                }
                
                if (frontmatter['bgimage']) {
                    document.body.style.backgroundImage = `url('${frontmatter['bgimage']}')`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundPosition = 'center';
                    document.body.style.backgroundRepeat = 'no-repeat';
                    
                    // Add support for background opacity
                    if (frontmatter['bgopacity']) {
                        const opacity = parseFloat(frontmatter['bgopacity']) / 100;
                        if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
                            // Create a pseudo-element for the background with opacity
                            const style = document.createElement('style');
                            style.textContent = `
                                body::before {
                                    content: '';
                                    position: fixed;
                                    top: 0;
                                    left: 0;
                                    width: 100%;
                                    height: 100%;
                                    background-image: url('${frontmatter['bgimage']}');
                                    background-size: cover;
                                    background-position: center;
                                    background-repeat: no-repeat;
                                    opacity: ${opacity};
                                    z-index: -1;
                                }
                                body {
                                    background-image: none !important;
                                }
                            `;
                            document.head.appendChild(style);
                        }
                    }
                }
            }
        }
        
        // Extract all image URLs first
        const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
        let match;
        while ((match = imageRegex.exec(content)) !== null) {
            this.imageUrls.add(match[2]);
        }

        // Extract background image URLs
        const backgroundRegex = /background\s*\{[^}]*background-image:\s*url\(['"]([^'"]+)['"]\)/g;
        while ((match = backgroundRegex.exec(content)) !== null) {
            this.imageUrls.add(match[1]);
        }

        // Process slides asynchronously
        const slidePromises = content.split('---').map(async slide => {
            // Extract speaker notes (HTML comments) from the end of the slide
            const lines = slide.trim().split('\n');
            let speakerNotes = [];
            let contentLines = [];
            
            // Process from bottom to top to find trailing comments
            let inComment = false;
            let commentContent = [];
            
            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i].trim();
                
                if (line.includes('-->')) {
                    inComment = true;
                    const commentText = line.split('-->')[0].trim();
                    if (commentText) {
                        commentContent.unshift(commentText);
                    }
                } else if (line.includes('<!--')) {
                    inComment = false;
                    const commentText = line.split('<!--')[1].trim();
                    if (commentText) {
                        commentContent.unshift(commentText);
                    }
                    speakerNotes.unshift(commentContent.join('\n'));
                    commentContent = [];
                } else if (inComment) {
                    commentContent.unshift(line);
                } else {
                    // Once we hit non-comment content, stop processing
                    contentLines = lines.slice(0, i + 1);
                    break;
                }
            }

            // Join the content lines and process Mermaid blocks first
            let content = contentLines.join('\n');
            
            // Extract Mermaid blocks and replace with placeholders
            const mermaidBlocks = []; // Local array for this slide
            content = content.replace(/```\s*mermaid(?:\s*\{[^}]*\})?\n([\s\S]*?)```/g, (match, code) => {
                const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
                // Store the exact code without any modifications
                mermaidBlocks.push({ id, code: code });
                return `@@MERMAID-BLOCK-${mermaidBlocks.length - 1}@@`;
            });

            // Extract code blocks and replace with placeholders
            const codeBlocks = []; // Local array for this slide
            // Use async replace for code blocks
            async function replaceCodeBlocksAsync(content, highlighter, codeBlocks) {
                // Replace code blocks one by one
                const regex = /```\s*([^\n]*)\n([\s\S]*?)```/g;
                let result = '';
                let lastIndex = 0;
                let match;
                while ((match = regex.exec(content)) !== null) {
                    result += content.slice(lastIndex, match.index);
                    let lang = (match[1] || '').trim().toLowerCase();
                    const code = match[2];
                    const sqlBlockMatch = typeof lang === 'string' ? lang.match(/^sql(?:\s+table:([\w-]+))?/i) : null;
                    const plotlyBlockMatch = typeof lang === 'string' ? lang.match(/^plotly(?:\s+sql:([\w-]+))?/i) : null;

                    if (plotlyBlockMatch) {
                        await injectPlotly();
                        await injectJsYaml();
                        const plotId = 'plotly-' + Math.random().toString(36).substr(2, 9);
                        const sqlName = plotlyBlockMatch[1];
                        let sqlData = sqlName ? (window._sqlResults[sqlName] || []) : (window._lastSqlResult || []);
                        console.log('Plotly YAML code:', code);
                        let plotSpec;
                        try {
                            plotSpec = window.jsyaml.load(code);
                        } catch (e) {
                            console.error('YAML parse error:', e, code);
                            plotSpec = {};
                        }
                        console.log('Parsed plotSpec:', plotSpec);
                        // Substitute $column with arrays from sqlData
                        if (sqlData && sqlData.length && plotSpec.data) {
                            const columns = Object.keys(sqlData[0]);
                            for (let trace of plotSpec.data) {
                                for (let key in trace) {
                                    if (typeof trace[key] === 'string' && trace[key].startsWith('$')) {
                                        const col = trace[key].slice(1);
                                        if (columns.includes(col)) {
                                            trace[key] = sqlData.map(row => row[col]);
                                        }
                                    }
                                }
                            }
                        }
                        console.log('After $var substitution:', plotSpec.data);
                        setTimeout(() => {
                            try {
                                console.log('Calling Plotly.newPlot with:', plotId, plotSpec.data, plotSpec.layout);
                                window.Plotly.newPlot(plotId, plotSpec.data, plotSpec.layout);
                            } catch (e) {
                                console.error('Plotly.newPlot error:', e);
                            }
                        }, 0);
                        result += `<div class="content-block"><div id="${plotId}"></div></div>`;
                    } else if (sqlBlockMatch) {
                        const tableName = sqlBlockMatch[1];
                        // Process SQL code block
                        const tableHtml = await processSqlBlock(code);
                        // Parse the SQL result as an array of objects
                        let sqlResultArr = [];
                        try {
                            const SQL = await window.initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });
                            const db = new SQL.Database();
                            // (re-run the SQL to get the result as array of objects)
                            // This is a bit redundant but ensures we have the right format
                            // (You may want to refactor processSqlBlock to return the array directly)
                            // For now, parse the result from processSqlBlock
                            // (Assume processSqlBlock returns the HTML table, not the data)
                            // Instead, update processSqlBlock to store the result in window._sqlResults if tableName is given
                        } catch (e) {}
                        if (tableName) {
                            // Store the result and suppress output
                            window._sqlResults[tableName] = window._lastSqlResult || [];
                            // No output
                        } else {
                            // Store as last result and output as before
                            window._lastSqlResult = window._lastSqlResult || [];
                            result += `<div class="content-block">${tableHtml}</div>`;
                        }
                    } else if (lang && lang.trim().toLowerCase() === 'sql') {
                        // Fallback for plain sql blocks
                        const tableHtml = await processSqlBlock(code);
                        window._lastSqlResult = window._lastSqlResult || [];
                        result += `<div class="content-block">${tableHtml}</div>`;
                    } else {
                const id = 'code-' + Math.random().toString(36).substr(2, 9);
                        codeBlocks.push({ id, lang, code });
                        result += `@@CODE-BLOCK-${codeBlocks.length - 1}@@`;
                    }
                    lastIndex = regex.lastIndex;
                }
                result += content.slice(lastIndex);
                return result;
            }
            content = await replaceCodeBlocksAsync(content, this.highlighter, codeBlocks);

            // Convert the main content to HTML
            let html = await this.convertMarkdownToHtml(content);
            
            // Restore Mermaid blocks after all other processing
            html = html.replace(/@@MERMAID-BLOCK-(\d+)@@/g, (match, idx) => {
                const blockIndex = parseInt(idx, 10);
                if (!mermaidBlocks || !mermaidBlocks[blockIndex]) {
                    console.error('Mermaid block not found:', { idx, blockIndex, mermaidBlocks });
                    return ''; // Return empty string if block not found
                }
                const block = mermaidBlocks[blockIndex];
                return `<div class="content-block mermaid-container"><div class="mermaid" id="${block.id}">${block.code}</div></div>`;
            });

            // Restore code blocks after all other processing
            const codeBlockPromises = [];
            html = html.replace(/@@CODE-BLOCK-(\d+)@@/g, (match, idx) => {
                const blockIndex = parseInt(idx, 10);
                if (!codeBlocks || !codeBlocks[blockIndex]) {
                    console.error('Code block not found:', { idx, blockIndex, codeBlocks });
                    return ''; // Return empty string if block not found
                }
                const block = codeBlocks[blockIndex];
                const placeholder = `@@CODE-PLACEHOLDER-${codeBlockPromises.length}@@`;
                
                if (this.highlighter && block.lang) {
                    codeBlockPromises.push(
                        this.highlighter.codeToHtml(block.code, { 
                            lang: block.lang,
                            theme: 'github-dark'
                        }).then(highlighted => {
                            return highlighted;
                        }).catch(error => {
                            console.error(`Failed to highlight code for language ${block.lang}:`, error);
                            return `<pre><code class="language-${block.lang}">${block.code}</code></pre>`;
                        })
                    );
                } else {
                    codeBlockPromises.push(Promise.resolve(
                        `<pre><code>${block.code}</code></pre>`
                    ));
                }
                return placeholder;
            });

            // Wait for all code blocks to be processed
            const processedBlocks = await Promise.all(codeBlockPromises);
            processedBlocks.forEach((block, index) => {
                html = html.replace(`@@CODE-PLACEHOLDER-${index}@@`, `<div class="content-block">${block}</div>`);
            });
            
            // Add speaker notes if they exist
            if (speakerNotes.length > 0) {
                return {
                    content: html,
                    notes: speakerNotes.join('\n')
                };
            }
            
            return {
                content: html,
                notes: null
            };
        });
        
        this.slides = await Promise.all(slidePromises);
    }

    prefetchImages() {
        this.imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    async convertMarkdownToHtml(markdown) {
        // Step 0: Replace SQL code blocks in the raw markdown before any other processing
        markdown = await replaceAsync(
            markdown,
            /```sql\s*([\s\S]*?)```/g,
            async (match, sqlCode) => {
                const tableHtml = await processSqlBlock(sqlCode);
                return `<div class="content-block">${tableHtml}</div>`;
            }
        );

        // Step 1: Process the markdown as usual
        const markdownLines = markdown.split('\n');
        let processedMarkdownLines = [];

        for (let i = 0; i < markdownLines.length; i++) {
            const line = markdownLines[i];
            processedMarkdownLines.push(line);
        }

        let html = processedMarkdownLines.join('\n');

        // Process lists
        const processLists = (text) => {
            // First normalize all indentation to spaces
            text = text.replace(/\t/g, '    '); // Convert tabs to 4 spaces
            const lines = text.split('\n');
            let result = [];
            let currentList = null;
            let listItems = [];
            let lastIndent = 0;
            let indentStack = []; // Track indentation levels
            let currentParent = null; // Track current parent item

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const content = line.trim();
                const indent = line.length - line.trimStart().length;
                const listMatch = content.match(/^([*\-]|\d+\.)\s+(.*)/);
                
                if (listMatch) {
                    if (!currentList) {
                        currentList = {
                            isOrdered: /^\d+\./.test(listMatch[1]),
                            items: []
                        };
                    }

                    // Process markdown formatting in list item content
                    let itemContent = listMatch[2];
                    // Replace highlighted sections first
                    itemContent = itemContent.replace(/==(.*?)==/g, '<mark>$1</mark>');
                    // Then replace bold sections
                    itemContent = itemContent.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
                    // Finally replace italic sections
                    itemContent = itemContent.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

                    const item = {
                        content: itemContent,
                        nested: []
                    };

                    // Handle indentation levels
                    if (indent > lastIndent) {
                        // This is a nested item
                        if (currentList.items.length > 0) {
                            if (!currentParent) {
                                currentParent = currentList.items[currentList.items.length - 1];
                            }
                            if (!currentParent.nested) {
                                currentParent.nested = [];
                            }
                            currentParent.nested.push(item);
                        }
                    } else if (indent < lastIndent) {
                        // We're going back to a previous indentation level
                        currentList.items.push(item);
                        currentParent = null;
                    } else {
                        // Same indentation level
                        if (currentParent) {
                            // If we're at the same indentation level and have a parent, add to parent's nested list
                            currentParent.nested.push(item);
                        } else {
                            // If we're at the same indentation level but no parent, add to top level
                            currentList.items.push(item);
                        }
                    }
                    
                    // Update indentation tracking
                    if (indent > lastIndent) {
                        indentStack.push(lastIndent);
                    } else if (indent < lastIndent) {
                        while (indentStack.length > 0 && indentStack[indentStack.length - 1] > indent) {
                            indentStack.pop();
                        }
                        currentParent = null;
                    }
                    lastIndent = indent;
                } else {
                    if (currentList) {
                        const buildList = (items, isOrdered) => {
                            const listType = isOrdered ? 'ol' : 'ul';
                            return `<${listType} class="markdown-list">${
                                items.map(item => 
                                    `<li>${item.content}${
                                        item.nested && item.nested.length > 0 
                                            ? `<ul class="markdown-list">${
                                                item.nested.map(nested => 
                                                    `<li>${nested.content}${
                                                        nested.nested && nested.nested.length > 0 
                                                            ? `<ul class="markdown-list">${
                                                                nested.nested.map(n => 
                                                                    `<li>${n.content}</li>`
                                                                ).join('')
                                                            }</ul>` 
                                                            : ''
                                                    }</li>`
                                                ).join('')
                                            }</ul>` 
                                            : ''
                                    }</li>`
                                ).join('')
                            }</${listType}>`;
                        };

                        result.push(`<div class="content-block">${buildList(currentList.items, currentList.isOrdered)}</div>`);
                        currentList = null;
                        lastIndent = 0;
                        indentStack = [];
                        currentParent = null;
                    }
                    if (content) {
                        result.push(line);
                    }
                }
            }

            // Handle any remaining list
            if (currentList) {
                const buildList = (items, isOrdered) => {
                    const listType = isOrdered ? 'ol' : 'ul';
                    return `<${listType} class="markdown-list">${
                        items.map(item => 
                            `<li>${item.content}${
                                item.nested && item.nested.length > 0 
                                    ? `<ul class="markdown-list">${
                                        item.nested.map(nested => 
                                            `<li>${nested.content}${
                                                nested.nested && nested.nested.length > 0 
                                                    ? `<ul class="markdown-list">${
                                                        nested.nested.map(n => 
                                                            `<li>${n.content}</li>`
                                                        ).join('')
                                                    }</ul>` 
                                                    : ''
                                            }</li>`
                                        ).join('')
                                    }</ul>` 
                                    : ''
                            }</li>`
                        ).join('')
                    }</${listType}>`;
                };

                result.push(`<div class="content-block">${buildList(currentList.items, currentList.isOrdered)}</div>`);
            }

            return result.join('\n');
        };
        html = processLists(html);

        // Process slide background
        html = html.replace(/^background\s*\{([^}]*)\}/gm, (match, style) => {
            return `<div class="slide-background" style="${style}"></div>`;
        });

        // Process positioned images with style block
        html = html.replace(/!\[(.*?)\]\((.*?)\)\s*\{([^}]*)\}/g, (match, alt, src, style) => {
            return `<img src="${src}" alt="${alt}" style="${style}">`;
        });

        // Process regular images without positioning
        html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
            return `<div class="content-block"><img src="${src}" alt="${alt || ''}" style="max-width: 100%; max-height: calc(100vh - 200px); width: auto; height: auto; display: block; margin: 1rem auto; object-fit: contain; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>`;
        });

        // Process positioned text blocks
        html = html.replace(/<text\s*\{([^}]*)\}>(.*?)<\/text>/gs, (match, style, content) => {
            return `<div style="position: absolute; ${style}">${this.convertMarkdownToHtml(content)}</div>`;
        });

        // Process positioned divs
        html = html.replace(/<div\s*\{([^}]*)\}>(.*?)<\/div>/gs, (match, style, content) => {
            return `<div style="position: absolute; ${style}">${this.convertMarkdownToHtml(content)}</div>`;
        });

        // Process tables
        const lines = html.split('\n');
        let inTable = false;
        let tableRows = [];
        let tableAlignments = [];
        let processedLines = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check if this is a table header
            if (line.startsWith('|') && line.endsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    tableRows = [];
                }
                tableRows.push(line);
            }
            // Check if this is the separator line
            else if (inTable && line.match(/^\|[-:]+\|$/)) {
                // Process alignments
                tableAlignments = line.split('|')
                    .filter(cell => cell.trim())
                    .map(cell => {
                        if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
                        if (cell.endsWith(':')) return 'right';
                        return 'left';
                    });
            }
            // Check if this is a table row
            else if (inTable && line.startsWith('|') && line.endsWith('|')) {
                tableRows.push(line);
            }
            // End of table
            else if (inTable) {
                inTable = false;
                if (tableRows.length > 2) { // At least header, separator, and one row
                    const headerCells = tableRows[0].split('|').filter(cell => cell.trim());
                    const headerRow = `<tr>${headerCells.map((cell, i) => 
                        `<th style="text-align: ${tableAlignments[i]}">${cell.trim()}</th>`
                    ).join('')}</tr>`;

                    const bodyRows = tableRows.slice(2).map(row => {
                        const cells = row.split('|').filter(cell => cell.trim());
                        return `<tr>${cells.map(cell => `<td>${cell.trim()}</td>`).join('')}</tr>`;
                    }).join('');

                    processedLines.push(`<div class="content-block"><table class="markdown-table">${headerRow}${bodyRows}</table></div>`);
                }
                processedLines.push(line);
            }
            else {
                processedLines.push(line);
            }
        }

        // Handle case where table is at the end of the content
        if (inTable && tableRows.length > 2) {
            const headerCells = tableRows[0].split('|').filter(cell => cell.trim());
            const headerRow = `<tr>${headerCells.map((cell, i) => 
                `<th style="text-align: ${tableAlignments[i]}">${cell.trim()}</th>`
            ).join('')}</tr>`;

            const bodyRows = tableRows.slice(2).map(row => {
                const cells = row.split('|').filter(cell => cell.trim());
                return `<tr>${cells.map(cell => `<td>${cell.trim()}</td>`).join('')}</tr>`;
            }).join('');

            processedLines.push(`<div class="content-block"><table class="markdown-table">${headerRow}${bodyRows}</table></div>`);
        }

        html = processedLines.join('\n');

        // Convert headings and other markdown elements
        html = html
            .replace(/^# (.*$)/gm, '<div class="content-block"><h1>$1</h1></div>')
            .replace(/^## (.*$)/gm, '<div class="content-block"><h2>$1</h2></div>')
            .replace(/^### (.*$)/gm, '<div class="content-block"><h3>$1</h3></div>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
            .replace(/^> (.*$)/gm, '<div class="content-block"><blockquote>$1</blockquote></div>')
            .replace(/^(?!<[a-z])(.*$)/gm, '<div class="content-block"><p>$1</p></div>');

        // Process formatting within div content blocks that contain plain text
        html = html.replace(/<div class="content-block"><p>(.*?)<\/p><\/div>/g, (match, content) => {
            content = content.replace(/==(.*?)==/g, '<mark>$1</mark>');
            content = content.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
            content = content.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
            return `<div class="content-block"><p>${content}</p></div>`;
        });

        // Convert remaining text to paragraphs, but only if it's not already wrapped in a div
        html = html.replace(/^(?!<div class="content-block">)(.*$)/gm, '<div class="content-block"><p>$1</p></div>');

        // Helper for async string replacement
        async function replaceAsync(str, regex, asyncFn) {
            const promises = [];
            str.replace(regex, (match, ...args) => {
                const promise = asyncFn(match, ...args);
                promises.push(promise);
                return match;
            });
            const data = await Promise.all(promises);
            return str.replace(regex, () => data.shift());
        }

        return html;
    }

    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.nextSlide();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.previousSlide();
            } else if (e.key === 'p' && e.ctrlKey) {  // Add Ctrl+P shortcut for presenter mode
                e.preventDefault();
                this.togglePresenterMode();
            }
        });

        // Add hash change listener to handle direct URL navigation
        window.addEventListener('hashchange', () => {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const slideNumber = parseInt(params.get('slide') || '1') - 1;
            if (slideNumber >= 0 && slideNumber < this.slides.length) {
                this.renderSlide(slideNumber);
            }
        });

        this.createNavigationButtons();
    }

    togglePresenterMode() {
        this.isPresenterMode = !this.isPresenterMode;
        document.body.classList.toggle('presenter-mode', this.isPresenterMode);
        // Update the presenter mode button state
        const presenterBtn = document.getElementById('presenterModeBtn');
        if (presenterBtn) {
            presenterBtn.classList.toggle('active', this.isPresenterMode);
        }
    }

    createNavigationButtons() {
        // Remove any existing navigation elements
        const existingNav = document.querySelector('.presentation-nav');
        if (existingNav) {
            existingNav.remove();
        }
        
        const nav = document.createElement('div');
        nav.className = 'presentation-nav';
        if (this.isNavMinimized) {
            nav.classList.add('collapsed');
        }
        
        // Create options for the select element
        const options = Array.from({ length: this.slides.length }, (_, i) => 
            `<option value="${i + 1}">Slide ${i + 1}</option>`
        ).join('');
        
        nav.innerHTML = `
            <button id="toggleNav" class="nav-toggle">${this.isNavMinimized ? '▲' : '▼'}</button>
            <div class="nav-content">
                <button id="prevBtn" class="${this.currentSlide === 0 ? 'disabled' : ''}">Previous</button>
                <div class="slide-navigation">
                    <select id="slideSelect">
                        ${options}
                    </select>
                    <span>of ${this.slides.length}</span>
                </div>
                <button id="nextBtn" class="${this.currentSlide === this.slides.length - 1 ? 'disabled' : ''}">Next</button>
                <button id="presenterModeBtn" class="${this.isPresenterMode ? 'active' : ''}" title="Toggle Presenter Mode (Ctrl+P)">🎥</button>
            </div>
        `;
        
        const bottomBar = document.querySelector('.bottom-bar');
        if (bottomBar) {
            bottomBar.appendChild(nav);
        }

        // Add button event listeners
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const toggleBtn = document.getElementById('toggleNav');
        const presenterBtn = document.getElementById('presenterModeBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (!prevBtn.classList.contains('disabled')) {
                    this.previousSlide();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (!nextBtn.classList.contains('disabled')) {
                    this.nextSlide();
                }
            });
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                nav.classList.toggle('collapsed');
                this.isNavMinimized = nav.classList.contains('collapsed');
                toggleBtn.textContent = this.isNavMinimized ? '▲' : '▼';
            });
        }

        if (presenterBtn) {
            presenterBtn.addEventListener('click', () => {
                this.togglePresenterMode();
            });
        }
        
        // Add select event listener
        const slideSelect = document.getElementById('slideSelect');
        if (slideSelect) {
            slideSelect.addEventListener('change', (e) => {
                const newSlide = parseInt(e.target.value) - 1;
                this.renderSlide(newSlide);
            });
        }
    }

    renderSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentSlide = index;
            
            // Update URL hash with current slide number
            window.location.hash = `slide=${index + 1}`;
            
            // Clear the body first
            document.body.innerHTML = '';
            
            // Create main content container
            const mainContent = document.createElement('div');
            mainContent.className = 'presentation-content';
            
            // Create a temporary container to parse the content
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = this.slides[index].content;
            
            // Remove any duplicate content blocks
            const seenContent = new Set();
            const contentBlocks = tempContainer.querySelectorAll('.content-block');
            contentBlocks.forEach(block => {
                const content = block.innerHTML.trim();
                if (seenContent.has(content)) {
                    block.remove();
                } else {
                    seenContent.add(content);
                }
            });
            
            mainContent.innerHTML = tempContainer.innerHTML;
            
            // Create bottom bar container
            const bottomBar = document.createElement('div');
            bottomBar.className = 'bottom-bar';
            
            // Create speaker notes only if they exist
            if (this.slides[index].notes) {
                const speakerNotes = document.createElement('div');
                speakerNotes.className = 'speaker-notes';
                speakerNotes.innerHTML = this.slides[index].notes;
                bottomBar.appendChild(speakerNotes);
            }
            
            // Append elements in the correct order
            document.body.appendChild(mainContent);
            document.body.appendChild(bottomBar);
            
            // Create navigation after the DOM is set up
            this.createNavigationButtons();
            
            // Initialize Mermaid diagrams
            if (typeof mermaid !== 'undefined') {
                mermaid.contentLoaded();
                mermaid.init(undefined, '.mermaid');
            } else {
                console.warn('Mermaid is not loaded yet. Diagrams will not be rendered.');
            }
            
            // Update slide select
            const slideSelect = document.getElementById('slideSelect');
            if (slideSelect) {
                slideSelect.value = index + 1;
            }
        }
    }

    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.renderSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 0) {
            this.renderSlide(this.currentSlide - 1);
        }
    }
}

// Add styles
const style = document.createElement('style');
style.textContent = `
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        margin: 0;
        padding: 0;
        background: #f5f5f5;
        min-height: 100vh;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        font-size: clamp(0.875rem, 3vw, 1.25rem); /* Reduced max size */
    }

    .presentation-content {
        padding: 1rem;
        padding-top: 2rem;
        flex: 1;
        overflow: hidden;
        position: relative;
        max-width: 100vw;
        max-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    /* Presenter mode aspect ratio enforcement */
    body.presenter-mode {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        margin: 0;
        padding: 0;
        background: #f5f5f5;
        min-height: 100vh;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }

    body.presenter-mode .presentation-content {
        flex: 1;
        width: 100%;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    body.presenter-mode .presentation-content > * {
        width: 100%;
        max-width: calc(100vh * 16 / 9); /* Maintain 16:9 aspect ratio */
    }

    /* Speaker notes styling */
    .speaker-notes {
        display: none; /* Hidden by default */
        background: #2c3e50;
        color: white;
        padding: 1rem;
        font-size: 0.9em;
        text-align: left;
        border-bottom: 1px solid #34495e;
        white-space: pre-line;
        width: 100%;
    }

    /* Show speaker notes only in presenter mode */
    body.presenter-mode .speaker-notes {
        display: block;
    }

    /* Hide speaker notes when nav is collapsed */
    .presentation-nav.collapsed .speaker-notes {
        display: none !important;
    }

    .presentation-nav {
        position: relative;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        z-index: 1000;
        transition: all 0.3s ease;
        width: 100%;
    }

    .presentation-nav.collapsed {
        width: 40px;
        height: 40px;
        right: 0;
        left: auto;
        padding: 0;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);

    }

    .presentation-nav.collapsed .nav-content {
        display: none;
    }

    .nav-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.3s ease;
    }

    /* Presenter mode button styles */
    #presenterModeBtn {
        background: none;
        border: none;
        font-size: 1.2em;
        cursor: pointer;
        padding: 0.5rem;
        color: #666;
        transition: all 0.2s ease;
    }

    #presenterModeBtn:hover {
        color: #007bff;
    }

    #presenterModeBtn.active {
        color: #007bff;
        background: rgba(0, 123, 255, 0.1);
        border-radius: 4px;
    }

    /* Responsive font sizes with more reasonable maximums */
    h1 {
        font-size: clamp(1.25rem, 6vw, 2.5rem);
        margin-top: 0;
        padding-top: 0;
        word-wrap: break-word;
        max-width: 100%;
    }

    h2 {
        font-size: clamp(1.1rem, 5vw, 2rem);
        word-wrap: break-word;
        max-width: 100%;
    }

    h3 {
        font-size: clamp(1rem, 4vw, 1.75rem);
        word-wrap: break-word;
        max-width: 100%;
    }

    p {
        font-size: clamp(0.875rem, 3vw, 1.25rem);
        word-wrap: break-word;
        max-width: 100%;
    }

    /* Adjust list font sizes */
    .markdown-list {
        font-size: clamp(0.875rem, 3vw, 1.25rem);
        margin: 0.5rem 0;
        padding-left: 2rem;
    }

    /* Adjust blockquote font size */
    blockquote {
        font-size: clamp(0.875rem, 3vw, 1.25rem);
        border-left: 4px solid #007bff;
        margin: 1rem 0;
        padding: 0.5rem 1rem;
        background-color: rgba(0, 123, 255, 0.05);
        font-style: italic;
        color: #555;
    }

    /* Adjust table font size */
    .markdown-table {
        font-size: clamp(0.75rem, 2.5vw, 1.1rem);
        border-collapse: collapse;
        width: 100%;
        margin: 1rem 0;
    }

    /* Adjust code block font size */
    .shiki {
        font-size: clamp(0.75rem, 2.5vw, 1.1rem);
        background-color: #0d1117;
        border-radius: 6px;
        padding: 1rem;
        padding-bottom: 0;
        margin: 1rem 0;
        overflow-x: auto;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        line-height: 1.5;
    }

    /* Adjust Mermaid diagram font sizes */
    .mermaid {
        font-size: clamp(0.75rem, 2.5vw, 1.1rem);
        width: 100%;
        min-height: 300px;
        margin: 1rem 0;
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .mermaid .label {
        font-size: clamp(0.7rem, 2vw, 1rem);
    }

    .mermaid .section {
        font-size: clamp(0.75rem, 2.5vw, 1.1rem);
        font-weight: bold;
    }

    .mermaid .title {
        font-size: clamp(0.875rem, 3vw, 1.25rem);
        font-weight: bold;
    }

    /* Adjust navigation font sizes */
    .presentation-nav button {
        font-size: clamp(0.75rem, 2.5vw, 1.1rem);
        padding: 0.5rem 1rem;
        border: none;
        background: #007bff;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.2s ease;
    }

    #slideSelect {
        font-size: clamp(0.75rem, 2.5vw, 1.1rem);
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: inherit;
        background-color: white;
        cursor: pointer;
        min-width: 100px;
    }

    /* Add container for slide content */
    body > *:not(.presentation-nav) {
        max-width: calc(100vw - 2rem);
        height: auto;
        position: relative;
    }

    img {
        max-width: 100%;
        height: auto;
        object-fit: contain;
    }

    /* Ensure positioned elements stay within bounds */
    [style*="position: absolute"] {
        max-width: calc(100vw - 2rem);
        max-height: calc(100vh - 6rem);
    }

    /* Ensure lists don't overflow */
    ul, ol {
        max-width: 100%;
        padding-left: 2rem;
        box-sizing: border-box;
    }

    /* Ensure links don't cause overflow */
    a {
        word-break: break-word;
    }

    /* Ensure code blocks don't overflow */
    pre, code {
        max-width: 100%;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .slide-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
    }

    .presentation-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        transition: all 0.3s ease;
    }

    .presentation-nav.collapsed {
        width: 40px;
        height: 40px;
        right: 0;
        left: auto;
        padding: 0;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .presentation-nav.collapsed .nav-toggle {
        position: static;
        transform: none;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: transparent;
        color: #333;
        opacity: 50%;
    }

    .presentation-nav.collapsed .nav-toggle:hover {
        background: transparent;
    }

    .nav-toggle {
        position: absolute;
        right: 3rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        padding: 0.5rem;
        color: #333;
        transition: all 0.3s ease;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .presentation-nav button {
        padding: 0.5rem 1rem;
        border: none;
        background: #007bff;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.2s ease;
    }

    .presentation-nav button:hover:not(.disabled) {
        background: #0056b3;
    }

    .presentation-nav button.disabled {
        background: #cccccc;
        color: #666666;
        cursor: not-allowed;
        opacity: 0.7;
    }

    .slide-navigation {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-family: inherit;
    }

    /* Add styles for list groups */
    .list-container {
        margin-bottom: 1rem;
    }

    ul {
        list-style-position: inside !important;
    }

    ul li {
        margin: 0.25rem 0 !important;
    }

    h1, h2, h3 {
        margin: 0 !important;
        padding: 0 !important;
        line-height: 1.2 !important;
    }

    h1 + ul,
    h2 + ul,
    h3 + ul {
        margin-top: 0.25rem !important;
    }

    /* Override any default browser styles */
    * {
        margin: 0;
        padding: 0;
    }

    /* Add table styles */
    .markdown-table {
        border-collapse: collapse;
        width: 100%;
        margin: 1rem 0; 
    }

    .markdown-table th,
    .markdown-table td {
        border: 1px solid #ddd;
        padding: 4px;
        text-align: left;
    }

    .markdown-table th {
        background-color: #f5f5f5;
        font-weight: bold;
    }

    .markdown-table tr:nth-child(even) {
        background-color: #f0f0f0;
    }

    .markdown-table tr:nth-child(odd) {
        background-color: #ffffff;
    }

    /* Add styles for content blocks */
    .content-block {
        margin-bottom: 1rem;
    }

    .content-block:last-child {
        margin-bottom: 0;
    }

    ul {
        list-style-position: inside !important;
    }

    ul li {
        margin: 0.25rem 0 !important;
    }

    /* Add styles for blockquotes */
    blockquote {
        border-left: 4px solid #007bff;
        margin: 1rem 0;
        padding: 0.5rem 1rem;
        background-color: rgba(0, 123, 255, 0.05);
        font-style: italic;
        color: #555;
    }

    blockquote p {
        margin: 0;
    }

    blockquote p:last-child {
        margin-bottom: 0;
    }

    /* Add styles for lists */
    .markdown-list {
        margin: 0.5rem 0;
        padding-left: 2rem;
    }

    .markdown-list ol {
        list-style-type: decimal;
    }

    .markdown-list ul {
        list-style-type: disc;
    }

    .markdown-list li {
        margin: 0.25rem 0;
    }

    .markdown-list li p {
        margin: 0;
    }

    .markdown-list ul .markdown-list {
        list-style-type: circle;
    }

    .markdown-list ul .markdown-list .markdown-list {
        list-style-type: square;
    }

    .markdown-list ol .markdown-list {
        list-style-type: lower-alpha;
    }

    .markdown-list ol .markdown-list .markdown-list {
        list-style-type: lower-roman;
    }

    /* Add error message styling */
    .error {
        color: #dc3545;
        padding: 1rem;
        margin: 1rem;
        border: 1px solid #dc3545;
        border-radius: 4px;
        background-color: #f8d7da;
    }

    /* Shiki code block styles */
    .shiki {
        background-color: #0d1117;
        border-radius: 6px;
        padding: 1rem;
        padding-bottom: 0;
        margin: 1rem 0;
        overflow-x: auto;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        font-size: 0.9em;
        line-height: .3;
    }

    .shiki code {
        font-family: inherit;
        white-space: pre;
        word-wrap: normal;
    }

    .shiki .line {
        display: block;
        min-height: 1.2em;
    }

    .shiki .line-number {
        display: inline-block;
        width: 2.5em;
        padding-right: 1em;
        text-align: right;
        color: #6e7681;
        user-select: none;
    }

    /* Ensure code blocks don't overflow */
    pre, code {
        max-width: 100%;
        overflow-x: auto;
        white-space: pre;
        word-wrap: normal;
    }

    /* Add styles for Mermaid diagrams */
    .mermaid {
        width: 100%;
        min-height: 300px;
        margin: 1rem 0;
        font-size: 16px;
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .mermaid svg {
        width: 100%;
        height: auto;
        max-height: 70vh;
    }

    /* Ensure the diagram container takes up appropriate space */
    .content-block.mermaid-container {
        width: 100%;
        margin: 1rem 0;
        padding: 0;
    }

    /* Adjust text size in diagrams */
    .mermaid .label {
        font-size: 14px;
    }

    .mermaid .section {
        font-size: 16px;
        font-weight: bold;
    }

    .mermaid .title {
        font-size: 18px;
        font-weight: bold;
    }

    /* Ensure the diagram container takes up appropriate space */
    .content-block .mermaid {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .bottom-bar {
        background: white;
        border-top: 1px solid #ddd;
        width: 100%;
    }

    /* Add styles for images */
    .content-block img {
        display: block;
        margin: 1rem auto;
        max-width: 100%;
        height: auto;
        object-fit: contain;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    /* Center images in presenter mode */
    body.presenter-mode .content-block img {
        margin: 1rem auto;
        display: block;
    }
`;
document.head.appendChild(style);

// Global SQL results storage
window._sqlResults = window._sqlResults || {};

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownPresentation();
}); 
} else {
    new MarkdownPresentation();
}
})(); 